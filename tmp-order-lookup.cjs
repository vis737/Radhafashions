// TEMP diagnostic: is the test order actually persisted, and under what identifiers? Delete after use.
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
  const r = await fetch(`${u}/rest/v1/orders?select=id,order_number,status,payment_status,date&order=id.desc&limit=8`, { headers: H });
  const rows = await r.json();
  if (!Array.isArray(rows)) { console.log('error', JSON.stringify(rows).slice(0, 200)); return; }
  console.log('orders in Supabase:', rows.length);
  for (const o of rows) {
    console.log('  id=', JSON.stringify(o.id), '| order_number=', JSON.stringify(o.order_number), '|', o.status, '|', o.payment_status);
  }
  const found = rows.find((o) => o.order_number === 'MR-TEST284777');
  console.log('\nMR-TEST284777 present?', !!found);
})();