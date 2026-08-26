-- Run once in Supabase SQL Editor. This migration is additive and safe to rerun.
-- It creates the category store and enables database change notifications used
-- by the Railway catalog stream.

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'categories'
      AND policyname = 'Allow all categories'
  ) THEN
    CREATE POLICY "Allow all categories"
      ON public.categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Required for UPDATE/DELETE notifications to include the full changed row.
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;
