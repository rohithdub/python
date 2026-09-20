const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// --- Code block to inject after "let state=loadState();" ---
const cloudSyncCode = `
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
      if (authToken) {
        await fetchCurrentUser();
      }
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
    const res = await fetch(API_BASE + '/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + authToken }
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      if (data.progress) {
        mergeCloudState(data.progress);
      }
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
  if (Number(cloudState.xp) > Number(state.xp)) {
    state.xp = Number(cloudState.xp);
    changed = true;
  }
  if (Number(cloudState.streak) > Number(state.streak)) {
    state.streak = Number(cloudState.streak);
    changed = true;
  }
  if (Array.isArray(cloudState.completedLessons)) {
    const set = new Set([...state.completedLessons, ...cloudState.completedLessons]);
    if (set.size > state.completedLessons.length) {
      state.completedLessons = Array.from(set);
      changed = true;
    }
  }
  if (Array.isArray(cloudState.completedChallenges)) {
    const set = new Set([...state.completedChallenges, ...cloudState.completedChallenges]);
    if (set.size > state.completedChallenges.length) {
      state.completedChallenges = Array.from(set);
      changed = true;
    }
  }
  if (cloudState.notes && typeof cloudState.notes === 'object') {
    state.notes = { ...cloudState.notes, ...state.notes };
  }
  if (changed) {
    localStorage.setItem(KEY, JSON.stringify(state));
    renderAll();
  }
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
    dot.title = 'Backend online - Sign in to sync progress';
  } else {
    dot.style.color = '#9aa8c2';
    txt.textContent = 'Local';
    dot.title = 'Offline / Local Mode (Stored in browser)';
  }
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'grid';
    renderAuthModal();
  }
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
    body.innerHTML = \`
      <div style="text-align:center;padding:12px 0 20px">
        <div class="logo" style="margin:0 auto 12px;width:56px;height:56px;font-size:22px">\${currentUser.username.slice(0,2).toUpperCase()}</div>
        <h3 style="margin:4px 0">\${esc(currentUser.username)}</h3>
        <p class="muted" style="font-size:13px">\${esc(currentUser.email)}</p>
        <span class="pill" style="margin-top:8px">● Cloud Synchronized</span>
      </div>
      <div class="status" style="margin-bottom:18px">
        Your learning progress, quiz scores, XP (\${state.xp}), and challenge answers automatically sync with the cloud.
      </div>
      <div class="toolbar" style="justify-content:space-between">
        <button class="primary" onclick="forceSync()">⚡ Sync Now</button>
        <button class="danger" onclick="cloudLogout()">Sign Out</button>
      </div>
    \`;
    return;
  }

  body.innerHTML = \`
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
      \${isCloudOnline ? '🟢 Connected to Python Academy Server' : '⚪ Running in Local Mode (Offline)'}
    </div>
  \`;
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('authAlert');
  if (alertBox) {
    alertBox.style.display = 'block';
    alertBox.className = 'status';
    alertBox.textContent = 'Connecting to server…';
  }

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

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('py_academy_token', authToken);
      if (data.progress) mergeCloudState(data.progress);
      await syncCloudProgress();
      updateCloudUI();
      closeAuthModal();
      alert('Welcome back, ' + currentUser.username + '! Progress synced.');
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

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('py_academy_token', authToken);
      await syncCloudProgress();
      updateCloudUI();
      closeAuthModal();
      alert('Account created successfully! Your progress is now backed up.');
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'status bad';
      alertBox.textContent = err.message || 'Authentication error';
    }
  }
}

function cloudLogout() {
  if (confirm('Sign out of your cloud account? Your progress on this browser remains safe.')) {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('py_academy_token');
    updateCloudUI();
    renderAuthModal();
  }
}

async function syncCloudProgress() {
  if (!authToken || !isCloudOnline) return;
  try {
    await fetch(API_BASE + '/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify(state)
    });
  } catch (e) {
    console.warn('Sync failed:', e);
  }
}

async function forceSync() {
  const alertBox = document.querySelector('#authModal .status');
  if (alertBox) alertBox.textContent = 'Syncing progress to cloud…';
  await syncCloudProgress();
  await fetchCurrentUser();
  if (alertBox) alertBox.textContent = 'Progress fully synchronized with cloud! ✓';
}

function toggleEngine() {
  executionEngine = executionEngine === 'server' ? 'pyodide' : 'server';
  localStorage.setItem('py_academy_exec_engine', executionEngine);
  renderLab();
}

async function fetchLeaderboard() {
  if (!isCloudOnline) return [];
  try {
    const res = await fetch(API_BASE + '/api/leaderboard?limit=10');
    if (res.ok) {
      const data = await res.json();
      cachedLeaderboard = data.leaderboard || [];
      return cachedLeaderboard;
    }
  } catch {}
  return [];
}
`;

