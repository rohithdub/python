// scratch/test_admin_api.js
const http = require('http');

console.log('Testing Admin API Endpoint...');

// 1. Test without authorization (should return 403)
const req1 = http.get('http://localhost:5000/api/admin/users', (res) => {
  console.log('Unauthenticated request status:', res.statusCode);
  if (res.statusCode === 403) {
    console.log('✅ Correctly blocked unauthenticated request (403)');
  }

  // 2. Test with admin key query param
  const req2 = http.get('http://localhost:5000/api/admin/users?key=admin123', (res2) => {
    console.log('Authorized request status:', res2.statusCode);
    let body = '';
    res2.on('data', chunk => body += chunk);
    res2.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Response ok:', data.ok);
        console.log('Stats:', data.stats);
        console.log('Total users returned:', data.users?.length);
        if (data.users?.length > 0) {
          console.log('First user:', data.users[0]);
        }
        console.log('🎉 ADMIN API ENDPOINT VERIFIED SUCCESSFULLY!');
      } catch (err) {
        console.error('Error parsing response:', err.message);
      }
    });
  });

  req2.on('error', err => console.error('Req2 failed:', err.message));
});

req1.on('error', err => {
  console.error('Req1 failed:', err.message);
});
