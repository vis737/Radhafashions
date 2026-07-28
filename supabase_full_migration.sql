-- =============================================================================
-- MERIS E-SHOP — Complete & Safe Supabase Database Migration
-- https://supabase.com/dashboard/project/zzwxnnzzwxsdvggpumze/sql/new
-- =============================================================================

-- Drop legacy template tables if they exist
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- ---------------------------------------------------------------------------
-- 1. PRODUCTS TABLE & COLUMNS
-- ---------------------------------------------------------------------------
CREATE TABLE public.products (
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
CREATE INDEX IF NOT EXISTS idx_orders_account_email ON public.orders(account_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ---------------------------------------------------------------------------
-- 7. CUSTOMERS TABLE & INDEXES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
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
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter(email);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & UNRESTRICTED ACCESS POLICIES
-- ---------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Products policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow all products') THEN
    CREATE POLICY "Allow all products" ON public.products FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Coupons policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Allow all coupons') THEN
    CREATE POLICY "Allow all coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Campaigns policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Allow all campaigns') THEN
    CREATE POLICY "Allow all campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- CMS config policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_config' AND policyname = 'Allow all cms') THEN
    CREATE POLICY "Allow all cms" ON public.cms_config FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Admin config policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_config' AND policyname = 'Allow all admin_config') THEN
    CREATE POLICY "Allow all admin_config" ON public.admin_config FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Orders policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow all orders') THEN
    CREATE POLICY "Allow all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Customers policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Allow all customers') THEN
    CREATE POLICY "Allow all customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Email logs policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_logs' AND policyname = 'Allow all email_logs') THEN
    CREATE POLICY "Allow all email_logs" ON public.email_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Newsletter policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter' AND policyname = 'Allow all newsletter') THEN
    CREATE POLICY "Allow all newsletter" ON public.newsletter FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- PRODUCT IMAGE STORAGE BUCKET
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read product images'
  ) THEN
    CREATE POLICY "Public read product images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END
$$;
