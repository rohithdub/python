// scratch/apply_admin_panel.js
const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

const adminCode = `
// --- Admin Dashboard & Student Management Engine ---
let adminPasskey = localStorage.getItem('py_academy_admin_key') || '';
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
        <input id="admin-pass-input" type="password" placeholder="Enter admin passkey..." value="admin123" style="width:100%;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;box-sizing:border-box">
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
    }

    if (!res.ok) {
      throw new Error('Server returned status ' + res.status);
    }

    adminCachedData = await res.json();
    renderAdminDashboard();
  } catch (err) {
    modal.innerHTML = \`
      <div style="background:#0e1526;border:1px solid rgba(239,68,68,0.4);border-radius:20px;max-width:440px;padding:28px;text-align:center;color:#fff">
        <div style="font-size:40px;margin-bottom:12px">⚠️</div>
        <h3 style="margin:0 0 8px">Unable to Connect to Backend</h3>
        <p style="color:#94a3b8;font-size:13.5px;margin:0 0 20px">Make sure your backend server is running (locally at http://localhost:5000 or on Render) and connected.</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="ghost" onclick="closeAdminModal()">Close</button>
          <button class="primary" onclick="openServerConfigModal()">Configure Server URL</button>
        </div>
      </div>
    \`;
  }
}

function renderAdminDashboard() {
  const modal = document.getElementById('admin-modal');
  if (!modal || !adminCachedData) return;

  const users = adminCachedData.users || [];
  const stats = adminCachedData.stats || { totalUsers: users.length, totalXp: 0, totalLessonsCompleted: 0 };
  const term = adminSearchTerm.toLowerCase();
  const filtered = users.filter(u => 
    (u.username || '').toLowerCase().includes(term) || 
    (u.email || '').toLowerCase().includes(term)
  );

  modal.innerHTML = \`
    <div style="max-width:1050px;width:95vw;background:#0d1424;border:1px solid rgba(245,158,11,0.4);border-radius:24px;box-shadow:0 25px 60px rgba(0,0,0,0.85);max-height:92vh;display:flex;flex-direction:column;overflow:hidden">
      <!-- Header -->
      <div style="padding:18px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;background:rgba(245,158,11,0.06)">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:30px">👑</span>
          <div>
            <h2 style="margin:0;font-size:19px;color:#fff;display:flex;align-items:center;gap:8px">
              Admin Panel · Student Directory & Progress
              <span style="font-size:11px;padding:2px 8px;background:rgba(0,230,118,0.15);color:#00e676;border-radius:999px;border:1px solid #00e676">Live</span>
            </h2>
            <p style="margin:2px 0 0;font-size:12px;color:#94a3b8">Inspect registered user accounts, emails, XP, and lesson completion status</p>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="ghost small-btn" onclick="exportAdminUsersCsv()">📥 Export CSV</button>
          <button class="ghost small-btn" onclick="fetchAdminData()">🔄 Refresh</button>
          <button class="ghost small-btn" onclick="closeAdminModal()">✕ Close</button>
        </div>
      </div>

      <!-- KPI Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:12px;padding:14px 24px;background:#090e18;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:10px 14px">
          <div style="font-size:11.5px;color:#94a3b8">Total Learners</div>
          <div style="font-size:22px;font-weight:700;color:#fff">\${stats.totalUsers}</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:10px 14px">
          <div style="font-size:11.5px;color:#94a3b8">Total Community XP</div>
          <div style="font-size:22px;font-weight:700;color:#7c5cff">\${stats.totalXp} XP</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:10px 14px">
          <div style="font-size:11.5px;color:#94a3b8">Lessons Mastered</div>
          <div style="font-size:22px;font-weight:700;color:#00e676">\${stats.totalLessonsCompleted}</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:10px 14px">
          <div style="font-size:11.5px;color:#94a3b8">Code Sandbox Runs</div>
          <div style="font-size:22px;font-weight:700;color:#38bdf8">\${stats.totalCodeRuns || 0}</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div style="padding:12px 24px;display:flex;gap:12px;align-items:center;background:#0d1424;border-bottom:1px solid rgba(255,255,255,0.04)">
        <input id="admin-search-input" type="text" placeholder="🔍 Search learners by username or email address..." value="\${esc(adminSearchTerm)}" oninput="handleAdminSearch(this.value)" style="flex:1;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:13.5px">
        <span style="font-size:12.5px;color:#94a3b8">\${filtered.length} of \${users.length} accounts</span>
      </div>

      <!-- Table Container -->
      <div style="flex:1;overflow-y:auto;padding:0 24px 20px">
        <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13px">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px">
              <th style="padding:12px 8px">ID</th>
              <th style="padding:12px 8px">Learner Name</th>
              <th style="padding:12px 8px">Email Address</th>
              <th style="padding:12px 8px">Total XP</th>
              <th style="padding:12px 8px">Streak</th>
              <th style="padding:12px 8px">Lessons Done</th>
              <th style="padding:12px 8px">Registered Date</th>
              <th style="padding:12px 8px">Last Active</th>
              <th style="padding:12px 8px;text-align:right">Progress Details</th>
            </tr>
          </thead>
          <tbody>
            \${filtered.length === 0 ? \`
              <tr>
                <td colspan="9" style="text-align:center;padding:40px;color:#64748b">No accounts found matching your search.</td>
              </tr>
            \` : filtered.map(u => \`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
                <td style="padding:12px 8px;color:#64748b">#\${u.id}</td>
                <td style="padding:12px 8px;font-weight:600;color:#fff">\${esc(u.username)}</td>
                <td style="padding:12px 8px;color:#38bdf8;font-family:monospace;font-size:12.5px">\${esc(u.email)}</td>
                <td style="padding:12px 8px;color:#a855f7;font-weight:700">\${u.xp} XP</td>
                <td style="padding:12px 8px">\${u.streak > 0 ? \`🔥 \${u.streak}d\` : '0d'}</td>
                <td style="padding:12px 8px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-weight:600">\${u.completedCount || 0} / 88</span>
                    <div style="width:50px;height:5px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden">
                      <div style="width:\${Math.min(100, Math.round(((u.completedCount || 0) / 88) * 100))}%;height:100%;background:#00e676"></div>
                    </div>
                  </div>
                </td>
                <td style="padding:12px 8px;color:#94a3b8;font-size:12px">\${u.createdAt ? u.createdAt.slice(0, 10) : '—'}</td>
                <td style="padding:12px 8px;color:#94a3b8;font-size:12px">\${u.updatedAt ? u.updatedAt.slice(0, 10) : '—'}</td>
                <td style="padding:12px 8px;text-align:right">
                  <button class="ghost small-btn" onclick="viewUserDetail(\${u.id})">Inspect ➔</button>
                </td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  \`;
}

function handleAdminSearch(val) {
  adminSearchTerm = val;
  renderAdminDashboard();
  const inp = document.getElementById('admin-search-input');
  if (inp) {
    inp.focus();
    inp.setSelectionRange(val.length, val.length);
  }
}

function viewUserDetail(userId) {
  if (!adminCachedData || !adminCachedData.users) return;
  const u = adminCachedData.users.find(x => x.id === userId);
  if (!u) return;

  let detailModal = document.getElementById('admin-user-detail-modal');
  if (!detailModal) {
    detailModal = document.createElement('div');
    detailModal.id = 'admin-user-detail-modal';
    detailModal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999999;padding:16px';
    document.body.appendChild(detailModal);
  }

  const completedList = (u.completedLessons || []).map(id => {
    const l = typeof LESSONS !== 'undefined' ? LESSONS.find(x => x.id === id) : null;
    return l ? \`Level \${l.level} · \${l.title}\` : id;
  });

  detailModal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(124,92,255,0.4);border-radius:24px;max-width:540px;width:100%;padding:28px;box-shadow:0 25px 60px rgba(0,0,0,0.9);max-height:85vh;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
        <div>
          <h3 style="margin:0;font-size:20px;color:#fff">\${esc(u.username)}</h3>
          <div style="font-size:13px;color:#38bdf8;margin-top:2px">\${esc(u.email)} · User #\${u.id}</div>
        </div>
        <button class="ghost small-btn" onclick="document.getElementById('admin-user-detail-modal').style.display='none'">✕ Close</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px">
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
          <div style="font-size:11px;color:#94a3b8">XP Earned</div>
          <div style="font-size:18px;font-weight:700;color:#7c5cff">\${u.xp}</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
          <div style="font-size:11px;color:#94a3b8">Study Streak</div>
          <div style="font-size:18px;font-weight:700;color:#f59e0b">🔥 \${u.streak}d</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
          <div style="font-size:11px;color:#94a3b8">Completed</div>
          <div style="font-size:18px;font-weight:700;color:#00e676">\${u.completedCount} / 88</div>
        </div>
      </div>

      <h4 style="margin:0 0 8px;font-size:14px;color:#cbd5e1">Mastered Lessons (\${completedList.length})</h4>
      <div style="flex:1;overflow-y:auto;background:#090e18;border:1px solid var(--border);border-radius:12px;padding:12px;max-height:220px">
        \${completedList.length === 0 ? '<div style="color:#64748b;font-size:13px;text-align:center;padding:20px">No lessons completed yet.</div>' : completedList.map(item => \`
          <div style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12.5px;color:#e2e8f0;display:flex;align-items:center;gap:8px">
            <span style="color:#00e676">✓</span> \${esc(item)}
          </div>
        \`).join('')}
      </div>

      <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#94a3b8">
        <div>Registered: \${u.createdAt ? u.createdAt : '—'}</div>
        <button class="primary small-btn" onclick="document.getElementById('admin-user-detail-modal').style.display='none'">Done</button>
      </div>
    </div>
  \`;
  detailModal.style.display = 'flex';
}

function exportAdminUsersCsv() {
  if (!adminCachedData || !adminCachedData.users) return;
  const users = adminCachedData.users;
  let csv = 'ID,Username,Email,XP,Streak,CompletedLessons,RegisteredDate,LastActiveDate\\n';
  users.forEach(u => {
    csv += \`"\${u.id}","\${(u.username||'').replace(/"/g, '""')}","\${(u.email||'').replace(/"/g, '""')}",\${u.xp},\${u.streak},\${u.completedCount},"\${u.createdAt||''}","\${u.updatedAt||''}"\\n\`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'python-academy-learners.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
`;

