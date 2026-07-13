import { Vendor, BundleOffer, BulkOrderInquiry, Product } from '../types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Bharath Nair',
    email: 'bharath@kanyakumariwood.in',
    phone: '+91 94432 10455',
    storeName: 'Kanyakumari Wood Craftsmen Studios',
    description: 'Generational teakwood and sheesham furniture carvers supplying chemical-free solid-wood goods.',
    approved: true,
    commissionRate: 12,
    status: 'active',
    revenue: 48950,
    logoUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=150&auto=format&fit=crop'
  },
  {
    id: 'vendor-2',
    name: 'Meera Devi',
    email: 'meera@azhagappapuralooms.org',
    phone: '+91 93421 88402',
    storeName: 'Azhagappapuram Female Loom Cooperatives',
    description: 'Weaving hand-spun cotton yarns, organic jute slings, and vintage wool knit blankets to empower women artisans.',
    approved: true,
    commissionRate: 8,
    status: 'active',
    revenue: 29400,
    logoUrl: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=150&auto=format&fit=crop'
  },
  {
    id: 'vendor-3',
    name: 'Thangavel Pandian',
    email: 'tpandian@rangoliacrylics.co.in',
    phone: '+91 98944 65633',
    storeName: 'Pandian Precision Laser Engravings',
    description: 'Laser-cutting acrylics and brass casting for Kolam boards, mandala trackers, and holy entrance panels.',
    approved: false, // For testing pending lists
    commissionRate: 15,
    status: 'pending',
    revenue: 0,
    logoUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=150&auto=format&fit=crop'
  }
];

export const INITIAL_BUNDLES: BundleOffer[] = [
  {
    id: 'bundle-toys',
    name: 'Artisanal Toy Jamboree',
    bundleType: 'category-qty',
    primaryTarget: 'Kids Toys',
    quantityRequired: 2,
    discountType: 'percentage',
    discountValue: 10,
    description: 'Purchase any 2 or more of our handcrafted sensory Kids Toys and enjoy 10% off automatically on those items!',
    active: true
  },
  {
    id: 'bundle-combo-leather',
    name: 'Boutique Carry & Keep Combo',
    bundleType: 'combo-fixed',
    primaryTarget: 'bag-1,wood-1', // bag-1 (Saddle Tote) + wood-1 (Keepsake Box)
    discountType: 'flat',
    discountValue: 100,
    description: 'Pair the luxury Serena Vegan Saddle Tote with our Royal Carved Wood Keepsake Box for a flat ₹100 combo reward!',
    active: true
  }
];

// Seasonal Promo pages configs
export interface SeasonalDeal {
  title: string;
  subtitle: string;
  bannerImage: string;
  themeColor: string;
  glowColor: string;
  badge: string;
  discountSummary: string;
  productsToShow: string[]; // ids
  customGreeting: string;
}

export const SEASONAL_LANDINGS: Record<string, SeasonalDeal> = {
  diwali: {
    title: 'Divine Joy of Deepavali Curation',
    subtitle: 'Illuminate your hallways with organic hand-fired brass and traditional motif tracers.',
    bannerImage: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-orange-600 via-amber-500 to-yellow-500',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    badge: 'Festival of Lights Special',
    discountSummary: 'Flat ₹150 OFF + Premium Gift Wrapping Free on all Kolam Stencils & Brass products.',
    productsToShow: ['kolam-1', 'wood-1', 'home-1'],
    customGreeting: 'As you light oil deepams to welcome Lakshmi, let traditional artisanal stencils spread auspicious alignments across your threshold.'
  },
  christmas: {
    title: 'Merry Forest Cabin Solstice',
    subtitle: 'Share snuggly hand-knit crochet buddies and warm candle-glow memories.',
    bannerImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-red-700 via-emerald-800 to-emerald-950',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    badge: 'Yuletide Winter Warmth',
    discountSummary: 'Free Pine-wood Keepsake Card + 10% Off on Snuggle Crochet Toys and Pine-wood Bookshelves.',
    productsToShow: ['toy-2', 'wood-2', 'home-1'],
    customGreeting: 'Gather under cozy light. This winter, support rural women weavers by sending organic-cotton companions to nieces and nephews.'
  },
  newyear: {
    title: 'New Horizons Creative Planners',
    subtitle: 'Embrace clear visions for the calendar with archival gold-gilded flax liners.',
    bannerImage: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-slate-900 via-zinc-800 to-yellow-600',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    badge: 'Year 2027 Awakening',
    discountSummary: 'Buy selected Linens and receive custom initials hot-pressed in real gold leaf foil.',
    productsToShow: ['stat-1', 'wood-1'],
    customGreeting: 'A pristine page holds endless possibilities. Document daily goals on stout acid-proof sheets that endure generation to generation.'
  },
  raksha: {
    title: 'Sacred Bond Rakhri Keepsakes',
    subtitle: 'Secure bonds with handloom bracelets and elegant lockboxes.',
    bannerImage: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-pink-600 via-indigo-600 to-purple-800',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'Raksha Bandhan Curation',
    discountSummary: 'Complimentary handcrafted silk threads and wooden kumkum box with every Rosewood Chest.',
    productsToShow: ['wood-1', 'toy-2'],
    customGreeting: 'A promise of shield. Honor sibling memories by encasing keepsakes and protection threads inside genuine aromatherapy rosewood.'
  },
  childrens: {
    title: 'Curious Minds Childrens Day Joy',
    subtitle: 'Nurture motor precision with non-toxic herbal wooden stackers.',
    bannerImage: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-blue-600 via-cyan-500 to-teal-400',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    badge: 'Nurture & Play Special',
    discountSummary: 'Buy Stacking Rings and get Abacus sliders for 20% off combined bundle discount.',
    productsToShow: ['toy-1', 'learn-1', 'toy-2'],
    customGreeting: 'Children deserve touchpoints that support creative discovery, fully free of harsh synthetic plastic coatings.'
  }
};

