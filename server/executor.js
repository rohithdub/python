const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');

// Detect host python binary
function findPythonBinary() {
  const candidates = [
    'python3',
    'python',
    'py',
    'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe',
    'C:\\Python310\\python.exe',
    path.join(os.homedir(), 'AppData\\Local\\Programs\\Python\\Python312\\python.exe'),
    path.join(os.homedir(), 'AppData\\Local\\Programs\\Python\\Python311\\python.exe')
  ];

  for (const bin of candidates) {
    if (path.isAbsolute(bin) && fs.existsSync(bin)) {
      return bin;
    }
  }
  return null;
}

const PYTHON_BIN = process.env.PYTHON_PATH || findPythonBinary();

// Built-in JS Python Engine fallback using bundled Skulpt
let skulptContext = null;
function getSkulptEngine() {
  if (skulptContext) return skulptContext;
  try {
    const skPath = path.join(__dirname, '..', 'python-academy-complete', 'assets', 'js', 'skulpt.min.js');
    const stdPath = path.join(__dirname, '..', 'python-academy-complete', 'assets', 'js', 'skulpt-stdlib.js');

    if (!fs.existsSync(skPath) || !fs.existsSync(stdPath)) return null;

    const skCode = fs.readFileSync(skPath, 'utf8');
    const stdCode = fs.readFileSync(stdPath, 'utf8');

    const ctx = {
      window: {},
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout
    };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(skCode, ctx);
    vm.runInContext(stdCode, ctx);

    skulptContext = ctx;
    return skulptContext;
  } catch (err) {
    console.warn('Could not initialize Skulpt engine on server:', err.message);
    return null;
  }
}

function runSkulptFallback(code, stdin = '', timeoutMs = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const ctx = getSkulptEngine();
    if (!ctx || !ctx.Sk) {
      return resolve({
        ok: false,
        stdout: '',
        stderr: 'Python engine is unavailable on this system.',
        executionTimeMs: 0
      });
    }

    const Sk = ctx.Sk;
    let stdout = [];
    const inputLines = (stdin || '').split('\n');
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
        if (prompt) stdout.push(prompt + '\n');
        return inputIdx < inputLines.length ? inputLines[inputIdx++] : '';
      },
      inputfunTakesPrompt: true,
      execLimit: timeoutMs
    });

    let isDone = false;
    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        resolve({
          ok: false,
          stdout: stdout.join(''),
          stderr: 'Execution stopped: Time limit reached (3 seconds).',
          executionTimeMs: timeoutMs
        });
      }
    }, timeoutMs);

    Sk.misceval
      .asyncToPromise(() => {
        return Sk.importMainWithBody('<stdin>', false, code, true);
      })
      .then(() => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        resolve({
          ok: true,
          stdout: stdout.join(''),
          stderr: '',
          executionTimeMs: Date.now() - startTime
        });
      })
      .catch((err) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        resolve({
          ok: false,
          stdout: stdout.join(''),
          stderr: err.toString(),
          executionTimeMs: Date.now() - startTime
        });
      });
  });
}

function executePythonCode(code, stdin = '', timeoutMs = 3000) {
  // If no host python binary is found, use the high-speed built-in engine
  if (!PYTHON_BIN) {
    return runSkulptFallback(code, stdin, timeoutMs);
  }

  return new Promise((resolve) => {
    const startTime = Date.now();
    const tempDir = path.join(os.tmpdir(), 'py_academy_runs');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const scriptPath = path.join(tempDir, `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.py`);

    try {
      fs.writeFileSync(scriptPath, code, 'utf8');
    } catch (err) {
      return runSkulptFallback(code, stdin, timeoutMs).then(resolve);
    }

    let stdout = '';
    let stderr = '';
    let isFinished = false;

    let child;
    try {
      child = spawn(PYTHON_BIN, ['-u', scriptPath], {
        windowsHide: true,
        timeout: timeoutMs + 1000
      });
    } catch (err) {
      cleanup();
      return runSkulptFallback(code, stdin, timeoutMs).then(resolve);
    }

    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        try {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', child.pid, '/f', '/t']);
          } else {
            child.kill('SIGKILL');
          }
        } catch {}
        cleanup();
        resolve({
          ok: false,
          stdout,
          stderr: 'Execution stopped: Time limit exceeded (3 seconds).',
          executionTimeMs: timeoutMs
        });
      }
    }, timeoutMs);

    function cleanup() {
      try {
        if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
      } catch {}
    }

    child.stdout.on('data', (data) => {
      if (stdout.length < 65536) stdout += data.toString('utf8');
    });

    child.stderr.on('data', (data) => {
      if (stderr.length < 65536) stderr += data.toString('utf8');
    });

    child.on('error', (err) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timer);
      cleanup();
      // On spawn error (e.g. Windows app alias error), fallback to built-in engine
      runSkulptFallback(code, stdin, timeoutMs).then(resolve);
    });

    child.on('close', (exitCode) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timer);
      cleanup();
      if (exitCode !== 0 && !stderr && !stdout) {
        // May have failed to launch the Windows Store alias
        return runSkulptFallback(code, stdin, timeoutMs).then(resolve);
      }
      resolve({
        ok: exitCode === 0,
        stdout,
        stderr,
        executionTimeMs: Date.now() - startTime
      });
    });

    if (stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch {}
    } else {
      try {
        child.stdin.end();
      } catch {}
    }
  });
}

module.exports = {
  executePythonCode,
  PYTHON_BIN
};
