#!/usr/bin/env node
/* eslint-disable no-console, node/prefer-global/buffer, style/max-statements-per-line, unused-imports/no-unused-vars */
/**
 * Test Supabase Login
 * Tests authentication with test credentials
 */

const https = require('https');

const SUPABASE_KEY = 'sb_publishable_vc8XGH1s_-Ox8MxeqhGuLw_21nng2WT';

const testCredentials = {
  email: 'test@citycrew.com',
  password: 'test123456'
};

function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testCredentials);

    const options = {
      hostname: 'hcwolskmqcqkkrlefaog.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data, error: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('\n🧪 Testing Supabase Authentication\n');
  console.log('Credentials:');
  console.log(`  Email: ${testCredentials.email}`);
  console.log(`  Password: ${testCredentials.password}`);
  console.log('\n📡 Sending login request to Supabase...\n');

  try {
    const result = await testLogin();

    if (result.statusCode === 200 && result.data.access_token) {
      console.log('✅ LOGIN SUCCESSFUL!\n');
      console.log('Session Details:');
      console.log(`  User ID: ${result.data.user.id}`);
      console.log(`  Email: ${result.data.user.email}`);
      console.log(`  Access Token: ${result.data.access_token.substring(0, 40)}...`);
      console.log(`  Refresh Token: ${result.data.refresh_token.substring(0, 40)}...`);
      console.log(`  Expires In: ${result.data.expires_in} seconds`);
      console.log('\n🎉 Authentication is working correctly!\n');
      console.log('✅ You can now test login in the app at http://localhost:8081\n');
    } else {
      console.log('❌ LOGIN FAILED\n');
      console.log(`Status Code: ${result.statusCode}`);
      console.log('Response:', JSON.stringify(result.data, null, 2));

      if (result.statusCode === 400) {
        console.log('\n💡 Possible issues:');
        console.log('   - User does not exist');
        console.log('   - Wrong password');
        console.log('   - Email not confirmed\n');
      }
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

main();
