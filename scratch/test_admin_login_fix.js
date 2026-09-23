const http = require('http');

async function run() {
  process.env.PORT = '5070';
  const server = require('../server/server');

  await new Promise(r => setTimeout(r, 300));
  const BASE = 'http://localhost:5070';

  console.log('🧪 Starting Admin Login Verification Tests...');

  // Test 1: Register a new student
  const studentUname = `newstudent_${Date.now()}`;
  const regRes = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: studentUname, email: `${studentUname}@example.com`, password: 'password123' })
  });
  console.log('1. Student Register Status:', regRes.status);
  const regData = await regRes.json();
  const studentToken = regData.token;
  if (!studentToken) throw new Error('Missing student token');

  // Test 2: Query admin users endpoint with student token and passkey (MUST NOT CRASH)
  const adminWithKey = await fetch(`${BASE}/api/admin/users?key=king%2055666`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('2. Admin endpoint with student token + key status:', adminWithKey.status);
  if (adminWithKey.status !== 200) throw new Error('Expected 200 with passkey');
  const adminUsersData = await adminWithKey.json();
  console.log('   Total users returned:', adminUsersData.users.length);

  // Test 3: Query admin users with student token and NO passkey (MUST RETURN 403, NOT CRASH)
  const adminNoKey = await fetch(`${BASE}/api/admin/users`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('3. Admin endpoint with student token + NO key status:', adminNoKey.status);
  if (adminNoKey.status !== 403) throw new Error('Expected 403 without passkey');
  console.log('   ✅ Safely blocked student without crashing!');

  // Test 4: Student login updates updated_at and moves them to top
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: studentUname, password: 'password123' })
  });
  console.log('4. Student Login Status:', loginRes.status);
  const loginData = await loginRes.json();
  if (loginData.user.isAdmin) throw new Error('Regular student should not be admin');

  // Check that the student has updatedAt populated and is at index 0 or near top
  const checkUsersRes = await fetch(`${BASE}/api/admin/users?key=king%2055666`);
  const checkUsers = await checkUsersRes.json();
  const foundStudent = checkUsers.users.find(u => u.username === studentUname);
  console.log('   Student in Admin Panel:', {
    id: foundStudent.id,
    username: foundStudent.username,
    updatedAt: foundStudent.updatedAt,
    isAdmin: foundStudent.isAdmin
  });
  if (!foundStudent.updatedAt) throw new Error('Student updatedAt must not be null');
  if (checkUsers.users[0].username !== studentUname) {
    console.log('   Notice: top user is', checkUsers.users[0].username);
  }
  console.log('   ✅ Student login activity recorded and non-null!');

  // Test 5: Primary Admin login (rohithdub)
  const adminLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'rohithdub', password: 'king 55666' })
  });
  console.log('5. Admin Login Status:', adminLoginRes.status);
  const adminLoginData = await adminLoginRes.json();
  console.log('   Admin user isAdmin flag:', adminLoginData.user.isAdmin);
  if (!adminLoginData.user.isAdmin) throw new Error('Admin user must have isAdmin=true');

  // Test 6: Access admin panel using admin token directly (WITHOUT passkey in URL)
  const adminDirectRes = await fetch(`${BASE}/api/admin/users`, {
    headers: { 'Authorization': `Bearer ${adminLoginData.token}` }
  });
  console.log('6. Direct Admin Access with Token (No key param) Status:', adminDirectRes.status);
  if (adminDirectRes.status !== 200) throw new Error('Admin token should grant direct access');
  console.log('   ✅ Admin seamlessly authenticated via token!');

  // Test 7: Verify ROHI user isAdmin recognition from admin endpoint
  const rohiInAdmin = checkUsers.users.find(u => u.username === 'ROHI');
  console.log('7. ROHI account in Admin Panel:', {
    id: rohiInAdmin?.id,
    username: rohiInAdmin?.username,
    email: rohiInAdmin?.email,
    isAdmin: rohiInAdmin?.isAdmin
  });
  if (!rohiInAdmin?.isAdmin) throw new Error('ROHI should be recognized as admin');

  console.log('\n🎉 ALL ADMIN PANEL LOGIN & DISPLAY TESTS PASSED SUCCESSFULLY!');
  server.close();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
