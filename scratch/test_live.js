// Quick live test of the running server
async function test() {
  const BASE = 'http://localhost:5000';

  // 1. Health
  const h = await fetch(BASE + '/api/health').then(r => r.json());
  console.log('Health:', JSON.stringify(h));

  // 2. Execute simple Python
  const e = await fetch(BASE + '/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'print("Hello from Python!")\nprint(2+2)', stdin: '', timeoutMs: 3000 })
  }).then(r => r.json());
  console.log('Execute result:', JSON.stringify(e));

  // 3. Static page (just check status)
  const s = await fetch(BASE + '/');
  console.log('Static serve status:', s.status, s.headers.get('content-type'));
}

test().catch(err => console.error('FAILED:', err.message));
