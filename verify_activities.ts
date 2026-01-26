import { supabase } from './src/lib/supabase';

async function verify() {
  console.log('\n🔍 Verifying activities and chats...\n');

  // Check activities
  const { data: activities } = await supabase
    .from('activities')
    .select('id, title, host_id')
    .order('starts_at');

  console.log(`✅ Activities created: ${activities?.length || 0}`);
  activities?.forEach(a => console.log(`   - ${a.title}`));

  // Check conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, activity_id')
    .eq('type', 'activity_group');

  console.log(`\n✅ Activity group chats: ${conversations?.length || 0}`);

  // Check participants
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id');

  console.log(`✅ Total chat participants: ${participants?.length || 0}\n`);

  // Verify each activity has chat with host
  for (const activity of activities || []) {
    const conv = conversations?.find(c => c.activity_id === activity.id);
    if (conv) {
      const hostInChat = participants?.find(
        p => p.conversation_id === conv.id && p.user_id === activity.host_id,
      );
      console.log(`${activity.title}:`);
      console.log(`  - Chat: ✅  Host in chat: ${hostInChat ? '✅' : '❌'}`);
    }
    else {
      console.log(`${activity.title}: ❌ No chat`);
    }
  }

  console.log('\n✅ Done!\n');
}

verify();
