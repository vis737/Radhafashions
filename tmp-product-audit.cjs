// TEMP diagnostic: compare Supabase products with what the public API returns. Delete after use.
const fs = require('fs');
function env(file, key) {
  if (!fs.existsSync(file)) return '';
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(new RegExp('^\\s*(?:export\\s+)?' + key + '\\s*=\\s*(.*)$'));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return '';
}
const u = env('.env', 'SUPABASE_URL');
const k = env('.env', 'SUPABASE_KEY');
const H = { apikey: k, Authorization: `Bearer ${k}` };

(async () => {
  const r = await fetch(`${u}/rest/v1/products?select=*&limit=200`, { headers: H });
  const rows = await r.json();
  if (!Array.isArray(rows)) { console.log('error', JSON.stringify(rows).slice(0, 250)); return; }
  console.log('Supabase products rows:', rows.length);
  console.log('columns:', Object.keys(rows[0] || {}).join(', '));

  const statusish = ['status', 'approval_status', 'is_approved', 'approved', 'active', 'is_active', 'visibility']
    .filter((c) => c in (rows[0] || {}));
  if (statusish.length) {
    console.log('\n--- distribution of', statusish.join(', '), '---');
    for (const c of statusish) {
      const counts = {};
      for (const row of rows) counts[String(row[c])] = (counts[String(row[c])] || 0) + 1;
      console.log(' ', c, '=>', JSON.stringify(counts));
    }
  }

  const api = await fetch('https://radhafashions.in/api/catalog/products', { cache: 'no-store' });
  const apiRows = await api.json();
  console.log('\npublic API products:', Array.isArray(apiRows) ? apiRows.length : 'n/a');

  const dbIds = new Set(rows.map((x) => String(x.id)));
  const apiIds = new Set((Array.isArray(apiRows) ? apiRows : []).map((x) => String(x.id)));
  const missingFromApi = [...dbIds].filter((id) => !apiIds.has(id));
  const extraInApi = [...apiIds].filter((id) => !dbIds.has(id));
  console.log('\nin DB but NOT returned by API:', missingFromApi.length, missingFromApi.slice(0, 10));
  console.log('in API but NOT in DB:', extraInApi.length, extraInApi.slice(0, 10));
  for (const id of missingFromApi.slice(0, 5)) {
    const row = rows.find((x) => String(x.id) === id);
    console.log('  MISSING ->', JSON.stringify({ id: row.id, name: row.name, status: row.status, active: row.active, is_active: row.is_active }));
  }
})();