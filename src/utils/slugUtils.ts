import { Product } from '../types';

/**
 * Converts any text into a URL-friendly slug.
 * e.g., Pure Kanjivaram Silk Saree - Red & Gold -> pure-kanjivaram-silk-saree-red-gold
 */
export const slugify = (text: string): string => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except space and hyphen
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into hyphen
    .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
};

/**
 * Returns a canonical slug for a product using its name/title.
 * Falls back to product ID if no name is available.
 */
export const getProductSlug = (product?: { id?: string; name?: string; slug?: string } | null): string => {
  if (!product) return '';
  if (product.slug && product.slug.trim()) {
    return slugify(product.slug);
  }
  if (product.name && product.name.trim()) {
    const slug = slugify(product.name);
    if (slug) return slug;
  }
  return product.id || '';
};

/**
 * Resolves a product by title slug or by ID from a products array.
 */
export const findProductBySlugOrId = (
  identifier: string,
  productList: Product[] = []
): Product | undefined => {
  if (!identifier || !Array.isArray(productList) || productList.length === 0) {
    return undefined;
  }

  const rawDecoded = decodeURIComponent(identifier).trim();
  const lowerDecoded = rawDecoded.toLowerCase();
  const slugified = slugify(rawDecoded);

  // 1. Check exact slug match
  let found = productList.find(p => getProductSlug(p).toLowerCase() === slugified);
  if (found) return found;

  // 2. Check exact ID match
  found = productList.find(p => (p.id || '').toLowerCase() === lowerDecoded);
  if (found) return found;

  // 3. Check case-insensitive name match
  found = productList.find(p => (p.name || '').trim().toLowerCase() === lowerDecoded);
  if (found) return found;

  // 4. Fallback: Check if identifier is in the form of slug-prodId
  found = productList.find(p => p.id && lowerDecoded.endsWith(p.id.toLowerCase()));
  return found;
};
