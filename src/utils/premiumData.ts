import { Vendor, BundleOffer, BulkOrderInquiry, Product } from '../types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Bharath Nair',
    email: 'bharath@kanyakumariwood.in',
    phone: '+91 94432 10455',
    storeName: 'Kanchipuram Silk Weavers Cooperative',
    description: 'Traditional silk saree weavers supplying pure Kanchipuram silk and cotton sarees.',
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
    storeName: 'Bengaluru Cotton Kurti House',
    description: 'Manufacturing premium cotton kurtis, salwar suits, and fusion wear for modern Indian women.',
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
    storeName: 'Jaipur Jewellery Exports',
    description: 'Supplying kundan, temple, and oxidized silver jewellery sets for ethnic fashion retail.',
    approved: false, // For testing pending lists
    commissionRate: 15,
    status: 'pending',
    revenue: 0,
    logoUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=150&auto=format&fit=crop'
  }
];

export const INITIAL_BUNDLES: BundleOffer[] = [
  {
    id: 'bundle-sarees',
    name: 'Saree Bundle Offer',
    bundleType: 'category-qty',
    primaryTarget: 'Sarees',
    quantityRequired: 2,
    discountType: 'percentage',
    discountValue: 10,
    description: 'Purchase any 2 or more sarees and enjoy 10% off automatically!',
    active: true
  },
  {
    id: 'bundle-combo-leather',
    name: 'Boutique Carry & Keep Combo',
    bundleType: 'combo-fixed',
    primaryTarget: 'bag-1,wood-1', // bag-1 (Saddle Tote) + wood-1 (Keepsake Box)
    discountType: 'flat',
    discountValue: 100,
    description: 'Pair the luxury Serena Vegan Saddle Tote with our Royal Carved Wood Keepsake Box for a flat Rs.100 combo reward!',
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
    discountSummary: 'Flat Rs.150 OFF + Premium Gift Wrapping Free on all Sarees & Ethnic Jewellery.',
    productsToShow: ['sarees', 'jewellery', 'handbags'],
    customGreeting: 'As you celebrate the festival of lights, illuminate your wardrobe with our festive ethnic wear collection.'
  },
  christmas: {
    title: 'Merry Forest Cabin Solstice',
    subtitle: 'Share snuggly hand-knit crochet buddies and warm candle-glow memories.',
    bannerImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-red-700 via-emerald-800 to-emerald-950',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    badge: 'Yuletide Winter Warmth',
    discountSummary: 'Free Gift Wrapping + 10% Off on Kurtis and Salwar Suits.',
    productsToShow: ['kurtis', 'salwar', 'dupattas'],
    customGreeting: 'Celebrate the festive season with our curated ethnic wear collection. Perfect gifts for loved ones.'
  },
  newyear: {
    title: 'New Horizons Creative Planners',
    subtitle: 'Embrace clear visions for the calendar with archival gold-gilded flax liners.',
    bannerImage: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-slate-900 via-zinc-800 to-yellow-600',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    badge: 'Year 2027 Awakening',
    discountSummary: 'Flat 20% Off on all Lehengas and Western Fusion Wear.',
    productsToShow: ['lehengas', 'western', 'kurtis'],
    customGreeting: 'Start the new year with a refreshed wardrobe. Explore our latest collection of designer lehengas and fusion wear.'
  },
  raksha: {
    title: 'Sacred Bond Rakhri Keepsakes',
    subtitle: 'Secure bonds with handloom bracelets and elegant lockboxes.',
    bannerImage: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-pink-600 via-indigo-600 to-purple-800',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'Raksha Bandhan Curation',
    discountSummary: 'Complimentary ethnic jewellery set with every saree purchase.',
    productsToShow: ['sarees', 'jewellery', 'dupattas'],
    customGreeting: 'Celebrate the bond of love. Gift your sister beautiful ethnic wear and jewellery from our curated collection.'
  },
  childrens: {
    title: 'Curious Minds Childrens Day Joy',
    subtitle: 'Adorable kids ethnic wear and nightwear for your little ones.',
    bannerImage: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'from-blue-600 via-cyan-500 to-teal-400',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    badge: 'Nurture & Play Special',
    discountSummary: 'Flat 15% Off on Kids Ethnic Wear and Nightwear collections.',
    productsToShow: ['kurtis', 'nightwear', 'dupattas'],
    customGreeting: 'Treat the little ones with our adorable ethnic wear collection. Comfortable, stylish, and perfect for festive occasions.'
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
  shippingWeightKg: number;
  billableWeightKg: number;
  shippingZone: string;
  giftWrappingCost: number;
  grandTotal: number;
}

const PRODUCT_WEIGHT_FALLBACKS_KG: Record<string, number> = {
  sarees: 0.5,
  lehengas: 1.2,
  kurtis: 0.4,
  salwar: 0.6,
  dupattas: 0.2,
  jewellery: 0.15,
  handbags: 0.8,
  nightwear: 0.3,
  western: 0.5
};

const SHIPPING_HANDLING_SURCHARGE = 50;

function addShippingHandlingSurcharge(cost: number): number {
  return cost > 0 ? cost + SHIPPING_HANDLING_SURCHARGE : cost;
}

function parseWeightValueToKg(value?: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (!value) return null;

  const normalized = value.toLowerCase().replace(/\s+/g, '');
  const match = normalized.match(/(\d+(?:\.\d+)?)(kg|kgs|kilogram|kilograms|g|gm|grams)?/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const unit = match[2] || '';
  return unit === 'g' || unit === 'gm' || unit === 'grams' ? amount / 1000 : amount;
}

export function getProductWeightKg(product: Product): number {
  const explicitWeight = parseWeightValueToKg(product.weightKg);
  if (explicitWeight) return explicitWeight;

  const specWeight = parseWeightValueToKg(product.specifications?.Weight);
  if (specWeight) return specWeight;

  return PRODUCT_WEIGHT_FALLBACKS_KG[product.categorySlug] || 0.5;
}

export function getCartShipmentWeightKg(cartItems: { product: Product; quantity: number }[]): number {
  const total = cartItems.reduce((sum, item) => {
    return sum + getProductWeightKg(item.product) * item.quantity;
  }, 0);

  return Math.round(total * 100) / 100;
}

interface PincodeRateProfile {
  zone: string;
  baseHalfKgRate: number;
  additionalHalfKgRate: number;
  remoteSurcharge: number;
}

function getLastMilePincodeAdjustment(pin: string): number {
  if (pin.length !== 6) return 0;

  // Courier partners often rate by serviceable pin clusters. This deterministic
  // adjustment keeps quotes sensitive to the exact pincode without an external API.
  const district = Number(pin.slice(0, 3));
  const localRoute = Number(pin.slice(3));
  const districtAdjustment = (district % 6) * 4;
  const routeAdjustment = (localRoute % 5) * 3;

  return districtAdjustment + routeAdjustment;
}

function getShippingRateProfileFromPincode(pincode?: string): PincodeRateProfile {
  const pin = (pincode || '').replace(/\D/g, '');
  if (pin.length !== 6) {
    return {
      zone: 'Enter pincode for exact rate',
      baseHalfKgRate: 80,
      additionalHalfKgRate: 52,
      remoteSurcharge: 0
    };
  }

  const prefix2 = Number(pin.slice(0, 2));
  const prefix3 = Number(pin.slice(0, 3));
  const lastMileAdjustment = getLastMilePincodeAdjustment(pin);

  if (prefix3 >= 600 && prefix3 <= 609) {
    return {
      zone: 'Chennai Metro Local',
      baseHalfKgRate: 58 + lastMileAdjustment,
      additionalHalfKgRate: 38,
      remoteSurcharge: 0
    };
  }

  if (prefix2 >= 60 && prefix2 <= 64) {
    return {
      zone: 'Tamil Nadu Local',
      baseHalfKgRate: 62 + lastMileAdjustment,
      additionalHalfKgRate: 40,
      remoteSurcharge: prefix3 >= 643 ? 15 : 0
    };
  }

  if (prefix2 >= 56 && prefix2 <= 59) {
    return {
      zone: prefix3 === 560 ? 'Bengaluru Metro' : 'Karnataka',
      baseHalfKgRate: (prefix3 === 560 ? 74 : 82) + lastMileAdjustment,
      additionalHalfKgRate: prefix3 === 560 ? 48 : 54,
      remoteSurcharge: 0
    };
  }

  if (prefix2 >= 50 && prefix2 <= 53) {
    return {
      zone: prefix3 === 500 ? 'Hyderabad Metro' : 'Telangana / Andhra',
      baseHalfKgRate: (prefix3 === 500 ? 78 : 88) + lastMileAdjustment,
      additionalHalfKgRate: prefix3 === 500 ? 50 : 58,
      remoteSurcharge: 0
    };
  }

  if (prefix2 >= 67 && prefix2 <= 69) {
    return {
      zone: 'Kerala',
      baseHalfKgRate: 92 + lastMileAdjustment,
      additionalHalfKgRate: 60,
      remoteSurcharge: prefix3 >= 685 ? 18 : 0
    };
  }

  if ((prefix2 >= 78 && prefix2 <= 79) || [194, 744].includes(prefix3)) {
    return {
      zone: 'Remote / Special Route',
      baseHalfKgRate: 168 + lastMileAdjustment,
      additionalHalfKgRate: 108,
      remoteSurcharge: [194, 744].includes(prefix3) ? 45 : 30
    };
  }

  if ((prefix2 >= 36 && prefix2 <= 49) || (prefix2 >= 30 && prefix2 <= 34)) {
    return {
      zone: 'West / Central India',
      baseHalfKgRate: 108 + lastMileAdjustment,
      additionalHalfKgRate: 70,
      remoteSurcharge: 0
    };
  }

  if ((prefix2 >= 11 && prefix2 <= 24) || (prefix2 >= 25 && prefix2 <= 29)) {
    return {
      zone: 'North India',
      baseHalfKgRate: 118 + lastMileAdjustment,
      additionalHalfKgRate: 78,
      remoteSurcharge: [171, 172, 173, 174, 175, 176, 177].includes(prefix3) ? 25 : 0
    };
  }

  if (prefix2 >= 70 && prefix2 <= 77) {
    return {
      zone: prefix3 === 700 ? 'Kolkata Metro' : 'East India',
      baseHalfKgRate: (prefix3 === 700 ? 115 : 132) + lastMileAdjustment,
      additionalHalfKgRate: prefix3 === 700 ? 76 : 86,
      remoteSurcharge: 0
    };
  }

  return {
    zone: 'Rest of India',
    baseHalfKgRate: 138 + lastMileAdjustment,
    additionalHalfKgRate: 90,
    remoteSurcharge: 10
  };
}

function calculateLocalShippingCost(
  totalWeightKg: number,
  destinationPincode: string | undefined,
  shippingMethod: 'standard' | 'express',
  subtotal: number
): { cost: number; billableWeightKg: number; zone: string } {
  if (subtotal <= 0 || totalWeightKg <= 0) {
    return { cost: 0, billableWeightKg: 0, zone: 'No shipment' };
  }

  const pin = (destinationPincode || '').replace(/\D/g, '');
  const billableWeightKg = Math.max(0.5, Math.ceil(totalWeightKg * 2) / 2);
  const rateProfile = getShippingRateProfileFromPincode(destinationPincode);
  const zone = rateProfile.zone;

  if (pin.length !== 6) {
    const fallbackCost = shippingMethod === 'express' ? 180 : subtotal > 1500 ? 0 : 80;
    return { cost: addShippingHandlingSurcharge(fallbackCost), billableWeightKg, zone };
  }

  const halfKgSlabs = Math.ceil(billableWeightKg / 0.5);
  const standardCost =
    rateProfile.baseHalfKgRate +
    Math.max(0, halfKgSlabs - 1) * rateProfile.additionalHalfKgRate +
    rateProfile.remoteSurcharge;

  if (shippingMethod === 'express') {
    return {
      cost: addShippingHandlingSurcharge(Math.round(standardCost * 1.45 + 40)),
      billableWeightKg,
      zone
    };
  }

  return { cost: addShippingHandlingSurcharge(standardCost), billableWeightKg, zone };
}

export function calculateCartTotals(
  cartItems: { product: Product; quantity: number }[],
  activeCoupon: { code: string; type: 'percentage' | 'flat'; value: number; minimumCartValue: number } | null,
  shippingMethod: 'standard' | 'express',
  giftWrappingRequested?: boolean,
  destinationPincode?: string
): CartTotals {
  let subtotal = 0;
  let bundleDiscount = 0;
  const bundleAppliedNames: string[] = [];

  // 1. Calculate normal subtotal
  cartItems.forEach(item => {
    const price = item.product.discountPrice || item.product.price;
    subtotal += price * item.quantity;
  });

  // 2. Evaluate "Buy 2 Sarees -> 10% Off" bundle
  const sareeItems = cartItems.filter(item => item.product.categorySlug === 'sarees' || item.product.category === 'Sarees');
  const sareeCount = sareeItems.reduce((acc, it) => acc + it.quantity, 0);
  if (sareeCount >= 2) {
    let sareeSavings = 0;
    sareeItems.forEach(item => {
      const price = item.product.discountPrice || item.product.price;
      sareeSavings += Math.round(price * item.quantity * 0.10);
    });
    bundleDiscount += sareeSavings;
    bundleAppliedNames.push('Saree Bundle Offer (10% Off)');
  }

  // 3. Evaluate "Handbag + Accessories -> Rs.100 Off" bundle
  const hasHandbag = cartItems.some(item => item.product.categorySlug === 'handbags' || item.product.category === 'Handbags');
  const hasGiftItem = cartItems.some(
    item => item.product.categorySlug === 'jewellery' ||
            item.product.category === 'Ethnic Jewellery' ||
            item.product.categorySlug === 'dupattas' ||
            item.product.category === 'Dupattas'
  );

  if (hasHandbag && hasGiftItem) {
    bundleDiscount += 100;
    bundleAppliedNames.push('Boutique Carry & Keep Combo (Rs.100 Reward)');
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

  // 5. Gift wrapping cost (+ Rs.100 for premium wraps)
  const giftWrappingCost = giftWrappingRequested ? 100 : 0;

  // 6. Tax (18% rules on adjusted net)
  const taxableAmount = Math.max(0, adjustedSubtotal - couponDiscount);
  const tax = Math.round(taxableAmount * 0.18);

  // 7. Local shipping logic: billable weight slab + destination pincode zone
  // Older carts can contain a cached copy of the test product without the
  // isTestProduct flag. Keep its checkout shipping-free using its stable ID/SKU.
  const allTestProducts = cartItems.length > 0 && cartItems.every(({ product }) =>
    product.isTestProduct || product.id === 'TEST-RF-001' || product.sku === 'TEST-10'
  );
  const shippingWeightKg = getCartShipmentWeightKg(cartItems);
  const shippingQuote = allTestProducts
    ? { cost: 0, billableWeightKg: 0, zone: 'Test — Free Shipping' }
    : calculateLocalShippingCost(shippingWeightKg, destinationPincode, shippingMethod, subtotal);
  const shippingCost = shippingQuote.cost;

  // 8. Grand total payable
  const grandTotal = Math.max(0, taxableAmount + tax + shippingCost + giftWrappingCost);

  return {
    subtotal,
    bundleDiscount,
    bundleAppliedNames,
    couponDiscount,
    tax,
    shippingCost,
    shippingWeightKg,
    billableWeightKg: shippingQuote.billableWeightKg,
    shippingZone: shippingQuote.zone,
    giftWrappingCost,
    grandTotal
  };
}


