-- =============================================================================
-- MERIS E-SHOP — Complete & Safe Supabase Database Migration
-- https://supabase.com/dashboard/project/zzwxnnzzwxsdvggpumze/sql/new
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PRODUCTS TABLE & COLUMNS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

ALTER TABLE public.products ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ---------------------------------------------------------------------------
-- 2. COUPONS TABLE & COLUMNS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
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
-- 3. CAMPAIGNS TABLE & COLUMNS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  image_url TEXT,
  title TEXT,
  description TEXT,
  cta_text TEXT,
  link_category TEXT,
  active BOOLEAN DEFAULT true
);
ALTER TABLE public.campaigns ALTER COLUMN id TYPE TEXT;

-- ---------------------------------------------------------------------------
-- 4. CMS CONFIG TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_config (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- ---------------------------------------------------------------------------
-- 5. ADMIN CONFIG TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_config (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- 6. ORDERS TABLE & INDEXES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
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
ALTER TABLE public.orders ALTER COLUMN id TYPE TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_account_email ON public.orders(account_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ---------------------------------------------------------------------------
-- 7. CUSTOMERS TABLE & INDEXES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.customers ALTER COLUMN id TYPE TEXT;
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- ---------------------------------------------------------------------------
-- 8. EMAIL LOGS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
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
ALTER TABLE public.email_logs ALTER COLUMN id TYPE TEXT;
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient);

-- ---------------------------------------------------------------------------
-- 9. NEWSLETTER SUBSCRIPTIONS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'footer_newsletter'
);
ALTER TABLE public.newsletter ALTER COLUMN id TYPE TEXT;
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter(email);

-- ---------------------------------------------------------------------------
-- SAFE ROW LEVEL SECURITY (RLS) & PUBLIC READ POLICIES
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') THEN
    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cms_config') THEN
    ALTER TABLE public.cms_config ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_config') THEN
    ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_logs') THEN
    ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'newsletter') THEN
    ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public read products') THEN
    CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Public read campaigns') THEN
    CREATE POLICY "Public read campaigns" ON public.campaigns FOR SELECT USING (true);
  END IF;
END
$$;
