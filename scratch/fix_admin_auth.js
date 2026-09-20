const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
const swPath = path.join(__dirname, '..', 'python-academy-complete', 'sw.js');

let html = fs.readFileSync(indexPath, 'utf8');

// Target the admin engine block from line 765 down to fetchAdminData
const targetBlock = `// --- Admin Dashboard & Student Management Engine ---
let adminPasskey = (localStorage.getItem('py_academy_admin_key') || '');
if (adminPasskey === 'admin123') {
  adminPasskey = '';
  localStorage.removeItem('py_academy_admin_key');
}
let adminCachedData = null;
let adminSearchTerm = '';

function openAdminModal() {
  let modal = document.getElementById('admin-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,8,18,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';

  if (!adminPasskey) {
    renderAdminLoginPrompt();
  } else {
    fetchAdminData();
  }
}

function closeAdminModal() {
  const m = document.getElementById('admin-modal');
  if (m) m.style.display = 'none';
}

function renderAdminLoginPrompt(errMsg = '') {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(245,158,11,0.4);border-radius:24px;max-width:440px;width:100%;padding:32px 28px;box-shadow:0 24px 60px rgba(0,0,0,0.8);text-align:center">
      <div style="font-size:48px;margin-bottom:12px">👑</div>
      <h2 style="margin:0 0 6px;color:#fff;font-size:22px">Admin Panel Access</h2>
      <p style="margin:0 0 20px;font-size:13.5px;color:#94a3b8">Enter your administrator passkey to inspect registered accounts, email addresses, and student learning progress.</p>
      <div style="margin-bottom:16px;text-align:left">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:#cbd5e1">Administrator Passkey</label>
        <input id="admin-pass-input" type="password" placeholder="Enter admin passkey..." value="king 55666" style="width:100%;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;box-sizing:border-box">
      </div>
      \${errMsg ? \`<div style="color:#f87171;font-size:13px;margin-bottom:14px">\${esc(errMsg)}</div>\` : ''}
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="ghost" onclick="closeAdminModal()">Cancel</button>
        <button class="primary" style="background:linear-gradient(135deg,#f59e0b,#ea580c);border:none;font-weight:700" onclick="submitAdminPasskey()">Unlock Dashboard ➔</button>
      </div>
    </div>
  \`;
}

async function submitAdminPasskey() {
  const input = document.getElementById('admin-pass-input');
  if (!input) return;
  adminPasskey = input.value.trim();
  localStorage.setItem('py_academy_admin_key', adminPasskey);
  await fetchAdminData();
}

async function fetchAdminData() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(245,158,11,0.3);border-radius:20px;padding:40px;text-align:center;color:#fff">
      <div style="font-size:36px;animation:spin 1s infinite linear">⏳</div>
      <p style="margin-top:14px;color:#94a3b8">Loading learner accounts and real-time statistics…</p>
    </div>
  \`;

  try {
    const res = await fetch((API_BASE || '') + '/api/admin/users?key=' + encodeURIComponent(adminPasskey), {
      headers: {
        ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {}),
        'x-admin-key': adminPasskey
      }
    });

    if (res.status === 403 || res.status === 401) {
      localStorage.removeItem('py_academy_admin_key');
      adminPasskey = '';
      renderAdminLoginPrompt('Access denied: Invalid administrator passkey.');
      return;
    }`;

const replBlock = `// --- Admin Dashboard & Student Management Engine ---
let adminPasskey = '';
try { localStorage.removeItem('py_academy_admin_key'); } catch(e) {}
let adminCachedData = null;
let adminSearchTerm = '';

function openAdminModal() {
  let modal = document.getElementById('admin-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,8,18,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  // Always require password on click - never bypass or auto-login
  renderAdminLoginPrompt();
}

function closeAdminModal() {
  const m = document.getElementById('admin-modal');
  if (m) m.style.display = 'none';
  adminPasskey = '';
  adminCachedData = null;
  try { localStorage.removeItem('py_academy_admin_key'); } catch(e) {}
}

function renderAdminLoginPrompt(errMsg = '') {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(245,158,11,0.4);border-radius:24px;max-width:440px;width:100%;padding:32px 28px;box-shadow:0 24px 60px rgba(0,0,0,0.8);text-align:center">
      <div style="font-size:48px;margin-bottom:12px">👑</div>
      <h2 style="margin:0 0 6px;color:#fff;font-size:22px">Admin Panel Access</h2>
      <p style="margin:0 0 20px;font-size:13.5px;color:#94a3b8">Enter your administrator passkey to inspect registered accounts, email addresses, and student learning progress.</p>
      <div style="margin-bottom:16px;text-align:left">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:#cbd5e1">Administrator Passkey</label>
        <input id="admin-pass-input" type="password" placeholder="Enter admin passkey..." value="" autocomplete="new-password" onkeydown="if(event.key==='Enter')submitAdminPasskey()" style="width:100%;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;box-sizing:border-box">
      </div>
      \${errMsg ? \`<div style="color:#f87171;font-size:13px;margin-bottom:14px">\${esc(errMsg)}</div>\` : ''}
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="ghost" onclick="closeAdminModal()">Cancel</button>
        <button class="primary" style="background:linear-gradient(135deg,#f59e0b,#ea580c);border:none;font-weight:700" onclick="submitAdminPasskey()">Unlock Dashboard ➔</button>
      </div>
    </div>
  \`;
  setTimeout(() => { const el = document.getElementById('admin-pass-input'); if (el) el.focus(); }, 60);
}

async function submitAdminPasskey() {
  const input = document.getElementById('admin-pass-input');
  if (!input) return;
  adminPasskey = input.value.trim();
  if (!adminPasskey) {
    renderAdminLoginPrompt('Please enter the administrator passkey.');
    return;
  }
  await fetchAdminData();
}

async function fetchAdminData() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(245,158,11,0.3);border-radius:20px;padding:40px;text-align:center;color:#fff">
      <div style="font-size:36px;animation:spin 1s infinite linear">⏳</div>
      <p style="margin-top:14px;color:#94a3b8">Loading learner accounts and real-time statistics…</p>
    </div>
  \`;

  try {
    const res = await fetch((API_BASE || '') + '/api/admin/users?key=' + encodeURIComponent(adminPasskey), {
      headers: {
        ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {}),
        'x-admin-key': adminPasskey
      }
    });

    if (res.status === 403 || res.status === 401) {
      adminPasskey = '';
      adminCachedData = null;
      renderAdminLoginPrompt('Access denied: Invalid administrator passkey.');
      return;
    }`;

// Normalize line breaks for matching
const normHtml = html.replace(/\r\n/g, '\n');
const normTarget = targetBlock.replace(/\r\n/g, '\n');

if (!normHtml.includes(normTarget)) {
  console.error("Target admin block not found!");
  process.exit(1);
}

// Replace in normalized, then write
let updatedHtml = normHtml.replace(normTarget, replBlock.replace(/\r\n/g, '\n'));

// Also replace close button in admin header
updatedHtml = updatedHtml.replace(
  '<button class="ghost small-btn" onclick="closeAdminModal()">✕ Close</button>',
  '<button class="ghost small-btn" onclick="closeAdminModal()">🔒 Lock & Exit</button>'
);

fs.writeFileSync(indexPath, updatedHtml, 'utf8');
console.log("Successfully updated index.html for strict admin password protection!");

// Bump sw.js to v10
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('python-academy-shell-v9', 'python-academy-shell-v10');
fs.writeFileSync(swPath, sw, 'utf8');
console.log("Successfully bumped sw.js to python-academy-shell-v10!");
