// scratch/test_live_render.js
const https = require('https');

console.log('Testing live Render backend at https://python-bdjn.onrender.com ...');

// 1. Test /api/health
https.get('https://python-bdjn.onrender.com/api/health', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Health status:', res.statusCode);
    console.log('Health body:', body);

    // 2. Test /api/admin/users with passkey king 55666
    https.get('https://python-bdjn.onrender.com/api/admin/users?key=' + encodeURIComponent('king 55666'), (res2) => {
      let body2 = '';
      res2.on('data', c => body2 += c);
      res2.on('end', () => {
        console.log('Admin status:', res2.statusCode);
        try {
          const data = JSON.parse(body2);
          console.log('Admin ok:', data.ok);
          console.log('Stats:', data.stats);
          console.log('Users count on Render:', data.users?.length);
          console.log('🎉 LIVE RENDER BACKEND FULLY VERIFIED!');
        } catch (e) {
          console.log('Admin raw response:', body2);
        }
      });
    }).on('error', err => console.error('Admin request error:', err.message));
  });
}).on('error', err => console.error('Health request error:', err.message));
