const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. New Responsive CSS
const newCss = `
:root {
  --bg: #0b1020;
  --panel: #11182b;
  --panel2: #161f36;
  --text: #eef4ff;
  --muted: #9aa8c2;
  --border: #232d46;
  --accent: #7c5cff;
  --accent2: #20c997;
  --warn: #f4b942;
  --danger: #ff6b6b;
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  --radius: 18px;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
button, input, textarea, select { font: inherit; }
button { cursor: pointer; touch-action: manipulation; }
a { color: inherit; text-decoration: none; }

body {
  background: radial-gradient(circle at 15% -10%, #1b2850 0, transparent 35%),
              radial-gradient(circle at 100% 0, #241b4c 0, transparent 30%),
              var(--bg);
  background-attachment: fixed;
}

.app {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  border-right: 1px solid var(--border);
  background: rgba(9, 14, 28, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 22px 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 4px 6px 22px;
}
.logo {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--accent), #38bdf8);
  display: grid;
  place-items: center;
  font-weight: 900;
  box-shadow: 0 10px 30px rgba(124, 92, 255, 0.32);
}
.brand h1 { font-size: 16px; margin: 0; font-weight: 800; }
.brand p { margin: 2px 0 0; color: var(--muted); font-size: 12px; }

.nav { display: grid; gap: 6px; flex: 1; overflow-y: auto; }
.nav button {
  border: 0;
  background: transparent;
  color: var(--muted);
  padding: 12px 14px;
  border-radius: 12px;
  text-align: left;
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
  min-height: 44px;
}
.nav button:hover, .nav button.active {
  background: #171f35;
  color: var(--text);
}
.nav button.active {
  border-left: 3px solid var(--accent);
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.sidebar-foot {
  padding: 16px 8px 6px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 15;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  border-bottom: 1px solid var(--border);
  background: rgba(11, 16, 32, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.topbar .title { font-weight: 800; font-size: 18px; white-space: nowrap; }
.actions { display: flex; gap: 8px; align-items: center; }

.icon-btn, .small-btn, .primary, .ghost, .danger {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 9px 14px;
  background: var(--panel);
  color: var(--text);
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;
  min-height: 38px;
}
.primary {
  background: linear-gradient(135deg, var(--accent), #6651e8);
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(124, 92, 255, 0.28);
}
.primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.ghost { background: transparent; }
.ghost:hover { background: rgba(255, 255, 255, 0.05); }
.danger { color: #ff9a9a; background: transparent; border-color: rgba(255, 107, 107, 0.3); }
.danger:hover { background: rgba(255, 107, 107, 0.1); }

.container {
  max-width: 1260px;
  width: 100%;
  margin: 0 auto;
  padding: 26px 28px 100px;
}

.view { display: none; }
.view.active { display: block; animation: fadeIn 0.18s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

.hero {
  padding: 26px;
  border: 1px solid var(--border);
  background: linear-gradient(145deg, rgba(124, 92, 255, 0.14), rgba(32, 201, 151, 0.04) 55%, rgba(255, 255, 255, 0.01));
  border-radius: 22px;
  box-shadow: var(--shadow);
  margin-bottom: 22px;
}
.eyebrow {
  color: #b9a7ff;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  font-weight: 800;
}
h2 {
  margin: 8px 0 10px;
  font-size: clamp(24px, 3.8vw, 40px);
  line-height: 1.15;
  font-weight: 800;
}
h3 { margin: 0 0 8px; font-size: 18px; }
p { color: var(--muted); line-height: 1.7; margin: 0 0 10px; }

/* Responsive stats */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin: 18px 0 24px;
}
.stat {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  min-width: 0;
}
.stat .n { font-size: clamp(20px, 4vw, 26px); font-weight: 900; }
.stat .l { color: var(--muted); font-size: 12px; margin-top: 4px; }

.grid { display: grid; gap: 16px; }
.grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid-3 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }

.card {
  background: rgba(17, 24, 43, 0.84);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
}
.card.clickable:hover {
  border-color: #40517a;
  transform: translateY(-1px);
}

.progress {
  height: 8px;
  background: #202a42;
  border-radius: 99px;
  overflow: hidden;
  margin: 8px 0;
}
.progress > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  border-radius: 99px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #19233d;
  color: #bcc9e7;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.lock { opacity: 0.55; }

.level-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
}
.level-num {
  width: 46px;
  height: 46px;
  min-width: 46px;
  border-radius: 14px;
  background: #1a2440;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #b8a8ff;
  font-size: 16px;
}
.lesson-list { display: grid; gap: 8px; margin-top: 14px; }
.lesson-row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #0f1628;
  min-height: 48px;
}
.lesson-row.done { border-color: #254f47; background: #10231f; }
.lesson-row button {
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
  padding: 0;
  font-size: 14px;
  word-break: break-word;
}
.check {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  border: 1px solid #40506c;
  display: grid;
  place-items: center;
  font-size: 11px;
}
.done .check { background: #1f9d7a; border-color: #1f9d7a; color: #fff; }

.search {
  width: clamp(140px, 25vw, 320px);
  background: #0f1628;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 9px 14px;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  transition: width 0.2s ease, border-color 0.15s ease;
}
.search:focus, textarea:focus, input:focus { border-color: #7c5cff; }

/* Lesson Wrap: Fluid columns avoiding intermediate breakpoint overflow */
.lesson-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  align-items: start;
}
.lesson-main, .lesson-side {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  min-width: 0;
}
.lesson-main h1 {
  font-size: clamp(24px, 3.5vw, 38px);
  margin: 8px 0 14px;
  line-height: 1.2;
}
.hook {
  border-left: 3px solid var(--accent);
  padding: 12px 16px;
  background: #151d34;
  border-radius: 0 12px 12px 0;
  margin: 18px 0;
}
.section { margin-top: 24px; min-width: 0; }
.section h3 { font-size: 16px; }
pre {
  margin: 12px 0;
  padding: 16px;
  border-radius: 14px;
  background: #0a0f1c;
  border: 1px solid #202a41;
  overflow-x: auto;
  line-height: 1.55;
  max-width: 100%;
}
code { font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace; font-size: 13.5px; }
.explain { white-space: pre-wrap; color: #d8e1f3; line-height: 1.7; word-break: break-word; }
.checklist { display: grid; gap: 8px; }
.quiz-opt {
  display: block;
  width: 100%;
  text-align: left;
  background: #0f1628;
  color: var(--text);
  border: 1px solid var(--border);
  padding: 12px 14px;
  border-radius: 12px;
  margin-top: 8px;
  min-height: 46px;
  line-height: 1.4;
}
.quiz-opt.selected { border-color: #6d5eea; background: #1a2142; }
.quiz-opt.correct { border-color: #1d9f7c; background: #102e28; }
.quiz-opt.wrong { border-color: #cf5b5b; background: #2f181b; }

.lab {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 16px;
}
textarea.editor {
  width: 100%;
  min-height: 400px;
  resize: vertical;
  background: #090e18;
  color: #dce7fb;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  font-family: "Cascadia Code", Consolas, monospace;
  font-size: 14px;
  line-height: 1.55;
  outline: none;
  tab-size: 4;
}
.lab-output {
  min-height: 400px;
  max-height: 550px;
  background: #090e18;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  white-space: pre-wrap;
  overflow: auto;
  font-family: "Cascadia Code", Consolas, monospace;
  font-size: 14px;
  color: #dce7fb;
}
.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin: 10px 0;
}
.toolbar .spacer { flex: 1; }

.challenge {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 16px;
}
.testcase {
  padding: 12px 14px;
  background: #0e1525;
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-top: 8px;
  word-break: break-word;
}
.status {
  padding: 11px 14px;
  border-radius: 12px;
  background: #121a2d;
  border: 1px solid var(--border);
  font-size: 13.5px;
  line-height: 1.5;
  word-break: break-word;
}
.status.ok { border-color: #266653; background: #10271f; }
.status.bad { border-color: #70414a; background: #2d151a; }

.mobile-nav { display: none; }
.empty { text-align: center; padding: 44px; color: var(--muted); }
.kbd {
  border: 1px solid var(--border);
  background: #141c30;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 11px;
}

/* Modal styles for Auth and Cloud Sync */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 15, 0.78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
  animation: fadeIn 0.15s ease;
}
.modal-card {
  background: #11182b;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.modal-header h3 { margin: 0; font-size: 18px; }
.close-btn {
  background: none;
  border: 0;
  color: var(--muted);
  font-size: 18px;
  padding: 4px;
}
.modal-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 18px;
}
.modal-tabs button {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #0c1322;
  color: var(--muted);
  font-weight: 600;
}
.modal-tabs button.active {
  background: #1b2646;
  border-color: var(--accent);
  color: #fff;
}
.form-group {
  margin-bottom: 14px;
}
.form-group label {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}
.form-group input {
  width: 100%;
  background: #090e18;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 11px 14px;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
}

/* Tablet & Intermediate Viewports */
@media (max-width: 1080px) {
  .lesson-wrap { grid-template-columns: 1fr; }
  .lesson-side { order: -1; }
}

@media (max-width: 980px) {
  .app { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .container {
    padding: 18px 16px calc(80px + env(safe-area-inset-bottom, 0px));
  }
  .topbar { padding: 12px 16px; }
  .challenge, .lab { grid-template-columns: 1fr; }
  .mobile-nav {
    position: fixed;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(62px + env(safe-area-inset-bottom, 0px));
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
    background: rgba(10, 15, 29, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    z-index: 100;
  }
  .mobile-nav button {
    border: 0;
    background: none;
    color: var(--muted);
    font-size: 10.5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 2px;
    border-radius: 8px;
    min-height: 48px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mobile-nav button.active { color: #fff; background: rgba(124, 92, 255, 0.15); }
  .mobile-nav span { display: block; font-size: 18px; margin-bottom: 2px; }
}

/* Mobile Screens (< 560px) */
@media (max-width: 560px) {
  h2 { font-size: 28px; }
  .hero, .card, .lesson-main, .lesson-side { padding: 16px; border-radius: 16px; }
  .topbar .title { font-size: 16px; }
  .topbar { gap: 6px; }
  .cloud-text { display: none; }
  .level-card {
    grid-template-columns: auto 1fr;
    gap: 12px;
  }
  .level-card button {
    grid-column: 1 / -1;
    justify-self: stretch;
    text-align: center;
  }
  textarea.editor, .lab-output { min-height: 280px; font-size: 16px; }
  input, textarea { font-size: 16px !important; }
}
`;

