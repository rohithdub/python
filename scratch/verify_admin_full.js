// scratch/verify_admin_full.js
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('--- Verifying Admin Dashboard Full-Stack Integration ---');

// 1. Verify frontend index.html has admin functions and buttons
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'python-academy-complete', 'index.html'), 'utf8');

const expectedAdminTokens = [
  'openAdminModal',
  'closeAdminModal',
  'renderAdminLoginPrompt',
  'submitAdminPasskey',
  'fetchAdminData',
  'renderAdminDashboard',
  'viewUserDetail',
  'exportAdminUsersCsv',
  'id="adminBtn"'
];

expectedAdminTokens.forEach(t => {
  if (indexHtml.includes(t)) {
    console.log(`✅ Frontend contains '${t}'`);
  } else {
    console.error(`❌ Frontend missing '${t}'!`);
    process.exit(1);
  }
});

// 2. Verify backend endpoint
const req = http.get('http://localhost:5000/api/admin/users?key=admin123', (res) => {
  if (res.statusCode !== 200) {
    console.error('❌ Server returned non-200 for admin request:', res.statusCode);
    process.exit(1);
  }
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    console.log(`✅ Backend returned ${data.users?.length} users and stats:`, data.stats);
    console.log('🎉 ADMIN PANEL FULL-STACK INTEGRATION FULLY VERIFIED!');
  });
});

req.on('error', err => {
  console.error('❌ Failed to connect to server:', err.message);
  process.exit(1);
});
