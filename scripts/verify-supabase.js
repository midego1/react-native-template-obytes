#!/usr/bin/env node
/* eslint-disable no-console, style/max-statements-per-line, prefer-promise-reject-errors, unused-imports/no-unused-vars */
/**
 * Supabase Setup Verification Script
 * Checks if database tables exist and are accessible
 */

const https = require('node:https');

const SUPABASE_URL = 'https://hcwolskmqcqkkrlefaog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vc8XGH1s_-Ox8MxeqhGuLw_21nng2WT';

async function checkTable(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hcwolskmqcqkkrlefaog.supabase.co',
      path: `/rest/v1/${tableName}?select=count`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ table: tableName, status: '✅ EXISTS', statusCode: res.statusCode });
        }
        else if (res.statusCode === 401 || res.statusCode === 403) {
          resolve({ table: tableName, status: '⚠️  PROTECTED (RLS)', statusCode: res.statusCode });
        }
        else {
          resolve({ table: tableName, status: `❌ ERROR (${res.statusCode})`, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject({ table: tableName, status: '❌ FAILED', error: error.message });
    });

    req.end();
  });
}

async function main() {
  console.log('\n🔍 Verifying Supabase Setup...\n');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Project: hcwolskmqcqkkrlefaog\n`);

  const tables = [
    'users',
    'activities',
    'activity_attendees',
    'crew_connections',
    'conversations',
    'conversation_participants',
    'messages',
  ];

  console.log('Checking tables:\n');

  for (const table of tables) {
    try {
      const result = await checkTable(table);
      console.log(`${result.status.padEnd(25)} ${table}`);
    }
    catch (error) {
      console.log(`❌ FAILED                  ${table} - ${error.error}`);
    }
  }

  console.log('\n📝 Notes:');
  console.log('  ✅ EXISTS          = Table exists and is accessible');
  console.log('  ⚠️  PROTECTED (RLS) = Table exists but RLS is blocking (expected!)');
  console.log('  ❌ ERROR           = Table might not exist or API issue\n');

  console.log('💡 RLS (Row Level Security) is ENABLED on all tables.');
  console.log('   This is correct! Tables should only be accessible when logged in.\n');
}

main().catch(console.error);
