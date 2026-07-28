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
import AgeToyFinder from './components/AgeToyFinder';
import { getAIRecommendations } from './utils/aiRecommender';
import FlashSaleSection from './components/FlashSaleSection';
import InstagramGallery from './components/InstagramGallery';
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

import { Product, CartItem, Coupon, Order, CustomerInfo, ActivityLog, CMSConfig, Review, BannerCampaign } from './types';

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
  const [activeView, setActiveView] = useState<'home' | 'category' | 'product' | 'checkout' | 'account' | 'admin' | 'ordersuccess'>('home');

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

  // Active home carousel index
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Hero slides: shuffle categories every 30 min
  const shuffleCategories = () => [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 5);
  const [heroSlides, setHeroSlides] = useState(shuffleCategories);

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
      const pendingSuccess = sessionStorage.getItem('meris_pending_success_order');
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
    });
  }, [cartItems, wishlistIds, orders, recentlyViewedIds, currentUser]);

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

  // Slide every 6s; reshuffle categories every 30 min
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveHeroIndex(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    const reshuffleTimer = setInterval(() => {
      setHeroSlides(shuffleCategories());
      setActiveHeroIndex(0);
    }, 30 * 60 * 1000);
    return () => {
      clearInterval(slideTimer);
      clearInterval(reshuffleTimer);
    };
  }, [heroSlides]);



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
  const handleAddProductToCart = (product: Product, quantity = 1) => {
    const limit = cms.maxCartQty || 10;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= limit) {
          alert(`You can purchase a maximum of ${limit} units per product item.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, limit, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, limit, quantity) }];
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
  const handleBuyNowTrigger = (product: Product) => {
    handleAddProductToCart(product, 1);
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
      paymentStatus: isUpiPayment || isPayUPayment ? 'pending' : (isCodPayment ? 'unpaid' : 'paid'),
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
        const inCart = cartItems.find((ci) => ci.product.id === p.id);
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
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
      sessionStorage.setItem('meris_pending_success_order', JSON.stringify(newOrder));
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

  // --- DERIVED RENDER PARAMS ---
  const activeProductModel = products.find((p) => p.id === currentProductId) || products[0];

  const relatedProductsList = products.filter(
    (p) => p.categorySlug === activeProductModel.categorySlug && p.id !== activeProductModel.id
  );

  const activeCategoryObject = CATEGORIES.find((c) => c.id === currentCategorySlug);
  const categoryProductsFiltered = products
    .filter((p) => p.categorySlug === currentCategorySlug)
    .filter((p) => (stockOnly ? p.stock > 0 : true))
    .filter((p) => {
      if (currentCategorySlug === 'toys') {
        if (selectedAgeGroup && p.ageGroup !== selectedAgeGroup) {
          return false;
        }
        if (selectedSkills.length > 0) {
          const matchSkill = selectedSkills.some(skill => {
            return p.skillType === skill || p.educationalType === skill || p.shortDescription?.toLowerCase().includes(skill.toLowerCase());
          });
          if (!matchSkill) return false;
        }
      }
      return true;
    })
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
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />

        <div className="max-w-md w-full bg-navy-900/40 border border-gold-400/20 backdrop-blur-xl rounded-3xl p-8 space-y-6 shadow-2xl relative z-10 text-white">
          <div className="mx-auto w-20 h-20 bg-gold-400/10 rounded-full flex items-center justify-center border border-gold-400/30 animate-pulse">
            <span className="text-3xl text-gold-400">🔨</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-bold text-lg text-white uppercase tracking-widest leading-snug">
              Workshop Polishing Underway
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              We are currently making some adjustments to the MERIS workshop to bring you an even better experience. Check back with us shortly!
            </p>
          </div>

          <div className="border-t border-navy-800 pt-4 flex justify-center gap-4 text-xs text-gray-500">
            <span>Helpline: {cms.contactPhone || '+91 91083 19758'}</span>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-20">
          <button 
            onClick={() => setActiveView('admin')}
            className="text-[10px] text-gray-600 hover:text-gold-400 transition uppercase font-mono font-bold tracking-wider cursor-pointer"
          >
            Staff Portal Bypass &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 text-gray-900 dark:text-slate-100 flex flex-col justify-between select-none transition-colors duration-300">
      
      {/* Scroll Viewport Progress Indicator */}
      <div id="scroll-progress-container" className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] pointer-events-none">
        <div
          id="scroll-progress-bar"
          className="h-full bg-gradient-to-r from-[#C5A021] via-amber-400 to-[#C5A021] ease-out shadow-[0_1px_8px_rgba(197,160,33,0.5)] transition-[width] duration-75"
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
              {/* Premium Rotating Hero Banner — category slides, reshuffles every 30 min */}
              <div className="relative min-h-[31rem] sm:min-h-[36rem] bg-slate-950 overflow-hidden text-white font-sans select-none">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_78%_20%,rgba(20,184,166,0.28),transparent_28%),linear-gradient(110deg,rgba(2,6,23,0.96)_0%,rgba(15,23,42,0.88)_42%,rgba(15,23,42,0.20)_100%)]" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeHeroIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={heroSlides[activeHeroIndex]?.imageUrl}
                      alt={heroSlides[activeHeroIndex]?.name || ''}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 saturate-90"
                    />

                    <div className="absolute inset-0 flex items-center">
                      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-8 w-full text-left">
                        <div className="max-w-2xl space-y-5">
                          <span className="px-3 py-1 bg-emerald-300 text-slate-950 uppercase text-[10px] sm:text-xs font-mono font-bold tracking-[0.18em] rounded-full inline-block">
                            Curated Artisan Marketplace
                          </span>

                          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl text-white leading-tight max-w-3xl">
                            {heroSlides[activeHeroIndex]?.name}
                          </h2>

                          <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed">
                            {heroSlides[activeHeroIndex]?.description}
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3 pt-3">
                            <button
                              onClick={() => handleSelectCategoryGroup(heroSlides[activeHeroIndex]?.id || '')}
                              className="py-3 px-6 rounded-lg bg-emerald-300 hover:bg-emerald-200 text-slate-950 text-xs font-display font-bold uppercase tracking-widest transition cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                              Shop {heroSlides[activeHeroIndex]?.name}
                            </button>
                            <button
                              onClick={() => handleSelectCategoryGroup('kolam')}
                              className="py-3 px-6 rounded-lg border border-white/25 hover:border-amber-300 hover:bg-white/10 text-white text-xs font-display font-medium uppercase tracking-wider transition cursor-pointer active:scale-95"
                            >
                              Explore Kolam Stencils
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Dot navigation */}
                <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveHeroIndex(i)}
                      className={`w-3 h-3 rounded-full cursor-pointer transition-all ${i === activeHeroIndex ? 'bg-emerald-300 scale-125' : 'bg-white/35'}`}
                    />
                  ))}
                </div>
              </div>

              {searchResultsList.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-slate-800 dark:text-white">
                        Search Results
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Matching products from the live catalog.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{searchResultsList.length} shown</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none">
                <div className="mb-6">
                  <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-slate-800 dark:text-white">
                    Featured Collection Categories
                  </h3>
                  <div className="w-10 h-0.5 bg-[#C5A021] mt-2 rounded"></div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {(CATEGORIES as any[]).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleSelectCategoryGroup(category.id)}
                      className="group relative h-40 sm:h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-100/10 cursor-pointer select-none shadow-sm hover:shadow-xl hover:border-gold-500/25 transition-all duration-300"
                    >
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition duration-500"
                      />
                      
                      {/* Premium glassmorphic gradient footer label */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Explore Collection
                        </span>
                        <h4 className="font-display font-semibold text-xs sm:text-sm text-white tracking-wide leading-none group-hover:text-gold-300 transition duration-300">
                          {category.name}
                        </h4>
                        <p className="text-[9px] text-gray-300 font-sans mt-2 line-clamp-1 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best Sellers showcase lists */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-slate-800 dark:text-white">
                      Heritage Best Sellers
                    </h3>
                    <div className="w-10 h-0.5 bg-[#C5A021] mt-2 rounded"></div>
                  </div>
                  <button
                    onClick={() => handleSelectCategoryGroup('toys')}
                    className="text-xs font-semibold text-[#C5A021] hover:text-[#C5A021]/80 flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-slate-800 dark:text-white">
                      New Craft Arrivals
                    </h3>
                    <div className="w-10 h-0.5 bg-[#C5A021] mt-2 rounded"></div>
                  </div>
                  <button
                    onClick={() => handleSelectCategoryGroup('kolam')}
                    className="text-xs font-semibold text-[#C5A021] hover:text-[#C5A021]/80 flex items-center gap-1"
                  >
                    View Arrivals <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 dark:text-navy-50 flex items-center gap-1.5 border-b border-gray-150 dark:border-navy-850 pb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A021]" /> {title}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
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
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8 py-8 border-t border-gray-100 dark:border-navy-800">
                    <div>
                      <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#C5A021]" /> AI Personalized Recommendations
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-sans mt-1">
                        Moris algorithmic scoring engine computing affinity profiles dynamically.
                      </p>
                      <div className="w-10 h-0.5 bg-[#C5A021] mt-2 rounded"></div>
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
              <section className="bg-slate-950 text-white py-16 text-left select-none relative overflow-hidden border-t border-b border-emerald-300/25">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(20,184,166,0.18),transparent_30%)] pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold-400 font-semibold block text-center">Reviews of the Meris Family</span>
                  <h3 className="font-display font-medium text-xl sm:text-2xl text-center uppercase tracking-widest mt-2 mb-10 text-white">Loved by Families Worldwide</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { quote: "The wooden alignment pins on the kolam stencils make geometric floor dusting a complete dream. Absolute heirloom products!", author: "Sowmya Ramaswamy", loc: "Chennai" },
                      { quote: "My grandchildren completely ditched digital tablets for the organic stacking wooden horses. Safe chemical-free smells are amazing.", author: "Kiran Mazumdar", loc: "Bangalore" },
                      { quote: "Superb custom packaged bottles for our wedding return gift bags. Each bottle got custom praise. Outstanding client service support.", author: "Rohan Advani", loc: "Mumbai" }
                    ].map((t, idx) => (
                      <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-400/40 transition flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-300 italic font-light leading-relaxed">"{t.quote}"</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 mt-4 text-xs font-semibold text-gold-300 font-sans flex justify-between items-center">
                          <span>{t.author}</span>
                          <span className="text-[10px] text-gray-500 font-mono italic">{t.loc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Curated luxury artisanal Instagram handcraft gallery */}
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
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left: Filters Panel (Desktop) */}
                <div className="bg-white border rounded-3xl p-6 h-fit text-left space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 mb-2">Category Selector</h3>
                    <div className="flex flex-col gap-1 text-xs">
                      {CATEGORIES.map((category, idx) => (
                        <motion.button
                          key={category.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25, ease: "easeOut" }}
                          onClick={() => handleSelectCategoryGroup(category.id)}
                          className={`w-full text-left py-2 px-2.5 rounded-lg transition font-semibold ${currentCategorySlug === category.id ? 'bg-[#C5A021]/10 text-[#C5A021] font-bold border-l-4 border-[#C5A021]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 mb-2">Sort Order Catalog</h3>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs border rounded-lg focus:outline-none bg-white"
                    >
                      <option value="rating">Sort by Rating Stars</option>
                      <option value="price-asc">Price: Low to High</option>
<option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 mb-2">Availability Filters</h3>
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockOnly}
                        onChange={(e) => setStockOnly(e.target.checked)}
                        className="text-gold-500 focus:ring-gold-400"
                      />
                      <span>In-Stock Items Only</span>
                    </label>
                  </div>

                  {currentCategorySlug === 'toys' && (
                    <div className="border-t pt-4">
                      <AgeToyFinder
                        selectedAgeGroup={selectedAgeGroup}
                        onSelectAgeGroup={setSelectedAgeGroup}
                        selectedSkills={selectedSkills}
                        onToggleSkill={(skill) => {
                          setSelectedSkills(prev =>
                            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                          );
                        }}
                        onClearFilters={() => {
                          setSelectedAgeGroup('');
                          setSelectedSkills([]);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Products catalog list */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Category banner description card */}
                  {activeCategoryObject && (
                    <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden text-left border border-gold-400/10 shadow-lg select-none">
                      <img 
                        src={activeCategoryObject.imageUrl} 
                        alt={activeCategoryObject.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10 space-y-1.5 z-10 max-w-xl">
                        <span className="text-[9px] font-mono tracking-widest text-gold-400 font-semibold uppercase">Collection Category</span>
                        <h2 className="font-display font-bold text-lg sm:text-2xl text-white uppercase leading-none">{activeCategoryObject.name}</h2>
                        <p className="text-[11px] text-gray-200 leading-normal font-light">{activeCategoryObject.description}</p>
                      </div>
                    </div>
                  )}

                  {/* dynamic list of products */}
                  {categoryProductsFiltered.length === 0 ? (
                    <div className="p-16 text-center bg-white dark:bg-navy-900 border border-dashed border-gray-200 dark:border-navy-800 rounded-3xl space-y-4">
                      <div className="w-12 h-12 bg-[#C5A021]/15 rounded-full flex items-center justify-center mx-auto text-[#C5A021]">
                        <Heart className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-navy-950 dark:text-white">No Matching Crafts Found</p>
                        <p className="text-[10px] text-gray-400 font-sans max-w-xs mx-auto">
                          We couldn't discover any items matching your selected age groups or filter criteria. Try adjusting your selector.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      key={currentCategorySlug}
                      variants={staggersContainerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
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
                    <ShieldCheck className="w-10 h-10 text-gold-500 mx-auto" />
                    <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-navy-900">Login Required</h2>
                    <p className="text-xs text-gray-500">Please create or sign in to your Meris account before placing an order.</p>
                    <button
                      onClick={() => {
                        setPendingCheckout(true);
                        handleSwapView('account');
                      }}
                      className="px-5 py-3 bg-gold-500 hover:bg-gold-600 text-navy-950 rounded-2xl text-xs font-bold uppercase tracking-widest transition"
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
                  try { sessionStorage.removeItem('meris_pending_success_order'); } catch {}
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
                  handleLogActivity('Session Closed', 'Shopper terminated session.');
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
                 onUpdateCampaigns={(camp) => setCampaigns(camp)}
                 onUpdateCMS={(cM) => setCms(cM)}
                onLogActivity={handleLogActivity}
                autoAuthenticated={adminBypassed}
                onLogoutAdmin={async () => {
                  try {
                    await fetch('/api/admin/logout', { method: 'POST' });
                  } catch (err) {
                    console.error('Logout sync failed:', err);
                  }
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
        onUpdateQuantity={(id, q) =>
          setCartItems((prev) => prev.map((it) => (it.product.id === id ? { ...it, quantity: q } : it)))
        }
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((it) => it.product.id !== id))}
        activeCoupon={activeCoupon}
        onApplyCoupon={setActiveCoupon}
        shippingMethod={shippingMethod}
        onUpdateShipping={setShippingMethod}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Login Gate Modal - shown when guest tries to checkout */}
      <AnimatePresence>
        {showLoginGate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-left"
            >
              {/* Gold header */}
              <div className="bg-gradient-to-tr from-navy-950 to-navy-900 p-6 flex flex-col items-center gap-3 border-b border-gold-400/20">
                <div className="w-12 h-12 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-2xl flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-6 h-6 text-navy-950" />
                </div>
                <h2 className="font-display font-semibold text-sm text-gold-300 uppercase tracking-widest text-center">
                  Login Required
                </h2>
                <p className="text-[11px] text-navy-200 text-center font-light leading-relaxed max-w-xs">
                  You need a Meris account to place orders, track deliveries, and access your personal shopping history.
                </p>
              </div>

              {/* Actions */}
              <div className="p-5 space-y-3">
                <button
                  onClick={() => {
                    setShowLoginGate(false);
                    handleSwapView('account');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-display font-semibold text-xs tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20 cursor-pointer hover:from-gold-600 transition"
                >
                  <Key className="w-4 h-4" />
                  Sign In / Register Free
                </button>
                <button
                  onClick={() => {
                    setShowLoginGate(false);
                    setPendingCheckout(false);
                  }}
                  className="w-full py-3 border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 font-sans text-xs font-semibold uppercase tracking-wider rounded-2xl cursor-pointer transition"
                >
                  Continue Shopping
                </button>
                <p className="text-[10px] text-gray-400 text-center font-mono pt-1">
                  Free to join - No credit card required
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secret Admin Login Prompt Modal */}
      <AnimatePresence>
        {showAdminLoginPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-navy-900 border border-gold-400/20 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 sm:p-8 relative text-left"
            >
              <button
                onClick={() => {
                  setShowAdminLoginPrompt(false);
                  setAdminLoginError('');
                  setAdminLoginUser('');
                  setAdminLoginPass('');
                }}
                className="absolute top-4 right-4 p-2 text-navy-300 hover:text-white bg-white/5 border border-white/10 rounded-full cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1.5 pb-4 border-b border-white/5">
                <div className="w-12 h-12 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <Key className="text-navy-950 w-5 h-5 animate-pulse" />
                </div>
                <h2 className="font-display font-medium text-sm text-gold-300 uppercase tracking-widest pt-2">Secured Admin Login</h2>
                <p className="text-[10px] text-navy-200">Please enter credentials to initialize session keys.</p>
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
                  <label className="block text-[10px] font-mono text-navy-300 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    required
                    id="admin-user-input"
                    value={adminLoginUser}
                    onChange={(e) => setAdminLoginUser(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full px-3 py-2 bg-navy-800 border border-white/10 focus:outline-none focus:border-gold-400 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-navy-300 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    id="admin-pass-input"
                    value={adminLoginPass}
                    onChange={(e) => setAdminLoginPass(e.target.value)}
                    placeholder="--------"
                    className="w-full px-3 py-2 bg-navy-800 border border-white/10 focus:outline-none focus:border-gold-400 rounded-xl text-white"
                  />
                  <p className="text-[9px] text-navy-400 mt-1 font-mono">Hint: User 'admin' / Pass 'password' or 'admin123'</p>
                </div>

                {adminLoginError && (
                  <p className="text-[10px] text-red-400 text-center font-semibold font-mono">{adminLoginError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-tr from-gold-500 to-gold-400 text-navy-950 font-display font-semibold text-xs tracking-widest uppercase rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-navy-950" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-left"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-navy-950 bg-gray-50 border border-gray-100 rounded-full cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
                  <img src={quickViewProduct.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono text-gold-500 uppercase font-semibold">{quickViewProduct.category}</span>
                    <h3 className="font-display font-medium text-navy-900 leading-snug">{quickViewProduct.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono">SKU: {quickViewProduct.sku}</p>
                    <p className="text-xs text-gray-600 font-light mt-2 line-clamp-3">{quickViewProduct.shortDescription}</p>
                  </div>

                  <div className="flex items-baseline gap-2 pb-2">
                    <span className="text-lg font-bold text-navy-950 font-sans">
                      Rs.{quickViewProduct.discountPrice || quickViewProduct.price}
                    </span>
                    {quickViewProduct.discountPrice && (
                      <span className="text-[10px] text-gray-400 line-through font-mono">
                        Rs.{quickViewProduct.price}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        handleAddProductToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 py-2 px-4 bg-navy-900 text-white rounded-xl text-xs font-semibold uppercase hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer"
                    >
                      Add Bag
                    </button>
                    <button
                      onClick={() => {
                        handleViewProductDetails(quickViewProduct.id);
                        setQuickViewProduct(null);
                      }}
                      className="py-2 px-4 border border-gray-200 rounded-xl text-xs text-gray-700 hover:bg-gray-50 transition cursor-pointer"
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

      {/* Floating WhatsApp chat assis widget */}
      <WhatsAppChat />

      {/* Exit Intent Offer Popup */}
      <ExitIntentOffer onApplyCoupon={setActiveCoupon} />



      {/* Universal brand footer */}
      <footer className="bg-navy-950 text-white py-12 border-t border-gold-400/20 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
          
          <div className="space-y-3">
            <span className="font-display font-bold text-sm tracking-wider text-white uppercase">MERIS <span className="text-gold-400">E-SHOP</span></span>
            <p className="text-navy-200 leading-relaxed font-light">
              We engineer raw Indian woodcraft catalogs into luxury family experiences. Authentic block stencil systems, certified organic beeswax safety parameters.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-semibold text-xs text-gold-300 uppercase tracking-widest leading-none">Catalog Sections</h4>
            <div className="flex flex-col gap-1.5 font-light text-navy-200">
              <button onClick={() => handleSelectCategoryGroup('toys')} className="text-left hover:text-gold-400 transition cursor-pointer">Family Learning Stuff</button>
              <button onClick={() => handleSelectCategoryGroup('kolam')} className="text-left hover:text-gold-400 transition cursor-pointer">Indigenous Kolam Stencils</button>
              <button onClick={() => handleSelectCategoryGroup('bottles')} className="text-left hover:text-gold-400 transition cursor-pointer">Gifts and Return Bottles</button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-semibold text-xs text-gold-300 uppercase tracking-widest leading-none">Administrative Links</h4>
            <div className="flex flex-col gap-1.5 font-light text-navy-200">
              <button onClick={() => handleSwapView('account')} className="text-left hover:text-gold-400 transition cursor-pointer">Customer Account Login</button>
              <button onClick={() => handleSwapView('home')} className="text-left hover:text-gold-400 transition cursor-pointer">Shopping Storefront Homepage</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-xs text-gold-300 uppercase tracking-widest leading-none">Indian Headquarters</h4>
            <p className="text-navy-200 leading-relaxed font-light">
              5/339, Fathima Road,<br />
              nager, Azhagappapuram, Tamil Nadu 629401<br />
              Contact Desk: support@meris.com
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-navy-300 text-[10px] font-mono tracking-wider">
          <span>(c) 2026 MERIS E-SHOP STUDIOS - All Heritage Rights Reserved.</span>
          <span className="text-gold-500/80">Crafted lovingly under Indian Wooden Toys safety standard rule (ISO 8124)</span>
        </div>
      </footer>

    </div>
  );
}
