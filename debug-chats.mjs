import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

async function debug() {
  console.log('\n🔍 Debugging activity chats...\n');

  // Get all activities
  const { data: activities } = await supabase
    .from('activities')
    .select('id, title, host_id');

  console.log(`Found ${activities.length} activities:`);
  activities.forEach(a => console.log(`  - ${a.title} (ID: ${a.id})`));

  // Check conversations table
  console.log('\n📊 Checking conversations table...');
  const { data: allConvs, error: convError } = await supabase
    .from('conversations')
    .select('*');

  if (convError) {
    console.log(`❌ Error fetching conversations: ${convError.message}`);
  }
  else {
    console.log(`Found ${allConvs.length} total conversations`);
    allConvs.forEach(c => console.log(`  - Type: ${c.type}, Activity: ${c.activity_id || 'N/A'}`));
  }

  // Try to create a conversation manually
  console.log('\n🔧 Attempting to create conversation manually...');
  const firstActivity = activities[0];

  const { data: newConv, error: createError } = await supabase
    .from('conversations')
    .insert({
      type: 'activity_group',
      activity_id: firstActivity.id,
    })
    .select()
    .single();

  if (createError) {
    console.log(`❌ Error creating conversation: ${createError.message}`);
    console.log('Details:', createError);
  }
  else {
    console.log(`✅ Created conversation: ${newConv.id}`);

    // Try to add host as participant
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: newConv.id,
        user_id: firstActivity.host_id,
      });

    if (partError) {
      console.log(`❌ Error adding participant: ${partError.message}`);
    }
    else {
      console.log(`✅ Added host as participant`);
    }
  }
}

debug().catch(console.error);
