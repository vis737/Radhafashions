-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Allow full access (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Allow all categories" ON public.categories;
CREATE POLICY "Allow all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 4. Seed all categories with images
INSERT INTO public.categories (id, name, description, image_url, enabled, sort_order) VALUES
('sarees', 'Sarees', 'Exquisite silk, chiffon, and cotton sarees for every occasion.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop', true, 1),
('lehengas', 'Lehengas', 'Bridal and designer lehengas with intricate embroidery.', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop', true, 2),
('kurtis', 'Kurtis', 'Casual and party-wear kurtis in trendy designs.', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop', true, 3),
('jewellery', 'Ethnic Jewellery', 'Traditional and contemporary ethnic jewellery collections.', 'https://images.unsplash.com/photo-1515562141589-67f0d727b750?w=600&auto=format&fit=crop', true, 4),
('handbags', 'Handbags', 'Designer potli bags, clutches, and ethnic handbags.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop', true, 5),
('dupattas', 'Dupattas', 'Embroidered and printed dupattas to complete your outfit.', 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=600&auto=format&fit=crop', true, 6),
('blouses', 'Blouses', 'Designer and customized blouses for sarees and lehengas.', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop', true, 7),
('salwar', 'Salwar Suits', 'Classic and modern salwar suits for daily and festive wear.', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop', true, 8),
('kids-ethnic', 'Kids Ethnic Wear', 'Adorable ethnic outfits for kids and toddlers.', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop', true, 9),
('nightwear', 'Nightwear & Loungewear', 'Soft cotton nightgowns, printed pyjama sets, and comfortable loungewear.', 'https://images.unsplash.com/photo-1617119038459-4f6e9de4c21e?w=600&auto=format&fit=crop', true, 10),
('western', 'Fusion & Western', 'Indo-western fusion dresses, printed maxi dresses, and contemporary ethnic coordinates.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop', true, 11)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  enabled = EXCLUDED.enabled,
  sort_order = EXCLUDED.sort_order;

-- 5. Verify
SELECT id, name, image_url, enabled FROM public.categories ORDER BY sort_order;
