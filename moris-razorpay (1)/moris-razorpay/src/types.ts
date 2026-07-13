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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

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
  tax: number;
  discount: number;
  subtotal: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  couponCode?: string;
  date: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid';
  
  // Festival & Seasonal Checkout Additions:
  giftWrappingRequested?: boolean;
  giftWrappingType?: string; // 'royal' | 'rustic' | 'classic'
  giftMessage?: string;
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
}

export interface BundleOffer {
  id: string;
  name: string;
  bundleType: 'category-qty' | 'combo-fixed';
  primaryTarget: string; // e.g. 'toys' or product ID
  quantityRequired?: number; // e.g. 2 for "Buy 2 Toys"
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
