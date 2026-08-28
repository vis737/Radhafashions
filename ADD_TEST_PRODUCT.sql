-- Test Product for Radha Fashions (₹10, Free Shipping, Free GST)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zzwxnnzzwxsdvggpumze/sql/new

INSERT INTO public.products (
  id, sku, name, category, category_slug,
  price, discount_price, stock,
  rating, rating_count,
  images, short_description, description,
  specifications, reviews,
  is_new, is_bestseller, brand, availability, vendor_id, variation
) VALUES (
  'TEST-RF-001',
  'TEST-10',
  'Test Product — ₹10 Trial Order',
  'kurtis',
  'kurtis',
  10,
  10,
  999,
  5.0,
  1,
  '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop"]',
  'Test product for verifying checkout flow. ₹10 only with free shipping and free GST.',
  'This is a test product to verify the complete checkout and payment flow. Price is ₹10 with completely free shipping and zero GST. Use this to test Razorpay and UPI QR payments before going live with real products.',
  '{"Weight": "0.1 kg", "Material": "Test", "Origin": "India"}',
  '[]',
  true,
  false,
  'Radha Fashions',
  'In Stock',
  'admin',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock = EXCLUDED.stock,
  images = EXCLUDED.images,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  availability = EXCLUDED.availability;

-- Verify
SELECT id, sku, name, price, discount_price, stock, availability FROM public.products WHERE id = 'TEST-RF-001';