if (!html.includes('// --- Admin Dashboard & Student Management Engine ---')) {
  html = html.replace('function openServerConfigModal()', adminCode + '\nfunction openServerConfigModal()');
  console.log('✅ Injected Admin Dashboard Engine into index.html');
}

// Add Admin Panel button in Profile toolbar
const oldProfileBtnTarget = `<button class="ghost" onclick="openServerConfigModal()">☁️ Cloud Backend Server</button>`;
const newProfileBtnTarget = `<button class="ghost" onclick="openServerConfigModal()">☁️ Cloud Backend Server</button><button class="primary" style="background:linear-gradient(135deg,#f59e0b,#ea580c);border:none;color:#fff" onclick="openAdminModal()">👑 Admin Panel</button>`;

if (html.includes(oldProfileBtnTarget)) {
  html = html.replace(oldProfileBtnTarget, newProfileBtnTarget);
  console.log('✅ Added 👑 Admin Panel button to Profile tab toolbar');
}

// Add Admin button to top navigation bar
const navTarget = `<button class="primary" onclick="openAuthModal()" id="navAuthBtn">☁️ Account</button>`;
const newNavTarget = `<button class="ghost" style="padding:6px 12px;font-size:13px;border-color:rgba(245,158,11,0.5);color:#f59e0b" onclick="openAdminModal()">👑 Admin</button>\n      <button class="primary" onclick="openAuthModal()" id="navAuthBtn">☁️ Account</button>`;

if (html.includes(navTarget)) {
  html = html.replace(navTarget, newNavTarget);
  console.log('✅ Added 👑 Admin shortcut button to top navigation bar');
}

fs.writeFileSync(targetPath, html, 'utf8');
console.log('✅ Updated index.html successfully!');