// Insert cloudSyncCode after let state=loadState();
html = html.replace('let state=loadState();', `let state=loadState();\n${cloudSyncCode}`);

// Update save() function to debounce sync to cloud
const oldSave = 'function save(){localStorage.setItem(KEY,JSON.stringify(state)); renderAll();}';
const newSave = `function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
  renderAll();
  if (authToken && isCloudOnline) {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(syncCloudProgress, 800);
  }
}`;
html = html.replace(oldSave, newSave);

// Update executePython to support backend execution with automatic Pyodide fallback
const oldExecutePython = 'function executePython(code,input,ms){return new Promise((resolve,reject)=>{const w=makeWorker();let startupTimer=setTimeout(()=>{w.terminate();reject(new Error(\'Python runtime could not load within 20 seconds.\'))},20000);w.onmessage=e=>{if(e.data.type===\'ready\'){clearTimeout(startupTimer);const t=setTimeout(()=>{w.terminate();reject(new Error(\'timeout\'))},ms);w._timer=t;w.postMessage({type:\'run\',code,input});return;}clearTimeout(startupTimer);clearTimeout(w._timer);w.terminate();e.data.ok?resolve(e.data.out):reject(new Error(e.data.out))};w.onerror=e=>{clearTimeout(startupTimer);clearTimeout(w._timer);w.terminate();reject(e)}})}';

const newExecutePython = `async function executePython(code, input, ms) {
  if (executionEngine === 'server' && isCloudOnline) {
    try {
      const res = await fetch(API_BASE + '/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
        },
        body: JSON.stringify({ code, stdin: input, timeoutMs: ms || 3000 })
      });
      const data = await res.json();
      if (data.ok) {
        return data.stdout || '(no output)';
      }
      throw new Error(data.stderr || data.error || 'Execution failed');
    } catch (err) {
      console.warn('Backend execution unavailable, falling back to Pyodide worker:', err.message);
    }
  }

  return new Promise((resolve, reject) => {
    const w = makeWorker();
    let startupTimer = setTimeout(() => {
      w.terminate();
      reject(new Error('Python runtime could not load within 20 seconds. Check connection.'));
    }, 20000);

    w.onmessage = e => {
      if (e.data.type === 'ready') {
        clearTimeout(startupTimer);
        const t = setTimeout(() => {
          w.terminate();
          reject(new Error('Execution timed out (3 seconds limit)'));
        }, ms || 3000);
        w._timer = t;
        w.postMessage({ type: 'run', code, input });
        return;
      }
      clearTimeout(startupTimer);
      clearTimeout(w._timer);
      w.terminate();
      e.data.ok ? resolve(e.data.out) : reject(new Error(e.data.out));
    };

    w.onerror = e => {
      clearTimeout(startupTimer);
      clearTimeout(w._timer);
      w.terminate();
      reject(e);
    };
  });
}`;

html = html.replace(oldExecutePython, newExecutePython);

