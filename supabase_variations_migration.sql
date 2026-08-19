-- Safe migration for stores that already have the products table.
-- Run this once in the Supabase SQL editor before using product variations.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS variation JSONB;
