// --- Dual-Mode Cloud Backend Engine ---
const API_BASE = window.location.port === '5000' ? '' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : (localStorage.getItem('py_academy_api_url') || ''));
let authToken = localStorage.getItem('py_academy_token') || null;
let currentUser = null;
let isCloudOnline = false;
let syncDebounceTimer = null;
let executionEngine = localStorage.getItem('py_academy_exec_engine') || (window.location.port === '5000' ? 'server' : 'pyodide');
let authTab = 'login';
let cachedLeaderboard = [];

async function checkCloudStatus() {
  try {
    const res = await fetch(API_BASE + '/api/health', { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      isCloudOnline = true;
      if (authToken) await fetchCurrentUser();
    } else {
      isCloudOnline = false;
    }
  } catch (e) {
    isCloudOnline = false;
  }
  updateCloudUI();
}

async function fetchCurrentUser() {
  if (!authToken) return;
  try {
    const res = await fetch(API_BASE + '/api/auth/me', { headers: { 'Authorization': 'Bearer ' + authToken } });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      if (data.progress) mergeCloudState(data.progress);
    } else if (res.status === 401) {
      localStorage.removeItem('py_academy_token');
      authToken = null;
      currentUser = null;
    }
  } catch (e) {
    console.warn('Error fetching user:', e);
  }
  updateCloudUI();
}

function mergeCloudState(cloudState) {
  if (!cloudState) return;
  let changed = false;
  if (Number(cloudState.xp) > Number(state.xp)) { state.xp = Number(cloudState.xp); changed = true; }
  if (Number(cloudState.streak) > Number(state.streak)) { state.streak = Number(cloudState.streak); changed = true; }
  if (Array.isArray(cloudState.completedLessons)) {
    const set = new Set([...state.completedLessons, ...cloudState.completedLessons]);
    if (set.size > state.completedLessons.length) { state.completedLessons = Array.from(set); changed = true; }
  }
  if (Array.isArray(cloudState.completedChallenges)) {
    const set = new Set([...state.completedChallenges, ...cloudState.completedChallenges]);
    if (set.size > state.completedChallenges.length) { state.completedChallenges = Array.from(set); changed = true; }
  }
  if (cloudState.notes && typeof cloudState.notes === 'object') { state.notes = { ...cloudState.notes, ...state.notes }; }
  if (changed) { localStorage.setItem(KEY, JSON.stringify(state)); renderAll(); }
}

function updateCloudUI() {
  const dot = document.getElementById('cloudDot');
  const txt = document.getElementById('cloudUserText');
  if (!dot || !txt) return;
  if (currentUser) {
    dot.style.color = '#20c997';
    txt.textContent = currentUser.username;
    dot.title = 'Logged in as ' + currentUser.username + ' (Cloud Synced)';
  } else if (isCloudOnline) {
    dot.style.color = '#f4b942';
    txt.textContent = 'Sign In';
    dot.title = 'Backend online - Click to sign in and sync';
  } else {
    dot.style.color = '#9aa8c2';
    txt.textContent = 'Local';
    dot.title = 'Offline / Local Mode (Stored in browser)';
  }
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) { modal.style.display = 'grid'; renderAuthModal(); }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

function switchAuthTab(tab) {
  authTab = tab;
  renderAuthModal();
}

