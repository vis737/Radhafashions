import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, Lock, Mail, Clipboard, Heart, Tag, RotateCcw, Compass, MapPin, Truck, AlertCircle, ShoppingCart, Check, Search, Package, Clock, ArrowRight, Download, X, Eye, EyeOff, Gift, ShieldCheck, MessageSquare, Smartphone, Copy, ExternalLink, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Product, Order, Coupon, CartItem } from '../types';
import { jsPDF } from 'jspdf';
import { getQrCodeUrl } from '../utils/qrCodeGenerator';
import MembershipDashboard from './MembershipDashboard';

import ProfileTab from './dashboard/ProfileTab';
import OrdersTab from './dashboard/OrdersTab';
import TrackingTab from './dashboard/TrackingTab';
import WishlistTab from './dashboard/WishlistTab';
import SupportTab from './dashboard/SupportTab';
import WalletTab from './dashboard/WalletTab';
import SecurityTab from './dashboard/SecurityTab';

import DOMPurify from 'dompurify';
import { generateInvoicePDF } from '../lib/invoiceGenerator';

interface AccountPanelProps {
  wishlistProducts: Product[];
  orders: Order[];
  coupons: Coupon[];
  currentUser: { email: string; name: string } | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  onMoveToCart: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
  onRequestRefund: (orderId: string, itemName: string, reason: string) => void;
  onSelectProduct: (productId: string) => void;
  onResubmitUpiDetails?: (orderId: string, txnId: string, screenshot: string) => void;
  products: Product[];
  rewardsEnabled?: boolean;
}

