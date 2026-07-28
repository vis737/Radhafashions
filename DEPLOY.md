# 🚀 Deploy Meris E-Shop to Railway/Render — Step-by-Step Guide

## Prerequisites
- A [Railway](https://railway.app) or [Render](https://render.com) account
- A [Supabase](https://supabase.com) project
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords)
- This repo pushed to GitHub / GitLab

---

## Step 1 — Run Supabase Migration

Go to your Supabase project → **SQL Editor** → **New Query**, paste the contents of [`supabase_full_migration.sql`](./supabase_full_migration.sql) and click **Run**.

This creates all 9 required tables:
`products`, `coupons`, `campaigns`, `cms_config`, `admin_config`, `orders`, `customers`, `email_logs`, `newsletter`

---

## Step 2 — Create a New Railway/Render Web Service

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub/GitLab repo
4. Render will auto-detect `render.yaml` — or set manually:

| Setting | Value |
|---|---|
| **Runtime** | Node |
| **Build Command** | `npm install --legacy-peer-deps && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

---

## Step 3 — Set Environment Variables in Railway/Render Dashboard

Go to your service → **Environment** tab → Add the following:

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render assigns this automatically |
| `APP_URL` | `https://your-app.up.railway.app` | ⚠️ **Set to your actual public app URL after first deploy** |
| `JWT_SECRET` | (random 64-char hex string) | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `ADMIN_USERNAME` | `admin` | Admin panel username |
| `ADMIN_PASSWORD` | (strong password) | Admin panel password |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | From Supabase → Project Settings → API |
| `SUPABASE_KEY` | (service role key) | From Supabase → Project Settings → API → service_role |
| `SUPABASE_STORAGE_BUCKET` | `product-images` | Product upload bucket; the app auto-creates it when using the service role key |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_SECURE` | `false` | |
| `SMTP_USER` | `your@gmail.com` | Your Gmail address |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | Gmail App Password (16 chars) |
| `SMTP_FROM_NAME` | `Meris E-Shop` | |
| `SMTP_FROM_EMAIL` | `your@gmail.com` | Same as SMTP_USER |
| `ENABLE_REAL_NOTIFICATIONS` | `true` | Enables real OTP emails |
| `PAYU_MERCHANT_KEY` | PayU merchant key | Required for online checkout |
| `PAYU_MERCHANT_SALT` | PayU merchant salt | Required for server-side hash verification |
| `PAYU_ENV` | `production` | Use `test` only for sandbox transactions |

### Optional Variables
| Variable | Value | Notes |
|---|---|---|
| `DATA_DIR` | `/data` | Only if using a Railway persistent volume as a local fallback |
| `GEMINI_API_KEY` | (your key) | For AI product recommendations |
| `PAYU_SUCCESS_URL` | `https://your-app.onrender.com/api/payu/success` | Optional; defaults from `APP_URL` |
| `PAYU_FAILURE_URL` | `https://your-app.onrender.com/api/payu/failure` | Optional; defaults from `APP_URL` |
| `PAYU_WEBHOOK_URL` | `https://your-app.onrender.com/api/payu/webhook` | Configure this in PayU dashboard if webhooks are enabled |

---

## Step 4 — Deploy

Click **Deploy** on Render. The build takes ~2-3 minutes.

After the first deploy:
1. Copy your public app URL (e.g. `https://your-app.up.railway.app`)
2. Go back to **Environment** and update `APP_URL` to your actual URL
3. Click **Manual Deploy → Deploy latest commit**

---

## Step 5 — Verify

| Test | How |
|---|---|
| App loads | Visit your Render URL |
| Login works | Register → Login with password |
| OTP works | Use "Email OTP" tab on login page |
| PayU works | Place an online order and confirm redirect to PayU |
| Admin panel | Visit `/admin` with your `ADMIN_USERNAME` / `ADMIN_PASSWORD` |
| Health check | Visit `/api/health` — should return `{"status":"ok"}` |

---

## Common Issues

### "Security lockout active"
The in-memory rate limiter triggered too many login attempts. **Redeploy** to reset it, or wait 15 minutes.

### OTP email not arriving
1. Check `ENABLE_REAL_NOTIFICATIONS=true` is set
2. Check Gmail App Password is correct (must be 16 chars, generated from myaccount.google.com/apppasswords)
3. Check Render logs: `npm run start` logs SMTP errors clearly

### PayU does not redirect or returns verification failed
1. Check `PAYU_MERCHANT_KEY` and `PAYU_MERCHANT_SALT` are set in Render
2. Check `PAYU_ENV=production` for live payments or `PAYU_ENV=test` for sandbox
3. Ensure `APP_URL` is your exact Render URL with no trailing slash
4. In PayU, use `https://your-app.onrender.com/api/payu/success`, `/api/payu/failure`, and `/api/payu/webhook`

### Login fails after deploy
1. Ensure `SUPABASE_URL` and `SUPABASE_KEY` are set correctly
2. Ensure `APP_URL` matches your Render URL exactly (no trailing slash)
3. Check that the `customers` table exists in Supabase (run migration SQL)

### Uploaded images disappear
Railway and Render app filesystems are **ephemeral** unless you attach a persistent volume. Product images are now uploaded to Supabase Storage when `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_STORAGE_BUCKET` are set. Use the Supabase **service role** key so the server can create/write the `product-images` bucket.

### Added products disappear after some time
Make sure `SUPABASE_URL` and `SUPABASE_KEY` are set in Railway. In production, catalog saves now fail with a clear API error instead of pretending to save only to temporary disk. As a fallback, attach a Railway volume and set `DATA_DIR=/data`.

---

## Architecture Summary

```
Browser → Render Web Service (Express + React)
              │
              ├── Supabase (all persistent data)
              │     ├── products, coupons, campaigns, cms_config
              │     ├── orders, customers, admin_config
              │     ├── email_logs, newsletter
              │     └── (no files written to disk)
              │
              ├── Gmail SMTP (OTP + transactional emails)
              └── OTP store (in-memory, 5-min TTL, auto-cleared)
```
