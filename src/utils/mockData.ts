import { Product, Coupon, BannerCampaign, CMSConfig, Order, ActivityLog } from '../types';

export const CATEGORIES = [
  { id: 'sarees', name: 'Sarees', description: 'Exquisite silk, chiffon, and cotton sarees for every occasion — from casual elegance to wedding grandeur.', imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&auto=format&fit=crop&q=80' },
  { id: 'lehengas', name: 'Lehengas & Skirts', description: 'Bridal lehengas, festive chaniya cholis, and flared skirts adorned with intricate embroidery.', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80' },
  { id: 'kurtis', name: 'Kurtis & Kurtas', description: 'Elegant anarkali kurtis, straight-cut kurtas and co-ord sets for everyday grace.', imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=80' },
  { id: 'salwar', name: 'Salwar Suits', description: 'Classic and contemporary salwar kameez sets — Punjabi, Anarkali, and palazzo styles.', imageUrl: 'https://images.unsplash.com/photo-1594938298603-a8d9d09c7d7e?w=800&auto=format&fit=crop&q=80' },
  { id: 'dupattas', name: 'Dupattas & Stoles', description: 'Handwoven silk dupattas, embroidered chiffon stoles, and designer printed scarves.', imageUrl: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&auto=format&fit=crop&q=80' },
  { id: 'jewellery', name: 'Ethnic Jewellery', description: 'Temple jewellery, oxidized silver, kundan sets and pearl accessories to complete your look.', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80' },
  { id: 'handbags', name: 'Potli & Clutch Bags', description: 'Handcrafted potli bags, embroidered clutches, and ethnic evening purses.', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80' },
  { id: 'nightwear', name: 'Nightwear & Loungewear', description: 'Soft cotton nightgowns, printed pyjama sets, and comfortable loungewear for daily wear.', imageUrl: 'https://images.unsplash.com/photo-1617119038459-4f6e9de4c21e?w=800&auto=format&fit=crop&q=80' },
  { id: 'western', name: 'Fusion & Western', description: 'Indo-western fusion dresses, printed maxi dresses, and contemporary ethnic coordinates.', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'TEST-RF-001',
    sku: 'TEST-10',
    name: 'Test Product — ₹10 Checkout',
    category: 'Dupattas',
    categorySlug: 'dupattas',
    price: 8,
    stock: 999,
    rating: 5,
    ratingCount: 1,
    images: ['https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=600&auto=format&fit=crop'],
    shortDescription: 'Test product for ₹10 Razorpay checkout. Free shipping.',
    description: 'This is a test product for verifying Razorpay payment integration. Price is ₹8 + GST (2%) = ~₹9 total with free shipping.',
    specifications: { Weight: '0.05 kg' },
    reviews: [],
    isNew: true,
    isBestseller: false,
    brand: 'Radha Fashions',
    availability: 'in-stock',
    isTestProduct: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'RADHA10',
    type: 'percentage',
    value: 10,
    expiryDate: '2027-01-01',
    usageLimit: 300,
    usageCount: 0,
    minimumCartValue: 500,
    description: 'Enjoy 10% off on all collections at Radha Fashions',
    active: true
  },
  {
    code: 'FESTIVE20',
    type: 'percentage',
    value: 20,
    expiryDate: '2026-12-25',
    usageLimit: 150,
    usageCount: 0,
    minimumCartValue: 1500,
    description: 'Special 20% festive discount on orders above Rs.1500',
    active: true
  },
  {
    code: 'NEWUSER150',
    type: 'flat',
    value: 150,
    expiryDate: '2027-04-12',
    usageLimit: 500,
    usageCount: 0,
    minimumCartValue: 1000,
    description: 'Flat Rs.150 off for first-time shoppers above Rs.1000',
    active: true
  }
];

export const INITIAL_CAMPAIGNS: BannerCampaign[] = [
  {
    id: 'camp-1',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&auto=format&fit=crop&q=80',
    title: 'New Season Saree Collection',
    description: 'Explore our handpicked silk and chiffon sarees for every occasion.',
    ctaText: 'Shop Sarees',
    linkCategory: 'sarees',
    active: true
  },
  {
    id: 'camp-2',
    imageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    title: 'Bridal Lehenga Edit',
    description: 'Discover stunning embroidered lehengas perfect for your special day.',
    ctaText: 'Shop Lehengas',
    linkCategory: 'lehengas',
    active: true
  },
  {
    id: 'camp-3',
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1200&auto=format&fit=crop&q=80',
    title: 'Ethnic Jewellery Edit',
    description: 'Complete your look with temple jewellery, kundan sets, and pearl accessories.',
    ctaText: 'Shop Jewellery',
    linkCategory: 'jewellery',
    active: true
  }
];

export const DEFAULT_CMS: CMSConfig = {
  headline: 'Timeless Ethnic Elegance, Crafted With Love',
  subheadline: 'Discover exquisite sarees, lehengas, kurtis and curated ethnic collections — woven with tradition, worn with pride.',
  aboutText: 'Radha Fashions was born from a deep love of Indian heritage and craftsmanship. We curate handpicked ethnic wear — from silk sarees and embroidered lehengas to everyday kurtis and statement jewellery — sourced directly from master weavers and artisans across India. Every piece in our collection tells a story of tradition, artistry, and timeless beauty.',
  contactEmail: 'admin@radhafashions.in',
  contactPhone: '+91 97311 53609',
  contactAddress: 'KSVK School Rd, Hagadur, Vinayakanagar, Whitefield, Bengaluru, Karnataka 560066',
  whatsappNumber: '+919731153609',
  instagramLink: 'https://instagram.com/radhafashionss',
  privacyPolicy: 'Your personal data (Name, Email, Address) is transmitted through fully secured channels. We use client-side local persistence for fast loading and never share your data with third parties.',
  termsConditions: 'All prices at Radha Fashions are inclusive of applicable GST. Returns are accepted within 7 days of delivery provided items are in original, unworn condition with tags intact.'
};

export function sanitizeProduct(p: any): Product {
  const safeImages = Array.isArray(p?.images) && p.images.length > 0 
    ? p.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
    : typeof p?.images === 'string' && p.images.trim().length > 0 
      ? [p.images.trim()] 
      : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'];

  const defaultImg = safeImages.length > 0 ? safeImages : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'];

  return {
    id: String(p?.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    sku: String(p?.sku || `SKU-${Date.now()}`),
    name: String(p?.name || 'Untitled Product'),
    category: String(p?.category || 'Luxury Goods'),
    categorySlug: String(p?.categorySlug || p?.category_slug || p?.category?.toLowerCase().replace(/\s+/g, '-') || 'luxury-goods'),
    price: typeof p?.price === 'number' && !isNaN(p.price) ? p.price : Number(p?.price) || 999,
    discountPrice: p?.discountPrice || p?.discount_price ? (typeof (p.discountPrice || p.discount_price) === 'number' ? (p.discountPrice || p.discount_price) : Number(p.discountPrice || p.discount_price) || null) : null,
    stock: typeof p?.stock === 'number' && !isNaN(p.stock) ? p.stock : Number(p?.stock) || 10,
    rating: typeof p?.rating === 'number' && !isNaN(p.rating) ? p.rating : Number(p?.rating) || 5,
    ratingCount: typeof p?.ratingCount === 'number' && !isNaN(p.ratingCount) ? p.ratingCount : Number(p?.ratingCount) || 1,
    images: defaultImg,
    shortDescription: String(p?.shortDescription || p?.short_description || p?.name || ''),
    description: String(p?.description || p?.name || ''),
    specifications: typeof p?.specifications === 'object' && p?.specifications !== null ? p.specifications : {},
    reviews: Array.isArray(p?.reviews) ? p.reviews : [],
    isNew: Boolean(p?.isNew || p?.is_new),
    isBestseller: Boolean(p?.isBestseller || p?.is_bestseller),
    brand: String(p?.brand || 'Radha Fashions'),
    availability: p?.availability || 'in-stock'
  };
}

// Database local storage management
export const getStoredDb = () => {
  if (typeof window === 'undefined') return { products: INITIAL_PRODUCTS.map(sanitizeProduct), coupons: INITIAL_COUPONS, campaigns: INITIAL_CAMPAIGNS, cms: DEFAULT_CMS };
  try {
    const productsJson = localStorage.getItem('radha_products');
    const couponsJson = localStorage.getItem('radha_coupons');
    const campaignsJson = localStorage.getItem('radha_campaigns');
    const cmsJson = localStorage.getItem('radha_cms');

    let mergedProducts = INITIAL_PRODUCTS.map(sanitizeProduct);
    if (productsJson) {
      try {
        const storedProducts: any[] = JSON.parse(productsJson);
        if (Array.isArray(storedProducts)) {
          // A saved catalog is an exact cached server snapshot. Do not merge in
          // INITIAL_PRODUCTS: doing so makes removed products reappear locally.
          mergedProducts = storedProducts.map(sanitizeProduct);
        }
      } catch (parseErr) {
        console.error('Error parsing stored products, falling back to INITIAL_PRODUCTS', parseErr);
      }
    }

    return {
      products: mergedProducts,
      coupons: couponsJson ? JSON.parse(couponsJson) : INITIAL_COUPONS,
      campaigns: campaignsJson ? JSON.parse(campaignsJson) : INITIAL_CAMPAIGNS,
      cms: cmsJson ? JSON.parse(cmsJson) : DEFAULT_CMS
    };
  } catch (e) {
    console.error('Error reading localStorage DB, fallback to defaults', e);
    return { products: INITIAL_PRODUCTS.map(sanitizeProduct), coupons: INITIAL_COUPONS, campaigns: INITIAL_CAMPAIGNS, cms: DEFAULT_CMS };
  }
};

export const saveStoredDb = (db: { products?: Product[]; coupons?: Coupon[]; campaigns?: BannerCampaign[]; cms?: CMSConfig }) => {
  if (typeof window === 'undefined') return;
  try {
    if (db.products && Array.isArray(db.products)) {
      // Preserve product images safely without corrupting string data
      const safeProducts = db.products.map(p => ({
        ...p,
        images: (p.images || []).map(img => {
          if (typeof img === 'string' && img.length > 500000 && img.startsWith('data:')) {
            return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop';
          }
          return img;
        })
      }));
      localStorage.setItem('radha_products', JSON.stringify(safeProducts));
    }
    if (db.coupons) localStorage.setItem('radha_coupons', JSON.stringify(db.coupons));
    if (db.campaigns) localStorage.setItem('radha_campaigns', JSON.stringify(db.campaigns));
    if (db.cms) localStorage.setItem('radha_cms', JSON.stringify(db.cms));
  } catch (e) {
    console.error('Failed writing storage DB (quota exceeded), continuing safely', e);
  }
};

export const INITIAL_CMS = DEFAULT_CMS;

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-initial',
    action: 'System Bootstrapped',
    details: 'Role-Based access control systems initiated. Standard secure parameters verified.',
    user: 'System Workspace',
    timestamp: new Date().toISOString()
  }
];

export const loadInitialState = () => {
  if (typeof window === 'undefined') {
    return { cart: [], wishlist: [], orders: [], recentlyViewed: [], currentUser: null };
  }
  try {
    const cartJson = localStorage.getItem('radha_cart');
    const wishlistJson = localStorage.getItem('radha_wishlist');
    const ordersJson = localStorage.getItem('radha_orders');
    const recentlyViewedJson = localStorage.getItem('radha_recently_viewed');
    const userJson = localStorage.getItem('radha_current_user');

    const parsedCart = cartJson ? JSON.parse(cartJson) : [];
    const safeCart = Array.isArray(parsedCart)
      ? parsedCart
          .map((item: any) => {
            if (!item || !item.product) return null;
            return {
              ...item,
              product: sanitizeProduct(item.product)
            };
          })
          .filter(Boolean)
      : [];

    const parsedWishlist = wishlistJson ? JSON.parse(wishlistJson) : [];
    const safeWishlist = Array.isArray(parsedWishlist) ? parsedWishlist.filter((id: any) => typeof id === 'string' && id.trim().length > 0) : [];

    const parsedOrders = ordersJson ? JSON.parse(ordersJson) : [];
    const safeOrders = Array.isArray(parsedOrders) ? parsedOrders : [];

    const parsedRecentlyViewed = recentlyViewedJson ? JSON.parse(recentlyViewedJson) : [];
    const safeRecentlyViewed = Array.isArray(parsedRecentlyViewed) ? parsedRecentlyViewed.filter((id: any) => typeof id === 'string' && id.trim().length > 0) : [];

    return {
      cart: safeCart,
      wishlist: safeWishlist,
      orders: safeOrders,
      recentlyViewed: safeRecentlyViewed,
      currentUser: userJson ? JSON.parse(userJson) : null
    };
  } catch (err) {
    console.error('Failure recovering stored states:', err);
    return { cart: [], wishlist: [], orders: [], recentlyViewed: [], currentUser: null };
  }
};

export const saveToStorage = (state: { cart: any[]; wishlist: string[]; orders: any[]; recentlyViewed: string[]; currentUser: any }) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('radha_cart', JSON.stringify(state.cart));
    localStorage.setItem('radha_wishlist', JSON.stringify(state.wishlist));
    localStorage.setItem('radha_orders', JSON.stringify(state.orders));
    localStorage.setItem('radha_recently_viewed', JSON.stringify(state.recentlyViewed));
    if (state.currentUser) {
      localStorage.setItem('radha_current_user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('radha_current_user');
    }
  } catch (err) {
    console.error('Error writing state indexes:', err);
  }
};

