const http = require('http');

const PORT = 5056;
process.env.PORT = PORT;
process.env.DATA_DIR = './server/data';

// Start the server instance for test
const server = require('../server/server.js');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Auth Flow Verification (Sign In & Create Account)...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testUsername = `testuser_${timestamp}`;
  const testEmail = `test_${timestamp}@example.com`;
  const testPassword = 'SecurePassword123!';

  // Test 1: Validation - missing fields on register
  const res1 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: '', email: testEmail, password: testPassword });
  assert(res1.status === 400, 'Register fails when username is empty (HTTP 400)');

  // Test 2: Validation - short username
  const res2 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'ab', email: testEmail, password: testPassword });
  assert(res2.status === 400 && res2.body.error.includes('>= 3'), 'Register fails when username < 3 chars (HTTP 400)');

  // Test 3: Validation - short password
  const res3 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: testUsername, email: testEmail, password: '123' });
  assert(res3.status === 400 && res3.body.error.includes('>= 6'), 'Register fails when password < 6 chars (HTTP 400)');

  // Test 4: Create Account (Register) - Success
  const res4 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: testUsername, email: testEmail, password: testPassword });
  assert(res4.status === 201, 'Register creates account successfully (HTTP 201)');
  assert(res4.body.token && typeof res4.body.token === 'string', 'Register returns JWT token');
  assert(res4.body.user && res4.body.user.username === testUsername, 'Register returns user object with matching username');
  assert(!res4.body.user.password_hash && !res4.body.user.salt, 'Register response NEVER leaks password hash or salt');

  const registeredToken = res4.body.token;

  // Test 5: Conflict - Duplicate Username
  const res5 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: testUsername, email: `diff_${timestamp}@example.com`, password: testPassword });
  assert(res5.status === 409, 'Register rejects duplicate username (HTTP 409 Conflict)');

  // Test 6: Conflict - Duplicate Email (case insensitive)
  const res6 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: `diffuser_${timestamp}`, email: testEmail.toUpperCase(), password: testPassword });
  assert(res6.status === 409, 'Register rejects duplicate email case-insensitively (HTTP 409 Conflict)');

  // Test 7: Sign In (Login) - Invalid Password
  const res7 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: testUsername, password: 'WrongPassword!' });
  assert(res7.status === 401, 'Login rejects wrong password (HTTP 401)');

  // Test 8: Sign In (Login) - Non-existent user
  const res8 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'non_existent_user_9999', password: testPassword });
  assert(res8.status === 401, 'Login rejects non-existent identifier (HTTP 401)');

  // Test 9: Sign In (Login) - Success with Username
  const res9 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: testUsername, password: testPassword });
  assert(res9.status === 200, 'Login succeeds using username (HTTP 200)');
  assert(res9.body.token && res9.body.user.username === testUsername, 'Login returns valid token & user data');

  // Test 10: Sign In (Login) - Success with Email (case-insensitive)
  const res10 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: testEmail.toUpperCase(), password: testPassword });
  assert(res10.status === 200, 'Login succeeds using uppercase email (HTTP 200)');

  // Test 11: Protected Profile (/api/auth/me) with token
  const res11 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${registeredToken}` }
  });
  assert(res11.status === 200 && res11.body.user.username === testUsername, 'GET /api/auth/me returns authenticated profile');

  // Test 12: Protected Profile with invalid token
  const res12 = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': 'Bearer invalid.fake.token' }
  });
  assert(res12.status === 401, 'GET /api/auth/me rejects invalid token (HTTP 401)');

  console.log('\n=============================================');
  console.log(`  Tests completed: ${passed} passed, ${failed} failed`);
  console.log('=============================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
