/**
 * Phase 2 Database Testing Script
 * Run with: node test-database.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

async function runTests() {
  console.log('\n🧪 Phase 2 Database Tests\n');

  // Test 1: Check activities exist
  console.log('📝 Test 1: Activities');
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('id, title, host_id')
    .limit(5);

  if (actError) {
    console.log(`   ❌ Error: ${actError.message}`);
  }
  else {
    console.log(`   ✅ Found ${activities.length} activities`);
    activities.forEach(a => console.log(`      - ${a.title}`));
  }

  // Test 2: Check activity group chats
  console.log('\n📝 Test 2: Activity Group Chats');
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id, type, activity_id')
    .eq('type', 'activity_group');

  if (convError) {
    console.log(`   ❌ Error: ${convError.message}`);
  }
  else {
    console.log(`   ✅ Found ${conversations.length} activity group chats`);
  }

  // Test 3: Check if hosts are in their activity chats
  console.log('\n📝 Test 3: Verify Hosts in Activity Chats');
  if (activities && activities.length > 0) {
    for (const activity of activities) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'activity_group')
        .eq('activity_id', activity.id)
        .single();

      if (conv) {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .eq('user_id', activity.host_id);

        if (participants && participants.length > 0) {
          console.log(`   ✅ "${activity.title}" - Host is in chat`);
        }
        else {
          console.log(`   ❌ "${activity.title}" - Host NOT in chat`);
        }
      }
    }
  }

  // Test 4: Check crew connections
  console.log('\n📝 Test 4: Crew Connections');
  const { data: crew, error: crewError } = await supabase
    .from('crew_connections')
    .select('*')
    .eq('status', 'accepted');

  if (crewError) {
    console.log(`   ❌ Error: ${crewError.message}`);
  }
  else {
    console.log(`   ✅ Found ${crew.length} crew connections`);
  }

  // Test 5: Check messages
  console.log('\n📝 Test 5: Messages');
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .limit(10);

  if (msgError) {
    console.log(`   ❌ Error: ${msgError.message}`);
  }
  else {
    console.log(`   ✅ Found ${messages.length} messages`);
  }

  console.log('\n✅ Database tests complete!\n');
}

runTests().catch(console.error);
