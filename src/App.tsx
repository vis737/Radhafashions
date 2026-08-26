import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Truck, ShieldCheck, Heart, Award, ArrowUp, Star, Trash2, Eye, Mail, Info, Send, ChevronRight, ChevronLeft, Smartphone, RefreshCw, Layers, X, Key } from 'lucide-react';

// Subcomponents import
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import CartDrawer from './components/CartDrawer';
import CheckoutPanel from './components/CheckoutPanel';
import OrderSuccessModal from './components/OrderSuccessModal';
import AccountPanel from './components/AccountPanel';
import AdminDashboard from './components/AdminDashboard';
import WhatsAppChat from './components/WhatsAppChat';
import AiRecommendations from './components/AiRecommendations';
import { getAIRecommendations } from './utils/aiRecommender';
import FlashSaleSection from './components/FlashSaleSection';
import InstagramGallery from './components/InstagramGallery';
import AboutPage from './components/AboutPage';
import ExitIntentOffer from './components/ExitIntentOffer';

// Mock Data imports
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_CAMPAIGNS,
  INITIAL_CMS,
  INITIAL_ORDERS,
  INITIAL_LOGS,
  CATEGORIES,
  loadInitialState,
  saveToStorage,
  getStoredDb,
  saveStoredDb
} from './utils/mockData';

import { calculateCartTotals } from './utils/premiumData';

import { Product, CartItem, Coupon, Order, CustomerInfo, ActivityLog, CMSConfig, Review, BannerCampaign, SelectedVariation, getCartItemKey } from './types';

// Framer Motion staggered grid entrance variants
const staggersContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const staggerCardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 18
    }
  }
};

