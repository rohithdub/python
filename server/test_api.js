const http = require('node:http');

async function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + (parsed.search || ''),
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  const BASE_URL = 'http://localhost:5055';
  process.env.PORT = '5055';
  const server = require('./server');

  console.log('🧪 Starting API Verification Tests on ' + BASE_URL + '...\n');
  let passed = 0;
  let failed = 0;

  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${desc} -> ${e.message}`);
      failed++;
    }
  }

  // Allow server a moment to bind
  await new Promise((r) => setTimeout(r, 200));

  let token = null;
  const testUser = `student_${Date.now()}`;

  // 1. Health check
  await assert('GET /api/health returns 200 and ok status', async () => {
    const res = await request(`${BASE_URL}/api/health`);
    if (res.status !== 200 || res.data.status !== 'ok') {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  });

  // 2. Register
  await assert('POST /api/auth/register creates user and returns token', async () => {
    const res = await request(
      `${BASE_URL}/api/auth/register`,
      { method: 'POST' },
      { username: testUser, email: `${testUser}@example.com`, password: 'strongpassword123' }
    );
    if (res.status !== 201 || !res.data.token) {
      throw new Error(`Expected 201 with token, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    token = res.data.token;
  });

  // 3. Login
  await assert('POST /api/auth/login authenticates user and returns token', async () => {
    const res = await request(
      `${BASE_URL}/api/auth/login`,
      { method: 'POST' },
      { identifier: testUser, password: 'strongpassword123' }
    );
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Expected 200 with token, got ${res.status}`);
    }
  });

  // 4. Auth Me
  await assert('GET /api/auth/me returns authenticated user details', async () => {
    const res = await request(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status !== 200 || res.data.user.username !== testUser) {
      throw new Error(`Expected username ${testUser}, got ${res.data?.user?.username}`);
    }
  });

  // 5. Save progress
  await assert('POST /api/progress saves progress state', async () => {
    const dummyState = {
      version: 1,
      xp: 150,
      streak: 3,
      completedLessons: ['L0_1', 'L0_2'],
      notes: { L0_1: 'Learned Python basic structure.' },
      bookmarks: ['L0_1']
    };
    const res = await request(
      `${BASE_URL}/api/progress`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      dummyState
    );
    if (res.status !== 200 || !res.data.result.success) {
      throw new Error(`Failed saving progress: ${JSON.stringify(res.data)}`);
    }
  });

  // 6. Get progress
  await assert('GET /api/progress retrieves persisted state', async () => {
    const res = await request(`${BASE_URL}/api/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status !== 200 || res.data.progress.xp !== 150 || !res.data.progress.completedLessons.includes('L0_1')) {
      throw new Error(`Progress mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  // 7. Leaderboard
  await assert('GET /api/leaderboard returns user in ranking', async () => {
    const res = await request(`${BASE_URL}/api/leaderboard`);
    if (res.status !== 200 || !Array.isArray(res.data.leaderboard)) {
      throw new Error(`Expected leaderboard array, got ${res.status}`);
    }
    const found = res.data.leaderboard.find((u) => u.username === testUser);
    if (!found || found.xp !== 150) {
      throw new Error(`Expected ${testUser} with 150 XP on leaderboard`);
    }
  });

  // 8. Curriculum & Challenges APIs
  await assert('GET /api/curriculum returns 11 levels and 88 lessons', async () => {
    const res = await request(`${BASE_URL}/api/curriculum`);
    if (res.status !== 200 || res.data.curriculum.length !== 11) {
      throw new Error(`Expected 11 levels, got ${res.data.curriculum.length}`);
    }
  });

  await assert('GET /api/challenges returns 11 challenges', async () => {
    const res = await request(`${BASE_URL}/api/challenges`);
    if (res.status !== 200 || res.data.challenges.length !== 11) {
      throw new Error(`Expected 11 challenges, got ${res.data.challenges.length}`);
    }
  });

  // 9. Static file serving check
  await assert('GET / serves index.html', async () => {
    const res = await request(`${BASE_URL}/`);
    if (res.status !== 200 || typeof res.data !== 'string' || !res.data.includes('Python Academy')) {
      throw new Error(`Failed to serve index.html`);
    }
  });

  console.log('\n=============================================');
  console.log(`  Tests completed: ${passed} passed, ${failed} failed`);
  console.log('=============================================\n');

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
