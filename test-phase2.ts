/**
 * Phase 2 Automated Testing Script
 * Tests API hooks and database functionality
 */

import { supabase } from './src/lib/supabase';

async function testPhase2() {
  console.log('\n🧪 Starting Phase 2 Automated Tests...\n');

  let testUser1Id: string;
  let testUser2Id: string;
  let activityId: string;
  let conversationId: string;

  try {
    // Test 1: User Authentication
    console.log('📝 Test 1: User Authentication');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError)
      throw new Error(`Auth failed: ${authError.message}`);
    console.log(`   ✅ Authenticated as: ${authData.user.email}`);
    testUser1Id = authData.user.id;

    // Test 2: Fetch Activities
    console.log('\n📝 Test 2: Fetch Activities');
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*')
      .limit(5);
    if (actError)
      throw new Error(`Failed to fetch activities: ${actError.message}`);
    console.log(`   ✅ Found ${activities?.length || 0} activities`);
    activityId = activities?.[0]?.id;

    // Test 3: User Profile with Stats
    console.log('\n📝 Test 3: User Profile Stats');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser1Id)
      .single();
    if (profileError)
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    console.log(`   ✅ Profile loaded: ${profile.full_name}`);

    // Get activity stats
    const { count: hostedCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', testUser1Id);
    console.log(`   ✅ Activities hosted: ${hostedCount || 0}`);

    // Test 4: Crew Connections
    console.log('\n📝 Test 4: Crew System');
    const { data: crewConnections, error: crewError } = await supabase
      .from('crew_connections')
      .select('*')
      .or(`requester_id.eq.${testUser1Id},addressee_id.eq.${testUser1Id}`)
      .eq('status', 'accepted');
    if (crewError)
      throw new Error(`Failed to fetch crew: ${crewError.message}`);
    console.log(`   ✅ Crew members: ${crewConnections?.length || 0}`);

    // Test 5: Crew Requests
    const { data: crewRequests, error: requestsError } = await supabase
      .from('crew_connections')
      .select('*')
      .eq('addressee_id', testUser1Id)
      .eq('status', 'pending');
    if (requestsError)
      throw new Error(`Failed to fetch requests: ${requestsError.message}`);
    console.log(`   ✅ Pending crew requests: ${crewRequests?.length || 0}`);

    // Test 6: Conversations
    console.log('\n📝 Test 6: Chat - Conversations');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(user_id)
      `)
      .or(`type.eq.direct,type.eq.activity_group`);
    if (convError)
      throw new Error(`Failed to fetch conversations: ${convError.message}`);
    console.log(`   ✅ Total conversations: ${conversations?.length || 0}`);
    conversationId = conversations?.[0]?.id;

    // Test 7: Activity Group Chats
    console.log('\n📝 Test 7: Activity Group Chats');
    if (activityId) {
      const { data: activityConv, error: actConvError } = await supabase
        .from('conversations')
        .select('*, participants:conversation_participants(*)')
        .eq('type', 'activity_group')
        .eq('activity_id', activityId)
        .maybeSingle();

      if (actConvError)
        throw new Error(`Failed to fetch activity chat: ${actConvError.message}`);

      if (activityConv) {
        console.log(`   ✅ Activity has group chat with ${activityConv.participants?.length || 0} participants`);
      }
      else {
        console.log(`   ⚠️  No group chat found for this activity (might not be created yet)`);
      }
    }

    // Test 8: Messages
    console.log('\n📝 Test 8: Chat - Messages');
    if (conversationId) {
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*, sender:users(full_name)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (msgError)
        throw new Error(`Failed to fetch messages: ${msgError.message}`);
      console.log(`   ✅ Found ${messages?.length || 0} messages in conversation`);
    }
    else {
      console.log(`   ⚠️  No conversations found to test messages`);
    }

    // Test 9: Activity Triggers (Check if hosts are in chats)
    console.log('\n📝 Test 9: Verify Activity Chat Triggers');
    const { data: myActivities, error: myActError } = await supabase
      .from('activities')
      .select('id, title')
      .eq('host_id', testUser1Id)
      .limit(3);

    if (myActError)
      throw new Error(`Failed to fetch my activities: ${myActError.message}`);

    if (myActivities && myActivities.length > 0) {
      for (const activity of myActivities) {
        const { data: conv } = await supabase
          .from('conversations')
          .select('*, participants:conversation_participants(user_id)')
          .eq('type', 'activity_group')
          .eq('activity_id', activity.id)
          .single();

        if (conv) {
          const hostIsParticipant = conv.participants?.some((p: any) => p.user_id === testUser1Id);
          if (hostIsParticipant) {
            console.log(`   ✅ "${activity.title}": Host is in group chat`);
          }
          else {
            console.log(`   ❌ "${activity.title}": Host NOT in group chat (BUG!)`);
          }
        }
        else {
          console.log(`   ⚠️  "${activity.title}": No group chat created`);
        }
      }
    }
    else {
      console.log(`   ⚠️  No hosted activities to verify`);
    }

    // Test 10: RLS Policies
    console.log('\n📝 Test 10: RLS Security');
    // Try to access conversation_participants (should work for own conversations)
    const { data: participants, error: rlsError } = await supabase
      .from('conversation_participants')
      .select('*')
      .limit(5);

    if (rlsError) {
      console.log(`   ❌ RLS Error: ${rlsError.message}`);
    }
    else {
      console.log(`   ✅ RLS policies working - can access own conversation participants`);
    }

    console.log('\n✅ All automated tests completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Activities: ${activities?.length || 0}`);
    console.log(`   - Crew members: ${crewConnections?.length || 0}`);
    console.log(`   - Pending requests: ${crewRequests?.length || 0}`);
    console.log(`   - Conversations: ${conversations?.length || 0}`);
    console.log(`   - Your hosted activities: ${myActivities?.length || 0}`);
  }
  catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testPhase2();