export default function App() {
  // Router views
  const [activeView, setActiveView] = useState<'home' | 'category' | 'product' | 'checkout' | 'account' | 'admin' | 'ordersuccess' | 'about'>('home');

  // Core mutable list states
  const [products, setProducts] = useState<Product[]>(() => {
    const db = getStoredDb();
    return db.products || INITIAL_PRODUCTS;
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const db = getStoredDb();
    return db.coupons || INITIAL_COUPONS;
  });
  const [campaigns, setCampaigns] = useState<BannerCampaign[]>(() => {
    const db = getStoredDb();
    return db.campaigns || INITIAL_CAMPAIGNS;
  });
  const [cms, setCms] = useState<CMSConfig>(() => {
    const db = getStoredDb();
    return db.cms || INITIAL_CMS;
  });
  
  // Persisted cart, wishlist, and orders indices
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Active contextual models
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string>('');
  const [currentProductId, setCurrentProductId] = useState<string>('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  // Popup overlay dialog drawer views
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [userFilteredProducts, setUserFilteredProducts] = useState<Product[]>([]);

  // Category view filter state
  const [sortOrder, setSortOrder] = useState<'rating' | 'price-asc' | 'price-desc'>('rating');
  const [stockOnly, setStockOnly] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Active home carousel index
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Helper to safely resolve a product image with fallbacks
  const getProductHeroImage = (p?: Product) => {
    if (!p) return 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=800&auto=format&fit=crop&q=80';
    if (p.images && p.images.length > 0 && p.images[0] && p.images[0].trim() !== '' && !p.images[0].includes('placeholder')) {
      return p.images[0];
    }
    const initP = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
    if (initP && initP.images && initP.images[0]) {
      return initP.images[0];
    }
    const cat = CATEGORIES.find(c => c.id === p.categorySlug || c.name?.toLowerCase() === p.category?.toLowerCase());
    if (cat && cat.imageUrl) return cat.imageUrl;
    return 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80';
  };

  const pickHeroProducts = (prodList: Product[]) => {
    const pool = prodList && prodList.length > 0 ? prodList : INITIAL_PRODUCTS;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  };

  const [heroProducts, setHeroProducts] = useState<Product[]>(() => pickHeroProducts(INITIAL_PRODUCTS));

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Active review submission tracking modal
  const [selectedSuccessOrder, setSelectedSuccessOrder] = useState<Order | null>(null);

  // Hidden admin login states
  const [showAdminLoginPrompt, setShowAdminLoginPrompt] = useState(false);
  const [adminLoginUser, setAdminLoginUser] = useState('');
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminBypassed, setAdminBypassed] = useState(false);

  // Scroll progress UX state
  const [scrollProgress, setScrollProgress] = useState(0);

  // Login gate state
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = (window.scrollY / scrollHeight) * 100;
        setScrollProgress(scrolled);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let typedBuffer = '';
    let timeoutId: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check for keyboard shortcut: Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdminLoginPrompt(true);
        return;
      }

      // 2. Check for sequence of keys: "admin"
      if (e.key && e.key.length === 1) {
        typedBuffer += e.key.toLowerCase();
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          typedBuffer = '';
        }, 1500);

        if (typedBuffer.slice(-5) === 'admin') {
          setShowAdminLoginPrompt(true);
          typedBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, []);

  // Load and recover stored memory on startup mounts
  useEffect(() => {
    const saved = loadInitialState();
    if (saved.cart) setCartItems(saved.cart);
    if (saved.wishlist) setWishlistIds(saved.wishlist);
    if (saved.orders) setOrders(saved.orders);
    if (saved.recentlyViewed) setRecentlyViewedIds(saved.recentlyViewed);
    if (saved.currentUser) setCurrentUser(saved.currentUser);

    // Sync orders from backend DB so admin panel always sees all placed orders,
    // even after a page reload or server restart (backend is source of truth).
    fetch('/api/orders')
      .then(res => res.ok ? res.json() : [])
      .then((backendOrders: Order[]) => {
        if (!Array.isArray(backendOrders) || backendOrders.length === 0) return;
        setOrders(prev => {
          // Merge: backend orders + any local-only orders not yet synced
          const backendIds = new Set(backendOrders.map(o => o.orderNumber));
          const localOnly = prev.filter(o => !backendIds.has(o.orderNumber));
          // Deduplicate: backend wins for status, put newest first
          const merged = [...localOnly, ...backendOrders].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          return merged;
        });
      })
      .catch(() => { /* backend unavailable - localStorage orders are still loaded */ });

    // Restore the success order screen if the page was reloaded right after checkout
    try {
      const pendingSuccess = sessionStorage.getItem('radha_pending_success_order');
      if (pendingSuccess) {
        const restoredOrder = JSON.parse(pendingSuccess) as Order;
        setSelectedSuccessOrder(restoredOrder);
        setActiveView('ordersuccess');
      }
    } catch { /* ignore corrupt session data */ }
  }, []);

  // Save changes back to browser memory
  useEffect(() => {
    saveToStorage({
      cart: cartItems,
      wishlist: wishlistIds,
      orders: orders,
      recentlyViewed: recentlyViewedIds,
      currentUser: currentUser
    });  }, [cartItems, wishlistIds, orders, recentlyViewedIds, currentUser]);

  const isCatalogLoadedRef = useRef(false);

  // Fetch centralized catalog data (products, coupons, campaigns, cms config) from server database on mount
  useEffect(() => {
    const loadCatalogFromBackend = async () => {
      try {
        const [prodsRes, coupsRes, campsRes, cmsRes, sessionRes] = await Promise.all([
          fetch('/api/catalog/products', { cache: 'no-store' }),
          fetch('/api/catalog/coupons', { cache: 'no-store' }),
          fetch('/api/catalog/campaigns', { cache: 'no-store' }),
          fetch('/api/catalog/cms', { cache: 'no-store' }),
          fetch('/api/admin/session', { cache: 'no-store', credentials: 'include' }).catch(() => null)
        ]);
        
        if (prodsRes && prodsRes.ok) {
          const prods = await prodsRes.json();
          if (Array.isArray(prods) && prods.length > 0) {
            setProducts(prods);
          }
        }
        if (coupsRes && coupsRes.ok) {
          const coups = await coupsRes.json();
          if (Array.isArray(coups) && coups.length > 0) {
            setCoupons(coups);
          }
        }
        if (campsRes && campsRes.ok) {
          const camps = await campsRes.json();
          if (Array.isArray(camps) && camps.length > 0) {
            setCampaigns(camps);
          }
        }
        if (cmsRes && cmsRes.ok) {
          const cmsData = await cmsRes.json();
          setCms(cmsData);
        }
        if (sessionRes && sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated) {
            setAdminBypassed(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch catalog from backend:', err);
      } finally {
        isCatalogLoadedRef.current = true;
      }
    };
    loadCatalogFromBackend();
  }, []);

  // Save products, coupons, campaigns, cms changes back to local storage and sync to backend server database
  useEffect(() => {
    saveStoredDb({ products, coupons, campaigns, cms });
    
    if (!isCatalogLoadedRef.current || !adminBypassed) return;

    const syncCatalogToBackend = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken') || '';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (adminToken) {
          headers['Authorization'] = `Bearer ${adminToken}`;
        }
        await Promise.all([
          fetch('/api/catalog/products', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(products)
          }),
          fetch('/api/catalog/coupons', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(coupons)
          }),
          fetch('/api/catalog/campaigns', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(campaigns)
          }),
          fetch('/api/catalog/cms', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(cms)
          })
        ]);
      } catch (err) {
        console.error('Failed to sync catalog changes to backend:', err);
      }
    };

    syncCatalogToBackend();
  }, [products, coupons, campaigns, cms, adminBypassed]);

  // Pick hero products whenever catalog finishes loading or updating
  useEffect(() => {
    if (products && products.length > 0) {
      setHeroProducts(pickHeroProducts(products));
    }
  }, [products]);

  // Slide every 6 seconds; reshuffle 5 random products every 30 minutes
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % (heroProducts.length || 1));
    }, 6000);

    const reshuffleTimer = setInterval(() => {
      setHeroProducts(pickHeroProducts(products));
      setActiveHeroIndex(0);
    }, 30 * 60 * 1000);

    return () => {
      clearInterval(slideTimer);
      clearInterval(reshuffleTimer);
    };
  }, [heroProducts, products]);



  // Scroll back up on swapping screens layout
  const handleSwapView = (view: typeof activeView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Log activity helpers
  const handleLogActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      action,
      details,
      user: currentUser ? currentUser.name : 'Guest Shopper',
      timestamp: new Date().toISOString()
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Add to cart state logic
  const handleAddProductToCart = (product: Product, selectedVariation?: SelectedVariation, quantity = 1) => {
    if (product.variation?.values?.length && !selectedVariation) {
      setCurrentProductId(product.id);
      handleSwapView('product');
      alert(`Please choose a ${product.variation.type === 'color' ? 'colour' : 'size'} before adding this product to your bag.`);
      return;
    }

    const limit = cms.maxCartQty || 10;
    setCartItems((prev) => {
      const cartKey = getCartItemKey({ product, selectedVariation });
      const existing = prev.find((item) => getCartItemKey(item) === cartKey);
      const quantityAlreadyInCart = prev
        .filter((item) => item.product.id === product.id)
        .reduce((total, item) => total + item.quantity, 0);
      const otherVariantQuantity = quantityAlreadyInCart - (existing?.quantity || 0);
      const maximumForThisVariant = Math.min(limit, Math.max(0, product.stock - otherVariantQuantity));

      if (maximumForThisVariant === 0) {
        alert('This product is no longer available in the requested quantity.');
        return prev;
      }

      if (existing) {
        if (existing.quantity >= maximumForThisVariant) {
          alert(`You can purchase a maximum of ${maximumForThisVariant} unit${maximumForThisVariant === 1 ? '' : 's'} of this selection.`);
          return prev;
        }
        return prev.map((item) =>
          getCartItemKey(item) === cartKey
            ? { ...item, quantity: Math.min(maximumForThisVariant, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, selectedVariation, quantity: Math.min(maximumForThisVariant, quantity) }];
    });
    setCartOpen(true);
    handleLogActivity('Item Added to Cart', `Added unit of ${product.name} to shopping bag.`);
  };

  // Toggle wishlist state logic
  const handleToggleProductWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        const filt = prev.filter((id) => id !== productId);
        handleLogActivity('Wishlist Removed', `Removed Product ID: ${productId} from wishlist.`);
        return filt;
      } else {
        const added = [...prev, productId];
        handleLogActivity('Wishlist Added', `Saved Product ID: ${productId} into wishlist.`);
        return added;
      }
    });
  };

  // Track product clicks to recently viewed
  const handleViewProductDetails = (productId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 5);
      return updated;
    });
    setCurrentProductId(productId);
    handleSwapView('product');
  };

  // Quick buy trigger (adds and redirects to checkout) - requires login
  const handleBuyNowTrigger = (product: Product, selectedVariation?: SelectedVariation) => {
    if (product.variation?.values?.length && !selectedVariation) {
      setCurrentProductId(product.id);
      alert(`Please choose a ${product.variation.type === 'color' ? 'colour' : 'size'} before checkout.`);
      return;
    }
    handleAddProductToCart(product, selectedVariation, 1);
    if (!currentUser) {
      setPendingCheckout(true);
      setShowLoginGate(true);
      return;
    }
    handleSwapView('checkout');
  };

  // Gated proceed to checkout - requires login
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setPendingCheckout(true);
      setCartOpen(false);
      setShowLoginGate(true);
      return;
    }
    handleSwapView('checkout');
  };

  // Authorize checkout purchase
  const handlePlaceSecureOrder = async (
    customer: CustomerInfo,
    paymentMethod: string,
    giftWrapped?: boolean,
    giftMsg?: string,
    giftTheme?: string,
    giftSender?: string,
    giftHidePrice?: boolean,
    upiTxnId?: string,
    upiSenderName?: string,
    upiScreenshot?: string,
    upiNotes?: string,
    payuTxnId?: string,
    payuPaymentId?: string,
    payuHash?: string,
    payuStatus?: string
  ): Promise<Order | void> => {
    if (!currentUser) {
      setPendingCheckout(true);
      setShowLoginGate(true);
      handleSwapView('account');
      return;
    }

    if (cartItems.length === 0) {
      handleSwapView('home');
      return;
    }

    const orderNum = payuTxnId || 'MR-' + Date.now().toString().substring(6, 12) + '-' + Math.floor(100 + Math.random() * 900);
    
    // Call our premium calculator to get mathematically aligned numbers!
    const totals = calculateCartTotals(cartItems, activeCoupon, shippingMethod, giftWrapped, customer.pincode);
    const subtotal = totals.subtotal;
    const discount = totals.bundleDiscount + totals.couponDiscount;
    const tax = totals.tax;
    const shippingCost = totals.shippingCost;
    const finalTotal = totals.grandTotal;

    const isUpiPayment = paymentMethod === 'UPI QR Payment';
    const isCodPayment = paymentMethod === 'Cash on Delivery' || paymentMethod === 'COD';
    const isPayUPayment = paymentMethod.toLowerCase().includes('payu');
    const isRazorpayPayment = paymentMethod.toLowerCase().includes('razorpay');

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      customerInfo: customer,
      items: [...cartItems],
      subtotal,
      discount,
      tax,
      shippingCost,
      shippingWeightKg: totals.shippingWeightKg,
      shippingZone: totals.shippingZone,
      total: finalTotal,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      paymentMethod,
      shippingMethod,
      paymentStatus: isUpiPayment || isPayUPayment ? 'pending' : (isCodPayment ? 'unpaid' : (isRazorpayPayment ? 'paid' : 'paid')),
      codStatus: isCodPayment ? 'pending' : undefined,
      giftWrappingRequested: giftWrapped,
      giftMessage: giftMsg,
      giftWrappingType: giftTheme,
      giftSenderName: giftSender,
      giftHidePrice,
      accountEmail: currentUser.email,
      accountName: currentUser.name,
      upiTxnId,
      upiSenderName,
      upiScreenshot,
      upiNotes,
      payuTxnId: isPayUPayment ? orderNum : undefined,
      payuPaymentId,
      payuHash,
      payuStatus
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrder,
          account: {
            email: currentUser.email,
            name: currentUser.name
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Order registration failed');
      }
    } catch (err) {
      console.error('Error saving order to backend database:', err);
      if (isPayUPayment) {
        throw err;
      }
    }

    // Update real physical stock counts in database
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartQuantity = cartItems
          .filter((ci) => ci.product.id === p.id)
          .reduce((total, ci) => total + ci.quantity, 0);
        if (cartQuantity > 0) {
          return { ...p, stock: Math.max(0, p.stock - cartQuantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedSuccessOrder(newOrder);
    setCartItems([]);
    setActiveCoupon(null);

    // Persist success order to sessionStorage so the invoice survives any accidental page reload
    try {
      sessionStorage.setItem('radha_pending_success_order', JSON.stringify(newOrder));
    } catch { /* storage unavailable */ }

    handleSwapView('ordersuccess');
    handleLogActivity('Order Dispatched', `Received fresh secure order ${orderNum} for total sum of Rs.${finalTotal}`);
    return newOrder;
  };

  // Newsletter form submission - calls backend API
  const handleNewsletterJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        setNewsletterSubscribed(true);
        handleLogActivity('Newsletter Signup', `Enrolled user mailbox: ${newsletterEmail}`);
        setNewsletterEmail('');
        setTimeout(() => {
          setNewsletterSubscribed(false);
        }, 4000);
      } else {
        alert(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      alert('Failed to subscribe. Please check your connection and try again.');
    }
  };

  // Active Category lists selection
  const handleSelectCategoryGroup = (slug: string) => {
    setCurrentCategorySlug(slug);
    handleSwapView('category');
  };

  // Moderation state togglers
  const handleApproveReviewContent = (productId: string, reviewId: string, approve: boolean) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            reviews: p.reviews.map((r) =>
              r.id === reviewId ? { ...r, approved: approve } : r
            )
          };
        }
        return p;
      });
      fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next)
      }).catch(err => console.error('Failed to sync review approval:', err));
      return next;
    });
  };

  const handleDeleteReviewContent = (productId: string, reviewId: string) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === productId) {
          const filteredRevs = p.reviews.filter((r) => r.id !== reviewId);
          return {
            ...p,
            reviews: filteredRevs
          };
        }
        return p;
      });
      fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next)
      }).catch(err => console.error('Failed to sync review deletion:', err));
      return next;
    });
  };

  const handleResubmitUpiDetails = (orderId: string, txnId: string, screenshot: string) => {
    setOrders((prev) => {
      const next = prev.map((o) => {
        if (o.id === orderId) {
          const updated = {
            ...o,
            upiTxnId: txnId,
            upiScreenshot: screenshot || o.upiScreenshot,
            paymentStatus: 'pending' as const
          };
          
          // Sync update back to server database
          fetch(`/api/orders/${o.orderNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          }).catch(err => console.error('Failed to sync resubmission:', err));
          
          return updated;
        }
        return o;
      });
      return next;
    });
    handleLogActivity('UPI Resubmit', `Resubmitted UPI reference ID: ${txnId} for order ID: ${orderId}`);
  };

  // Add custom user reviews dynamically
  const handleAddNewUserReview = (productId: string, review: Omit<Review, 'id'>) => {
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      ...review
    };

    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === productId) {
          const updatedRevs = [newRev, ...p.reviews];
          const approvedCount = updatedRevs.length;
          const totalRating = updatedRevs.reduce((acc, r) => acc + r.rating, 0);
          return {
            ...p,
            reviews: updatedRevs,
            rating: totalRating / approvedCount,
            ratingCount: approvedCount
          };
        }
        return p;
      });
      fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next)
      }).catch(err => console.error('Failed to sync new review:', err));
      return next;
    });
    handleLogActivity('Review Created', `Submitted client review rating [${review.rating} Stars] for Product ID: ${productId}`);
  };

  // Edit existing review dynamically
  const handleEditReviewContent = (productId: string, reviewId: string, updated: Partial<Review>) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === productId) {
          const updatedRevs = (p.reviews || []).map((r) =>
            r.id === reviewId ? { ...r, ...updated } : r
          );
          const approvedRevs = updatedRevs.filter(r => r.approved !== false);
          const approvedCount = approvedRevs.length;
          const totalRating = approvedRevs.reduce((acc, r) => acc + r.rating, 0);
          return {
            ...p,
            reviews: updatedRevs,
            rating: approvedCount > 0 ? Number((totalRating / approvedCount).toFixed(1)) : p.rating,
            ratingCount: approvedCount > 0 ? approvedCount : p.ratingCount
          };
        }
        return p;
      });
      fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next)
      }).catch(err => console.error('Failed to sync edited review:', err));
      return next;
    });
    handleLogActivity('Review Edited', `Updated review ID: ${reviewId} for Product ID: ${productId}`);
  };

  // --- DERIVED RENDER PARAMS ---
  const activeProductModel = products.find((p) => p.id === currentProductId) || products[0];

  const relatedProductsList = products.filter(
    (p) => p.categorySlug === activeProductModel.categorySlug && p.id !== activeProductModel.id
  );

  const activeCategoryObject = CATEGORIES.find((c) => c.id === currentCategorySlug);

  // SEO: Dynamically update page title based on active view
  useEffect(() => {
    const categoryNames: Record<string, string> = {
      sarees: 'Sarees', lehengas: 'Lehengas & Skirts', kurtis: 'Kurtis & Kurtas',
      salwar: 'Salwar Suits', dupattas: 'Dupattas & Stoles', jewellery: 'Ethnic Jewellery',
      handbags: 'Potli & Clutch Bags', nightwear: 'Nightwear & Loungewear', western: 'Fusion & Western'
    };
    const viewTitles: Record<string, string> = {
      home: 'Radha Fashions Boutique | Designer Sarees, Lehengas, Kurtis & Ethnic Wear Online | Bengaluru',
      about: 'About Radha Fashions Boutique | Our Story, Services & Courses | Bengaluru',
      checkout: 'Checkout | Radha Fashions Boutique — Secure Payment',
      ordersuccess: 'Order Confirmed! | Radha Fashions Boutique',
      account: 'My Account & Orders | Radha Fashions Boutique',
      cart: 'Shopping Cart | Radha Fashions Boutique',
      category: `${categoryNames[currentCategorySlug] || 'Collection'} | Radha Fashions Boutique — Shop Online`,
    };
    if (activeView === 'product' && currentProductId) {
      const prod = products.find(p => p.id === currentProductId);
      if (prod) document.title = `${prod.name} | Radha Fashions Boutique`;
    } else {
      document.title = viewTitles[activeView] || viewTitles.home;
    }
  }, [activeView, currentProductId, products, currentCategorySlug]);

  const categoryProductsFiltered = products
    .filter((p) => p.categorySlug === currentCategorySlug)
    .filter((p) => (stockOnly ? p.stock > 0 : true))
    .sort((a, b) => {
      if (sortOrder === 'rating') return b.rating - a.rating;
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return 0;
    });

  const bestSellersList = products
    .filter((product) => product.isBestseller)
    .slice(0, 4);
  const newArrivalsList = products.filter((p) => p.isNew).slice(0, 4);
  const searchResultsList =
    userFilteredProducts.length > 0 && userFilteredProducts.length !== products.length
      ? userFilteredProducts.slice(0, 8)
      : [];

  if (cms.maintenanceMode && activeView !== 'admin') {
    return (
      <div className="min-h-screen bg-pink-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />

        <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-pink-800/30 rounded-3xl p-8 space-y-6 shadow-2xl relative z-10">
          <div className="mx-auto w-20 h-20 bg-pink-400/10 rounded-full flex items-center justify-center border border-pink-400/30 animate-pulse">
            <span className="text-3xl text-pink-500">🔨</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-bold text-lg text-gray-900 dark:text-white uppercase tracking-widest leading-snug">
              Workshop Polishing Underway
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              We are currently making some adjustments to the Radha Fashions workshop to bring you an even better experience. Check back with us shortly!
            </p>
          </div>

          <div className="border-t border-pink-200 dark:border-gray-800 pt-4 flex justify-center gap-4 text-xs text-gray-500">
            <span>Helpline: {cms.contactPhone || '+91 97311 53609'}</span>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-20">
          <button 
            onClick={() => setActiveView('admin')}
            className="text-[10px] text-gray-600 hover:text-pink-500 transition uppercase font-mono font-bold tracking-wider cursor-pointer"
          >
            Staff Portal Bypass &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between select-none transition-colors duration-300">
      
      {/* Scroll Viewport Progress Indicator */}
      <div id="scroll-progress-container" className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] pointer-events-none">
        <div
          id="scroll-progress-bar"
          className="h-full bg-gradient-to-r from-pink-500 via-pink-400 to-pink-500 ease-out shadow-[0_1px_8px_rgba(212,100,138,0.5)] transition-[width] duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Primary Header/Navbar */}
      <Navbar
        cartItems={cartItems}
        wishlistIds={wishlistIds}
        allProducts={products}
        currentCategory={currentCategorySlug}
        onSelectCategory={handleSelectCategoryGroup}
        onNavigate={handleSwapView}
        onSelectProduct={handleViewProductDetails}
        onSetProductsFilter={(matched) => setUserFilteredProducts(matched)}
        onOpenCart={() => setCartOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setCartItems([]);
          setWishlistIds([]);
          handleLogActivity('User Session Terminated', 'Shopper signed out of active cart.');
        }}
      />

      {/* Main viewport Container area */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          
          {/* ================= VIEW: HOME ================= */}
          {activeView === 'home' && (
            <motion.div
              key="homeView"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Premium Hero + values — sakura fades into the page */}
              <section className="relative overflow-hidden">
                <div
                  className="absolute inset-0 scale-105 bg-cover bg-center"
                  style={{ backgroundImage: "url('/sakura-auth-bg.png')" }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#140c14]/75 via-[#1e1220]/55 to-[#2a1824]/35 dark:from-[#140c14]/82 dark:via-[#1e1220]/62 dark:to-[#2a1824]/38"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-rose-950/20 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-48 sm:h-64 bg-gradient-to-b from-transparent via-background/70 to-background"
                  aria-hidden="true"
                />
                <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-6 sm:gap-10 px-4 sm:px-6 py-8 sm:py-16 md:grid-cols-2 md:pb-10 md:pt-24">
                  <div className="text-left">
                    <p className="text-[10px] sm:text-[0.6875rem] uppercase tracking-[0.2em] sm:tracking-[0.28em] text-pink-300 sm:text-white/80 font-mono font-semibold">
                      New season · Collection 2026
                    </p>
                    <h1 className="mt-3 sm:mt-5 font-display text-3xl sm:text-5xl leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] md:text-7xl">
                      Elegance,
                      <br />
                      tailored to you.
                    </h1>
                    <p className="mt-3 sm:mt-6 max-w-md text-xs sm:text-base leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                      A boutique of quietly romantic Indian ethnic wear — handpicked silk sarees, designer lehengas and curated jewelry made in small batches.
                    </p>
                    <div className="mt-5 sm:mt-9 flex flex-wrap gap-2.5 sm:gap-3">
                      <button
                        onClick={() => {
                          const featuredCategoriesEl = document.getElementById('featured-categories');
                          if (featuredCategoriesEl) {
                            featuredCategoriesEl.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="py-2.5 sm:py-3 px-5 sm:px-6 rounded-sm bg-primary-gradient text-primary-foreground hover:opacity-90 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition cursor-pointer active:scale-95 shadow-petal"
                      >
                        Shop the collection
                      </button>
                      <button
                        onClick={() => handleSwapView('about')}
                        className="py-2.5 sm:py-3 px-5 sm:px-6 rounded-sm border border-white/55 bg-black/20 hover:bg-white/15 text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider transition cursor-pointer active:scale-95"
                      >
                        Our story
                      </button>
                    </div>
                  </div>
                  <div className="relative mt-2 sm:mt-0">
                    <img
                      src="/hero-boutique-new.png"
                      alt="Radha Fashions Boutique — handpicked ethnic wear, designer lehengas and curated collections"
                      width={1600}
                      height={1104}
                      className="w-full rounded-xl sm:rounded-sm object-cover shadow-2xl ring-1 ring-white/20 animate-fade-in aspect-[16/10] sm:aspect-auto"
                    />
                  </div>
                </div>
              </section>

              {searchResultsList.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-gray-800 dark:text-white">
                        Search Results
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Matching products from the live catalog.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{searchResultsList.length} shown</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {searchResultsList.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={handleToggleProductWishlist}
                        onAddToCart={(p) => handleAddProductToCart(p)}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onSelectProduct={handleViewProductDetails}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* AI Recommendations Shelf */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AiRecommendations
                  cartItems={cartItems}
                  recentlyViewedIds={recentlyViewedIds}
                  allProducts={products}
                  onSelectProduct={handleViewProductDetails}
                />
              </div>

              {/* Urgency-driven promotional Flash Sale Countdown section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FlashSaleSection
                  products={products}
                  onAddProductToCart={handleAddProductToCart}
                  onSelectProduct={handleViewProductDetails}
                />
              </div>

              {/* Dynamic Featured Category Grid Shelf */}
              <section id="featured-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none">
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider text-gray-800 dark:text-white">
                    Featured Collection Categories
                  </h3>
                  <div className="w-10 h-0.5 bg-pink-500 mt-1.5 sm:mt-2 rounded"></div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
                  {(CATEGORIES as any[]).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleSelectCategoryGroup(category.id)}
                      className="group relative h-36 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-950 border border-gray-100/10 cursor-pointer select-none shadow-sm hover:shadow-xl hover:border-pink-500/25 transition-all duration-300"
                    >
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition duration-500"
                      />
                      
                      {/* Premium glassmorphic gradient footer label */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent flex flex-col justify-end p-3 sm:p-4">
                        <span className="text-[8px] sm:text-[9px] font-mono text-pink-400 uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Explore
                        </span>
                        <h4 className="font-display font-semibold text-xs sm:text-sm text-white tracking-wide leading-none group-hover:text-pink-300 transition duration-300">
                          {category.name}
                        </h4>
                        <p className="text-[8px] sm:text-[9px] text-gray-300 font-sans mt-1.5 line-clamp-1 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best Sellers showcase lists */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none">
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                  <div>
                    <h3 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider text-gray-800 dark:text-white">
                      Best Sellers
                    </h3>
                    <div className="w-10 h-0.5 bg-pink-500 mt-1.5 sm:mt-2 rounded"></div>
                  </div>
                  <button
                    onClick={() => handleSelectCategoryGroup('sarees')}
                    className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-500 flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  {bestSellersList.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleProductWishlist}
                      onAddToCart={(p) => handleAddProductToCart(p)}
                      onQuickView={(p) => setQuickViewProduct(p)}
                      onSelectProduct={handleViewProductDetails}
                    />
                  ))}
                </div>
              </section>

              {/* New Arrivals Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none">
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                  <div>
                    <h3 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider text-gray-800 dark:text-white">
                      New Fashion Arrivals
                    </h3>
                    <div className="w-10 h-0.5 bg-pink-500 mt-1.5 sm:mt-2 rounded"></div>
                  </div>
                  <button
                    onClick={() => handleSelectCategoryGroup('lehengas')}
                    className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-500 flex items-center gap-1"
                  >
                    View Arrivals <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  {newArrivalsList.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleProductWishlist}
                      onAddToCart={(p) => handleAddProductToCart(p)}
                      onQuickView={(p) => setQuickViewProduct(p)}
                      onSelectProduct={handleViewProductDetails}
                    />
                  ))}
                </div>
              </section>

              {/* Dynamic AI Recommendation Section */}
              {(() => {
                const recs = getAIRecommendations(
                  products,
                  cartItems,
                  wishlistIds,
                  recentlyViewedIds,
                  orders,
                  selectedAgeGroup
                );

                const renderShelf = (title: string, list: Product[]) => {
                  if (list.length === 0) return null;
                  return (
                    <div className="space-y-4">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-1.5 border-b border-gray-150 dark:border-gray-800 pb-2">
                        <Sparkles className="w-3.5 h-3.5 text-pink-500" /> {title}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 animate-fade-in">
                        {list.map(p => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            isWishlisted={wishlistIds.includes(p.id)}
                            onToggleWishlist={handleToggleProductWishlist}
                            onAddToCart={(prod) => handleAddProductToCart(prod)}
                            onQuickView={(prod) => setQuickViewProduct(prod)}
                            onSelectProduct={handleViewProductDetails}
                          />
                        ))}
                      </div>
                    </div>
                  );
                };

                return (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8 py-8 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-500" /> AI Personalized Recommendations
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-sans mt-1">
                        Personalized picks computed from your browsing history and preferences.
                      </p>
                      <div className="w-10 h-0.5 bg-pink-500 mt-2 rounded"></div>
                    </div>

                    {renderShelf("Recommended For You", recs.recommendedForYou)}
                    {renderShelf("You May Also Like", recs.youMayAlsoLike)}
                    {renderShelf("Customers Similar To You Bought", recs.customersSimilar)}
                    {renderShelf("Because You Viewed", recs.becauseYouViewed)}
                    {renderShelf("Inspired By Your Wishlist", recs.inspiredByWishlist)}
                    {renderShelf("Recently Trending", recs.recentlyTrending)}
                  </section>
                );
              })()}

              {/* Professional testimonials review widgets */}
              <section className="bg-pink-900 dark:bg-gray-950 text-white py-12 sm:py-16 text-left select-none relative overflow-hidden border-t border-b border-pink-400/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(212,100,138,0.18),transparent_30%)] pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-300 font-semibold block text-center">Why Shop With Us</span>
                  <h3 className="font-display font-medium text-lg sm:text-2xl text-center uppercase tracking-widest mt-2 mb-8 sm:mb-10 text-white">The Radha Fashions Promise</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                    {[
                      { icon: '🪡', title: 'Quality Checked', desc: 'Every piece is curated and quality-checked by our team before shipping to you.' },
                      { icon: '🧵', title: 'Premium Fabrics', desc: 'Pure silk, cotton, and georgette sourced directly from master weavers across India.' },
                      { icon: '✂️', title: 'Custom Stitching', desc: 'Get your outfits custom-stitched to your exact measurements by expert tailors.' },
                      { icon: '🚚', title: 'Pan-India Delivery', desc: 'Free shipping on orders above ₹1,500. Delivered to your doorstep in 5–7 days.' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:border-pink-400/40 hover:bg-white/8 transition-all duration-300 text-center group">
                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-1 sm:mb-2 font-display">{item.title}</h4>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed font-light">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Trust Stats */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-8 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10">
                    {[
                      { value: '5,000+', label: 'Happy Customers' },
                      { value: '4.8★', label: 'Google Rating' },
                      { value: '100%', label: 'Authentic Products' },
                      { value: '7-Day', label: 'Easy Returns' },
                    ].map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <span className="text-base sm:text-xl font-display font-black text-pink-300">{stat.value}</span>
                        <span className="block text-[9px] sm:text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              {/* Our Story */}
              <section id="our-story" className="bg-petal mt-8 sm:mt-12 rounded-sm border border-border">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
                  <p className="eyebrow">Our Story</p>
                  <h2 className="mt-3 sm:mt-4 font-display text-2xl sm:text-4xl md:text-5xl leading-tight text-foreground">
                    Made slowly, in small rooms with good light.
                  </h2>
                  <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Radha Fashions began as a passion for Indian ethnic fashion. Today every piece in our boutique still passes through the same standard of perfection — hand-selected silks, checked seams, and wrapped with love.
                  </p>
                </div>
              </section>

              {/* Product Gallery */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                <InstagramGallery />
              </div>
            </motion.div>
          )}

          {/* ================= VIEW: CATEGORIES CATALOG ================= */}
          {activeView === 'category' && (
            <motion.div
              key="categoryView"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8"
            >
              {/* Mobile Filter & Sort Toggle Bar */}
              <div className="lg:hidden flex items-center justify-between mb-4 gap-2.5">
                <button
                  onClick={() => setMobileFiltersOpen((f) => !f)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-pink-400 hover:text-pink-500 transition cursor-pointer shadow-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filters & Categories'}</span>
                </button>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-white focus:outline-none focus:border-pink-400 shadow-xs"
                >
                  <option value="rating">Sort: Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                
                {/* Left: Filters Panel (Collapsible on Mobile, always on Desktop) */}
                <div className={`bg-white dark:bg-gray-900 border rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-fit text-left space-y-4 sm:space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2">Category Selector</h3>
                    <div className="flex flex-col gap-1 text-xs">
                      {CATEGORIES.map((category, idx) => (
                        <motion.button
                          key={category.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25, ease: "easeOut" }}
                          onClick={() => {
                            handleSelectCategoryGroup(category.id);
                            setMobileFiltersOpen(false);
                          }}
                          className={`w-full text-left py-2 px-2.5 rounded-lg transition font-semibold ${currentCategorySlug === category.id ? 'bg-pink-500/10 text-pink-600 font-bold border-l-4 border-pink-500' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950'}`}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 hidden lg:block">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2">Sort Order Catalog</h3>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs border rounded-lg focus:outline-none bg-white dark:bg-gray-900"
                    >
                      <option value="rating">Sort by Rating Stars</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2">Availability Filters</h3>
                    <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockOnly}
                        onChange={(e) => setStockOnly(e.target.checked)}
                        className="text-pink-500 focus:ring-pink-400 rounded"
                      />
                      <span>In-Stock Items Only</span>
                    </label>
                  </div>
                </div>

                {/* Right: Products catalog list */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                  {/* Category banner description card */}
                  {activeCategoryObject && (
                    <div className="relative h-36 sm:h-52 rounded-2xl sm:rounded-3xl overflow-hidden text-left border border-pink-400/10 shadow-lg select-none">
                      <img 
                        src={activeCategoryObject.imageUrl} 
                        alt={activeCategoryObject.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/75 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6 md:p-10 space-y-1 sm:space-y-1.5 z-10 max-w-xl">
                        <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-pink-400 font-semibold uppercase">Collection Category</span>
                        <h2 className="font-display font-bold text-base sm:text-2xl text-white uppercase leading-none">{activeCategoryObject.name}</h2>
                        <p className="text-[10px] sm:text-[11px] text-gray-200 leading-normal font-light line-clamp-2 sm:line-clamp-none">{activeCategoryObject.description}</p>
                      </div>
                    </div>
                  )}

                  {/* dynamic list of products */}
                  {categoryProductsFiltered.length === 0 ? (
                    <div className="p-10 sm:p-16 text-center bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl space-y-4">
                      <div className="w-12 h-12 bg-pink-500/15 rounded-full flex items-center justify-center mx-auto text-pink-500">
                        <Heart className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">No Matching Products Found</p>
                        <p className="text-[10px] text-gray-400 font-sans max-w-xs mx-auto">
                          We couldn't discover any items matching your selected criteria. Try adjusting your filter.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      key={currentCategorySlug}
                      variants={staggersContainerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6"
                    >
                      {categoryProductsFiltered.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          isWishlisted={wishlistIds.includes(p.id)}
                          onToggleWishlist={handleToggleProductWishlist}
                          onAddToCart={(p) => handleAddProductToCart(p)}
                          onQuickView={(p) => setQuickViewProduct(p)}
                          onSelectProduct={handleViewProductDetails}
                          variants={staggerCardVariants}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= VIEW: PRODUCT DETAILS SHEET ================= */}
          {activeView === 'product' && (
            <motion.div
              key="productView"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProductDetails
                product={activeProductModel}
                relatedProducts={relatedProductsList}
                onBack={() => handleSwapView('home')}
                isWishlisted={wishlistIds.includes(activeProductModel.id)}
                onToggleWishlist={handleToggleProductWishlist}
                onAddToCart={handleAddProductToCart}
                onBuyNow={handleBuyNowTrigger}
                onSelectProduct={handleViewProductDetails}
                onAddReview={handleAddNewUserReview}
              />
            </motion.div>
          )}

          {/* ================= VIEW: CHECKOUT PANEL ================= */}
          {activeView === 'checkout' && (
            <motion.div
              key="checkoutView"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {currentUser ? (
                <CheckoutPanel
                  cartItems={cartItems}
                  shippingMethod={shippingMethod}
                  activeCoupon={activeCoupon}
                  currentUser={currentUser}
                  onBackToCart={() => { setCartOpen(true); handleSwapView('home'); }}
                  onPlaceOrder={handlePlaceSecureOrder}
                  codEnabled={cms.codEnabled !== false}
                  upiEnabled={cms.upiEnabled !== false}
                />
              ) : (
                <div className="max-w-xl mx-auto px-4 py-16 text-center">
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4">
                    <ShieldCheck className="w-10 h-10 text-pink-500 mx-auto" />
                    <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-gray-900 dark:text-white">Login Required</h2>
                    <p className="text-xs text-gray-500">Please create or sign in to your Radha Fashions account before placing an order.</p>
                    <button
                      onClick={() => {
                        setPendingCheckout(true);
                        handleSwapView('account');
                      }}
                      className="px-5 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition"
                    >
                      Sign In / Register
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ================= VIEW: ORDER SUCCESS MODAL ================= */}
          {activeView === 'ordersuccess' && selectedSuccessOrder && (
            <motion.div
              key="ordersuccessView"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OrderSuccessModal
                order={selectedSuccessOrder}
                onClose={() => {
                  try { sessionStorage.removeItem('radha_pending_success_order'); } catch {}
                  handleSwapView('home');
                }}
              />
            </motion.div>
          )}

          {/* ================= VIEW: USER PROFILE ACCOUNT PANEL ================= */}
          {activeView === 'account' && (
            <motion.div
              key="accountView"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AccountPanel
                wishlistProducts={products.filter((p) => wishlistIds.includes(p.id))}
                orders={currentUser ? orders.filter(o => (o.customerInfo?.email || o.accountEmail) === currentUser.email) : []}
                coupons={coupons}
                currentUser={currentUser}
                onLogin={(emailVal, nameVal) => {
                  const verifiedUsr = { email: emailVal, name: nameVal };
                  setCurrentUser(verifiedUsr);
                  handleLogActivity('Auth Successful', `Client session keys unlocked for ${nameVal}`);
                  // If user logged in because they were blocked from checkout, send them there
                  if (pendingCheckout) {
                    setPendingCheckout(false);
                    handleSwapView('checkout');
                  }
                }}
                onLogout={() => {
                  setCurrentUser(null);
                  setCartItems([]);
                  setWishlistIds([]);
                  try {
                    localStorage.removeItem('radha_user');
                    localStorage.removeItem('radha_cart');
                    localStorage.removeItem('radha_wishlist');
                    sessionStorage.clear();
                  } catch {}
                  handleLogActivity('Session Closed', 'Shopper terminated session.');
                  handleSwapView('home');
                }}
                onMoveToCart={(prod) => {
                  handleAddProductToCart(prod);
                  handleToggleProductWishlist(prod.id);
                }}
                onRemoveFromWishlist={handleToggleProductWishlist}
                onRequestRefund={(ordId, itemNm, reasonText) => {
                  handleLogActivity(
                    'Refund Ticket Dispatched',
                    `Order ID: ${ordId} | Item: ${itemNm} | reason code: ${reasonText}`
                  );
                }}
                onSelectProduct={handleViewProductDetails}
                onResubmitUpiDetails={handleResubmitUpiDetails}
                products={products}
                rewardsEnabled={cms.rewardsEnabled !== false}
              />
            </motion.div>
          )}

          {/* ================= VIEW: SECURED ADMIN WORKSPACE ================= */}
          {activeView === 'admin' && (
            <motion.div
              key="adminView"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard
                products={products}
                coupons={coupons}
                campaigns={campaigns}
                cms={cms}
                orders={orders}
                logs={activityLogs}
                onAddProduct={(added) => {
                  setProducts((prev) => {
                    const updated = [added, ...prev.filter(p => p.id !== added.id)];
                    fetch('/api/catalog/products', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updated)
                    }).catch(err => console.error('Product add sync error:', err));
                    return updated;
                  });
                }}
                onEditProduct={(edited) => {
                  setProducts((prev) => {
                    const updated = prev.map((p) => (p.id === edited.id ? edited : p));
                    fetch('/api/catalog/products', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updated)
                    }).catch(err => console.error('Product edit sync error:', err));
                    return updated;
                  });
                }}
                onDeleteProduct={(delId) => {
                  setProducts((prev) => {
                    const updated = prev.filter((p) => p.id !== delId);
                    fetch('/api/catalog/products', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updated)
                    }).catch(err => console.error('Product delete sync error:', err));
                    return updated;
                  });
                }}
                onAddCoupon={(c) => setCoupons((prev) => [c, ...prev])}
                onDeleteCoupon={async (codeStr) => {
                  setCoupons((prev) => prev.filter((c) => c.code !== codeStr));
                  try {
                    const token = localStorage.getItem('adminToken') || '';
                    await fetch('/api/catalog/coupons/bulk-delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ codes: [codeStr] })
                    });
                  } catch (err) { console.error('Failed to delete coupon:', err); }
                }}
                onBulkDeleteCoupons={async (codes) => {
                  setCoupons((prev) => prev.filter((c) => !codes.includes(c.code)));
                  try {
                    const token = localStorage.getItem('adminToken') || '';
                    await fetch('/api/catalog/coupons/bulk-delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ codes })
                    });
                  } catch (err) { console.error('Failed to bulk delete coupons:', err); }
                }}
                onDeleteAllCoupons={async () => {
                  setCoupons([]);
                  try {
                    const token = localStorage.getItem('adminToken') || '';
                    await fetch('/api/catalog/coupons', {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                  } catch (err) { console.error('Failed to delete all coupons:', err); }
                }}
                onDeleteCampaign={(campId) => setCampaigns((prev) => prev.filter((c) => c.id !== campId))}
                onDeleteOrder={async (ordId, ordNum) => {
                  setOrders((prev) => prev.filter((o) => o.id !== ordId));
                  try {
                    await fetch(`/api/orders/${ordNum}`, { method: 'DELETE' });
                  } catch (err) {
                    console.error('Failed to delete order from backend:', err);
                  }
                }}
                onDeleteLog={(logId) => setActivityLogs((prev) => prev.filter((l) => l.id !== logId))}
                onClearLogs={() => setActivityLogs([])}
                onUpdateOrderStatus={(ordId, nextStatus) =>
                  setOrders((prev) =>
                    prev.map((o) => (o.id === ordId ? { ...o, status: nextStatus } : o))
                  )
                }
                onUpdatePaymentStatus={(ordId, nextPaymentStatus, reason) => {
                  setOrders((prev) => {
                    const next = prev.map((o) => {
                      if (o.id === ordId) {
                        const updated = {
                          ...o,
                          paymentStatus: nextPaymentStatus,
                          upiRejectionReason: reason || '',
                          status: nextPaymentStatus === 'paid' ? ('processing' as const) : o.status
                        };
                        
                        // Sync updates back to server database
                        fetch(`/api/orders/${o.orderNumber}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updated)
                        }).catch(err => console.error('Failed to sync payment validation:', err));
                        
                        return updated;
                      }
                      return o;
                    });
                    return next;
                  });
                }}
                 onApproveReview={handleApproveReviewContent}
                 onDeleteReview={handleDeleteReviewContent}
                 onAddReview={handleAddNewUserReview}
                 onEditReview={handleEditReviewContent}
                 onUpdateCampaigns={(camp) => setCampaigns(camp)}
                 onUpdateCMS={(cM) => setCms(cM)}
                onLogActivity={handleLogActivity}
                autoAuthenticated={adminBypassed}
                onLogoutAdmin={async () => {
                  try {
                    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
                  } catch (err) {
                    console.error('Logout sync failed:', err);
                  }
                  try {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminAuthenticated');
                    sessionStorage.clear();
                  } catch {}
                  setAdminBypassed(false);
                  handleSwapView('home');
                }}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Slide out Cart drawer overlay */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={(cartItemKey, q) =>
          setCartItems((prev) => prev.map((it) => (getCartItemKey(it) === cartItemKey ? { ...it, quantity: q } : it)))
        }
        onRemoveItem={(cartItemKey) => setCartItems((prev) => prev.filter((it) => getCartItemKey(it) !== cartItemKey))}
        activeCoupon={activeCoupon}
        onApplyCoupon={setActiveCoupon}
        shippingMethod={shippingMethod}
        onUpdateShipping={setShippingMethod}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Login Gate Modal - shown when guest tries to checkout */}
      <AnimatePresence>
        {showLoginGate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/sakura-auth-bg.png')" }}
            />
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="relative w-full max-w-[340px] rounded-md px-8 py-9 text-left shadow-[0_18px_50px_rgba(80,20,50,0.28)]"
              style={{
                background: 'rgba(232, 214, 220, 0.58)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
            >
              <h2 className="text-center text-[26px] font-bold text-black mb-3">Sign In</h2>
              <p className="text-[12px] text-neutral-700 text-center mb-6 leading-relaxed">
                You need a Radha Fashions account to place orders and track deliveries.
              </p>
              <button
                onClick={() => {
                  setShowLoginGate(false);
                  handleSwapView('account');
                }}
                className="w-full h-11 rounded-md bg-black text-white text-[15px] font-semibold hover:bg-neutral-900 transition cursor-pointer"
              >
                Login
              </button>
              <div className="mt-6 flex items-center justify-between text-[13px] text-neutral-800">
                <button
                  onClick={() => {
                    setShowLoginGate(false);
                    setPendingCheckout(false);
                  }}
                  className="hover:text-black cursor-pointer"
                >
                  Keep shopping
                </button>
                <button
                  onClick={() => {
                    setShowLoginGate(false);
                    handleSwapView('account');
                  }}
                  className="hover:text-black cursor-pointer"
                >
                  Signup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secret Admin Login Prompt Modal */}
      <AnimatePresence>
        {showAdminLoginPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-pink-50 dark:bg-gray-900 border border-pink-300 dark:border-pink-800/40 text-gray-900 dark:text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 sm:p-8 relative text-left"
            >
              <button
                onClick={() => {
                  setShowAdminLoginPrompt(false);
                  setAdminLoginError('');
                  setAdminLoginUser('');
                  setAdminLoginPass('');
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 border border-pink-200 dark:border-pink-900/30 rounded-full cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1.5 pb-4 border-b border-pink-200 dark:border-pink-900/30">
                <div className="w-12 h-12 bg-gradient-to-tr from-pink-600 to-pink-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <Key className="text-white w-5 h-5 animate-pulse" />
                </div>
                <h2 className="font-display font-medium text-sm text-pink-700 dark:text-pink-300 uppercase tracking-widest pt-2">Secured Admin Login</h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Please enter credentials to initialize session keys.</p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch('/api/admin/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username: adminLoginUser, password: adminLoginPass })
                    });
                    const data = await res.json();
                    
                    // Clear inputs immediately
                    setAdminLoginUser('');
                    setAdminLoginPass('');
                    
                    if (res.ok && data.success) {
                      setAdminBypassed(true);
                      setShowAdminLoginPrompt(false);
                      setAdminLoginError('');
                      handleSwapView('admin');
                      handleLogActivity('Admin Login Successful', 'Secured key keyboard prompt entry authenticated on server.');
                    } else {
                      setAdminLoginError(data.error || 'Invalid administrative user credentials.');
                    }
                  } catch (err) {
                    setAdminLoginError('Failed to establish connection to authentication gate.');
                  }
                }}
                className="space-y-4 pt-4 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    required
                    id="admin-user-input"
                    value={adminLoginUser}
                    onChange={(e) => setAdminLoginUser(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-pink-300 dark:border-pink-900/30 focus:outline-none focus:border-pink-500 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    id="admin-pass-input"
                    value={adminLoginPass}
                    onChange={(e) => setAdminLoginPass(e.target.value)}
                    placeholder="--------"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-pink-300 dark:border-pink-900/30 focus:outline-none focus:border-pink-500 rounded-xl text-gray-900 dark:text-white"
                  />
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-mono">Hint: User 'admin' / Pass 'password' or 'admin123'</p>
                </div>

                {adminLoginError && (
                  <p className="text-[10px] text-red-400 text-center font-semibold font-mono">{adminLoginError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-tr from-pink-600 to-pink-500 text-white font-display font-semibold text-xs tracking-widest uppercase rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Verify Credentials</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick view overlay card modal popup */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-left"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 text-gray-400 hover:text-gray-950 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <img src={quickViewProduct.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] sm:text-[10px] font-mono text-pink-500 uppercase font-semibold">{quickViewProduct.category}</span>
                    <h3 className="font-display font-medium text-base sm:text-lg text-gray-900 dark:text-gray-100 leading-snug">{quickViewProduct.name}</h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-mono">SKU: {quickViewProduct.sku}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-light mt-1.5 line-clamp-3">{quickViewProduct.shortDescription}</p>
                  </div>

                  <div className="flex items-baseline gap-2 pb-1 sm:pb-2">
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-sans">
                      Rs.{quickViewProduct.discountPrice || quickViewProduct.price}
                    </span>
                    {quickViewProduct.discountPrice && (
                      <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                        Rs.{quickViewProduct.price}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleAddProductToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 py-2.5 px-3 bg-pink-600 text-white rounded-xl text-xs font-semibold uppercase hover:bg-pink-700 hover:text-white transition cursor-pointer active:scale-95"
                    >
                      Add Bag
                    </button>
                    <button
                      onClick={() => {
                        handleViewProductDetails(quickViewProduct.id);
                        setQuickViewProduct(null);
                      }}
                      className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      Full Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= VIEW: ABOUT ================= */}
      {activeView === 'about' && (
        <motion.div
          key="aboutView"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AboutPage />
        </motion.div>
      )}

      {/* Floating WhatsApp chat assis widget */}
      <WhatsAppChat />

      {/* Exit Intent Offer Popup */}
      <ExitIntentOffer onApplyCoupon={setActiveCoupon} />



      {/* Universal brand footer */}
      {!(activeView === 'account' && !currentUser) && (
      <footer className="bg-pink-900 dark:bg-gray-950 text-white py-12 border-t border-pink-800/30 dark:border-pink-900/20 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
          
          <div className="space-y-3">
            <span className="font-display font-bold text-sm tracking-wider text-white uppercase">Radha Fashions <span className="text-pink-300">Boutique</span></span>
            <p className="text-pink-200 dark:text-gray-400 leading-relaxed font-light">
              Curated ethnic fashion for the modern Indian woman. Sarees, lehengas, kurtis, and ethnic accessories — sourced directly from artisans and weavers across India.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-semibold text-xs text-pink-300 uppercase tracking-widest leading-none">Shop Categories</h4>
            <div className="flex flex-col gap-1.5 font-light text-pink-200 dark:text-gray-400">
              <button onClick={() => handleSelectCategoryGroup('sarees')} className="text-left hover:text-pink-300 transition cursor-pointer">Sarees & Lehengas</button>
              <button onClick={() => handleSelectCategoryGroup('kurtis')} className="text-left hover:text-pink-300 transition cursor-pointer">Kurtis & Salwar Suits</button>
              <button onClick={() => handleSelectCategoryGroup('jewellery')} className="text-left hover:text-pink-300 transition cursor-pointer">Ethnic Jewellery & Bags</button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-semibold text-xs text-pink-300 uppercase tracking-widest leading-none">Quick Links</h4>
            <div className="flex flex-col gap-1.5 font-light text-pink-200 dark:text-gray-400">
              <button onClick={() => handleSwapView('account')} className="text-left hover:text-pink-300 transition cursor-pointer">My Account & Orders</button>
              <button onClick={() => handleSwapView('home')} className="text-left hover:text-pink-300 transition cursor-pointer">Browse Collections</button>
              <button onClick={() => handleSwapView('about')} className="text-left hover:text-pink-300 transition cursor-pointer">About Us</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-xs text-pink-300 uppercase tracking-widest leading-none">Indian Headquarters</h4>
            <p className="text-pink-200 dark:text-gray-400 leading-relaxed font-light">
              KSVK School Rd, Hagadur,<br />
              Vinayakanagar, Whitefield,<br />
              Bengaluru, Karnataka 560066<br />
              Contact Desk: admin@radhafashions.in
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-pink-300 dark:text-gray-500 text-[10px] font-mono tracking-wider">
          <span>(c) 2026 Radha Fashions - All Rights Reserved.</span>
          <span className="text-pink-400/80">Made with love — Authentic Indian ethnic wear, curated for you</span>
        </div>
      </footer>
      )}

    </div>
  );
}
