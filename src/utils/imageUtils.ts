/**
 * Utility to provide high-quality fallback images when a product image URL fails or is missing.
 */
const DEFAULT_FALLBACK_IMAGES: Record<string, string> = {
  Handbags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop',
  'Kids Toys': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop',
  Watches: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop',
  Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
  Jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop',
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'
};

export function getFallbackImage(category?: string): string {
  if (category && DEFAULT_FALLBACK_IMAGES[category]) {
    return DEFAULT_FALLBACK_IMAGES[category];
  }
  return DEFAULT_FALLBACK_IMAGES.default;
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string
) {
  const target = e.currentTarget;
  const fallback = getFallbackImage(category);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
