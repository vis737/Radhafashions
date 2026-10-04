#!/usr/bin/env node
/**
 * Restore the Worker's secrets after a `wrangler deploy` wipes them.
 *
 * A deploy replaces the Worker's bindings with whatever is declared in
 * `wrangler.jsonc`. Anything that lived only in the Cloudflare dashboard —
 * SUPABASE_KEY, RESEND_API_KEY, JWT_SECRET, ADMIN_PASSWORD and friends — is
 * dropped from the Worker on every CI build. That is what caused the 503s.
 *
 * Usage:
 *   node restore-worker-secrets.mjs            # dry run: prints the plan only
 *   node restore-worker-secrets.mjs --apply    # actually sets the secrets
 *
 * Values are read from .dev.vars (gitignored) and piped straight to wrangler.
 * Nothing is printed, logged or written to disk.
 *
 * Prerequisite: `wrangler whoami` must report the account that owns the
 * Worker (radhanarayan0709@gmail.com / 31d352816cc0d50abe41bbd13bd10973).
 */

import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Already declared in wrangler.jsonc `vars`, so a deploy keeps them. Re-setting
// them here would be pointless noise.
const DECLARED_IN_CONFIG = new Set([
  'APP_URL',
  'SUPABASE_URL',
  'REQUIRE_SUPABASE',
  'SEED_SUPABASE_DATA',
  'SUPABASE_STORAGE_BUCKET',
  'ENABLE_REAL_NOTIFICATIONS',
]);

// Built into the client bundle at build time by Vite; the Worker never reads
// them at runtime. Listed for completeness but skipped by default.
const BUILD_TIME_ONLY = /^(VITE_|GEMINI_)/;

function readDotEnv(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (v) out[m[1]] = v;
  }
  return out;
}

const apply = process.argv.includes('--apply');
const includeBuildTime = process.argv.includes('--include-build-time');

const env = { ...readDotEnv('.env'), ...readDotEnv('.dev.vars') };
const targets = Object.keys(env).filter(
  (k) => !DECLARED_IN_CONFIG.has(k) && (includeBuildTime || !BUILD_TIME_ONLY.test(k))
);

if (!targets.length) {
  console.log('Nothing to restore — .dev.vars is missing or has no extra keys.');
  process.exit(1);
}

console.log(`${apply ? 'APPLYING' : 'DRY RUN — would set'} ${targets.length} secret(s):`);
for (const k of targets) {
  const note = BUILD_TIME_ONLY.test(k) ? '  (build-time only, skipped)' : '';
  console.log(`  - ${k}${note}`);
}
console.log('');

if (!apply) {
  console.log('Re-run with --apply to set them. Dry run made no changes.');
  process.exit(0);
}

const isWindows = process.platform === 'win32';
// On Windows `npx` is a .cmd shim, so spawning it directly fails; a shell is
// required for the account guard to actually run instead of erroring out.
function run(args, input) {
  return spawnSync(isWindows ? 'npx.cmd' : 'npx', args, {
    input,
    encoding: 'utf8',
    shell: isWindows,
  });
}

const whoami = run(['wrangler', 'whoami']);
if (whoami.status !== 0) {
  console.error('wrangler whoami failed — are you logged in?');
  console.error((whoami.stderr || '').split('\n').slice(0, 3).join('\n'));
  process.exit(1);
}
if (!whoami.stdout.includes('31d352816cc0d50abe41bbd13bd10973')) {
  console.error('WRONG ACCOUNT.');
  console.error('This token does not own the Worker. Log in as radhanarayan0709@gmail.com first:');
  console.error('  npx wrangler logout && npx wrangler login');
  console.error('\nRefusing to continue — setting secrets in the wrong account achieves nothing.');
  process.exit(1);
}

let failed = 0;
for (const key of targets) {
  if (BUILD_TIME_ONLY.test(key)) continue;
  process.stdout.write(`  ${key} ... `);
  const r = run(['wrangler', 'secret', 'put', key], env[key]);
  if (r.status === 0) console.log('ok');
  else {
    failed++;
    console.log('FAILED');
    console.log((r.stderr || '').split('\n').slice(0, 3).join('\n'));
  }
}

console.log(`\n${failed === 0 ? 'All secrets set.' : failed + ' secret(s) failed.'}`);
console.log('Verify with: curl -s https://radhafashions.in/api/supabase-health');
process.exit(failed === 0 ? 0 : 1);