// Update renderLab to include the Engine Selector
const oldRenderLab = "function renderLab(){const el=document.getElementById('view-lab'); if(labRunning===false){} el.innerHTML=`<div class=\"hero\"><div class=\"eyebrow\">Browser Python Lab</div><h2>Experiment without leaving the course.</h2><p>Your code runs in a Web Worker using Pyodide. The worker is terminated after a timeout so a runaway loop cannot freeze the page.</p></div><div class=\"lab\"><div class=\"card\"><h3>Editor</h3><textarea id=\"editor\" class=\"editor\" spellcheck=\"false\">${esc(state.labCode)}</textarea><label class=\"muted\" style=\"display:block;margin:10px 0 6px\">Input for <code>input()</code> — one value per line</label><textarea id=\"labInput\" style=\"width:100%;min-height:90px;resize:vertical;background:#090e18;color:var(--text);border:1px solid var(--border);border-radius:12px;padding:12px;font-family:monospace\">${esc(state.labInput||'')}</textarea><div class=\"toolbar\"><button class=\"primary\" onclick=\"runCode()\">▶ Run</button><button class=\"ghost\" onclick=\"stopCode()\">■ Stop</button><button class=\"ghost\" onclick=\"clearLab()\">Clear</button><button class=\"ghost\" onclick=\"copyLab()\">Copy</button><span class=\"spacer\"></span><span class=\"pill\">3s execution limit</span></div></div><div class=\"card\"><h3>Output</h3><div id=\"labOutput\" class=\"lab-output\">Ready. Press Run.</div><div class=\"toolbar\"><span class=\"muted\" style=\"font-size:12px\">Tip: enter values in the Input box, one line per input().</span></div></div></div>`;}";

const newRenderLab = `function renderLab(){
  const el = document.getElementById('view-lab');
  const engineLabel = executionEngine === 'server' ? '⚡ Engine: Backend Sandbox' : '🌐 Engine: Pyodide Worker';
  el.innerHTML = \`<div class="hero"><div class="eyebrow">Interactive Python Lab</div><h2>Experiment without leaving the course.</h2><p>Run code either directly inside your browser via WebAssembly (Pyodide) or execute remotely with native speed via your backend server.</p></div><div class="lab"><div class="card"><h3>Editor</h3><textarea id="editor" class="editor" spellcheck="false">\${esc(state.labCode)}</textarea><label class="muted" style="display:block;margin:10px 0 6px">Input for <code>input()</code> — one value per line</label><textarea id="labInput" style="width:100%;min-height:90px;resize:vertical;background:#090e18;color:var(--text);border:1px solid var(--border);border-radius:12px;padding:12px;font-family:monospace">\${esc(state.labInput||'')}</textarea><div class="toolbar"><button class="primary" onclick="runCode()">▶ Run</button><button class="ghost" onclick="stopCode()">■ Stop</button><button class="ghost" onclick="clearLab()">Clear</button><button class="ghost" onclick="copyLab()">Copy</button><button class="ghost" onclick="toggleEngine()" title="Toggle Execution Engine">\${engineLabel}</button><span class="spacer"></span><span class="pill">3s limit</span></div></div><div class="card"><h3>Output</h3><div id="labOutput" class="lab-output">Ready. Press Run.</div><div class="toolbar"><span class="muted" style="font-size:12px">Tip: enter values in the Input box, one line per input(). Mode: \${executionEngine}.</span></div></div></div>\`;
}`;

html = html.replace(oldRenderLab, newRenderLab);

