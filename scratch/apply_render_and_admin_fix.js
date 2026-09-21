const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
const swPath = path.join(__dirname, '..', 'python-academy-complete', 'sw.js');
const rootIndexPath = path.join(__dirname, '..', 'index.html');

// 1. Update index.html
let html = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

// Replace API_BASE initialization
const oldApiInit = `// --- Dual-Mode Cloud Backend Engine ---
const DEFAULT_CLOUD_API = 'https://python-bdjn.onrender.com';
let API_BASE = (localStorage.getItem('py_academy_api_url') || (window.location.port === '5000' ? '' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : DEFAULT_CLOUD_API))).replace(/\\/+$/, '');`;

const newApiInit = `// --- Dual-Mode Cloud Backend Engine ---
const DEFAULT_CLOUD_API = 'https://python-bdjn.onrender.com';
let storedApi = null;
try {
  localStorage.removeItem('py_academy_admin_key');
  storedApi = localStorage.getItem('py_academy_api_url');
  if (storedApi && (storedApi.includes('localhost') || storedApi.includes('127.0.0.1')) && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    localStorage.removeItem('py_academy_api_url');
    storedApi = null;
  }
} catch (e) {}
let API_BASE = (storedApi || (window.location.port === '5000' ? '' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : DEFAULT_CLOUD_API))).replace(/\\/+$/, '');`;

if (html.includes(oldApiInit)) {
  html = html.replace(oldApiInit, newApiInit);
} else {
  console.log("oldApiInit not matched verbatim, checking...");
}

// Ensure prompt input always wipes value and forces focus
const oldPromptInput = `<input id="admin-pass-input" type="password" placeholder="Enter admin passkey..." value="" autocomplete="new-password" onkeydown="if(event.key==='Enter')submitAdminPasskey()" style="width:100%;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;box-sizing:border-box">`;
const newPromptInput = `<input id="admin-pass-input" type="password" placeholder="Enter admin passkey..." value="" autocomplete="off" onkeydown="if(event.key==='Enter')submitAdminPasskey()" style="width:100%;background:#090e18;color:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;box-sizing:border-box">`;

if (html.includes(oldPromptInput)) {
  html = html.replace(oldPromptInput, newPromptInput);
}

// In renderAdminLoginPrompt timeout, explicitly wipe input value
const oldTimeout = `setTimeout(() => { const el = document.getElementById('admin-pass-input'); if (el) el.focus(); }, 60);`;
const newTimeout = `setTimeout(() => { const el = document.getElementById('admin-pass-input'); if (el) { el.value = ''; el.focus(); } }, 60);`;

if (html.includes(oldTimeout)) {
  html = html.replace(oldTimeout, newTimeout);
}

// Controllerchange reload listener for service worker updates
const oldSwReg = `if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./sw.js');reg.update();}catch{}});} `;
const altSwReg = `if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./sw.js');reg.update();}catch{}});}`;

const newSwReg = `if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      reg.update();
    } catch (e) {}
  });
}`;

if (html.includes(altSwReg)) {
  html = html.replace(altSwReg, newSwReg);
} else if (html.includes(oldSwReg)) {
  html = html.replace(oldSwReg, newSwReg);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log("✅ Updated index.html successfully!");

// 2. Update sw.js with aggressive HTML freshness and cache deletion
const newSwContent = `const CACHE = "python-academy-shell-v11";
const APP = [
  "./manifest.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/js/skulpt.min.js",
  "./assets/js/skulpt-stdlib.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Always Network-First for HTML and navigations so code updates take effect immediately
  const isHtml = req.mode === "navigate" ||
                 req.destination === "document" ||
                 url.pathname.endsWith("/") ||
                 url.pathname.endsWith(".html") ||
                 (req.headers.get("accept") && req.headers.get("accept").includes("text/html"));

  if (isHtml) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html") || caches.match("./")))
    );
    return;
  }

  // Cache-first for static assets (Skulpt JS, icons, manifest)
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => cached || new Response("Offline", { status: 503 }))
    )
  );
});
`;

fs.writeFileSync(swPath, newSwContent, 'utf8');
console.log("✅ Updated sw.js with v11 and network-first HTML strategy!");

// 3. Update root index.html with cache-busting headers
const rootHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=./python-academy-complete/">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Python Academy — Redirecting...</title>
  <script>
    window.location.replace("./python-academy-complete/" + window.location.hash);
  </script>
</head>
<body style="background:#090d16;color:#e2e8f0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
  <div style="text-align:center">
    <h2>🐍 Loading Python Academy...</h2>
    <p>If you are not redirected automatically, <a href="./python-academy-complete/" style="color:#7c5cff">click here to enter Python Academy</a>.</p>
  </div>
</body>
</html>
`;
fs.writeFileSync(rootIndexPath, rootHtml, 'utf8');
console.log("✅ Updated root index.html with cache prevention!");
