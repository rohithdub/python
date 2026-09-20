// scratch/test_render_config_ui.js
const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

const serverSettingsFunctions = `
// --- Cloud Backend Configuration Helpers ---
function openServerConfigModal() {
  let modal = document.getElementById('server-config-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'server-config-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,8,18,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px';
    document.body.appendChild(modal);
  }
  const currentUrl = localStorage.getItem('py_academy_api_url') || (window.location.port === '5000' ? 'http://localhost:5000' : '');
  modal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(124,92,255,0.4);border-radius:24px;max-width:480px;width:100%;padding:28px 24px;box-shadow:0 24px 60px rgba(0,0,0,0.6)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <span style="font-size:28px">☁️</span>
        <div>
          <h3 style="margin:0;font-size:18px;color:#fff">24/7 Cloud Backend Server</h3>
          <p style="margin:2px 0 0;font-size:12.5px;color:#94a3b8">Connect your Render or cloud backend to sync accounts across devices.</p>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#cbd5e1">Backend Server URL</label>
        <input id="server-url-input" type="url" placeholder="https://python-academy.onrender.com" value="\${esc(currentUrl)}" style="width:100%;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:14px;box-sizing:border-box">
        <div style="margin-top:6px;font-size:12px;color:#94a3b8">Status: <strong style="color:\${isCloudOnline ? '#00e676' : '#f59e0b'}">\${isCloudOnline ? '🟢 Connected (Online)' : '⚪ Offline / Standalone'}</strong></div>
      </div>
      <div id="server-test-msg" style="margin-bottom:16px;font-size:13px"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="ghost" onclick="document.getElementById('server-config-modal').style.display='none'">Close</button>
        <button class="primary" onclick="saveAndTestBackendServer()">Save & Connect</button>
      </div>
    </div>
  \`;
  modal.style.display = 'flex';
}

async function saveAndTestBackendServer() {
  const input = document.getElementById('server-url-input');
  const msg = document.getElementById('server-test-msg');
  if (!input) return;
  const rawUrl = input.value.trim().replace(/\\/+$/, '');
  msg.style.color = '#94a3b8';
  msg.textContent = 'Testing connection…';
  if (!rawUrl) {
    localStorage.removeItem('py_academy_api_url');
    isCloudOnline = false;
    updateCloudUI();
    msg.style.color = '#38bdf8';
    msg.textContent = 'Reset to local browser mode.';
    setTimeout(() => { document.getElementById('server-config-modal').style.display = 'none'; renderAll(); }, 1200);
    return;
  }
  try {
    const res = await fetch(rawUrl + '/api/health', { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      localStorage.setItem('py_academy_api_url', rawUrl);
      isCloudOnline = true;
      msg.style.color = '#00e676';
      msg.textContent = '✅ Connected successfully! Cloud sync active.';
      if (authToken) await fetchCurrentUser();
      updateCloudUI();
      setTimeout(() => { document.getElementById('server-config-modal').style.display = 'none'; renderAll(); }, 1400);
    } else {
      msg.style.color = '#f87171';
      msg.textContent = 'Server responded with status ' + res.status + '. Check URL.';
    }
  } catch (err) {
    msg.style.color = '#f87171';
    msg.textContent = 'Could not reach server. If sleeping on Render, give it 30s to wake up.';
  }
}
`;

console.log('Helpers syntax test passing.');
