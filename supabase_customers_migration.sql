-- Run this in your Supabase project's SQL editor:
-- https://supabase.com/dashboard/project/hynmcyebbnhdrrxevkzg/sql/new

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow the server (service role) full access via SUPABASE_KEY
-- (The anon key should NOT be able to read password hashes)
CREATE POLICY "Service role full access" ON customers
  FOR ALL USING (true);
