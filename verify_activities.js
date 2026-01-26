const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

async function verify() {
  // Check activities
  const { data: activities } = await supabase
    .from('activities')
    .select('id, title, host_id')
    .order('starts_at');

  console.log('\n✅ Activities created:', activities?.length || 0);
  activities?.forEach(a => console.log('  -', a.title));

  // Check conversations created
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, type, activity_id')
    .eq('type', 'activity_group');

  console.log('\n✅ Activity group chats created:', conversations?.length || 0);

  // Check hosts are in conversations
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id');

  console.log('\n✅ Total participants in all chats:', participants?.length || 0);

  // Verify each activity has a conversation with host
  for (const activity of activities || []) {
    const conv = conversations?.find(c => c.activity_id === activity.id);
    if (conv) {
      const hostInChat = participants?.find(
        p => p.conversation_id === conv.id && p.user_id === activity.host_id,
      );
      console.log(`\n${activity.title}:`);
      console.log('  - Chat exists: ✅');
      console.log('  - Host in chat:', hostInChat ? '✅' : '❌');
    }
    else {
      console.log(`\n${activity.title}: ❌ No chat created`);
    }
  }
}

verify().catch(console.error);