// Precise and automated Bundle and Coupon calculator for CART & CHECKOUT
export interface CartTotals {
  subtotal: number;
  bundleDiscount: number;
  bundleAppliedNames: string[];
  couponDiscount: number;
  tax: number;
  shippingCost: number;
  giftWrappingCost: number;
  grandTotal: number;
}

export function calculateCartTotals(
  cartItems: { product: Product; quantity: number }[],
  activeCoupon: { code: string; type: 'percentage' | 'flat'; value: number; minimumCartValue: number } | null,
  shippingMethod: 'standard' | 'express',
  giftWrappingRequested?: boolean
): CartTotals {
  let subtotal = 0;
  let bundleDiscount = 0;
  const bundleAppliedNames: string[] = [];

  // 1. Calculate normal subtotal
  cartItems.forEach(item => {
    const price = item.product.discountPrice || item.product.price;
    subtotal += price * item.quantity;
  });

  // 2. Evaluate "Buy 2 Toys -> 10% Off" bundle
  const toyItems = cartItems.filter(item => item.product.categorySlug === 'toys' || item.product.category === 'Kids Toys');
  const toyCount = toyItems.reduce((acc, it) => acc + it.quantity, 0);
  if (toyCount >= 2) {
    let toySavings = 0;
    toyItems.forEach(item => {
      const price = item.product.discountPrice || item.product.price;
      toySavings += Math.round(price * item.quantity * 0.10);
    });
    bundleDiscount += toySavings;
    bundleAppliedNames.push('Artisanal Toy Jamboree (10% Off)');
  }

  // 3. Evaluate "Handbag + Gift Item -> ₹100 Off" bundle
  const hasHandbag = cartItems.some(item => item.product.categorySlug === 'handbags' || item.product.category === 'Handbags');
  const hasGiftItem = cartItems.some(
    item => item.product.categorySlug === 'wood-gifts' || 
            item.product.category === 'Wood Crafted Gifts' ||
            item.product.categorySlug === 'home' ||
            item.product.category === 'Home Gifts'
  );

  if (hasHandbag && hasGiftItem) {
    bundleDiscount += 100;
    bundleAppliedNames.push('Boutique Carry & Keep Combo (₹100 Reward)');
  }

  // Adjusted subtotal prior to coupon
  const adjustedSubtotal = Math.max(0, subtotal - bundleDiscount);

  // 4. Evaluate coupon
  let couponDiscount = 0;
  if (activeCoupon && adjustedSubtotal >= activeCoupon.minimumCartValue) {
    if (activeCoupon.type === 'percentage') {
      couponDiscount = Math.round((adjustedSubtotal * activeCoupon.value) / 100);
    } else {
      couponDiscount = activeCoupon.value;
    }
  }

  // 5. Gift wrapping cost (+ ₹100 for premium wraps)
  const giftWrappingCost = giftWrappingRequested ? 100 : 0;

  // 6. Tax (18% rules on adjusted net)
  const taxableAmount = Math.max(0, adjustedSubtotal - couponDiscount);
  const tax = Math.round(taxableAmount * 0.18);

  // 7. Shipping logic
  let shippingCost = 0;
  if (subtotal > 0) {
    if (shippingMethod === 'express') {
      shippingCost = 180;
    } else {
      // standard is free above ₹1500, else ₹80
      shippingCost = subtotal > 1500 ? 0 : 80;
    }
  }

  // 8. Grand total payable
  const grandTotal = Math.max(0, taxableAmount + tax + shippingCost + giftWrappingCost);

  return {
    subtotal,
    bundleDiscount,
    bundleAppliedNames,
    couponDiscount,
    tax,
    shippingCost,
    giftWrappingCost,
    grandTotal
  };
}
