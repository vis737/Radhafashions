-- =============================================================================
-- MERIS E-SHOP — Customer & Clerk Auth Supabase Migration
-- https://supabase.com/dashboard/project/zzwxnnzzwxsdvggpumze/sql/new
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  clerk_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  image_url TEXT,
  auth_provider TEXT DEFAULT 'email',
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS clerk_id TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_clerk_id ON public.customers(clerk_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Allow all customers') THEN
    CREATE POLICY "Allow all customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
