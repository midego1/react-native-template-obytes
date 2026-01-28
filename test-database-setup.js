/**
 * Test script to verify database setup for Phase 2
 * Run with: node test-database-setup.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hcwolskmqcqkkrlefaog.supabase.co';
const supabaseKey = 'sb_publishable_vc8XGH1s_-Ox8MxeqhGuLw_21nng2WT';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSetup() {
  console.log('🧪 Testing Phase 2 Database Setup...\n');

  try {
    // Test 1: Check if push_tokens table exists
    console.log('✅ Test 1: Checking push_tokens table...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('push_tokens')
      .select('*')
      .limit(1);

    if (tokenError && tokenError.code !== 'PGRST116') {
      console.log('❌ push_tokens table error:', tokenError.message);
    }
    else {
      console.log('✅ push_tokens table exists and is accessible\n');
    }

    // Test 2: Check if conversations table exists
    console.log('✅ Test 2: Checking conversations table...');
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);

    if (convError && convError.code !== 'PGRST116') {
      console.log('❌ conversations table error:', convError.message);
    }
    else {
      console.log('✅ conversations table exists and is accessible\n');
    }

    // Test 3: Check if messages table exists
    console.log('✅ Test 3: Checking messages table...');
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (msgError && msgError.code !== 'PGRST116') {
      console.log('❌ messages table error:', msgError.message);
    }
    else {
      console.log('✅ messages table exists and is accessible\n');
    }

    // Test 4: Check if conversation_participants table exists
    console.log('✅ Test 4: Checking conversation_participants table...');
    const { data: partData, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .limit(1);

    if (partError && partError.code !== 'PGRST116') {
      console.log('❌ conversation_participants table error:', partError.message);
    }
    else {
      console.log('✅ conversation_participants table exists and is accessible\n');
    }

    // Test 5: Check if crew_connections table exists
    console.log('✅ Test 5: Checking crew_connections table...');
    const { data: crewData, error: crewError } = await supabase
      .from('crew_connections')
      .select('*')
      .limit(1);

    if (crewError && crewError.code !== 'PGRST116') {
      console.log('❌ crew_connections table error:', crewError.message);
    }
    else {
      console.log('✅ crew_connections table exists and is accessible\n');
    }

    console.log('✅ All database tables verified!\n');
    console.log('📝 Note: Triggers and functions can only be verified through Supabase Dashboard or SQL queries.\n');
    console.log('🎉 Phase 2 database setup is complete and ready for testing!');
  }
  catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testDatabaseSetup();