export default function AccountPanel({
  wishlistProducts,
  orders,
  coupons,
  currentUser,
  onLogin,
  onLogout,
  onMoveToCart,
  onRemoveFromWishlist,
  onRequestRefund,
  onSelectProduct,
  onResubmitUpiDetails,
  products,
  rewardsEnabled = true
}: AccountPanelProps) {
  // Login/Signup Inputs
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Age group helper for dynamic child profiles toy matching
  const isProductAgeFit = (product: Product, ageGroup: string): boolean => {
    let childMin = 0;
    let childMax = 99;
    
    if (ageGroup.includes('Months')) {
      if (ageGroup.includes('0–6')) { childMin = 0; childMax = 0.5; }
      else if (ageGroup.includes('6–12')) { childMin = 0.5; childMax = 1.0; }
    } else {
      const match = ageGroup.match(/(\d+)\s*–\s*(\d+)/) || ageGroup.match(/(\d+)\+/);
      if (match) {
        childMin = parseInt(match[1], 10);
        childMax = match[2] ? parseInt(match[2], 10) : 99;
      }
    }

    const prodMin = product.minimumAge !== undefined ? Number(product.minimumAge) : 0;
    const prodMax = product.maximumAge !== undefined ? Number(product.maximumAge) : 99;

    return (prodMin <= childMax) && (prodMax >= childMin);
  };
  const [password, setPassword] = useState('');

  // Google SSO States
  const [showGoogleSsoModal, setShowGoogleSsoModal] = useState(false);
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Authentication configuration: standard, email OTP, or Google SSO
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  // Spam rate limiting metrics
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Tab router inside account dashboard
  const [subTab, setSubTab] = useState<'profile' | 'orders' | 'tracking' | 'wishlist' | 'returns'>('profile');
  const [wishlistPrivacy, setWishlistPrivacy] = useState<'Public' | 'Private' | 'Friends'>('Public');
  const [copiedLink, setCopiedLink] = useState(false);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    if (currentUser) {
      setShippingName(currentUser.name);
    }
  }, [currentUser]);


  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('Standard');

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    sendOtpRequest();
  };

  const sendOtpRequest = () => {
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setOtpError('Please input a valid email address.');
      return;
    }

    setOtpError('');
    setOtpLoading(true);
    setOtpSuccessMessage('');
    setMockOtp('');

    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: otpEmail.trim() }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 429 && data.retryAfterSec) {
            setLockoutTime(Date.now() + data.retryAfterSec * 1000);
          }
          throw new Error(data?.error || 'Failed to dispatch email OTP');
        }
        setAuthStep('otp');
        setOtpSuccessMessage(data.message || 'OTP sent successfully.');
        setMockOtp(typeof data.mockOtp === 'string' ? data.mockOtp : '');
        setResendCooldown(60);
      })
      .catch((err) => {
        setOtpError(err.message || 'Error dispatching email OTP.');
      })
      .finally(() => setOtpLoading(false));
  };


  // Order Tracking states
  const [trackingInput, setTrackingInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState('');
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [isLiveConnection, setIsLiveConnection] = useState(false);
  const [copiedAWB, setCopiedAWB] = useState(false);

  // Return request states
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState<Order | null>(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<string>('');
  const [selectedReturnItem, setSelectedReturnItem] = useState<string>('');
  const [returnReason, setReturnReason] = useState('');
  const [returnSuccess, setReturnSuccess] = useState(false);

  // Secure rate limiting check function
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (lockoutTime && now < lockoutTime) {
      const remaining = Math.round((lockoutTime - now) / 1000);
      setRateLimitMessage(`Security lockout active. Too many attempts. Try again in ${remaining}s.`);
      return false;
    }
    setRateLimitMessage('');
    return true;
  };

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setRateLimitMessage('');
    
    // Check rate limit safety
    if (!checkRateLimit()) return;

    if (authMethod === 'password') {
      if (!email.trim() || !password.trim()) return;

      if (isSignUp) {
        // Enforce strong password validation
        const { evaluatePasswordStrength } = await import('../utils/passwordValidator');
        const validation = evaluatePasswordStrength(password);
        if (!validation.valid) {
          setPasswordErrors(validation.errors);
          setPasswordStrength(validation.strength);
          setShowPasswordValidation(true);
          setOtpError('Please satisfy all password strength requirements before proceeding.');
          return;
        }
        setPasswordErrors([]);
        setShowPasswordValidation(false);
      }

      const username = name.trim() || email.split('@')[0];

      // Save user to backend and dispatch confirmation email
      if (isSignUp) {
        try {
          const res = await fetch('/api/register-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), name: username, password })
          });
          const data = await res.json();
          if (!res.ok) {
            setOtpError(data.error || 'Failed to create account.');
            return;
          }
          // Account registered, call onLogin
          onLogin(email.trim(), username);
        } catch (err) {
          console.error('Registration failed:', err);
          setOtpError('Connection error during registration.');
          return;
        }
      } else {
        // Standard Sign In via secure backend
        try {
          const res = await fetch('/api/login-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password })
          });
          const data = await res.json();
          if (!res.ok) {
            setOtpError(data.error || 'Invalid credentials.');
            return;
          }
          // Account verified
          onLogin(data.customer.email, data.customer.name);
        } catch (err) {
          console.error('Login failed:', err);
          setOtpError('Connection error during sign in.');
          return;
        }
      }
    } else if (authMethod === 'otp') {
      if (authStep === 'email') {
        sendOtpRequest();
      } else {
        if (!otpCode.trim() || otpCode.length < 4) {
          setOtpError('Please enter the 4-digit verification code.');
          return;
        }

        setOtpLoading(true);
        setOtpError('');

        fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: otpEmail.trim(),
            code: otpCode,
          }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data?.error || 'Invalid passcode.');
            }
            onLogin(otpEmail.trim(), name.trim() || otpEmail.trim().split('@')[0]);
            setAuthStep('email');
            setOtpSuccessMessage('');
            setResendCooldown(0);
          })
          .catch((err) => {
            setOtpError(err.message || 'Invalid secure verification OTP.');
          })
          .finally(() => setOtpLoading(false));
      }
    }
  };

  const handleTriggerRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnOrder || !selectedReturnItem || !returnReason.trim()) return;

    onRequestRefund(selectedReturnOrder, selectedReturnItem, returnReason);

    setReturnReason('');
    setSelectedReturnItem('');
    setSelectedReturnOrder('');
    setReturnSuccess(true);
    setTimeout(() => setReturnSuccess(false), 4000);
  };

  const getCourierDetails = (order: Order) => {
    const numericId = order.id.replace(/[^0-9]/g, '') || '8294029';
    const shortNum = (parseInt(numericId, 10) % 900000) + 100000;
    const isExpress = order.shippingMethod === 'express';
    if (isExpress) {
      return {
        partner: 'BlueDart Express',
        awb: `BD-${shortNum}`,
        portalUrl: 'https://www.bluedart.com/',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        brandColor: '#FFCC00',
      };
    } else {
      return {
        partner: 'Delhivery Prime',
        awb: `DLV-${shortNum}`,
        portalUrl: 'https://www.delhivery.com/',
        color: 'bg-sky-50 text-sky-800 border-sky-200',
        brandColor: '#000000',
      };
    }
  };

  const getCourierLogs = (order: Order, courier: string) => {
    const logs = [];
    if (order.status === 'pending') {
      logs.push({
        time: 'Just now',
        title: 'Awaiting Handoff Prep',
        description: `Merchant packing team is preparing consignment items for pickup collection by ${courier}.`,
        status: 'pending'
      });
    } else if (order.status === 'processing') {
      logs.push({
        time: 'Today, 11:30 AM',
        title: 'Artisan Quality Check Cleared',
        description: 'Handcrafted premium items verified, packaged securely, and weight stamped in Meris ledger.',
        status: 'success'
      });
      logs.push({
        time: 'Yesterday',
        title: 'Shipment Created',
        description: `Consignment booked & shipping label queued. Request dispatch dispatched to ${courier}.`,
        status: 'success'
      });
    } else if (order.status === 'shipped') {
      logs.push({
        time: 'Today, 10:20 AM',
        title: 'In Transit',
        description: `Consignment departed regional sorting hub. Transiting to destination hub facility.`,
        status: 'active'
      });
      logs.push({
        time: 'Yesterday, 04:30 PM',
        title: `Collected by ${courier}`,
        description: `Successfully collected from Meris Studio warehouse (Tamil Nadu). Sorted and checked at main partner depot.`,
        status: 'success'
      });
    } else if (order.status === 'delivered') {
      logs.push({
        time: 'Today, 03:40 PM',
        title: 'Delivered',
        description: 'Artisanal item successfully handed over and signed by recipient customer.',
        status: 'success'
      });
      logs.push({
        time: 'Today, 09:15 AM',
        title: 'Out for Delivery',
        description: `Parcel assigned to last-mile delivery agent. Contactless handoff active.`,
        status: 'success'
      });
      logs.push({
        time: 'Yesterday, 11:30 AM',
        title: 'Arrived at Destination Sorting Depot',
        description: 'Cargo received and checked at distribution sorting facility nearest to delivery address.',
        status: 'success'
      });
      logs.push({
        time: '2 Days Ago',
        title: `Departed Chennai Air Cargo Hub`,
        description: `Package left Chennai regional warehouse center, cleared cargo scan.`,
        status: 'success'
      });
    } else if (order.status === 'cancelled') {
      logs.push({
        time: 'Recently',
        title: 'Delivery Aborted',
        description: 'Transaction sequence terminated. Return-to-sender registered with courier.',
        status: 'cancelled'
      });
    }
    return logs;
  };

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const handleTrackOrderSearch = async (e?: React.FormEvent, customNo?: string) => {
    if (e) e.preventDefault();
    const query = (customNo || trackingInput).trim().toUpperCase();
    if (!query) {
      setTrackingError('Please enter a valid order number.');
      setSearchedOrder(null);
      setIsLiveConnection(false);
      return;
    }

    setIsTrackingLoading(true);
    setTrackingError('');

    try {
      const res = await fetch(`/api/orders/${query}`);
      if (res.ok) {
        const backendOrder = await res.json();
        setSearchedOrder(backendOrder);
        setIsLiveConnection(true);
        if (customNo) {
          setTrackingInput(customNo);
        }
      } else {
        const localFound = orders.find(
          (o) => o.orderNumber.toUpperCase() === query || o.id.toUpperCase() === query
        );
        if (localFound) {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localFound)
          });
          setSearchedOrder(localFound);
          setIsLiveConnection(true);
          if (customNo) {
            setTrackingInput(customNo);
          }
        } else {
          setSearchedOrder(null);
          setIsLiveConnection(false);
          setTrackingError(`No active order found with order number "${query}". Please verify and try again.`);
        }
      }
    } catch (err) {
      console.error('Error tracking order from database:', err);
      const localFound = orders.find(
        (o) => o.orderNumber.toUpperCase() === query || o.id.toUpperCase() === query
      );
      if (localFound) {
        setSearchedOrder(localFound);
        setIsLiveConnection(false);
        if (customNo) {
          setTrackingInput(customNo);
        }
      } else {
        setSearchedOrder(null);
        setIsLiveConnection(false);
        setTrackingError('Unable to connect to the tracking server. Please check your network and try again.');
      }
    } finally {
      setIsTrackingLoading(false);
    }
  };


  // Real-time order tracking polling from backend database
  useEffect(() => {
    if (subTab !== 'tracking' || !searchedOrder) return;
    if (searchedOrder.status === 'delivered' || searchedOrder.status === 'cancelled') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${searchedOrder.orderNumber}`);
        if (res.ok) {
          const updatedOrder = await res.json();
          setSearchedOrder(updatedOrder);
          setIsLiveConnection(true);
        }
      } catch (err) {
        console.error('Error polling order tracking updates:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [subTab, searchedOrder?.orderNumber, searchedOrder?.status]);

  // --- Render Authentication Gate ---
  if (!currentUser) {
    return (
      <>
        <div className="max-w-md mx-auto py-12 px-4 font-sans text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-navy-800 shadow-2xl space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-300 rounded-2xl flex items-center justify-center mx-auto shadow-md animate-pulse">
                <User className="text-navy-950 w-6 h-6" />
              </div>
              <h2 className="font-display font-medium text-lg text-navy-900 dark:text-navy-50 uppercase tracking-widest pt-2">
                {isSignUp ? 'Enroll New Account' : 'Secure Member Gate'}
              </h2>
              <p className="text-xs text-gray-400">Secure OTP & Password validation</p>
            </div>

            {rateLimitMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rateLimitMessage}</span>
              </div>
            )}

            {/* Secure Method Switch Tabs */}
            {!isSignUp && (
              <div className="flex gap-2 p-1 bg-gray-50 dark:bg-navy-950 rounded-xl border border-gray-200/50">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('password'); setOtpError(''); setRateLimitMessage(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer text-center ${authMethod === 'password' ? 'bg-white dark:bg-navy-800 text-gold-500 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-navy-900 font-normal'}`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setOtpError(''); setRateLimitMessage(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer text-center ${authMethod === 'otp' ? 'bg-white dark:bg-navy-800 text-gold-500 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-navy-900 font-normal'}`}
                >
                  Email OTP Safe
                </button>
              </div>
            )}

            {authMethod === 'password' || isSignUp ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {otpError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Charan Kumar"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Email Coordinates</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (isSignUp) {
                          import('../utils/passwordValidator').then(({ evaluatePasswordStrength }) => {
                            const validation = evaluatePasswordStrength(e.target.value);
                            setPasswordErrors(validation.errors);
                            setPasswordStrength(validation.strength);
                            setShowPasswordValidation(true);
                          });
                        }
                      }}
                      placeholder="--------"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gold-500 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {isSignUp && showPasswordValidation && (
                    <div className="mt-2 p-2.5 bg-navy-950/40 border border-gray-200 dark:border-navy-800 rounded-xl space-y-2 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="font-mono uppercase text-[9px] text-[#C5A021] font-bold">Password Strength</span>
                        <span className={`font-bold text-[10px] ${passwordStrength === 'Strong' ? 'text-emerald-500' : passwordStrength === 'Medium' ? 'text-amber-500' : 'text-red-500'}`}>{passwordStrength}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 dark:bg-navy-900 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${passwordStrength === 'Strong' ? 'w-full bg-emerald-500' : passwordStrength === 'Medium' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-red-500'}`} />
                      </div>
                      
                      {passwordErrors.length > 0 ? (
                        <ul className="list-disc pl-3 text-red-500 space-y-0.5 mt-2">
                          {passwordErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-emerald-500 font-bold flex items-center gap-1 mt-2">
                          <Check className="w-3.5 h-3.5" /> Password meets all security criteria
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!!rateLimitMessage || (isSignUp && passwordErrors.length > 0)}
                  className="w-full py-3 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-navy-950 font-display font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-navy-950" />
                  <span>{isSignUp ? 'Sign Up' : 'Sign In Now'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setOtpError('');
                      setRateLimitMessage('');
                      setPasswordErrors([]);
                      setShowPasswordValidation(false);
                    }}
                    className="text-[11px] text-gray-500 hover:text-gold-600 font-medium transition cursor-pointer"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                  </button>
                </div>
              </form>
            ) : (
              <form id="otp-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
                {otpError && (
                  <div className="text-red-500 text-[11px] font-medium leading-tight">
                    Warning {otpError}
                  </div>
                )}

                {authStep === 'email' ? (
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="e.g. customer@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 dark:text-white"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">Verify with a one-time passcode sent by email</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-navy-950 border border-amber-200 dark:border-navy-800 rounded-xl text-[11.5px] text-amber-700 dark:text-gold-300 font-sans leading-relaxed text-left">
                      Secure passcode dispatched to <strong className="font-mono text-xs">{otpEmail}</strong>.
                      <span className="text-emerald-500">
                        {otpSuccessMessage}
                      </span>
                      {mockOtp && (
                        <span className="block mt-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          Testing OTP: {mockOtp}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Enter 4-Digit OTP Code</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 1234"
                          disabled={otpLoading}
                          className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-widest text-center border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 dark:text-white disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!!rateLimitMessage || otpLoading}
                  className="w-full py-3 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-navy-950 font-display font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-navy-950" />
                  <span>
                    {otpLoading
                      ? 'Please wait...'
                      : authStep === 'otp'
                        ? 'Confirm Secure Access'
                        : 'Send Email Passcode'}
                  </span>
                </button>

                {authStep === 'otp' && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || otpLoading}
                      className="w-full text-center text-[10px] text-gold-600 hover:text-gold-700 underline font-mono cursor-pointer disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setOtpError('');
                        setOtpSuccessMessage('');
                        setResendCooldown(0);
                        setAuthStep('email');
                      }}
                      className="w-full text-center text-[10px] text-gray-400 hover:text-navy-900 underline font-mono cursor-pointer"
                    >
                      Change email address
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  // --- Render Logged-In User Dashboard ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Navigation panel Menu */}
        <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center text-navy-950 font-bold font-display text-lg shadow-md">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-display font-semibold text-xs text-navy-900 tracking-wide">{currentUser.name}</h3>
              <span className="text-[9px] font-mono text-gray-400">{currentUser.email}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-4 font-sans">
            {([
              { id: 'profile', label: 'My Profile', icon: MapPin },
              { id: 'orders', label: 'Purchase Ledger', icon: Clipboard, badge: orders.length },
              { id: 'tracking', label: 'Order Tracking', icon: Truck },
              { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, badge: wishlistProducts.length },
              { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw }
            ] as any[]).map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className={`py-2.5 px-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${subTab === tab.id ? 'bg-gold-50 text-gold-600 border-l-4 border-gold-400 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <TabIcon className="w-4 h-4 text-gold-400" />
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] text-gray-600 font-bold font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 font-display font-medium text-xs uppercase tracking-widest transition cursor-pointer text-center"
          >
            Logout Profile
          </button>
        </div>

        {/* Right Columns details routers */}
        <div className="md:col-span-9 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_10px_40px_rgb(0,0,0,0.015)] text-left min-h-[24rem]">
          <AnimatePresence mode="wait">
            {subTab === 'profile' && (
              <ProfileTab
                currentUser={currentUser!}
                orders={orders}
                setSubTab={setSubTab}
                isEditingAddress={isEditingAddress}
                setIsEditingAddress={setIsEditingAddress}
                shippingName={shippingName}
                setShippingName={setShippingName}
                shippingPhone={shippingPhone}
                setShippingPhone={setShippingPhone}
                shippingAddress={shippingAddress}
                setShippingAddress={setShippingAddress}
                shippingCity={shippingCity}
                setShippingCity={setShippingCity}
                shippingPincode={shippingPincode}
                setShippingPincode={setShippingPincode}
                shippingCarrier={shippingCarrier}
                setShippingCarrier={setShippingCarrier}
              />
            )}

            {subTab === 'orders' && (
              <OrdersTab
                orders={orders}
                setSubTab={setSubTab}
                setTrackingInput={setTrackingInput}
                setSearchedOrder={setSearchedOrder}
                setTrackingError={setTrackingError}
                setSelectedDetailsOrder={setSelectedDetailsOrder}
                onResubmitUpiDetails={onResubmitUpiDetails}
              />
            )}

            {subTab === 'tracking' && (
              <TrackingTab
                orders={orders}
                searchedOrder={searchedOrder}
                trackingInput={trackingInput}
                setTrackingInput={setTrackingInput}
                setSearchedOrder={setSearchedOrder}
                trackingError={trackingError}
                setTrackingError={setTrackingError}
                isLiveConnection={isLiveConnection}
                setIsLiveConnection={setIsLiveConnection}
                isTrackingLoading={isTrackingLoading}
                setIsTrackingLoading={setIsTrackingLoading}
                generateInvoicePDF={generateInvoicePDF}
              />
            )}

            {subTab === 'wishlist' && (
              <WishlistTab
                wishlistProducts={wishlistProducts}
                onSelectProduct={onSelectProduct}
                onRemoveFromWishlist={onRemoveFromWishlist}
                onMoveToCart={onMoveToCart}
                wishlistPrivacy={wishlistPrivacy}
                setWishlistPrivacy={setWishlistPrivacy}
                copiedLink={copiedLink}
                setCopiedLink={setCopiedLink}
              />
            )}

            {subTab === 'returns' && (
              <SupportTab
                orders={orders}
                onRequestRefund={onRequestRefund}
              />
            )}

</AnimatePresence>
        </div>
      </div>
    </div>
  );
}
