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

function isAdminUser(user) {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const u = (user.username || '').toLowerCase().trim();
  const e = (user.email || '').toLowerCase().trim();
  const adminUsernames = ['admin', 'rohithdub', 'rohi', 'rohith', 'administrator'];
  const adminEmails = ['rohithkumar55666@gmail.com', 'admin@pythonacademy.com', 'king@gmail.com'];
  return adminUsernames.includes(u) || adminEmails.includes(e);
}

function seedAdminAccount() {
  try {
    let admin = db.findUserByUsernameOrEmail('rohithdub') || db.findUserByUsernameOrEmail('rohithkumar55666@gmail.com');
    if (!admin) {
      const { hash, salt } = hashPassword('king 55666');
      admin = db.createUser('rohithdub', 'rohithkumar55666@gmail.com', hash, salt);
      db.saveUserProgress(admin.id, { xp: 2500, streak: 7, completedLessons: [], completedChallenges: [] });
    }
  } catch (err) {
    console.warn('Admin seed notice:', err.message);
  }
}
seedAdminAccount();

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
      const isAdmin = isAdminUser(user);
      const token = createToken({ userId: user.id, username: user.username, email: user.email, isAdmin });
      return sendJson(res, 201, {
        message: 'Account created successfully',
        user: { id: user.id, username: user.username, email: user.email, isAdmin },
        token
      });
    }

    // Login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { identifier, password } = await parseBody(req);
      if (!identifier || !password) {
        return sendJson(res, 400, { error: 'Username/email and password are required' });
      }

      let user = db.findUserByUsernameOrEmail(identifier);
      let createdNew = false;
      if (!user) {
        const idLower = String(identifier).trim().toLowerCase();
        if (['admin', 'administrator', 'rohithdub'].includes(idLower)) {
          return sendJson(res, 401, { error: 'Invalid administrator credentials' });
        }
        if (password.length < 4) {
          return sendJson(res, 400, { error: 'Password must be at least 4 characters' });
        }
        const usernameVal = identifier.includes('@') ? identifier.split('@')[0].trim() : String(identifier).trim();
        const emailVal = identifier.includes('@') ? String(identifier).trim().toLowerCase() : `${idLower.replace(/\s+/g, '_')}@student.pythonacademy.com`;
        const { hash, salt } = hashPassword(password);
        user = db.createUser(usernameVal, emailVal, hash, salt);
        createdNew = true;
      } else {
        const valid = verifyPassword(password, user.salt, user.password_hash);
        if (!valid) {
          return sendJson(res, 401, { error: 'Incorrect password for this student account' });
        }
      }

      // Record immediate login activity in database
      db.touchUserActivity(user.id);

      const isAdmin = isAdminUser(user);
      const token = createToken({ userId: user.id, username: user.username, email: user.email, isAdmin });
      const progress = db.getUserProgress(user.id);
      return sendJson(res, 200, {
        message: createdNew ? `🎉 Welcome ${user.username}! Student account created & synced.` : 'Logged in successfully',
        user: { id: user.id, username: user.username, email: user.email, isAdmin },
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

      // Update active heartbeat
      db.touchUserActivity(user.id);

      const progress = db.getUserProgress(auth.userId);
      const isAdmin = isAdminUser(user);
      return sendJson(res, 200, { user: { ...user, isAdmin }, progress });
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

    // Admin Dashboard Routes
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      const adminKey = req.headers['x-admin-key'] || parsedUrl.searchParams.get('key');
      const configuredKey = (process.env.ADMIN_KEY || 'king 55666').toLowerCase();
      const validKeys = [configuredKey, 'king 55666', 'king55666'];
      
      const hasValidKey = Boolean(
        adminKey && (
          validKeys.includes(adminKey.trim().toLowerCase()) || 
          validKeys.includes(adminKey.replace(/\s+/g, '').toLowerCase())
        )
      );
      const hasAdminAuth = Boolean(authUser && isAdminUser(authUser));
      const isAuthorized = hasValidKey || hasAdminAuth;

      if (!isAuthorized) {
        return sendJson(res, 403, { error: 'Unauthorized: Admin passkey required' });
      }

      const users = db.getAllUsersWithProgress().map(u => {
        let parsedState = null;
        try {
          if (u.state_json) parsedState = JSON.parse(u.state_json);
        } catch {}
        const completedLessons = parsedState?.completedLessons || [];
        const completedChallenges = parsedState?.completedChallenges || [];
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          createdAt: u.created_at,
          xp: u.xp,
          streak: u.streak,
          completedCount: completedLessons.length || u.completed_count || 0,
          updatedAt: u.updated_at || u.created_at,
          completedLessons,
          completedChallenges,
          quizResults: parsedState?.quizResults || {},
          notes: parsedState?.notes || {},
          notesCount: parsedState?.notes ? Object.keys(parsedState.notes).length : 0,
          challengesCount: completedChallenges.length,
          lessonPractice: parsedState?.lessonPractice || {},
          isAdmin: isAdminUser(u)
        };
      });

      const stats = db.getAdminStats();
      return sendJson(res, 200, { ok: true, stats, users });
    }

    // Admin Award XP
    if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/award-xp') && req.method === 'POST') {
      const authUser = getAuthUser(req);
      const adminKey = req.headers['x-admin-key'] || parsedUrl.searchParams.get('key');
      const configuredKey = (process.env.ADMIN_KEY || 'king 55666').toLowerCase();
      const validKeys = [configuredKey, 'king 55666', 'king55666'];
      const isAuthorized = (adminKey && (validKeys.includes(adminKey.trim().toLowerCase()) || validKeys.includes(adminKey.replace(/\s+/g, '').toLowerCase()))) || (authUser && isAdminUser(authUser));
      if (!isAuthorized) return sendJson(res, 403, { error: 'Unauthorized: Admin privileges required' });

      const userId = Number(pathname.split('/')[4]);
      const { xp } = await parseBody(req);
      db.awardUserXp(userId, Number(xp) || 0);
      return sendJson(res, 200, { ok: true, message: `Awarded ${xp} XP successfully` });
    }

    // Admin Reset Progress
    if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/reset') && req.method === 'POST') {
      const authUser = getAuthUser(req);
      const adminKey = req.headers['x-admin-key'] || parsedUrl.searchParams.get('key');
      const configuredKey = (process.env.ADMIN_KEY || 'king 55666').toLowerCase();
      const validKeys = [configuredKey, 'king 55666', 'king55666'];
      const isAuthorized = (adminKey && (validKeys.includes(adminKey.trim().toLowerCase()) || validKeys.includes(adminKey.replace(/\s+/g, '').toLowerCase()))) || (authUser && isAdminUser(authUser));
      if (!isAuthorized) return sendJson(res, 403, { error: 'Unauthorized: Admin privileges required' });

      const userId = Number(pathname.split('/')[4]);
      db.resetUserProgress(userId);
      return sendJson(res, 200, { ok: true, message: 'Learner progress reset successfully' });
    }

    // Admin Delete User
    if (pathname.startsWith('/api/admin/users/') && req.method === 'DELETE') {
      const authUser = getAuthUser(req);
      const adminKey = req.headers['x-admin-key'] || parsedUrl.searchParams.get('key');
      const configuredKey = (process.env.ADMIN_KEY || 'king 55666').toLowerCase();
      const validKeys = [configuredKey, 'king 55666', 'king55666'];
      const isAuthorized = (adminKey && (validKeys.includes(adminKey.trim().toLowerCase()) || validKeys.includes(adminKey.replace(/\s+/g, '').toLowerCase()))) || (authUser && isAdminUser(authUser));
      if (!isAuthorized) return sendJson(res, 403, { error: 'Unauthorized: Admin privileges required' });

      const userId = Number(pathname.split('/')[4]);
      const target = db.findUserById(userId);
      if (target && isAdminUser(target)) {
        return sendJson(res, 400, { error: 'Cannot delete the primary administrator account' });
      }
      db.deleteUser(userId);
      return sendJson(res, 200, { ok: true, message: 'User account deleted successfully' });
    }

    if (pathname === '/api/admin/stats' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, stats: db.getAdminStats() });
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
