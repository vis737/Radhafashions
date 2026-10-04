/**
 * Production smoke test.
 *
 *   npm run smoke                      # read-only checks + latency budget
 *   SMOKE_WRITE=1 npm run smoke        # also run the order lifecycle check
 *
 * Read-only by default. The lifecycle check creates and deletes a real order,
 * so it stays behind SMOKE_WRITE rather than firing on every invocation.
 *
 * The latency budget exists because checkout silently regressed from ~0.5s to
 * ~10s once already, and nothing in the build noticed.
 */
import { existsSync, readFileSync } from 'node:fs';

const BASE = process.env.SMOKE_URL || 'https://radhafashions.in';
const BUDGET_MS = Number(process.env.SMOKE_BUDGET_MS || 1500);
const ALLOW_WRITE = process.env.SMOKE_WRITE === '1';

let failures = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

function loadCredentials(): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!existsSync('.dev.vars')) return vars;
  for (const line of readFileSync('.dev.vars', 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return vars;
}

async function timeOf(path: string): Promise<{ ms: number; status: number }> {
  const t0 = Date.now();
  const res = await fetch(`${BASE}${path}`);
  await res.text();
  return { ms: Date.now() - t0, status: res.status };
}

console.log(`--- production smoke: ${BASE} ---\n`);

// Warm the connection so the first sample is not a TLS-handshake outlier.
await timeOf('/health');

const floor = await timeOf('/health');
check('/health responds 200', floor.status === 200, `${floor.status}`);
console.log(`      network + Worker floor: ${floor.ms} ms\n`);

for (const path of ['/', '/api/catalog/products', '/api/email-health', '/sitemap.xml', '/robots.txt']) {
  const r = await timeOf(path);
  check(`${path} responds 200`, r.status === 200, `${r.status}`);
}

// ---- checkout latency budget ----
const creds = loadCredentials();
const samples: number[] = [];
const orderNumbers: string[] = [];

for (let i = 0; i < 3; i++) {
  const stamp = Date.now();
  const orderNumber = `MR-SMOKE-${stamp}-${i}`;
  orderNumbers.push(orderNumber);
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `ord-smoke-${stamp}-${i}`,
      orderNumber,
      items: [{ product: { id: 'SMOKE', name: 'Smoke Test Item', price: 1 }, quantity: 1 }],
      subtotal: 1, tax: 0, discount: 0, shippingCost: 0, total: 1,
      paymentMethod: 'UPI',
      // Deliberately claims to be paid: the server must refuse to trust it.
      paymentStatus: 'paid',
      customerInfo: {
        name: 'Smoke Test',
        email: creds.ADMIN_NOTIFICATION_EMAIL || 'smoke@example.com',
        phone: '+919731153609',
        address: 'Smoke Test Address',
      },
      accountEmail: creds.ADMIN_NOTIFICATION_EMAIL || 'smoke@example.com',
      date: new Date().toISOString().slice(0, 10),
    }),
  });
  const ms = Date.now() - t0;
  await res.text();
  samples.push(ms);
  if (res.status !== 201) {
    check(`checkout order ${i + 1} accepted`, false, `status ${res.status}`);
  }
}

samples.sort((a, b) => a - b);
const median = samples[Math.floor(samples.length / 2)];
console.log(`\n      checkout samples: ${samples.join(', ')} ms`);
check(
  `checkout stays under ${BUDGET_MS} ms`,
  median < BUDGET_MS,
  `median ${median} ms (regressed to ~10000 ms before the fix)`,
);

async function cleanup(): Promise<void> {
  const login = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: creds.ADMIN_USERNAME, password: creds.ADMIN_PASSWORD }),
  });
  if (!login.ok) {
    console.log(`      cleanup skipped: admin login returned ${login.status}`);
    return;
  }
  const { token } = await login.json();
  for (const orderNumber of orderNumbers) {
    const res = await fetch(`${BASE}/api/orders/${encodeURIComponent(orderNumber)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) console.log(`      could not delete ${orderNumber}: ${res.status}`);
  }
  console.log('      test orders removed');
}

if (!ALLOW_WRITE) {
  console.log(`\n      (skipping lifecycle assertions; set SMOKE_WRITE=1 to enable)`);
}

await cleanup();
console.log(`\n${failures === 0 ? 'SMOKE PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);