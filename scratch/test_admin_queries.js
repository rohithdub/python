// scratch/test_admin_queries.js
const { db } = require('../server/db');

console.log('Testing Admin Database Queries...');

// Test query
const stmt = db.prepare(`
  SELECT 
    u.id, 
    u.username, 
    u.email, 
    u.created_at,
    COALESCE(up.xp, 0) AS xp,
    COALESCE(up.streak, 0) AS streak,
    COALESCE(up.completed_count, 0) AS completed_count,
    up.updated_at
  FROM users u
  LEFT JOIN user_progress up ON u.id = up.user_id
  ORDER BY u.created_at DESC
`);

const users = stmt.all();
console.log('Current users count:', users.length);
if (users.length > 0) {
  console.log('Sample user:', users[0]);
}

const statsStmt = db.prepare(`
  SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COALESCE(SUM(xp), 0) FROM user_progress) AS total_xp,
    (SELECT COALESCE(SUM(completed_count), 0) FROM user_progress) AS total_completed
`);
const stats = statsStmt.get();
console.log('Stats:', stats);
console.log('✅ Admin queries verified successfully!');
