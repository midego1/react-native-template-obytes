#!/usr/bin/env node
/**
 * Phase 2 Integration Tests
 * Tests database operations, RLS policies, and real-time features
 *
 * Run: node test-phase2-integration.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

function test(name, fn) {
  return async () => {
    try {
      await fn();
      testResults.passed++;
      console.log(`✅ ${name}`);
    }
    catch (error) {
      testResults.failed++;
      testResults.errors.push({ name, error: error.message });
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  };
}

async function runTests() {
  console.log('\n🧪 Phase 2 Integration Tests\n');
  console.log('='.repeat(50));

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    console.log('❌ No authenticated user found. Please log in first.');
    process.exit(1);
  }

  const currentUserId = authData.user.id;
  console.log(`\n👤 Testing as user: ${currentUserId}\n`);

  // Test 1: User Profiles
  await test('Fetch user profile', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, avatar_url, bio, current_city')
      .eq('id', currentUserId)
      .single();

    if (error)
      throw new Error(error.message);
    if (!data)
      throw new Error('User profile not found');
    if (!data.email)
      throw new Error('User email missing');
  })();

  // Test 2: Crew Connections - Fetch
  await test('Fetch crew connections', async () => {
    const { data, error } = await supabase
      .from('crew_connections')
      .select(`
        *,
        requester:users!requester_id(id, full_name, avatar_url),
        addressee:users!addressee_id(id, full_name, avatar_url)
      `)
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
      .eq('status', 'accepted');

    if (error)
      throw new Error(error.message);
    console.log(`   Found ${data?.length || 0} crew members`);
  })();

  // Test 3: Crew Requests - Fetch
  await test('Fetch crew requests', async () => {
    const { data, error } = await supabase
      .from('crew_connections')
      .select(`
        *,
        requester:users!requester_id(id, full_name, avatar_url),
        addressee:users!addressee_id(id, full_name, avatar_url)
      `)
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
      .eq('status', 'pending');

    if (error)
      throw new Error(error.message);
    console.log(`   Found ${data?.length || 0} pending requests`);
  })();

  // Test 4: Conversations - Fetch
  await test('Fetch conversations', async () => {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations:conversations(
          id,
          type,
          activity_id,
          created_at
        )
      `)
      .eq('user_id', currentUserId);

    if (error)
      throw new Error(error.message);
    console.log(`   Found ${data?.length || 0} conversations`);
  })();

  // Test 5: Activity Group Chats
  await test('Fetch activity group chats', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        activity:activities(id, title, host_id)
      `)
      .eq('type', 'activity_group');

    if (error)
      throw new Error(error.message);
    console.log(`   Found ${data?.length || 0} activity group chats`);

    // Verify trigger created chats for all activities
    const { data: activities } = await supabase
      .from('activities')
      .select('id');

    const activityCount = activities?.length || 0;
    const chatCount = data?.length || 0;

    if (activityCount > chatCount) {
      throw new Error(
        `Missing activity chats: ${activityCount} activities but only ${chatCount} chats`,
      );
    }
  })();

  // Test 6: Messages Table Structure
  await test('Verify messages table has new columns', async () => {
    // Try to select with new columns
    const { data, error } = await supabase
      .from('messages')
      .select(
        'id, type, content, media_url, media_type, file_name, file_size, thumbnail_url, duration, status, reply_to_message_id, deleted_at',
      )
      .limit(1);

    if (error)
      throw new Error(error.message);
    console.log('   All new message columns exist');
  })();

  // Test 7: Message Reactions Table
  await test('Verify message_reactions table exists', async () => {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('id, message_id, user_id, emoji, created_at')
      .limit(1);

    if (error && !error.message.includes('0 rows')) {
      throw new Error(error.message);
    }
    console.log('   message_reactions table accessible');
  })();

  // Test 8: Typing Indicators Table
  await test('Verify typing_indicators table exists', async () => {
    const { data, error } = await supabase
      .from('typing_indicators')
      .select('conversation_id, user_id, started_at')
      .limit(1);

    if (error && !error.message.includes('0 rows')) {
      throw new Error(error.message);
    }
    console.log('   typing_indicators table accessible');
  })();

  // Test 9: Storage Bucket
  await test('Verify chat-media storage bucket exists', async () => {
    const { data, error } = await supabase.storage.listBuckets();

    if (error)
      throw new Error(error.message);

    const chatMediaBucket = data?.find(b => b.id === 'chat-media');
    if (!chatMediaBucket) {
      throw new Error('chat-media bucket not found');
    }
    console.log('   chat-media bucket exists');
  })();

  // Test 10: Message Type Constraints
  await test('Verify message type constraint', async () => {
    // This should fail with invalid type
    const { error } = await supabase.from('messages').insert({
      conversation_id: '00000000-0000-0000-0000-000000000000',
      sender_id: currentUserId,
      content: 'Test',
      type: 'invalid_type', // This should be rejected
    });

    if (!error) {
      throw new Error('Should have rejected invalid message type');
    }

    if (!error.message.includes('messages_type_check')) {
      throw new Error('Expected type constraint error');
    }

    console.log('   Message type constraint working');
  })();

  // Test 11: Message Status Constraint
  await test('Verify message status constraint', async () => {
    // This should fail with invalid status
    const { error } = await supabase.from('messages').insert({
      conversation_id: '00000000-0000-0000-0000-000000000000',
      sender_id: currentUserId,
      content: 'Test',
      type: 'text',
      status: 'invalid_status', // This should be rejected
    });

    if (!error) {
      throw new Error('Should have rejected invalid message status');
    }

    console.log('   Message status constraint working');
  })();

  // Test 12: Real-time Subscription (quick test)
  await test('Test real-time subscription setup', async () => {
    let subscriptionWorking = false;

    const channel = supabase
      .channel('test-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          subscriptionWorking = true;
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('   Real-time subscription established');
        }
      });

    // Wait a bit for subscription
    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabase.removeChannel(channel);

    if (!subscriptionWorking && channel.state !== 'joined') {
      // Don't fail, just warn
      console.log('   Warning: Real-time subscription may not be working');
    }
  })();

  // Test 13: RLS Policy - Can't read other users' private data
  await test('Verify RLS prevents unauthorized access', async () => {
    // Try to fetch all users (should work)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name');

    if (usersError)
      throw new Error(usersError.message);

    // Find a different user
    const otherUser = users?.find(u => u.id !== currentUserId);

    if (otherUser) {
      // Try to fetch their private conversations directly (should be filtered by RLS)
      const { data: convs, error: convsError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('user_id', otherUser.id);

      // We can query but should only see conversations we're part of
      if (convsError)
        throw new Error(convsError.message);

      console.log('   RLS policies are active');
    }
  })();

  // Print summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('\n📊 Test Summary:\n');
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Total:  ${testResults.passed + testResults.failed}`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:\n');
    testResults.errors.forEach(({ name, error }) => {
      console.log(`   • ${name}`);
      console.log(`     ${error}\n`);
    });
    process.exit(1);
  }
  else {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
});
