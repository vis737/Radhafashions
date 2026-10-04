# Deploying Radha Fashions to Cloudflare Workers

The whole site runs as **one Cloudflare Worker**: the React SPA is served from
Cloudflare's static-asset pipeline, and the Express API is the Worker's
JavaScript. **Supabase is the only persistent database.** A Worker has no
writable disk, so nothing that matters may live in a local file.

This document is the runbook for a fresh deployment. For the other hosts, see
[DEPLOY.md](DEPLOY.md) (Railway / Render) and [README.md](README.md).

---

## 1. Before you start

### Account plan — read this first

This deployment targets the **Workers Free** plan (10 ms of CPU per request).
bcrypt is pure CPU and is by far the most expensive thing this app does, so the
Free plan needs care. Measured inside `workerd`:

| Operation | Wall-clock in the emulator |
| --- | --- |
| bcrypt cost 12, hash | ~313 ms |
| bcrypt cost 12, compare | ~315 ms |
| bcrypt cost 10, hash | ~79 ms |
| bcrypt cost 8, hash | ~46 ms |
| bcrypt cost 4, hash | ~31 ms |
| WebCrypto PBKDF2, 210k iterations | ~105 ms |

Those are wall-clock numbers in the dev emulator, not CPU time, and
**`wrangler dev` does not enforce `cpu_ms` at all** — a control run at
`cpu_ms: 1` still passed. So the Free budget cannot be validated before
deploying. Treat the table as an upper bound: the real CPU cost is lower, but
almost certainly still above 10 ms at cost 12.

Two ways forward:

1. **Move to Workers Paid** ($5/month, 30 s CPU). Nothing else changes. This is
   the recommendation.
2. **Stay on Free and lower the bcrypt work factor.** Set these as Worker
   variables — no redeploy of code needed, the value is read per request:

   ```
   ADMIN_BCRYPT_COST=6
   CUSTOMER_BCRYPT_COST=6
   ```

   Lowering the cost only affects **new** hashes. Passwords already stored are
   still compared at whatever cost they were created with, so after changing
   this, change the admin and customer passwords once (Settings ▸ Admin ▸
   Change password, and re-register customer accounts) to re-hash them at the
   new cost.

If you do move to Paid and want more headroom, add to `wrangler.jsonc`:

```jsonc
"limits": {
  "cpu_ms": 30000
}
```

### What you need

- A Cloudflare account with a Workers Paid plan
- A Supabase project (the existing one is fine)
- Node 20+ and npm 10+

---

## 2. Database schema

Run these against Supabase, in this order:

| Order | File | Notes |
| --- | --- | --- |
| 1 | `supabase_full_migration.sql` | Base tables. Already applied on the existing project. |
| 2 | `supabase_variations_migration.sql`, `supabase_variations_v2_migration.sql` | Product variations. |
| 3 | `supabase_customers_migration.sql` | Customer credentials. |
| 4 | `SUPABASE_CATEGORIES_MIGRATION.sql` | Categories. |
| 5 | `supabase_catalog_realtime_migration.sql` | Realtime publication (used by the Node deployment). |
| 6 | **`supabase_cloudflare_migration.sql`** | **Required for Workers. Run this.** |

### Why step 6 is mandatory

`server.ts` already read and wrote 17 columns that the live Supabase project
does not have:

- **orders** — `cod_status`, `payu_txn_id`, `payu_payment_id`, `payu_hash`,
  `payu_status`, `upi_txn_id`, `upi_sender_name`, `upi_screenshot`, `upi_notes`,
  `upi_rejection_reason`, `gift_sender_name`, `gift_hide_price`
- **customers** — `clerk_id`, `phone`, `image_url`, `auth_provider`,
  `last_sign_in_at`

On Railway/Render this was invisible: the failed upsert was a detached promise
whose error was only written to a log, and the order still survived in the
local `orders_db.json` cache. On Workers there is no cache, so the same
statement failure means a customer loses their order at checkout. The migration
is additive (`ADD COLUMN IF NOT EXISTS`) and safe to re-run.

### Storage

