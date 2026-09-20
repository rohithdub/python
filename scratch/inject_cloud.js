const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

const cloudCode = fs.readFileSync(path.join(__dirname, 'cloud_integration.js'), 'utf8');

// 1. Inject cloudCode right after let state=loadState();
if (!html.includes('// --- Dual-Mode Cloud Backend Engine ---')) {
  html = html.replace('let state=loadState();', 'let state=loadState();\n' + cloudCode);
}

// 2. Enhance save() to debounce sync
const oldSave = 'function save(){localStorage.setItem(KEY,JSON.stringify(state)); renderAll();}';
const newSave = `function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
  renderAll();
  if (typeof authToken !== 'undefined' && authToken && isCloudOnline) {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(syncCloudProgress, 700);
  }
}`;
if (html.includes(oldSave)) {
  html = html.replace(oldSave, newSave);
}

// 3. Enhance executePython
const oldExecutePython = 'function executePython(code,input,ms){return new Promise((resolve,reject)=>{const w=makeWorker();let startupTimer=setTimeout(()=>{w.terminate();reject(new Error(\'Python runtime could not load within 20 seconds.\'))},20000);w.onmessage=e=>{if(e.data.type===\'ready\'){clearTimeout(startupTimer);const t=setTimeout(()=>{w.terminate();reject(new Error(\'timeout\'))},ms);w._timer=t;w.postMessage({type:\'run\',code,input});return;}clearTimeout(startupTimer);clearTimeout(w._timer);w.terminate();e.data.ok?resolve(e.data.out):reject(new Error(e.data.out))};w.onerror=e=>{clearTimeout(startupTimer);clearTimeout(w._timer);w.terminate();reject(e)}})}';

const newExecutePython = `async function executePython(code, input, ms) {
  if (typeof executionEngine !== 'undefined' && executionEngine === 'server' && isCloudOnline) {
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
      if (data.ok) return data.stdout || '(no output)';
      throw new Error(data.stderr || data.error || 'Execution failed');
    } catch (err) {
      console.warn('Backend execution fallback to Pyodide worker:', err.message);
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
          reject(new Error('Execution timeout'));
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

if (html.includes(oldExecutePython)) {
  html = html.replace(oldExecutePython, newExecutePython);
}

// 4. Update checkCloudStatus call on startup
if (!html.includes('checkCloudStatus();')) {
  html = html.replace('recordActivity(); renderAll();', 'recordActivity(); renderAll(); checkCloudStatus();');
}

// 5. Update renderLab toolbar
const oldLabToolbar = '<span class="spacer"></span><span class="pill">3s execution limit</span>';
const newLabToolbar = '<button class="ghost" onclick="toggleEngine()" title="Toggle Python Execution Engine">${executionEngine===\'server\'?\'⚡ Server Engine\':\'🌐 Pyodide Engine\'}</button><span class="spacer"></span><span class="pill">3s limit</span>';
if (html.includes(oldLabToolbar)) {
  html = html.replace(oldLabToolbar, newLabToolbar);
}

fs.writeFileSync(targetPath, html, 'utf8');
console.log('Successfully injected cloud backend integration and responsive handlers into index.html');