// Update renderProfile to show Cloud Account, Sync Status, and Leaderboard
const oldRenderProfile = 'function renderProfile(){const el=document.getElementById(\'view-profile\'); const mastered=state.completedLessons.length; const notes=Object.values(state.notes).filter(Boolean).length; el.innerHTML=`<div class="hero"><div class="eyebrow">Profile & progress</div><h2>Your private learning dashboard.</h2><p>No sign-in and no server database. Resetting clears this browser’s stored progress.</p></div><div class="grid grid-3"><div class="card"><div class="eyebrow">Mastery</div><h3>${pct(mastered,LESSONS.length)}%</h3><p>${mastered} of ${LESSONS.length} lessons</p></div><div class="card"><div class="eyebrow">Bookmarks</div><h3>${state.bookmarks.length}</h3><p>Lessons saved for review</p></div><div class="card"><div class="eyebrow">Notes</div><h3>${notes}</h3><p>Personal notes stored locally</p></div></div><div class="card" style="margin-top:16px"><div class="eyebrow">Level status</div>${CURRICULUM.map(l=>{const p=levelProgress(+l.id);return `<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)"><div><strong>Level ${l.id} · ${esc(l.title)}</strong><div class="progress" style="margin-top:8px"><span style="width:${pct(p.done,p.total)}%"></span></div></div><span class="pill">${p.done} / ${p.total}</span></div>`}).join('')}</div><div class="toolbar" style="margin-top:16px"><button class="ghost" onclick="exportProgress()">Export progress</button><button class="ghost" onclick="importProgress()">Import progress</button><button class="danger" onclick="resetProgress()">Reset everything</button></div>`}';

const newRenderProfile = `async function renderProfile(){
  const el = document.getElementById('view-profile');
  const mastered = state.completedLessons.length;
  const notes = Object.values(state.notes).filter(Boolean).length;
  const lb = await fetchLeaderboard();

  el.innerHTML = \`<div class="hero"><div class="eyebrow">Profile & Learning Dashboard</div><h2>Your personal & cloud learning hub.</h2><p>Supports private offline learning as well as cloud-synced accounts across your desktop and mobile devices.</p></div><div class="grid grid-3"><div class="card"><div class="eyebrow">Mastery</div><h3>\${pct(mastered,LESSONS.length)}%</h3><p>\${mastered} of \${LESSONS.length} lessons</p></div><div class="card"><div class="eyebrow">Bookmarks</div><h3>\${state.bookmarks.length}</h3><p>Lessons saved for review</p></div><div class="card"><div class="eyebrow">Notes</div><h3>\${notes}</h3><p>Personal notes saved</p></div></div><div class="card" style="margin-top:16px"><div class="eyebrow">Cloud Account & Sync</div><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:10px"><div><strong>Status: </strong>\${currentUser ? \`Logged in as <span style="color:var(--accent2)">\${esc(currentUser.username)}</span> (\${esc(currentUser.email)})\` : 'Local Mode (No cloud account active)'}</div><div class="toolbar" style="margin:0"><button class="primary" onclick="openAuthModal()">\${currentUser ? 'Manage Account' : 'Connect Cloud Account'}</button>\${currentUser ? '<button class="ghost" onclick="forceSync()">Sync Now</button>' : ''}</div></div></div>\${lb && lb.length ? \`<div class="card" style="margin-top:16px"><div class="eyebrow">Community Leaderboard</div><div style="margin-top:10px">\${lb.slice(0, 5).map((u, i) => \`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span><strong>#\${i+1} \${esc(u.username)}</strong></span><span class="pill">\${u.xp} XP 🔥 \${u.streak}d</span></div>\`).join('')}</div></div>\` : ''}<div class="card" style="margin-top:16px"><div class="eyebrow">Level status</div>\${CURRICULUM.map(l=>{const p=levelProgress(+l.id);return \`<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)"><div><strong>Level \${l.id} · \${esc(l.title)}</strong><div class="progress" style="margin-top:8px"><span style="width:\${pct(p.done,p.total)}%"></span></div></div><span class="pill">\${p.done} / \${p.total}</span></div>\`}).join('')}</div><div class="toolbar" style="margin-top:16px"><button class="ghost" onclick="exportProgress()">Export progress</button><button class="ghost" onclick="importProgress()">Import progress</button><button class="danger" onclick="resetProgress()">Reset everything</button></div>\`;
}`;

html = html.replace(oldRenderProfile, newRenderProfile);

// Ensure checkCloudStatus() runs on load
html = html.replace('renderAll();', 'renderAll(); checkCloudStatus();');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Scripts and Cloud Sync Integration updated successfully.');
`;

fs.writeFileSync(path.join(__dirname, 'update_scripts.js'), scriptContent, 'utf8');
console.log('Created scratch/update_scripts.js');
