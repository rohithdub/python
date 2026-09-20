const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
const swPath = path.join(__dirname, '..', 'python-academy-complete', 'sw.js');

let html = fs.readFileSync(indexPath, 'utf8');

// Normalize line endings for replacement or replace CRLF-aware
const oldApiLine = "let API_BASE = (localStorage.getItem('py_academy_api_url') || (window.location.port === '5000' ? '' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : ''))).replace(/\\/+$/, '');";

const newApiLine = "const DEFAULT_CLOUD_API = 'https://python-bdjn.onrender.com';\nlet API_BASE = (localStorage.getItem('py_academy_api_url') || (window.location.port === '5000' ? '' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : DEFAULT_CLOUD_API))).replace(/\\/+$/, '');";

if (!html.includes(oldApiLine)) {
  console.error("oldApiLine not found!");
  process.exit(1);
}

html = html.replace(oldApiLine, newApiLine);

const oldHealth = "const res = await fetch(API_BASE + '/api/health', { method: 'GET', signal: AbortSignal.timeout(3000) });";
const newHealth = "const res = await fetch(API_BASE + '/api/health', { method: 'GET', signal: AbortSignal.timeout(6000) });";

if (!html.includes(oldHealth)) {
  console.error("oldHealth not found!");
  process.exit(1);
}

html = html.replace(oldHealth, newHealth);

const oldCurrentUrl = "const currentUrl = localStorage.getItem('py_academy_api_url') || (window.location.port === '5000' ? 'http://localhost:5000' : '');";
const newCurrentUrl = "const currentUrl = localStorage.getItem('py_academy_api_url') || (window.location.port === '5000' ? 'http://localhost:5000' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : DEFAULT_CLOUD_API));";

if (!html.includes(oldCurrentUrl)) {
  console.error("oldCurrentUrl not found!");
  process.exit(1);
}

html = html.replace(oldCurrentUrl, newCurrentUrl);

const oldPlaceholder = 'placeholder="https://python-academy.onrender.com"';
const newPlaceholder = 'placeholder="https://python-bdjn.onrender.com"';

if (!html.includes(oldPlaceholder)) {
  console.error("oldPlaceholder not found!");
  process.exit(1);
}

html = html.replace(oldPlaceholder, newPlaceholder);

const oldReset = "API_BASE = window.location.port === '5000' ? '' : '';";
const newReset = "API_BASE = (window.location.port === '5000' ? '' : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : DEFAULT_CLOUD_API)).replace(/\\/+$/, '');\n    await checkCloudStatus();";

if (!html.includes(oldReset)) {
  console.error("oldReset not found!");
  process.exit(1);
}

html = html.replace(oldReset, newReset);

fs.writeFileSync(indexPath, html, 'utf8');
console.log("Successfully updated index.html!");

// Update sw.js cache version
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('python-academy-shell-v8', 'python-academy-shell-v9');
fs.writeFileSync(swPath, sw, 'utf8');
console.log("Successfully updated sw.js to python-academy-shell-v9!");
