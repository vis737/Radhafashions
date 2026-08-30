export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean; // Managed by Admin review panel
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  description: string;
  approved: boolean;
  commissionRate: number; // e.g. 15 for 15%
  status: 'active' | 'suspended' | 'pending';
  logoUrl?: string;
  revenue: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  weightKg?: number;
  rating: number;
  ratingCount: number;
  images: string[];
  shortDescription: string;
  description: string;
  specifications: Record<string, string>;
  reviews: Review[];
  isNew?: boolean;
  isBestseller?: boolean;
  ageGroup?: string;
  brand: string;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  
  // Marketing & Multi-vendor Additions:
  vendorId?: string; // Links to Vendor
  isFlashSale?: boolean;
  flashSaleEndTime?: string; // ISO String Date
  bundleSuggestedIds?: string[]; // IDs of products suggested as bundle
  minimumAge?: number;
  maximumAge?: number;
  skillType?: string;
  educationalType?: string;
  recommendationScore?: number;
  viewCount?: number;
  purchaseCount?: number;
  wishlistCount?: number;
  trendScore?: number;
  toyParameters?: {
    minAge?: number;
    maxAge?: number;
    skillType?: string;
    educationalType?: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  /** Legacy single variation (kept for backward compatibility). */
  variation?: ProductVariation;
  /** Multiple customer-selectable variations (color + size simultaneously). */
  variations?: ProductVariations;
  /** Internal flag — test products get free shipping and are capped at ₹10 total */
  isTestProduct?: boolean;
}

export type VariationType = 'color' | 'size';

/** Legacy single variation (one type at a time). Kept for backward compatibility. */
export interface ProductVariation {
  type: VariationType;
  values: string[];
}

/** New: supports both color and size simultaneously. */
export interface ProductVariations {
  color?: string[];
  size?: string[];
}

/** A customer's chosen combination of color + size. Either field is optional. */
export interface SelectedVariation {
  color?: string;
  size?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Saved with the cart and order so each variant stays distinct. */
  selectedVariation?: SelectedVariation;
}

/** Normalize any variation shape (legacy single or new multi) into ProductVariations. */
export const getEffectiveVariations = (product: Product): ProductVariations | undefined => {
  // New multi-variation field takes precedence
  if (product.variations) {
    const { color, size } = product.variations;
    if ((color && color.length > 0) || (size && size.length > 0)) return product.variations;
  }
  // Fall back to legacy single variation
  if (product.variation?.values?.length) {
    return { [product.variation.type]: product.variation.values };
  }
  return undefined;
};

/** Build a stable cart key from the selected color + size combination. */
export const getCartItemKey = (item: Pick<CartItem, 'product' | 'selectedVariation'>) => {
  const sv = item.selectedVariation;
  const color = sv?.color || '';
  const size = sv?.size || '';
  return `${item.product.id}::${color}::${size}`;
};

/** Human-readable label for a selected variation (e.g. "(Color: Red, Size: L)"). */
export const formatSelectedVariation = (item: Pick<CartItem, 'selectedVariation'>) => {
  const sv = item.selectedVariation;
  if (!sv) return '';
  const parts: string[] = [];
  if (sv.color) parts.push(`Color: ${sv.color}`);
  if (sv.size) parts.push(`Size: ${sv.size}`);
  return parts.length ? `(${parts.join(', ')})` : '';
};

/** Check if a product has any variation configured (new or legacy). */
export const hasVariations = (product: Product): boolean => {
  const v = getEffectiveVariations(product);
  return !!(v && ((v.color && v.color.length > 0) || (v.size && v.size.length > 0)));
};

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  minimumCartValue: number;
  description: string;
  active: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  shippingMethod: 'standard' | 'express';
  shippingCost: number;
  shippingWeightKg?: number;
  shippingZone?: string;
  tax: number;
  discount: number;
  subtotal: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed' | 'returned';
  couponCode?: string;
  date: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'rejected' | 'refunded';
  codStatus?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

  // PayU gateway parameters
  payuTxnId?: string;
  payuPaymentId?: string;
  payuHash?: string;
  payuStatus?: string;
  
  // UPI QR parameters
  upiTxnId?: string;
  upiSenderName?: string;
  upiScreenshot?: string;
  upiNotes?: string;
  upiRejectionReason?: string;
  adminNotes?: string; // Internal admin comments
  
  // Festival & Seasonal Checkout Additions:
  giftWrappingRequested?: boolean;
  giftWrappingType?: string; // 'royal' | 'rustic' | 'classic'
  giftMessage?: string;
  giftSenderName?: string;
  giftHidePrice?: boolean;
  accountEmail?: string;
  accountName?: string;
}

export interface AdminNotification {
  id: string;
  type: 'order' | 'stock' | 'customer' | 'payment' | 'security';
  message: string;
  read: boolean;
  timestamp: string;
}

export interface GiftOrderStats {
  totalGiftRevenue: number;
  popularThemes: Record<string, number>; // theme -> count
  totalGiftOrders: number;
  averageGiftValue: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  riskLevel?: 'low' | 'medium' | 'high'; // For Fraud Detection
}

export interface BannerCampaign {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  ctaText: string;
  linkCategory: string;
  active: boolean;
}

export interface CMSConfig {
  headline: string;
  subheadline: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  privacyPolicy: string;
  termsConditions: string;
  logoUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  whatsappNumber?: string;
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  shippingCharges?: number;
  deliveryCharges?: number;
  returnPolicy?: string;
  themePrimary?: string;
  themeMode?: 'light' | 'dark' | 'system';
  maintenanceMode?: boolean;
  aiConciergeEnabled?: boolean;
  rewardsEnabled?: boolean;
  codEnabled?: boolean;
  upiEnabled?: boolean;
  emailOrderSubject?: string;
  emailOrderBody?: string;
  emailDispatchSubject?: string;
  emailDispatchBody?: string;
  maxCartQty?: number;
  returnWindowDays?: number;
  upiId?: string;
  upiQrUrl?: string;
}

export interface BundleOffer {
  id: string;
  name: string;
  bundleType: 'category-qty' | 'combo-fixed';
  primaryTarget: string; // e.g. 'sarees' or product ID
  quantityRequired?: number; // e.g. 2 for "Buy 2 Sarees"
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 10 for 10%
  description: string;
  active: boolean;
}

export interface BulkOrderInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  eventType: 'birthday' | 'school' | 'corporate' | 'festival';
  productName: string;
  quantity: number;
  notes?: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface UserMembership {
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints: number;
  lifetimeSavings: number;
  joinDate: string;
  expiryDate?: string;
  history: { date: string; action: string; points: number }[];
}