Product images live in Supabase Storage, in a **public** bucket named
`product-images` (set `SUPABASE_STORAGE_BUCKET`). A Worker cannot write to a
filesystem, so this bucket is the only durable image store — the `/uploads`
directory is not mounted on Workers.

---

## 3. Configure variables and secrets

Open **Cloudflare dashboard ▸ Workers & Pages ▸ your Worker ▸ Settings ▸
Variables and Secrets**.

> **"Variables cannot be added to a Worker that only has static assets"**
>
> This is the error in the screenshot attached to this task. It means the
> Worker has no script. Deploying `worker.ts` as the entry point fixes it —
> `main: "worker.ts"` in `wrangler.jsonc` makes this a real Worker, and the
> variables panel unlocks.

### Variables (plain text, safe to show)

Already in `wrangler.jsonc` under `vars` — confirm they match your deployment:

| Name | Value |
| --- | --- |
| `APP_URL` | `https://radhafashions.in` |
| `REQUIRE_SUPABASE` | `true` |
| `SEED_SUPABASE_DATA` | `false` |
| `SUPABASE_STORAGE_BUCKET` | `product-images` |
| `ENABLE_REAL_NOTIFICATIONS` | `true` |
| `ADMIN_NOTIFICATION_EMAIL` | your admin inbox |
| `ADMIN_BCRYPT_COST` | optional | Defaults to `12`. Lower it to `6` on the Free plan — see section 1. |
| `CUSTOMER_BCRYPT_COST` | optional | Defaults to `10`. Lower it to `6` on the Free plan. |

### Secrets (encrypted — never in `wrangler.jsonc`)

| Name | Required | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | ✅ | `https://<project>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role, **not** anon. RLS is on; only this bypasses it. |
| `JWT_SECRET` | ✅ | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. Without it the Worker derives a stable key from the Supabase credentials — admin sessions survive, but an explicit secret is one less thing derived. |
| `ADMIN_USERNAME` | ✅ | Only used until `admin_config` has a row. |
| `ADMIN_PASSWORD` | ✅ | Only used until `admin_config` has a row. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | ✅ | Online payments. |
| `RESEND_API_KEY` **or** `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` | ✅ | OTP + order emails. Resend is preferred. |
| `GEMINI_API_KEY` | optional | Smart search. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_SMS_NUMBER` / `TWILIO_WHATSAPP_NUMBER` | optional | SMS alerts. |
| `PAYU_MERCHANT_KEY` / `PAYU_MERCHANT_SALT` | optional | PayU fallback gateway. |
| `ADMIN_NOTIFICATION_EMAIL` | recommended | New-order alerts. |

From the CLI:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put JWT_SECRET
# …repeat for each secret
```

`wrangler.jsonc` also sets the `nodejs_compat_populate_process_env`
compatibility flag, which copies all of these into `process.env` at runtime —
that is how the Express server reads its configuration.

---

## 4. Deploy

```bash
npm install
npm run cf:deploy        # = vite build && wrangler deploy
```

`npm run cf:deploy:dry` runs the same build and stops after bundling, so you
can catch config errors without publishing.

Expected output:

```
Read 33 files from the assets directory .../dist
Your Worker has access to the following bindings:
Binding                              Resource
env.ASSETS                           Assets
env.APP_URL ("https://radhafasions.in")  Environment Variable
...
```

Tail the live logs with `npm run cf:logs`.

### Build-time variables

`VITE_CLERK_PUBLISHABLE_KEY` and `VITE_RAZORPAY_KEY_ID` are inlined into the
JavaScript bundle by Vite, so they must be present in the **build** environment
(not as Worker secrets). With the Cloudflare Git integration, add them under
**Settings ▸ Builds & deployments ▸ Environment variables**.

---

## 5. Verify the deployment

```bash
BASE=https://radha-fashions.<your-subdomain>.workers.dev   # or your domain

