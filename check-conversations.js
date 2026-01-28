const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function checkConversations() {
  // Get Michiel Test's user ID
  const { data: userData } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('email', 'mdgooijer@gmail.com')
    .single();

  if (!userData) {
    console.log('User not found');
    return;
  }

  console.log('User:', userData.full_name, 'ID:', userData.id);

  // Get activities where Michiel is attending
  const { data: attendees } = await supabase
    .from('activity_attendees')
    .select('activity_id, status, activity:activities(title)')
    .eq('user_id', userData.id);

  console.log('\nAttending activities:');
  attendees?.forEach(a => console.log(`- ${a.activity?.title} (status: ${a.status})`));

  // Get all conversations for these activities
  for (const att of attendees || []) {
    console.log(`\nChecking conversation for: ${att.activity?.title}`);

    const { data: conv, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'activity_group')
      .eq('activity_id', att.activity_id)
      .maybeSingle();

    if (error) {
      console.log('  Error:', error.message);
    } else if (!conv) {
      console.log('  No conversation found');
    } else {
      console.log('  Conversation ID:', conv.id);

      // Check if user is participant
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conv.id)
        .eq('user_id', userData.id)
        .maybeSingle();

      console.log('  User is participant:', !!participant);
    }
  }
}

checkConversations().catch(console.error);
