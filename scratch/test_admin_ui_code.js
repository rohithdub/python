// scratch/test_admin_ui_code.js
function generateAdminHtml(data, filterTerm = '') {
  const users = data.users || [];
  const stats = data.stats || { totalUsers: 0, totalXp: 0, totalLessonsCompleted: 0 };
  const filtered = users.filter(u => {
    const term = filterTerm.toLowerCase();
    return u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  return `
    <div style="max-width:960px;width:95vw;background:#0d1424;border:1px solid rgba(245,158,11,0.4);border-radius:24px;box-shadow:0 25px 60px rgba(0,0,0,0.8);max-height:90vh;display:flex;flex-direction:column;overflow:hidden">
      <!-- Header -->
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;background:rgba(245,158,11,0.06)">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:32px">👑</span>
          <div>
            <h2 style="margin:0;font-size:20px;color:#fff">Admin Panel · Learner Management</h2>
            <p style="margin:2px 0 0;font-size:12.5px;color:#94a3b8">Real-time student accounts, emails, and learning progress</p>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="ghost small-btn" onclick="exportAdminUsersCsv()">📥 Export CSV</button>
          <button class="ghost small-btn" onclick="fetchAdminData()">🔄 Refresh</button>
          <button class="ghost small-btn" onclick="closeAdminModal()">✕</button>
        </div>
      </div>

      <!-- KPI Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;padding:16px 24px;background:#090e18;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:12px 16px">
          <div style="font-size:12px;color:#94a3b8">Registered Learners</div>
          <div style="font-size:22px;font-weight:700;color:#fff">${stats.totalUsers}</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:12px 16px">
          <div style="font-size:12px;color:#94a3b8">Community XP</div>
          <div style="font-size:22px;font-weight:700;color:#7c5cff">${stats.totalXp} XP</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:12px 16px">
          <div style="font-size:12px;color:#94a3b8">Lessons Mastered</div>
          <div style="font-size:22px;font-weight:700;color:#00e676">${stats.totalLessonsCompleted}</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div style="padding:12px 24px;display:flex;gap:12px;align-items:center;background:#0d1424">
        <input id="admin-search-input" type="text" placeholder="🔍 Search by username or email address..." value="${filterTerm}" style="flex:1;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:13.5px">
        <span style="font-size:13px;color:#94a3b8">Showing ${filtered.length} of ${users.length}</span>
      </div>

      <!-- Table Container -->
      <div style="flex:1;overflow-y:auto;padding:0 24px 20px">
        <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13.5px">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;font-size:12px">
              <th style="padding:10px 8px">ID</th>
              <th style="padding:10px 8px">Username</th>
              <th style="padding:10px 8px">Email Address</th>
              <th style="padding:10px 8px">XP</th>
              <th style="padding:10px 8px">Streak</th>
              <th style="padding:10px 8px">Completed</th>
              <th style="padding:10px 8px">Registered</th>
              <th style="padding:10px 8px">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(u => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
                <td style="padding:12px 8px;color:#64748b">#${u.id}</td>
                <td style="padding:12px 8px;font-weight:600;color:#fff">${u.username}</td>
                <td style="padding:12px 8px;color:#38bdf8">${u.email}</td>
                <td style="padding:12px 8px;color:#7c5cff;font-weight:700">${u.xp} XP</td>
                <td style="padding:12px 8px">🔥 ${u.streak}d</td>
                <td style="padding:12px 8px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span>${u.completedCount} / 88</span>
                    <div style="width:60px;height:6px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden">
                      <div style="width:${Math.round((u.completedCount / 88) * 100)}%;height:100%;background:#00e676"></div>
                    </div>
                  </div>
                </td>
                <td style="padding:12px 8px;color:#94a3b8;font-size:12px">${u.createdAt ? u.createdAt.slice(0, 10) : '—'}</td>
                <td style="padding:12px 8px">
                  <button class="ghost small-btn" onclick="viewUserDetail(${u.id})">Inspect ➔</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

console.log('Admin UI template generated successfully.');
