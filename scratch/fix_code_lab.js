const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add Skulpt script tags in <head>
if (!html.includes('skulpt.min.js')) {
  html = html.replace('<title>Python Academy</title>', '<script src="./assets/js/skulpt.min.js"></script>\n<script src="./assets/js/skulpt-stdlib.js"></script>\n<title>Python Academy</title>');
}

// 2. Define the new in-browser and unified execution functions
const newExecutionBlock = `
function runSkulptInBrowser(code, input = '', timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    if (typeof Sk === 'undefined') {
      return reject(new Error('Python engine is initializing, please try again in a moment.'));
    }

    let stdout = [];
    const inputLines = (input || '').split('\\n');
    let inputIdx = 0;

    Sk.configure({
      output: (str) => stdout.push(str),
      read: (x) => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
          throw new Error('File not found: ' + x);
        }
        return Sk.builtinFiles['files'][x];
      },
      inputfun: (prompt) => {
        if (prompt) stdout.push(prompt + '\\n');
        return inputIdx < inputLines.length ? inputLines[inputIdx++] : '';
      },
      inputfunTakesPrompt: true,
      execLimit: timeoutMs
    });

    let isDone = false;
    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        reject(new Error('Execution stopped: Time limit reached (3 seconds).'));
      }
    }, timeoutMs);

    Sk.misceval.asyncToPromise(() => {
      return Sk.importMainWithBody('<stdin>', false, code, true);
    }).then(() => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      resolve(stdout.join(''));
    }).catch((err) => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function executePython(code, input = '', ms = 3000) {
  if (typeof executionEngine !== 'undefined' && executionEngine === 'server' && isCloudOnline) {
    try {
      const res = await fetch(API_BASE + '/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
        },
        body: JSON.stringify({ code, stdin: input, timeoutMs: ms })
      });
      const data = await res.json();
      if (data.ok) return data.stdout || '(no output)';
      throw new Error(data.stderr || data.error || 'Execution failed');
    } catch (err) {
      console.warn('Backend execution fallback to in-browser engine:', err.message);
    }
  }

  return runSkulptInBrowser(code, input, ms);
}

async function runCode() {
  if (labRunning) return;
  const code = document.getElementById('editor')?.value || '';
  const input = document.getElementById('labInput')?.value || '';
  state.labCode = code;
  state.labInput = input;
  localStorage.setItem(KEY, JSON.stringify(state));

  const out = document.getElementById('labOutput');
  if (out) out.textContent = 'Running Python code…';
  labRunning = true;

  try {
    const result = await executePython(code, input, 3000);
    if (out) out.textContent = result || '(Program completed with no output)';
  } catch (err) {
    if (out) out.textContent = 'Error: ' + (err.message || String(err));
  } finally {
    labRunning = false;
  }
}

function stopCode() {
  labRunning = false;
  const o = document.getElementById('labOutput');
  if (o) o.textContent = 'Execution stopped.';
}
`;

// Replace makeWorker, runCode, stopCode and executePython
const lines = html.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('function makeWorker()')) {
    startIdx = i;
  }
  if (lines[i].startsWith('async function executePython(') || lines[i].startsWith('function executePython(')) {
    // Find the end of executePython
    let j = i;
    while (j < lines.length && !lines[j].startsWith('function renderProfile()') && !lines[j].startsWith('async function renderProfile()')) {
      j++;
    }
    endIdx = j;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  // Extract intermediate functions between stopCode and executePython (renderChallenges, openChallenge, renderSearch, runChallenge)
  const intermediateLines = [];
  let recording = false;
  for (let k = startIdx; k < endIdx; k++) {
    if (lines[k].startsWith('function renderChallenges()')) {
      recording = true;
    }
    if (lines[k].startsWith('async function executePython(') || lines[k].startsWith('function executePython(')) {
      recording = false;
    }
    if (recording) {
      intermediateLines.push(lines[k]);
    }
  }

  const replacement = newExecutionBlock + '\n' + intermediateLines.join('\n');
  lines.splice(startIdx, endIdx - startIdx, replacement);
  html = lines.join('\n');
  console.log('Replaced old makeWorker / runCode / executePython with new instant Skulpt engine.');
} else {
  console.error('Could not locate boundary for replacement:', { startIdx, endIdx });
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Saved updated index.html.');

// 3. Update sw.js
const swPath = path.join(__dirname, '..', 'python-academy-complete', 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
if (!swContent.includes('skulpt.min.js')) {
  swContent = swContent.replace(
    'const APP=["./","./index.html","./manifest.json","./assets/icons/icon-192.png","./assets/icons/icon-512.png"];',
    'const APP=["./","./index.html","./manifest.json","./assets/icons/icon-192.png","./assets/icons/icon-512.png","./assets/js/skulpt.min.js","./assets/js/skulpt-stdlib.js"];'
  );
  fs.writeFileSync(swPath, swContent, 'utf8');
  console.log('Updated sw.js with cached Skulpt files.');
}