// Replace style tag
html = html.replace(/<style>[\s\S]*?<\/style>/, `<style>${newCss}</style>`);

// 2. Replace topbar with Cloud Sync button
const oldTopbar = '<header class="topbar"><div class="title" id="pageTitle">Dashboard</div><div class="actions"><input id="globalSearch" class="search" placeholder="Search lessons…" aria-label="Search lessons"><button class="icon-btn" id="resetBtn" title="Reset local progress">↺</button></div></header>';

const newTopbar = `<header class="topbar">
  <div class="title" id="pageTitle">Dashboard</div>
  <div class="actions">
    <input id="globalSearch" class="search" placeholder="Search lessons…" aria-label="Search lessons">
    <button class="icon-btn" id="cloudBtn" onclick="openAuthModal()" title="Cloud Account & Sync">
      <span id="cloudDot" style="color:#20c997">●</span> <span id="cloudUserText" class="cloud-text">Cloud Sync</span>
    </button>
    <button class="icon-btn" id="resetBtn" title="Reset local progress">↺</button>
  </div>
</header>`;

html = html.replace(oldTopbar, newTopbar);

// 3. Add Auth Modal right before </main>
const authModalHtml = `
  <div id="authModal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closeAuthModal()">
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="modalTitle">Cloud Account & Sync</h3>
        <button class="close-btn" onclick="closeAuthModal()">✕</button>
      </div>
      <div id="authModalBody"></div>
    </div>
  </div>
</main>`;

html = html.replace('</main>', authModalHtml);

// Write intermediate file
fs.writeFileSync(filePath, html, 'utf8');
console.log('HTML structure and CSS updated successfully.');
