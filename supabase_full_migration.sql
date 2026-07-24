-- =============================================================================
-- MERIS E-SHOP — Full Supabase Database Migration
-- Run this ONCE in your Supabase project SQL editor:
-- https://supabase.com/dashboard/project/<YOUR_PROJECT_ID>/sql/new
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  name TEXT NOT NULL,
  category TEXT,
  category_slug TEXT,
  price NUMERIC,
  discount_price NUMERIC,
  stock INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]',
  short_description TEXT,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  reviews JSONB DEFAULT '[]',
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  brand TEXT,
  availability TEXT,
  vendor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. COUPONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  type TEXT,
  value NUMERIC,
  expiry_date TEXT,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  minimum_cart_value NUMERIC DEFAULT 0,
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- ---------------------------------------------------------------------------
-- 3. CAMPAIGNS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  image_url TEXT,
  title TEXT,
  description TEXT,
  cta_text TEXT,
  link_category TEXT,
  active BOOLEAN DEFAULT true
);

-- ---------------------------------------------------------------------------
-- 4. CMS CONFIG
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_config (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- ---------------------------------------------------------------------------
-- 5. ADMIN CONFIG
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_config (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- 6. ORDERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_info JSONB DEFAULT '{}',
  items JSONB DEFAULT '[]',
  shipping_method TEXT,
  shipping_cost NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  coupon_code TEXT,
  date TEXT,
  payment_method TEXT DEFAULT 'Razorpay',
  payment_status TEXT DEFAULT 'unpaid',
  upi_txn_id TEXT,
  upi_sender_name TEXT,
  upi_screenshot TEXT,
  upi_notes TEXT,
  upi_rejection_reason TEXT,
  gift_wrapping_requested BOOLEAN DEFAULT false,
  gift_wrapping_type TEXT,
  gift_message TEXT,
  gift_sender_name TEXT,
  gift_hide_price BOOLEAN DEFAULT false,
  account_email TEXT,
  account_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_account_email ON orders(account_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ---------------------------------------------------------------------------
-- 7. CUSTOMERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ---------------------------------------------------------------------------
-- 8. EMAIL LOGS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT,
  body_html TEXT,
  sent_at TEXT,
  order_number TEXT,
  status TEXT DEFAULT 'Delivered',
  date_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);

-- ---------------------------------------------------------------------------
-- 9. NEWSLETTER SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'footer_newsletter'
);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------
-- Enable RLS on all tables. The service-role key bypasses RLS automatically.
-- This prevents the anon key from accessing sensitive data.

ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter      ENABLE ROW LEVEL SECURITY;

-- Public read-only policies for catalog data (products, campaigns are public)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public read products'
  ) THEN
    CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Public read campaigns'
  ) THEN
    CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
  END IF;
END
$$;

-- Service role handles all write operations via the server (bypasses RLS automatically).
-- No additional policies needed for the service-role key.


-- =============================================================================
-- DONE. Run npm run build then deploy to Render.
-- =============================================================================
