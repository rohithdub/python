const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
const swPath = path.join(__dirname, '..', 'python-academy-complete', 'sw.js');

let html = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add "Continue as Guest" in renderAuthModal()
const oldFormClose = `      <button type="submit" class="primary" style="width:100%;margin-top:10px;justify-content:center">
        \${authTab === 'login' ? 'Sign In & Sync' : 'Create Account & Sync Progress'}
      </button>
    </form>
    <div style="margin-top:16px;text-align:center;font-size:12px" class="muted">
      \${isCloudOnline ? '🟢 Connected to Python Academy Backend' : '⚪ Offline / GitHub Pages Mode'}
    </div>`;

const newFormClose = `      <button type="submit" class="primary" style="width:100%;margin-top:10px;justify-content:center">
        \${authTab === 'login' ? 'Sign In & Sync' : 'Create Account & Sync Progress'}
      </button>
    </form>
    <div style="margin-top:12px;text-align:center">
      <button type="button" class="ghost" style="font-size:12.5px;padding:6px 14px;color:#94a3b8" onclick="closeAuthModal()">Continue as Guest ➔</button>
    </div>
    <div style="margin-top:12px;text-align:center;font-size:11.5px" class="muted">
      \${isCloudOnline ? '🟢 Connected to 24/7 Cloud Backend' : 'Connecting to 24/7 Cloud Backend…'}
    </div>`;

if (html.includes(oldFormClose)) {
  html = html.replace(oldFormClose, newFormClose);
  console.log("✅ Updated renderAuthModal with Continue as Guest");
} else {
  console.log("Note: oldFormClose not matched verbatim, checking...");
}

// 2. Add automatic openAuthModal() popup after link is opened if user is not signed in
const oldStartup = `recordActivity(); renderAll(); checkCloudStatus();`;
const newStartup = `recordActivity(); renderAll(); checkCloudStatus();
if (!authToken && !currentUser) {
  setTimeout(() => { openAuthModal(); }, 350);
}`;

if (!html.includes(oldStartup)) {
  console.error("Could not find oldStartup in index.html!");
  process.exit(1);
}

html = html.replace(oldStartup, newStartup);
console.log("✅ Added automatic login modal popup on link open!");

fs.writeFileSync(indexPath, html, 'utf8');

// 3. Bump sw.js to v13
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('python-academy-shell-v12', 'python-academy-shell-v13');
fs.writeFileSync(swPath, sw, 'utf8');
console.log("✅ Bumped sw.js to python-academy-shell-v13!");
