const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function createConversation() {
  // Sign in as the test user first
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mdgooijer@gmail.com',
    password: 'password123', // You'll need to provide the actual password
  });

  if (authError) {
    console.log('Auth error:', authError.message);
    console.log('Cannot proceed without authentication');
    return;
  }

  console.log('Authenticated as:', authData.user.email);

  // Get an activity ID
  const { data: attendee } = await supabase
    .from('activity_attendees')
    .select('activity_id, activity:activities(title)')
    .eq('user_id', authData.user.id)
    .limit(1)
    .single();

  if (!attendee) {
    console.log('No activities found');
    return;
  }

  console.log('\nCreating conversation for:', attendee.activity?.title);

  // Try to create conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      type: 'activity_group',
      activity_id: attendee.activity_id,
    })
    .select()
    .single();

  if (convError) {
    console.log('Error creating conversation:', convError.message);
    console.log('Full error:', JSON.stringify(convError, null, 2));
    return;
  }

  console.log('Conversation created:', conversation.id);

  // Add user as participant
  const { data: participant, error: partError } = await supabase
    .from('conversation_participants')
    .insert({
      conversation_id: conversation.id,
      user_id: authData.user.id,
    })
    .select()
    .single();

  if (partError) {
    console.log('Error adding participant:', partError.message);
    return;
  }

  console.log('Participant added:', participant.id);
}

createConversation().catch(console.error);
