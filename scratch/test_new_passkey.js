// scratch/test_new_passkey.js
const http = require('http');

console.log('Testing Admin Passkey Update to "king 55666"...');

// 1. Old passkey 'admin123' must be rejected (403)
http.get('http://localhost:5000/api/admin/users?key=admin123', (res1) => {
  console.log('Old key "admin123" response status:', res1.statusCode);
  if (res1.statusCode === 403) {
    console.log('✅ Old key "admin123" successfully blocked (403)!');
  } else {
    console.error('❌ Old key was not blocked!');
  }

  // 2. New passkey 'king 55666' must be accepted (200)
  http.get('http://localhost:5000/api/admin/users?key=' + encodeURIComponent('king 55666'), (res2) => {
    console.log('New key "king 55666" response status:', res2.statusCode);
    if (res2.statusCode === 200) {
      console.log('✅ New passkey "king 55666" accepted with 200 OK!');
    } else {
      console.error('❌ New passkey rejected!');
    }

    // 3. Spaceless passkey 'king55666' also accepted (200)
    http.get('http://localhost:5000/api/admin/users?key=king55666', (res3) => {
      console.log('Spaceless key "king55666" response status:', res3.statusCode);
      if (res3.statusCode === 200) {
        console.log('✅ Spaceless passkey "king55666" also accepted (200 OK)!');
        console.log('🎉 PASSKEY "king 55666" VERIFIED 100%!');
      }
    });
  });
});
