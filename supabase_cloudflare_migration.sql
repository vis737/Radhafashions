-- ---------------------------------------------------------------------------
-- Radha Fashions — Supabase schema reconciliation for the Cloudflare Workers
-- deployment
-- ---------------------------------------------------------------------------
-- Run this ONCE against the Supabase project, after supabase_full_migration.sql:
--   Supabase dashboard ▸ SQL Editor ▸ paste this file ▸ Run
-- or
--   psql "$SUPABASE_DB_URL" -f supabase_cloudflare_migration.sql
--
-- WHY THIS EXISTS
--
-- On Cloudflare Workers there is no writable disk, so Supabase is the only
-- store an order or a customer can live in. Every write therefore has to name
-- real columns — Postgres rejects the whole statement if one of them is
-- missing, so a single absent column silently breaks order checkout on
-- Workers.
--
-- The columns below were verified against the live project by querying PostgREST
-- and are genuinely absent there, even though the application code has been
-- reading and writing them for a while. On the Node/Railway deployment the bug
-- was masked: the failed upsert was a detached promise whose error was only
-- logged, and the order still survived in the local orders_db.json cache. On
-- Workers there is no cache, so it would fail loudly and lose the order.
--
-- Safe to run repeatedly — every statement is guarded with IF NOT EXISTS.
-- ---------------------------------------------------------------------------

BEGIN;

-- ===========================================================================
-- public.orders
-- ===========================================================================

-- Cash-on-delivery approval state, shown in the admin logistics tracker.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cod_status TEXT;

-- PayU gateway bookkeeping. `payu_txn_id` identifies the order in the PayU
-- success/failure redirects and in the webhook, so it gets its own index.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payu_txn_id TEXT,
  ADD COLUMN IF NOT EXISTS payu_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payu_hash TEXT,
  ADD COLUMN IF NOT EXISTS payu_status TEXT;

-- UPI QR payments. `upi_screenshot` holds a public Supabase Storage URL to the
-- payer's payment screenshot, which an admin verifies before approving.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS upi_txn_id TEXT,
  ADD COLUMN IF NOT EXISTS upi_sender_name TEXT,
  ADD COLUMN IF NOT EXISTS upi_screenshot TEXT,
  ADD COLUMN IF NOT EXISTS upi_notes TEXT,
  ADD COLUMN IF NOT EXISTS upi_rejection_reason TEXT;

-- Gift-wrap sender name and "hide the price" flag on the packing slip.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gift_sender_name TEXT,
  ADD COLUMN IF NOT EXISTS gift_hide_price BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_orders_payu_txn_id
  ON public.orders (payu_txn_id);

CREATE INDEX IF NOT EXISTS idx_orders_date
  ON public.orders (date);

-- ===========================================================================
-- public.customers
-- ===========================================================================
-- Written by POST /api/auth/clerk-sync for social (Google/Apple) sign-ins and
-- read by GET /api/customers. Without these the Clerk sync upsert fails with
-- 42703 and social sign-in never records a profile row.
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS clerk_id TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS auth_provider TEXT,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_customers_clerk_id
  ON public.customers (clerk_id);

COMMIT;

-- ---------------------------------------------------------------------------
-- VERIFICATION
--
-- Re-run this after applying; it should report zero missing columns:
--
--   SELECT table_name, column_name FROM information_schema.columns
--    WHERE table_schema = 'public'
--      AND column_name IN (
--        'cod_status','payu_txn_id','payu_payment_id','payu_hash','payu_status',
--        'upi_txn_id','upi_sender_name','upi_screenshot','upi_notes',
--        'upi_rejection_reason','gift_sender_name','gift_hide_price',
--        'clerk_id','phone','image_url','auth_provider','last_sign_in_at')
--    ORDER BY table_name, column_name;
--
-- Expected: 12 rows for `orders` and 5 rows for `customers`.
--
-- Note: `customers.phone`, `customers.image_url` and `customers.auth_provider`
-- are unrelated to the already-present password login flow, which keeps using
-- `email` and `password_hash`.
-- ---------------------------------------------------------------------------
