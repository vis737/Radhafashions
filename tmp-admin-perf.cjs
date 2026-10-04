// TEMP diagnostic: production latency + auth behaviour for admin panel endpoints. Delete after use.
const BASE = 'https://radhafashions.in';

async function timed(label, url, opts = {}) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, opts);
    const text = await r.text();
    const ms = Date.now() - t0;
    let size = '';
    try {
      const j = JSON.parse(text);
      size = Array.isArray(j) ? ` array(${j.length})` : ` obj(${Object.keys(j).length} keys)`;
    } catch { size = ` ${text.length}b`; }
    console.log(`${String(ms).padStart(6)}ms  HTTP ${String(r.status).padEnd(4)} ${size.padEnd(16)} ${label}`);
    return { ms, status: r.status, text };
  } catch (e) {
    console.log(`${'ERR'.padStart(6)}     ${label} :: ${e.message}`);
    return { ms: -1, status: 0, text: '' };
  }
}

(async () => {
  console.log('=== admin panel endpoints, as the browser calls them (no auth) ===');
  for (let i = 0; i < 2; i++) {
    console.log(`--- round ${i + 1} ---`);
    await timed('GET /api/catalog/products', `${BASE}/api/catalog/products`, { cache: 'no-store' });
    await timed('GET /api/catalog/categories', `${BASE}/api/catalog/categories`, { cache: 'no-store' });
    await timed('GET /api/catalog/coupons', `${BASE}/api/catalog/coupons`, { cache: 'no-store' });
    await timed('GET /api/catalog/campaigns', `${BASE}/api/catalog/campaigns`, { cache: 'no-store' });
    await timed('GET /api/catalog/cms', `${BASE}/api/catalog/cms`, { cache: 'no-store' });
    await timed('GET /api/admin/session', `${BASE}/api/admin/session`, { cache: 'no-store' });
    await timed('GET /api/orders  (NO TOKEN)', `${BASE}/api/orders`, { cache: 'no-store' });
  }

  console.log('\n=== /api/orders response body without a token ===');
  const r = await fetch(`${BASE}/api/orders`, { cache: 'no-store' });
  console.log('status', r.status, '->', (await r.text()).slice(0, 200));

  console.log('\n=== SSE stream /api/catalog/stream (5s sample) ===');
  const ctl = new AbortController();
  const t0 = Date.now();
  const timer = setTimeout(() => ctl.abort(), 5000);
  try {
    const r = await fetch(`${BASE}/api/catalog/stream`, { signal: ctl.signal, headers: { Accept: 'text/event-stream' } });
    console.log('status', r.status, '| content-type:', r.headers.get('content-type'));
    const reader = r.body.getReader();
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) { console.log('stream CLOSED after', Date.now() - t0, 'ms'); break; }
      bytes += value.length;
    }
    console.log('bytes received while open:', bytes);
  } catch (e) {
    console.log('stream aborted/errored after', Date.now() - t0, 'ms ::', e.name, e.message);
  } finally {
    clearTimeout(timer);
  }
})();