function renderAuthModal() {
  const body = document.getElementById('authModalBody');
  if (!body) return;
  if (currentUser) {
    body.innerHTML = `
      <div style="text-align:center;padding:10px 0 20px">
        <div class="logo" style="margin:0 auto 12px;width:56px;height:56px;font-size:22px">\${esc(currentUser.username.slice(0,2).toUpperCase())}</div>
        <h3 style="margin:4px 0">\${esc(currentUser.username)}</h3>
        <p class="muted" style="font-size:13px">\${esc(currentUser.email)}</p>
        <span class="pill" style="margin-top:8px">● Cloud Synchronized</span>
      </div>
      <div class="status" style="margin-bottom:18px">Your progress, XP (\${state.xp}), and challenge solutions are safely stored in your cloud account.</div>
      <div class="toolbar" style="justify-content:space-between">
        <button class="primary" onclick="forceSync()">⚡ Sync Now</button>
        <button class="danger" onclick="cloudLogout()">Sign Out</button>
      </div>
    `;
    return;
  }
  body.innerHTML = `
    <div class="modal-tabs">
      <button class="\${authTab === 'login' ? 'active' : ''}" onclick="switchAuthTab('login')">Sign In</button>
      <button class="\${authTab === 'register' ? 'active' : ''}" onclick="switchAuthTab('register')">Create Account</button>
    </div>
    <div id="authAlert" style="display:none;margin-bottom:12px"></div>
    <form onsubmit="handleAuthSubmit(event)">
      \${authTab === 'register' ? \`
        <div class="form-group">
          <label>Username</label>
          <input id="authUsername" type="text" required placeholder="Choose a username" minlength="3">
        </div>
      \` : ''}
      <div class="form-group">
        <label>\${authTab === 'login' ? 'Username or Email' : 'Email Address'}</label>
        <input id="authIdentifier" type="\${authTab === 'register' ? 'email' : 'text'}" required placeholder="\${authTab === 'login' ? 'Your username or email' : 'you@example.com'}">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input id="authPassword" type="password" required placeholder="Enter password (min 6 chars)" minlength="6">
      </div>
      <button type="submit" class="primary" style="width:100%;margin-top:10px;justify-content:center">
        \${authTab === 'login' ? 'Sign In & Sync' : 'Create Account & Sync Progress'}
      </button>
    </form>
    <div style="margin-top:16px;text-align:center;font-size:12px" class="muted">
      \${isCloudOnline ? '🟢 Connected to Python Academy Backend' : '⚪ Offline / GitHub Pages Mode'}
    </div>
  `;
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('authAlert');
  if (alertBox) { alertBox.style.display = 'block'; alertBox.className = 'status'; alertBox.textContent = 'Connecting…'; }
  try {
    if (authTab === 'login') {
      const identifier = document.getElementById('authIdentifier')?.value.trim();
      const password = document.getElementById('authPassword')?.value;
      const res = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      authToken = data.token; currentUser = data.user; localStorage.setItem('py_academy_token', authToken);
      if (data.progress) mergeCloudState(data.progress);
      await syncCloudProgress(); updateCloudUI(); closeAuthModal(); alert('Logged in successfully! Welcome ' + currentUser.username);
    } else {
      const username = document.getElementById('authUsername')?.value.trim();
      const email = document.getElementById('authIdentifier')?.value.trim();
      const password = document.getElementById('authPassword')?.value;
      const res = await fetch(API_BASE + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      authToken = data.token; currentUser = data.user; localStorage.setItem('py_academy_token', authToken);
      await syncCloudProgress(); updateCloudUI(); closeAuthModal(); alert('Account registered and progress synced!');
    }
  } catch (err) {
    if (alertBox) { alertBox.className = 'status bad'; alertBox.textContent = err.message || 'Authentication error'; }
  }
}

function cloudLogout() {
  if (confirm('Sign out of your cloud account? Local progress will remain saved in this browser.')) {
    authToken = null; currentUser = null; localStorage.removeItem('py_academy_token');
    updateCloudUI(); renderAuthModal();
  }
}

async function syncCloudProgress() {
  if (!authToken || !isCloudOnline) return;
  try {
    await fetch(API_BASE + '/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify(state)
    });
  } catch (e) { console.warn('Cloud sync error:', e); }
}

async function forceSync() {
  const alertBox = document.querySelector('#authModal .status');
  if (alertBox) alertBox.textContent = 'Syncing…';
  await syncCloudProgress();
  await fetchCurrentUser();
  if (alertBox) alertBox.textContent = 'All progress synchronized with cloud! ✓';
}

function toggleEngine() {
  executionEngine = executionEngine === 'server' ? 'pyodide' : 'server';
  localStorage.setItem('py_academy_exec_engine', executionEngine);
  renderLab();
}

async function fetchLeaderboard() {
  if (!isCloudOnline) return [];
  try {
    const res = await fetch(API_BASE + '/api/leaderboard?limit=8');
    if (res.ok) {
      const data = await res.json();
      cachedLeaderboard = data.leaderboard || [];
      return cachedLeaderboard;
    }
  } catch {}
  return [];
}
