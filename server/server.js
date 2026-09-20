const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

const db = require('./db');
const { hashPassword, verifyPassword, createToken, verifyToken } = require('./auth');
const { executePythonCode } = require('./executor');

let curriculumData = { curriculum: [], lessons: [], challenges: [], projects: [] };
try {
  curriculumData = JSON.parse(fs.readFileSync(path.join(__dirname, 'curriculum.json'), 'utf8'));
} catch (e) {
  console.warn('Could not load curriculum.json:', e.message);
}

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, '..', 'python-academy-complete');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      if (body.length < 1048576) {
        // 1MB max
        body += chunk;
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return verifyToken(token);
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --- API Routes ---
  if (pathname.startsWith('/api/')) {
    // Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        app: 'Python Academy Backend',
        timestamp: new Date().toISOString(),
        sqlite: 'connected'
      });
    }

    // Register
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const { username, email, password } = await parseBody(req);
      if (!username || !email || !password) {
        return sendJson(res, 400, { error: 'Username, email, and password are required' });
      }
      if (username.length < 3 || password.length < 6) {
        return sendJson(res, 400, { error: 'Username must be >= 3 characters, password >= 6 characters' });
      }

      const existing = db.findUserByUsernameOrEmail(username) || db.findUserByUsernameOrEmail(email);
      if (existing) {
        return sendJson(res, 409, { error: 'Username or email already exists' });
      }

      const { hash, salt } = hashPassword(password);
      const user = db.createUser(username.trim(), email.trim(), hash, salt);
      const token = createToken({ userId: user.id, username: user.username });
      return sendJson(res, 201, {
        message: 'Account created successfully',
        user: { id: user.id, username: user.username, email: user.email },
        token
      });
    }

    // Login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { identifier, password } = await parseBody(req);
      if (!identifier || !password) {
        return sendJson(res, 400, { error: 'Username/email and password are required' });
      }

      const user = db.findUserByUsernameOrEmail(identifier);
      if (!user) {
        return sendJson(res, 401, { error: 'Invalid username or password' });
      }

      const valid = verifyPassword(password, user.salt, user.password_hash);
      if (!valid) {
        return sendJson(res, 401, { error: 'Invalid username or password' });
      }

      const token = createToken({ userId: user.id, username: user.username });
      const progress = db.getUserProgress(user.id);
      return sendJson(res, 200, {
        message: 'Logged in successfully',
        user: { id: user.id, username: user.username, email: user.email },
        token,
        progress
      });
    }

    // Get current user profile
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const auth = getAuthUser(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });

      const user = db.findUserById(auth.userId);
      if (!user) return sendJson(res, 404, { error: 'User not found' });

      const progress = db.getUserProgress(auth.userId);
      return sendJson(res, 200, { user, progress });
    }

    // Progress: GET
    if (pathname === '/api/progress' && req.method === 'GET') {
      const auth = getAuthUser(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });

      const progress = db.getUserProgress(auth.userId);
      return sendJson(res, 200, { progress: progress || null });
    }

    // Progress: POST (Sync state)
    if (pathname === '/api/progress' && req.method === 'POST') {
      const auth = getAuthUser(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });

      const payload = await parseBody(req);
      if (!payload || typeof payload !== 'object') {
        return sendJson(res, 400, { error: 'Invalid progress data' });
      }

      const result = db.saveUserProgress(auth.userId, payload);
      return sendJson(res, 200, { message: 'Progress saved successfully', result });
    }

    // Code Execution Sandbox
    if (pathname === '/api/execute' && req.method === 'POST') {
      const { code, stdin, timeoutMs } = await parseBody(req);
      if (typeof code !== 'string') {
        return sendJson(res, 400, { error: 'Code is required' });
      }

      const auth = getAuthUser(req);
      const executionResult = await executePythonCode(code, stdin || '', Math.min(timeoutMs || 3000, 5000));

      if (auth) {
        db.recordCodeRun(
          auth.userId,
          code,
          stdin || '',
          executionResult.stdout,
          executionResult.stderr,
          executionResult.executionTimeMs,
          executionResult.ok ? 'success' : 'error'
        );
      }

      return sendJson(res, 200, executionResult);
    }

    // Leaderboard
    if (pathname === '/api/leaderboard' && req.method === 'GET') {
      const limit = Math.min(parseInt(parsedUrl.searchParams.get('limit'), 10) || 20, 100);
      const leaderboard = db.getLeaderboard(limit);
      return sendJson(res, 200, { leaderboard });
    }

    // Curriculum
    if (pathname === '/api/curriculum' && req.method === 'GET') {
      return sendJson(res, 200, { curriculum: curriculumData.curriculum });
    }

    // Challenges
    if (pathname === '/api/challenges' && req.method === 'GET') {
      return sendJson(res, 200, { challenges: curriculumData.challenges });
    }

    // Projects
    if (pathname === '/api/projects' && req.method === 'GET') {
      return sendJson(res, 200, { projects: curriculumData.projects });
    }

    // Unmatched API route
    return sendJson(res, 404, { error: 'API route not found' });
  }

  // --- Static Files Serving ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA hash routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      const isNoCache = ext === '.html' || path.basename(filePath) === 'sw.js';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': isNoCache ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log('=====================================================');
  console.log(`  🐍 Python Academy Full-Stack Server Running!`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  API Health:  http://localhost:${PORT}/api/health`);
  console.log(`  Database:    Native SQLite (data/python_academy.sqlite)`);
  console.log('=====================================================');
});

module.exports = server;
