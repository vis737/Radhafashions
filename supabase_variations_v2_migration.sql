-- Migration: Add `variations` column for dual color + size product variations.
-- Run this once in the Supabase SQL editor.
-- The legacy `variation` column is kept for backward compatibility.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS variations JSONB;
