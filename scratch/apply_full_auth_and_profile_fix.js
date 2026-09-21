const fs = require('fs');
const path = require('path');

const pyMainPath = path.join(__dirname, '..', 'backend-python', 'main.py');
const indexPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
const swPath = path.join(__dirname, '..', 'python-academy-complete', 'sw.js');

// 1. Update backend-python/main.py
let pyCode = fs.readFileSync(pyMainPath, 'utf8').replace(/\r\n/g, '\n');

const oldPasslibImport = "from passlib.context import CryptContext\nfrom jose import JWTError, jwt";
const newPasslibImport = "import hashlib\nimport hmac\nfrom jose import JWTError, jwt";

if (!pyCode.includes(oldPasslibImport)) {
  console.error("Could not find oldPasslibImport!");
  process.exit(1);
}
pyCode = pyCode.replace(oldPasslibImport, newPasslibImport);

const oldPwdContext = `pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "python-academy-secret-key-super-safe-9821!")`;

const newPwdContext = `SECRET_KEY = os.getenv("SECRET_KEY", "python-academy-secret-key-super-safe-9821!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"pbkdf2_sha256\${salt}\${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith("pbkdf2_sha256\$"):
            parts = hashed_password.split("\$")
            salt = parts[1]
            dk_hex = parts[2]
            check = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
            return hmac.compare_digest(check, dk_hex)
        try:
            import bcrypt
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            pass
        return False
    except Exception:
        return False`;

// Also notice that lines 39-40 had ALGORITHM and ACCESS_TOKEN_EXPIRE_DAYS
const oldPwdContextFull = `pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "python-academy-secret-key-super-safe-9821!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30`;

if (!pyCode.includes(oldPwdContextFull)) {
  console.error("Could not find oldPwdContextFull!");
  process.exit(1);
}
pyCode = pyCode.replace(oldPwdContextFull, newPwdContext);

// Replace register and login in pyCode
const oldRegister = `    hashed_pw = pwd_context.hash(payload.password)
    user = models.User(username=payload.username, email=payload.email, password_hash=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)`;

const newRegister = `    hashed_pw = hash_password(payload.password)
    user = models.User(username=payload.username, email=payload.email, password_hash=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)`;

if (!pyCode.includes(oldRegister)) {
  console.error("Could not find oldRegister!");
  process.exit(1);
}
pyCode = pyCode.replace(oldRegister, newRegister);

const oldVerify = `    if not user or not pwd_context.verify(payload.password, user.password_hash):`;
const newVerify = `    if not user or not verify_password(payload.password, user.password_hash):`;

if (!pyCode.includes(oldVerify)) {
  console.error("Could not find oldVerify!");
  process.exit(1);
}
pyCode = pyCode.replace(oldVerify, newVerify);

fs.writeFileSync(pyMainPath, pyCode, 'utf8');
console.log("✅ Updated backend-python/main.py successfully!");

// 2. Update python-academy-complete/index.html
let html = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

// checkCloudStatus with retry
const oldCheckCloud = `async function checkCloudStatus() {
  try {
    const res = await fetch(API_BASE + '/api/health', { method: 'GET', signal: AbortSignal.timeout(6000) });
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
}`;

const newCheckCloud = `let cloudRetryScheduled = false;
async function checkCloudStatus() {
  try {
    const res = await fetch(API_BASE + '/api/health', { method: 'GET', signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      isCloudOnline = true;
      if (authToken) await fetchCurrentUser();
    } else {
      isCloudOnline = false;
    }
  } catch (e) {
    isCloudOnline = false;
    if (!cloudRetryScheduled) {
      cloudRetryScheduled = true;
      setTimeout(() => { cloudRetryScheduled = false; checkCloudStatus(); }, 5000);
    }
  }
  updateCloudUI();
}`;

if (html.includes(oldCheckCloud)) {
  html = html.replace(oldCheckCloud, newCheckCloud);
}

// Update handleAuthSubmit
const oldAuthSubmit = `async function handleAuthSubmit(e) {
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
      await syncCloudProgress(); updateCloudUI(); renderAll(); renderAuthModal();
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
      await syncCloudProgress(); updateCloudUI(); renderAll(); renderAuthModal();
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'status bad';
      const msg = (!navigator.onLine || String(err.message).toLowerCase().includes('fetch'))
        ? 'Backend server appears unreachable. Make sure the server is running (run_server.bat).'
        : (err.message || 'Authentication error');
      alertBox.textContent = msg;
    }
  }
}`;