curl -s $BASE/health                              # -> OK
curl -s $BASE/api/catalog/products | head -c 200  # -> real products from Supabase
curl -s -o /dev/null -w '%{http_code}\n' $BASE/sitemap.xml          # -> 200
curl -s -o /dev/null -w '%{http_code}\n' $BASE/robots.txt           # -> 200
curl -s -o /dev/null -w '%{http_code}\n' $BASE/account              # -> 200 (SPA shell)
```

Then check by hand:

1. **Homepage** loads and the shop grid shows real products.
2. **Admin login** at `/admin` — if the credentials work, `readAdminConfig()`
   found the row in Supabase.
3. **Place a ₹10 test order** using `TEST-RF-001` (run `ADD_TEST_PRODUCT.sql`
   if it is not in your catalogue), then confirm it appears in
   **Admin ▸ Orders**. This is the one path that cannot be verified read-only,
   because it is the only place a missing column would break.
4. **Share a product link** in WhatsApp — the preview should show the product
   photo, which means the server-rendered Open Graph tags worked.

---

## 6. Custom domain

**Workers & Pages ▸ your Worker ▸ Settings ▸ Domains & Routes ▸ Add ▸ Custom
domain**, then add `radhafashions.in`.

Once the domain is live, update:

- `APP_URL` in `wrangler.jsonc` (or the dashboard) → `https://radhafashions.in`
  and redeploy. It is used for CORS, cookie security and PayU callbacks.
- The Razorpay and PayU dashboard callback URLs.

---

## 7. How the deployment is put together

```
wrangler.jsonc
├── main: worker.ts            ── the Express app, bridged to fetch()
└── assets: ./dist/            ── served from Cloudflare's edge
    ├── run_worker_first       ── only these paths reach the Worker
    │     /api/*, /health, /sitemap.xml, /robots.txt,
    │     /products/*, /product/*
    └── everything else        ── straight from the edge cache, Worker never runs
```

`worker.ts` sets two globals before importing `server.ts` (the import is
dynamic, because ES module imports are hoisted and the server has to know it is
running on Workers before it evaluates):

- `__RADHA_CF_WORKER__` — switches `server.ts` into Workers mode
- `__RADHA_CF_ASSETS__` — the `ASSETS` binding, used in place of
  `fs.readFileSync('dist/index.html')`

### What changes in Workers mode

| Area | Node / Railway | Cloudflare Workers |
| --- | --- | --- |
| Orders | `orders_db.json` cache, Supabase written in the background | Supabase only; every read and write awaited |
| Admin credentials | `admin_config.json` cache | Supabase `admin_config` only |
| Customers | `customers_db.json` + in-memory cache | Supabase only, per request |
| Catalogue | Supabase first, JSON cache warm | Supabase first, no cache at all |
| Product images | `public/uploads/` on disk | Supabase Storage only |
| SPA shell | `express.static('dist')` | `ASSETS` binding |
| Social previews | `fs.readFileSync(dist/index.html)` | `ASSETS.fetch('/index.html')` |
| Catalogue live updates | Supabase Realtime WebSocket | Skipped; the client polls every 20 s |
| Order notifications | Fire-and-forget after the response | Awaited before responding |
| Email transport | Resend, then Brevo, then Nodemailer SMTP | Resend, then Brevo. **SMTP is skipped** — Workers have no raw TCP sockets |
| OTP cleanup | `setInterval` every 10 min | Purged inline on read |

### Why order notifications are awaited

A long-lived Node server can return the HTTP response and keep sending the
booking email afterwards. A Worker is frozen the moment the response is
returned, so a detached promise is cancelled before the first SMTP request
leaves. `ctx.waitUntil()` is not reachable from inside an Express handler, so
`POST /api/orders` awaits the notifications instead. The order is already
committed to Supabase at that point and every notification failure is
swallowed, so a flaky mail provider can never turn a successful checkout into an
error response.

**This applies to every outbound call, not just orders.** `POST /api/send-otp`
had the same defect once: it fired `dispatchOtpEmail()` without awaiting, so it
answered `200 "Passcode sent"` in ~18 ms while the Resend request was cancelled
before leaving the isolate and no email was ever delivered. Anything that must
survive the response has to be awaited (or handed to `ctx.waitUntil()`).

### Checking email delivery

