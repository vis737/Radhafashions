// TEMP diagnostic: prove admin writes are rejected and time admin login. Delete after use.
const BASE = 'https://radhafashions.in';

(async () => {
  console.log('=== A. Payment approval PUT exactly as the admin panel sends it (no auth) ===');
  const putRes = await fetch(`${BASE}/api/orders/MR-TEST284777`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentStatus: 'paid', status: 'processing' }),
  });
  console.log('PUT /api/orders/MR-TEST284777 ->', putRes.status, await putRes.text());
  console.log('   ^ fetch() does NOT reject on 401, so the .catch() never fires.');

  console.log('\n=== B. Order status update (no auth) ===');
  const stRes = await fetch(`${BASE}/api/orders/MR-TEST284777/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'processing' }),
  });
  console.log('POST /api/orders/:n/status ->', stRes.status, (await stRes.text()).slice(0, 120));

  console.log('\n=== C. Admin login latency (Free-plan CPU budget) ===');
  for (let i = 1; i <= 3; i++) {
    const t0 = Date.now();
    const r = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Radha', password: 'Radha@2401' }),
    });
    const body = await r.text();
    console.log(`  attempt ${i}: ${String(Date.now() - t0).padStart(5)}ms  HTTP ${r.status}  ${body.slice(0, 70)}`);
  }

  console.log('\n=== D. Same write WITH a token (does it work?) ===');
  const login = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Radha', password: 'Radha@2401' }),
  });
  const j = await login.json();
  const token = j.token;
  if (!token) { console.log('  no token returned:', JSON.stringify(j).slice(0, 150)); return; }
  const authPut = await fetch(`${BASE}/api/orders/MR-TEST284777/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'pending' }),
  });
  console.log('  POST /status with Bearer ->', authPut.status, (await authPut.text()).slice(0, 120));
})();