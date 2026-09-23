const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'python_academy.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id INTEGER PRIMARY KEY,
    state_json TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    completed_count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS code_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    code TEXT NOT NULL,
    stdin TEXT,
    stdout TEXT,
    stderr TEXT,
    execution_time_ms INTEGER,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

module.exports = {
  db,

  // User queries
  createUser(username, email, passwordHash, salt) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, salt, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(username, email, passwordHash, salt);
    const userId = Number(result.lastInsertRowid);
    // Initialize default progress row so updated_at is always tracked
    const emptyState = JSON.stringify({ xp: 0, streak: 0, completedLessons: [], completedChallenges: [], notes: {}, quizResults: {} });
    db.prepare(`
      INSERT OR IGNORE INTO user_progress (user_id, state_json, xp, streak, completed_count, updated_at)
      VALUES (?, ?, 0, 0, 0, datetime('now'))
    `).run(userId, emptyState);
    return { id: userId, username, email };
  },

  touchUserActivity(userId) {
    const emptyState = JSON.stringify({ xp: 0, streak: 0, completedLessons: [], completedChallenges: [], notes: {}, quizResults: {} });
    const stmt = db.prepare(`
      INSERT INTO user_progress (user_id, state_json, xp, streak, completed_count, updated_at)
      VALUES (?, ?, 0, 0, 0, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET updated_at = datetime('now')
    `);
    stmt.run(userId, emptyState);
  },

  findUserByUsernameOrEmail(identifier) {
    const stmt = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
      LIMIT 1
    `);
    return stmt.get(identifier, identifier);
  },

  findUserById(id) {
    const stmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Progress queries
  getUserProgress(userId) {
    const stmt = db.prepare('SELECT state_json, xp, streak, completed_count, updated_at FROM user_progress WHERE user_id = ?');
    const row = stmt.get(userId);
    if (!row) return null;
    try {
      return {
        ...JSON.parse(row.state_json),
        xp: row.xp,
        streak: row.streak,
        updatedAt: row.updated_at
      };
    } catch {
      return null;
    }
  },

  saveUserProgress(userId, state) {
    const stateJson = JSON.stringify(state);
    const xp = Number(state.xp) || 0;
    const streak = Number(state.streak) || 0;
    const completedCount = Array.isArray(state.completedLessons) ? state.completedLessons.length : 0;

    const stmt = db.prepare(`
      INSERT INTO user_progress (user_id, state_json, xp, streak, completed_count, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        state_json = excluded.state_json,
        xp = excluded.xp,
        streak = excluded.streak,
        completed_count = excluded.completed_count,
        updated_at = datetime('now')
    `);
    stmt.run(userId, stateJson, xp, streak, completedCount);
    return { success: true, xp, streak, completedCount };
  },

  // Leaderboard
  getLeaderboard(limit = 20) {
    const stmt = db.prepare(`
      SELECT u.username, up.xp, up.streak, up.completed_count, up.updated_at
      FROM user_progress up
      JOIN users u ON u.id = up.user_id
      ORDER BY up.xp DESC, up.completed_count DESC, up.streak DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  },

  // Code run logs
  recordCodeRun(userId, code, stdin, stdout, stderr, executionTimeMs, status) {
    const stmt = db.prepare(`
      INSERT INTO code_runs (user_id, code, stdin, stdout, stderr, execution_time_ms, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(userId, code, stdin, stdout, stderr, executionTimeMs, status);
  },

  // Admin queries
  getAllUsersWithProgress() {
    const stmt = db.prepare(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.created_at,
        COALESCE(up.xp, 0) AS xp,
        COALESCE(up.streak, 0) AS streak,
        COALESCE(up.completed_count, 0) AS completed_count,
        up.updated_at,
        up.state_json
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      ORDER BY COALESCE(up.updated_at, u.created_at) DESC
    `);
    return stmt.all();
  },

  getAdminStats() {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    const progressStats = db.prepare('SELECT COALESCE(SUM(xp), 0) as total_xp, COALESCE(SUM(completed_count), 0) as total_completed FROM user_progress').get() || { total_xp: 0, total_completed: 0 };
    const codeRunCount = db.prepare('SELECT COUNT(*) as count FROM code_runs').get()?.count || 0;
    return {
      totalUsers: userCount,
      totalXp: progressStats.total_xp,
      totalLessonsCompleted: progressStats.total_completed,
      totalCodeRuns: codeRunCount
    };
  },

  awardUserXp(userId, additionalXp) {
    const stmt = db.prepare(`
      UPDATE user_progress 
      SET xp = MAX(0, xp + ?), updated_at = datetime('now')
      WHERE user_id = ?
    `);
    stmt.run(additionalXp, userId);
  },

  resetUserProgress(userId) {
    const emptyState = JSON.stringify({ xp: 0, streak: 0, completedLessons: [], completedChallenges: [], notes: {}, quizResults: {} });
    const stmt = db.prepare(`
      UPDATE user_progress 
      SET xp = 0, streak = 0, completed_count = 0, state_json = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `);
    stmt.run(emptyState, userId);
  },

  deleteUser(userId) {
    db.prepare('DELETE FROM user_progress WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM code_runs WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  }
};