`GET /api/email-health` is a read-only diagnostic — it never sends a message.
It reports which transports are configured, the resolved `from` address,
whether that sending domain is actually verified in Resend, and the result of
the most recent dispatch attempt on that isolate.

```bash
curl -s https://radhafashions.in/api/email-health | jq
```

`domainVerified` must be `"verified"`. The Free plan is not a factor here:
outbound HTTPS to `api.resend.com` works identically on every plan.

### Known trade-offs

- **Live catalogue updates** use the 20-second poll plus a window-focus refresh
  in `src/App.tsx` rather than Server-Sent Events. `/api/catalog/stream` still
  exists and still works, but each open stream holds a Worker request open, so
  the deployment does not subscribe to Supabase Realtime.
- **Image uploads** have no local fallback. If Supabase Storage is
  misconfigured, `/api/upload-image` returns a 500 that says so instead of
  silently writing to a disk that would vanish.
- **`iconv-lite` is pinned** to `^0.7.3` via `overrides` in `package.json`.
  Version 0.4.x ships a `browser` field that stubs out `./lib/streams` while
  `lib/index.js` still calls it, which crashes the Workers bundle at start-up
  with `require_streams(...) is not a function`
  ([workers-sdk#9309](https://github.com/cloudflare/workers-sdk/issues/9309)).
  It reaches the app through `raw-body` ← `body-parser` ← `express`.

---

## 8. Local development on Workers

```bash
cp .env .dev.vars          # secrets for `wrangler dev`
npm run dev:cf             # build + wrangler dev on http://localhost:8787
```

`wrangler dev` reads `.dev.vars` (gitignored) exactly the way it reads Worker
secrets in production, so local behaviour matches. Use `npm run dev` for the
plain Node server with hot reload.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| "Variables cannot be added to a Worker that only has static assets" | The Worker has no script | Deploy `worker.ts`; `main` is set in `wrangler.jsonc` |
| `/health` returns the homepage HTML | `/health` is not in `run_worker_first` | Add it; it is included in the shipped config |
| `/api/catalog/products` returns 503 | Supabase unreachable or RLS blocking | Use the service role key, not the anon key |
| Orders 500 at checkout, log says `42703` | `supabase_cloudflare_migration.sql` not applied | Run it |
| Admin sessions die on every deploy | `JWT_SECRET` not set | `npx wrangler secret put JWT_SECRET` |
| Deploy fails with `Disallowed operation called within global scope` (`10021`) | Module-scope async I/O or randomness — most often `crypto.randomBytes` for `JWT_SECRET` | Randomness and timers may only run inside a request handler. `getJwtSecret()` in [server.ts](server.ts) resolves lazily for this reason; keep any new `crypto`/`setTimeout` call out of module top level |
| `require_streams(...) is not a function` | `iconv-lite` 0.4.x in the bundle | Keep the `overrides` entry; reinstall |
| Upload returns 500 | Storage bucket missing or private | Create a public `product-images` bucket |
| Admin login times out on Free plan | 10 ms CPU limit | Set `ADMIN_BCRYPT_COST=6`, or move to Workers Paid |
| Login fails with `1101` / "exceeded resource limits" | Same cause, on Workers rather than locally | Same fix; `wrangler dev` cannot reproduce this |
| Emails never arrive, but the API says success | An un-awaited dispatch. A Worker is frozen the instant the response is returned, so a detached promise is cancelled mid-flight | Await every outbound call. `POST /api/send-otp` had exactly this bug; it now returns `502` instead of a false success |
| `GET /api/email-health` reports `domainVerified: false` | The `from` domain is missing or unverified in Resend | Verify `radhafashions.in` at <https://resend.com/domains>, or change `RESEND_FROM_EMAIL` |
| `/api/send-otp` returns `502` | Resend rejected the send | Read `lastDispatch` in `/api/email-health`, or the `[Resend]` line in `npm run cf:logs` |
| Emails stopped after a `SMTP_*` misconfiguration | Workers cannot open raw TCP sockets, so the Nodemailer fallback can never succeed there | Set `RESEND_API_KEY` and remove the dependency on SMTP |