const newAuthSubmit = `async function handleAuthSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('authAlert');
  if (alertBox) { alertBox.style.display = 'block'; alertBox.className = 'status'; alertBox.textContent = 'Connecting to 24/7 cloud server…'; }
  try {
    if (authTab === 'login') {
      const identifier = document.getElementById('authIdentifier')?.value.trim();
      const password = document.getElementById('authPassword')?.value;
      const res = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      let data = {};
      try { data = await res.json(); } catch(jsonErr) {}
      if (!res.ok) {
        const errorMsg = data.error || data.detail || (typeof data === 'string' ? data : '') || 'Invalid username or password';
        throw new Error(errorMsg);
      }
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('py_academy_token', authToken);
      isCloudOnline = true;
      if (data.progress) mergeCloudState(data.progress);
      await syncCloudProgress();
      updateCloudUI();
      renderAll();
      if (alertBox) {
        alertBox.className = 'status ok';
        alertBox.textContent = '✅ Signed in as ' + currentUser.username + '! Automatically connected to 24/7 cloud server.';
      }
      setTimeout(() => {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
        renderAll();
      }, 1100);
    } else {
      const username = document.getElementById('authUsername')?.value.trim();
      const email = document.getElementById('authIdentifier')?.value.trim();
      const password = document.getElementById('authPassword')?.value;
      const res = await fetch(API_BASE + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      let data = {};
      try { data = await res.json(); } catch(jsonErr) {}
      if (!res.ok) {
        const errorMsg = data.error || data.detail || (typeof data === 'string' ? data : '') || 'Registration failed';
        throw new Error(errorMsg);
      }
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('py_academy_token', authToken);
      isCloudOnline = true;
      await syncCloudProgress();
      updateCloudUI();
      renderAll();
      if (alertBox) {
        alertBox.className = 'status ok';
        alertBox.textContent = '🎉 Account created! Signed in and automatically connected to cloud server.';
      }
      setTimeout(() => {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
        renderAll();
      }, 1100);
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'status bad';
      const msg = (!navigator.onLine || String(err.message).toLowerCase().includes('failed to fetch'))
        ? 'Backend server appears unreachable. If sleeping on Render, please allow 20 seconds for container startup and try again.'
        : (err.message || 'Authentication error');
      alertBox.textContent = msg;
    }
  }
}`;

if (!html.includes(oldAuthSubmit)) {
  console.error("Could not find oldAuthSubmit in index.html!");
  process.exit(1);
}

html = html.replace(oldAuthSubmit, newAuthSubmit);

// Update renderProfile() toolbar and text
const oldRenderProfile = `function renderProfile(){const el=document.getElementById('view-profile'); const mastered=state.completedLessons.length; const notes=Object.values(state.notes).filter(Boolean).length; const cloudInfo=currentUser?\`Signed in as <strong>\${esc(currentUser.username)}</strong> (\${esc(currentUser.email)}) · Cloud Synchronized\`:(isCloudOnline?'Running in local mode. Sign in to sync your study progress across devices.':'Offline mode. All progress is safely stored in this browser.'); const cloudActionBtn=currentUser?\`<button class="primary" onclick="openAuthModal()">☁️ Account: \${esc(currentUser.username)}</button>\`:\`<button class="primary" onclick="openAuthModal()">☁️ Sign In / Create Account</button>\`; el.innerHTML=\`<div class="hero"><div class="eyebrow">Profile & progress</div><h2>Your private learning dashboard.</h2><p>\${cloudInfo}</p><div class="toolbar" style="margin-top:14px;gap:10px;flex-wrap:wrap">\${cloudActionBtn}<button class="ghost" onclick="openServerConfigModal()">☁️ Cloud Backend Server</button><button class="primary" style="background:linear-gradient(135deg,#f59e0b,#ea580c);border:none;color:#fff" onclick="openAdminModal()">👑 Admin Panel</button></div></div>`;

const newRenderProfile = `function renderProfile(){const el=document.getElementById('view-profile'); const mastered=state.completedLessons.length; const notes=Object.values(state.notes).filter(Boolean).length; const cloudInfo=currentUser?\`Signed in as <strong>\${esc(currentUser.username)}</strong> (\${esc(currentUser.email)}) · 🟢 24/7 Cloud Synchronized with Render\`:(isCloudOnline?'🟢 Automatically connected to 24/7 Cloud Backend. Sign in or create an account to sync your progress across devices.':'Connecting to 24/7 Cloud Server… Sign in or create an account to automatically sync your progress.'); const cloudActionBtn=currentUser?\`<button class="primary" onclick="openAuthModal()">☁️ Account: \${esc(currentUser.username)}</button>\`:\`<button class="primary" onclick="openAuthModal()">☁️ Sign In / Create Account</button>\`; el.innerHTML=\`<div class="hero"><div class="eyebrow">Profile & progress</div><h2>Your private learning dashboard.</h2><p>\${cloudInfo}</p><div class="toolbar" style="margin-top:14px;gap:10px;flex-wrap:wrap">\${cloudActionBtn}<button class="primary" style="background:linear-gradient(135deg,#f59e0b,#ea580c);border:none;color:#fff" onclick="openAdminModal()">👑 Admin Panel</button></div></div>`;

if (!html.includes(oldRenderProfile)) {
  console.error("Could not find oldRenderProfile in index.html!");
  process.exit(1);
}

html = html.replace(oldRenderProfile, newRenderProfile);

fs.writeFileSync(indexPath, html, 'utf8');
console.log("✅ Updated index.html successfully!");

// 3. Bump sw.js to v12
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('python-academy-shell-v11', 'python-academy-shell-v12');
fs.writeFileSync(swPath, sw, 'utf8');
console.log("✅ Bumped sw.js to python-academy-shell-v12!");
