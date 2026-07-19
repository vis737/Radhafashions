import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, Lock, Mail, Clipboard, Heart, Tag, RotateCcw, Compass, MapPin, Truck, AlertCircle, ShoppingCart, Check, Search, Package, Clock, ArrowRight, Download, X, Eye, Gift, ShieldCheck, MessageSquare, Smartphone, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { Product, Order, Coupon, CartItem } from '../types';
import { jsPDF } from 'jspdf';
import { getQrCodeUrl } from '../utils/qrCodeGenerator';
import MembershipDashboard from './MembershipDashboard';
import DOMPurify from 'dompurify';

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
  onResubmitUpiDetails
}: AccountPanelProps) {
  // Login/Signup Inputs
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Simulated Google SSO States
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
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  // Spam rate limiting metrics
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Tab router inside account dashboard
  const [subTab, setSubTab] = useState<'profile' | 'orders' | 'tracking' | 'wishlist' | 'coupons' | 'returns' | 'emails' | 'whatsapp'>('profile');
  const [wishlistPrivacy, setWishlistPrivacy] = useState<'Public' | 'Private' | 'Friends'>('Public');
  const [copiedLink, setCopiedLink] = useState(false);

  // Email Notification States
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [whatsappAlerts, setWhatsappAlerts] = useState<any[]>([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState<any | null>(null);

  // Poll simulated booking emails
  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const [emailRes, whatsappRes] = await Promise.all([
          fetch(`/api/emails?recipient=${encodeURIComponent(currentUser.email)}`),
          fetch(`/api/whatsapp?recipient=${encodeURIComponent(currentUser.email)}`)
        ]);

        if (emailRes.ok) setEmails(await emailRes.json());
        if (whatsappRes.ok) setWhatsappAlerts(await whatsappRes.json());
      } catch (err) {
        console.error('Error fetching account notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser, subTab]);

  // Auto-select first email in list if none selected
  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0]);
    }
  }, [emails, selectedEmail]);

  useEffect(() => {
    if (whatsappAlerts.length > 0 && !selectedWhatsapp) {
      setSelectedWhatsapp(whatsappAlerts[0]);
    }
  }, [whatsappAlerts, selectedWhatsapp]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = () => {
    if (resendCooldown > 0 || otpLoading) return;
    sendOtpRequest();
  };

  const sendOtpRequest = () => {
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setOtpError('Please input a valid email address.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    setOtpSuccessMessage('');

    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: otpEmail.trim() }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to dispatch email OTP');
        }
        setOtpSent(true);
        setOtpCode('');
        if (data.mockOtp) {
          setMockOtp(data.mockOtp);
          setOtpSuccessMessage(`Sandbox mode: use code ${data.mockOtp} (SMTP not configured).`);
        } else {
          setMockOtp('');
          setOtpSuccessMessage(`Verification code sent to ${otpEmail.trim()}.`);
        }
        setResendCooldown(60);
      })
      .catch((err) => {
        setOtpError(err.message || 'Error dispatching email OTP.');
        setOtpSent(false);
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
      setRateLimitMessage(`Security Security lockout active. Too many attempts. Try again in ${remaining}s.`);
      return false;
    }
    
    setSubmitAttempts(prev => {
      const next = prev + 1;
      if (next >= 4) {
        setLockoutTime(Date.now() + 25000); // 25s lockout
        setRateLimitMessage("Security Security lockout active. Too many attempts. Try again in 25 seconds.");
        return 0;
      }
      setRateLimitMessage('');
      return next;
    });
    return true;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit safety
    if (!checkRateLimit()) return;

    if (authMethod === 'password') {
      if (!email.trim() || !password.trim()) return;
      const username = name.trim() || email.split('@')[0];
      onLogin(email, username);
    } else if (authMethod === 'otp') {
      if (!otpSent) {
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
            setOtpSent(false);
            setOtpCode('');
            setMockOtp('');
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

  const handleGoogleSsoLogin = () => {
    if (!checkRateLimit()) return;
    setShowCustomGoogleForm(false);
    setCustomGoogleEmail('');
    setCustomGoogleName('');
    setShowGoogleSsoModal(true);
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

  const handleForceAdvanceStatus = async () => {
    if (!searchedOrder) return;
    const nextStatusMap: Record<string, string> = {
      'pending': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered',
      'delivered': 'pending'
    };
    const nextStatus = nextStatusMap[searchedOrder.status] || 'pending';
    
    try {
      setIsTrackingLoading(true);
      const res = await fetch(`/api/orders/${searchedOrder.orderNumber}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSearchedOrder(data.order);
          setIsLiveConnection(true);
        }
      }
    } catch (err) {
      console.error('Error forcing status advance:', err);
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
              <p className="text-xs text-gray-400">Secure OTP, Password & Google SSO validation</p>
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
                  onClick={() => { setAuthMethod('password'); setOtpError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer text-center ${authMethod === 'password' ? 'bg-white dark:bg-navy-800 text-gold-500 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-navy-900 font-normal'}`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setOtpError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer text-center ${authMethod === 'otp' ? 'bg-white dark:bg-navy-800 text-gold-500 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-navy-900 font-normal'}`}
                >
                  Email OTP Safe
                </button>
              </div>
            )}

            {authMethod === 'password' || isSignUp ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="--------"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!!rateLimitMessage}
                  className="w-full py-3 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-navy-950 font-display font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-navy-950" />
                  <span>{isSignUp ? 'Sign Up' : 'Sign In Now'}</span>
                </button>
              </form>
            ) : (
              <form id="otp-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
                {otpError && (
                  <div className="text-red-500 text-[11px] font-medium leading-tight">
                    Warning {otpError}
                  </div>
                )}
                {otpSuccessMessage && (
                  <div className="text-emerald-600 text-[11px] font-medium leading-tight">
                    {otpSuccessMessage}
                  </div>
                )}

                {!otpSent ? (
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
                        disabled={otpLoading}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 dark:text-white disabled:opacity-60"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">Verify with a one-time passcode sent by email</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-navy-950 border border-amber-200 dark:border-navy-800 rounded-xl text-[11.5px] text-amber-700 dark:text-gold-300 font-sans leading-relaxed text-left">
                      Secure passcode dispatched to <strong className="font-mono text-xs">{otpEmail}</strong>.
                      {mockOtp ? (
                        <span> Type <strong className="font-mono text-xs">{mockOtp}</strong> below (sandbox mode).</span>
                      ) : (
                        <span> Enter the 4-digit code sent to your email inbox.</span>
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
                          placeholder={mockOtp ? `e.g. ${mockOtp}` : "e.g. 1234"}
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
                      : otpSent
                        ? 'Confirm Secure Access'
                        : 'Send Email Passcode'}
                  </span>
                </button>

                {otpSent && (
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
                        setOtpSent(false);
                        setOtpCode('');
                        setOtpError('');
                        setOtpSuccessMessage('');
                        setMockOtp('');
                        setResendCooldown(0);
                      }}
                      className="w-full text-center text-[10px] text-gray-400 hover:text-navy-900 underline font-mono cursor-pointer"
                    >
                      Change email address
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Secure Google Authentication Section */}
            {!isSignUp && (
              <div className="space-y-3 pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-100 dark:border-navy-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono text-gray-300 dark:text-navy-700 uppercase tracking-widest">Or Single Sign-On</span>
                  <div className="flex-grow border-t border-gray-100 dark:border-navy-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSsoLogin}
                  disabled={!!rateLimitMessage}
                  className="w-full py-2.5 bg-white dark:bg-navy-950 border border-gray-200 dark:border-navy-800 hover:bg-gray-50 text-gray-700 dark:text-gray-100 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:border-gray-300 active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.4 15 0 12 0 7.4 0 3.4 2.6 1.4 6.6l3.9 3c1-2.9 3.7-4.56 6.7-4.56z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.5l3.7 2.9c2.2-2 3.7-5 3.7-8.5z" />
                    <path fill="#34A853" d="M12 24c3.2 0 6-.1 8-2.9l-3.7-2.9c-1.1.8-2.6 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.9 3c2 4 6 6.6 10.6 6.6z" />
                    <path fill="#FBBC05" d="M5.4 14.4c-.2-.6-.4-1.3-.4-2s.2-1.4.4-2l-3.9-3C.6 9.4 0 10.6 0 12s.6 2.6 1.5 4.6l3.9-3l1.5.8z" />
                  </svg>
                  <span>Authorize with Google SSO</span>
                </button>
              </div>
            )}

            <div className="text-center pt-2 border-t border-gray-50 dark:border-navy-800 text-xs">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-gold-500 hover:text-gold-600 font-medium tracking-wide"
              >
                {isSignUp ? 'Already member? Sign In' : 'First time traveler? Register Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Google SSO Simulated Account Chooser Modal */}
        <AnimatePresence>
          {showGoogleSsoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 border border-slate-100 relative text-center"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowGoogleSsoModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer animate-none"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Google Colored Logo */}
                <svg className="w-8 h-8 mx-auto mb-4 mt-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>

                {!showCustomGoogleForm ? (
                  <>
                    <h3 className="text-xl font-sans font-medium text-slate-800 leading-tight">
                      Choose an account
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-6">
                      to continue to <span className="font-semibold text-slate-800">Meris E-Shop</span>
                    </p>

                    <div className="space-y-2 text-left max-h-72 overflow-y-auto pr-1">
                      {/* Account 1: Vishnu */}
                      <button
                        onClick={() => {
                          onLogin('vishnu@gmail.com', 'Vishnu');
                          setShowGoogleSsoModal(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 border border-slate-100/50 hover:border-slate-200 transition duration-150 text-left cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 text-blue-600 font-bold font-sans flex items-center justify-center shrink-0">
                          V
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">Vishnu</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">vishnu@gmail.com</p>
                        </div>
                      </button>

                      {/* Account 2: Google Traveler */}
                      <button
                        onClick={() => {
                          onLogin('google.traveler@gmail.com', 'Google Traveler');
                          setShowGoogleSsoModal(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 border border-slate-100/50 hover:border-slate-200 transition duration-150 text-left cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600 font-bold font-sans flex items-center justify-center shrink-0">
                          G
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">Google Traveler</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">google.traveler@gmail.com</p>
                        </div>
                      </button>

                      {/* Use another account */}
                      <button
                        onClick={() => setShowCustomGoogleForm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 border border-slate-100/50 hover:border-slate-200 transition duration-150 text-left cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-500 font-bold font-sans flex items-center justify-center shrink-0">
                          +
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">Use another account</p>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-sans font-medium text-slate-800 leading-tight">
                      Sign in with Google
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-6">
                      Enter your Google account credentials
                    </p>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!customGoogleEmail.trim() || !customGoogleName.trim()) return;
                        onLogin(customGoogleEmail.trim(), customGoogleName.trim());
                        setShowGoogleSsoModal(false);
                      }}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={customGoogleName}
                          onChange={(e) => setCustomGoogleName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1">Email address</label>
                        <input
                          type="email"
                          required
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="e.g. user@gmail.com"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white text-slate-900"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCustomGoogleForm(false)}
                          className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer text-center"
                        >
                          Next
                        </button>
                      </div>
                    </form>
                  </>
                )}

                <div className="border-t border-slate-100 mt-6 pt-4 text-[9px] text-slate-400 leading-relaxed text-left">
                  To keep your account secure, this sandbox simulates Google's OAuth 2.0 sign-in flow. Your selections remain purely local to your device.
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-4">
            {([
              { id: 'profile', label: 'My Profile', icon: MapPin },
              { id: 'orders', label: 'Purchase Ledger', icon: Clipboard, badge: orders.length },
              { id: 'tracking', label: 'Order Tracking', icon: Truck },
              { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, badge: wishlistProducts.length },
              { id: 'coupons', label: 'Available Coupons', icon: Tag, badge: coupons.length },
              { id: 'emails', label: 'Email Notifications', icon: Mail, badge: emails.length },
              { id: 'whatsapp', label: 'WhatsApp Alerts', icon: Smartphone, badge: whatsappAlerts.length },
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
            
            {/* User credentials details */}
            {subTab === 'profile' && (() => {
              const mockMembership: any = {
                level: orders.length >= 5 ? 'Platinum' : orders.length >= 3 ? 'Gold' : orders.length >= 1 ? 'Silver' : 'Bronze',
                loyaltyPoints: orders.length * 150 + 50,
                lifetimeSavings: orders.length * 120,
                joinDate: '2026-02-15',
                expiryDate: '2027-02-15',
                history: [
                  { date: '2026-02-15', action: 'Welcome Bonus Points Approved', points: 50 },
                  ...orders.map(o => ({
                    date: o.date,
                    action: `Purchase Points #${o.orderNumber}`,
                    points: 150
                  }))
                ]
              };
              
              return (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6 animate-fade-in"
                >
                  <MembershipDashboard membership={mockMembership} />

                  <div>
                    <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Membership Coordinates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                    <div className="p-4 rounded-xl bg-gray-50 border">
                      <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">GUEST ID</span>
                      <span className="font-bold font-mono text-navy-950 mt-1 block">MR-MBR-2026-X839</span>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border">
                      <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">STATUS STATUS</span>
                      <span className="font-bold text-emerald-600 tracking-wide mt-1 block flex items-center gap-1">Verified ACTIVE MEMBER</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Saved Shipping Address</h3>
                  <div className="p-4 rounded-xl bg-gray-50 border mt-4 text-xs font-light leading-relaxed max-w-md">
                    <p className="font-semibold text-navy-900">{currentUser.name}</p>
                    <p className="mt-1">5/339, Fathima Road, nager</p>
                    <p>Azhagappapuram, Tamil Nadu, 629401</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-2">Preferred air deliveries via BlueDart Express</p>
                  </div>
                </div>
                </motion.div>
              );
            })()}

            {/* Purchase ledger tracking milestones */}
            {subTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Your Orders Ledger</h3>
                
                {orders.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <Clipboard className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-500">You have no recorded purchases yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2 text-xs">
                          <div className="text-left font-sans">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-navy-950 font-mono">ID: {ord.orderNumber}</span>
                              <button
                                onClick={() => {
                                  setTrackingInput(ord.orderNumber);
                                  setSearchedOrder(ord);
                                  setTrackingError('');
                                  setSubTab('tracking');
                                }}
                                className="px-2 py-0.5 bg-gold-50 hover:bg-gold-100 text-gold-700 hover:text-gold-800 transition rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Track Live</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedDetailsOrder(ord);
                                }}
                                className="px-2 py-0.5 bg-navy-50 hover:bg-navy-100 text-navy-700 hover:text-navy-800 transition rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-navy-500" />
                                <span>Order Details</span>
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">Purchased on {ord.date}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {ord.paymentMethod === 'UPI QR Payment' && (
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                                ord.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-255' :
                                ord.paymentStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-255 animate-pulse' :
                                'bg-amber-50 text-amber-600 border-amber-255'
                              }`}>
                                {ord.paymentStatus === 'paid' ? 'Payment Approved' :
                                 ord.paymentStatus === 'rejected' ? 'Payment Rejected' :
                                 'Payment Pending Verification'}
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : ord.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-gold-50 text-gold-600'}`}>
                              {ord.status}
                            </span>
                            <span className="font-mono font-bold text-navy-950 text-xs">Total: Rs.{ord.total}</span>
                          </div>
                        </div>

                        {ord.paymentMethod === 'UPI QR Payment' && ord.paymentStatus === 'rejected' && (
                          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-left space-y-2 font-sans">
                            <p className="text-red-800 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" /> UPI Payment Verification Failed
                            </p>
                            <p className="text-red-700">Reason: {ord.upiRejectionReason || 'No reason specified by administration.'}</p>
                            
                            <form 
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const txnInput = form.elements.namedItem('txnId') as HTMLInputElement;
                                const fileInput = form.elements.namedItem('screenshot') as HTMLInputElement;
                                const txnId = txnInput.value.trim();
                                
                                if (!txnId) {
                                  alert("Please enter your UPI transaction ID.");
                                  return;
                                }

                                let screenshotUrl = ord.upiScreenshot || '';
                                if (fileInput.files?.[0]) {
                                  const file = fileInput.files[0];
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("Maximum screenshot size is 5 MB.");
                                    return;
                                  }
                                  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                  if (!allowed.includes(file.type)) {
                                    alert("Only JPG, JPEG, PNG, and WEBP formats are allowed.");
                                    return;
                                  }
                                  
                                  const reader = new FileReader();
                                  screenshotUrl = await new Promise((resolve) => {
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.readAsDataURL(file);
                                  });
                                }

                                if (onResubmitUpiDetails) {
                                  onResubmitUpiDetails(ord.id, txnId, screenshotUrl);
                                  alert("UPI details resubmitted successfully. Pending administrative validation.");
                                }
                              }}
                              className="space-y-3.5 pt-2"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] text-gray-500 font-mono mb-0.5">New Transaction ID / Ref No.</label>
                                  <input type="text" name="txnId" required defaultValue={ord.upiTxnId} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white" />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-gray-500 font-mono mb-0.5">New Screenshot (Optional)</label>
                                  <input type="file" name="screenshot" accept="image/jpeg,image/jpg,image/png,image/webp" className="w-full text-[10px]" />
                                </div>
                              </div>
                              <button type="submit" className="px-4 py-2 bg-navy-950 hover:bg-[#C5A021] text-white hover:text-navy-950 rounded-xl font-bold uppercase transition cursor-pointer">
                                Resubmit Payment Details
                              </button>
                            </form>
                          </div>
                        )}

                        {/* tracking milestone */}
                        <div className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gold-400 shrink-0" />
                            <span className="text-gray-600 font-light">Status tracking:</span>
                          </div>
                          <div className="flex-1 max-w-xs grid grid-cols-4 text-center text-[9px] font-semibold text-gray-400 gap-1 select-none">
                            <span className={ord.status !== 'cancelled' ? 'text-gold-500' : ''}>Polishing</span>
                            <span className={ord.status === 'processing' || ord.status === 'shipped' || ord.status === 'delivered' ? 'text-gold-500' : ''}>Routed</span>
                            <span className={ord.status === 'shipped' || ord.status === 'delivered' ? 'text-gold-500' : ''}>Shipped</span>
                            <span className={ord.status === 'delivered' ? 'text-emerald-500 font-bold animate-pulse' : ''}>Delivered</span>
                          </div>
                        </div>

                        {/* order items summary */}
                        <div className="space-y-2 text-xs">
                          {ord.items.map((it) => (
                            <div key={it.product.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                              <span className="font-semibold text-gray-700">{it.product.name} (x{it.quantity})</span>
                              <span className="text-gray-400 font-mono">Rs.{(it.product.discountPrice || it.product.price) * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Order Tracking Feature Workspace */}
            {subTab === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Order Verification & Tracking</h3>
                  <p className="text-xs text-gray-400 mt-2">
                    Enter the order code or select from your active order list below to check the real-time package milestones.
                  </p>
                </div>

                {/* Tracking Query Form */}
                <form
                  onSubmit={(e) => handleTrackOrderSearch(e)}
                  className="flex gap-2 max-w-md bg-gray-50 p-1.5 rounded-2xl border"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 shrink-0" />
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="e.g. MR-123456-789"
                      className="w-full bg-transparent pl-9 pr-3 py-2 text-xs focus:outline-none font-mono uppercase tracking-wider text-navy-950 font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    Track Status
                  </button>
                </form>

                {/* Error Banner */}
                {trackingError && (
                  <div className="p-4 bg-red-50 text-red-800 text-xs border border-red-100 rounded-xl flex items-center gap-2 max-w-md">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p>{trackingError}</p>
                  </div>
                )}

                {/* Quick select history helpers */}
                {orders.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Your Active Order Codes</p>
                    <div className="flex flex-wrap gap-2">
                      {orders.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => handleTrackOrderSearch(undefined, o.orderNumber)}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            searchedOrder?.id === o.id
                              ? 'bg-gold-50 border-gold-400 text-gold-700 font-bold shadow-sm'
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5 text-gold-400" />
                          <span>{o.orderNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Status Timeline */}
                {searchedOrder ? (
                  <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-6">
                    {/* Header meta */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 p-4 rounded-xl gap-4 border border-dashed">
                      <div className="text-left font-sans">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono text-gray-400 uppercase">CURRENT ORDER</span>
                          {isLiveConnection ? (
                            <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 animate-pulse">
                              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                              LIVE REMOTE DB
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                              LOCAL CACHE
                            </span>
                          )}
                        </div>
                        <h4 className="font-mono text-xs font-bold text-navy-950 uppercase">{searchedOrder.orderNumber}</h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Purchased on {searchedOrder.date}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right font-sans shrink-0">
                          <span className="text-[10px] font-mono text-gray-400 block">BILLING AMOUNT</span>
                          <h4 className="text-xs font-bold text-navy-950">Rs.{searchedOrder.total}</h4>
                          <span className="text-[10px] font-mono text-gray-400 mt-0.5 block">
                            Method: {searchedOrder.paymentMethod}
                          </span>
                        </div>
                        <button
                          onClick={() => generateInvoicePDF(searchedOrder)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 hover:text-navy-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                          title="Generate high-resolution printable invoice with line items, tax, and shipping breakdowns"
                        >
                          <Download className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                          <span>Download Invoice</span>
                        </button>
                      </div>
                    </div>

                    {/* High-Fidelity Visual Progress Bar */}
                    <div className="p-5 bg-navy-950 text-white rounded-2xl md:p-6 space-y-4 shadow-md select-none border border-navy-900">
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-gold-400 uppercase font-semibold">
                        <span className="flex items-center gap-1.5">
                          Live Status Pulse
                          {isTrackingLoading && (
                            <span className="animate-spin text-gold-400 text-[10px]">...</span>
                          )}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-800 text-white">
                          {searchedOrder.status === 'cancelled' ? 'CANCELLED' : searchedOrder.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="relative">
                        {/* Empty background track */}
                        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-navy-900/80 rounded-full -translate-y-1/2" />
                        
                        {/* Filled colored track with Progressive Motion */}
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{
                            width: 
                              searchedOrder.status === 'cancelled' ? '100%' :
                              searchedOrder.status === 'pending' ? '15%' :
                              searchedOrder.status === 'processing' ? '45%' :
                              searchedOrder.status === 'shipped' ? '75%' :
                              searchedOrder.status === 'delivered' ? '100%' : '0%'
                          }}
                          transition={{ type: 'tween', duration: 1.6, ease: 'easeOut', delay: 0.2 }}
                          className={`absolute top-1/2 left-0 h-1.5 rounded-full -translate-y-1/2 transition-colors duration-300 ${
                            searchedOrder.status === 'cancelled' 
                              ? 'bg-red-500' 
                              : 'bg-gradient-to-r from-gold-500 via-gold-400 to-emerald-500'
                          }`}
                        />

                        {/* Timeline Nodes */}
                        <div className="relative flex justify-between items-center z-10">
                          {/* Node 1: Placed */}
                          <div className="flex flex-col items-center">
                            <motion.div 
                              className="relative"
                              animate={searchedOrder.status !== 'cancelled' ? {
                                scale: [1, 1.1, 1],
                              } : {}}
                              transition={{
                                repeat: Infinity,
                                duration: 2.2,
                                ease: "easeInOut"
                              }}
                            >
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                                searchedOrder.status === 'cancelled'
                                  ? 'bg-red-950 border-red-500 text-red-400'
                                  : 'bg-emerald-950 border-emerald-400 text-emerald-400 ring-4 ring-emerald-950/40'
                              }`}>
                                {searchedOrder.status === 'cancelled' ? <AlertCircle className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                              </div>
                              {searchedOrder.status !== 'cancelled' && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">
                                  Check
                                </div>
                              )}
                            </motion.div>
                          </div>

                          {/* Node 2: Processing */}
                          {(() => {
                            const isCompleted = searchedOrder.status !== 'pending' && searchedOrder.status !== 'cancelled';
                            const isActive = searchedOrder.status === 'pending' || searchedOrder.status === 'processing';
                            const isCancelled = searchedOrder.status === 'cancelled';
                            const isReached = isCompleted || searchedOrder.status === 'processing';
                            
                            let nodeStyle = 'bg-navy-900 border-navy-800 text-navy-400';
                            if (isCancelled) {
                              nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                            } else if (isCompleted) {
                              nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400';
                            } else if (isActive) {
                              nodeStyle = 'bg-gold-950 border-gold-400 text-gold-400 ring-4 ring-gold-950/40';
                            }

                            return (
                              <div className="flex flex-col items-center">
                                <motion.div 
                                  className="relative"
                                  animate={isReached && !isCancelled ? {
                                    scale: [1, 1.1, 1],
                                  } : {}}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2.2,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${nodeStyle}`}>
                                    <Clock className={`w-4 h-4 ${isActive ? 'animate-spin' : ''}`} />
                                  </div>
                                  {isCompleted && !isCancelled && (
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">
                                      Check
                                    </div>
                                  )}
                                </motion.div>
                              </div>
                            );
                          })()}

                          {/* Node 3: Dispatched */}
                          {(() => {
                            const isCompleted = searchedOrder.status === 'delivered';
                            const isActive = searchedOrder.status === 'shipped';
                            const isCancelled = searchedOrder.status === 'cancelled';
                            const isReached = isCompleted || isActive;
                            
                            let nodeStyle = 'bg-navy-900 border-navy-800 text-navy-400';
                            if (isCancelled) {
                              nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                            } else if (isCompleted) {
                              nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400';
                            } else if (isActive) {
                              nodeStyle = 'bg-gold-950 border-gold-400 text-gold-400 ring-4 ring-gold-950/40';
                            }

                            return (
                              <div className="flex flex-col items-center">
                                <motion.div 
                                  className="relative"
                                  animate={isReached && !isCancelled ? {
                                    scale: [1, 1.1, 1],
                                  } : {}}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2.2,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${nodeStyle}`}>
                                    <Truck className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                  </div>
                                  {isCompleted && !isCancelled && (
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">
                                      Check
                                    </div>
                                  )}
                                </motion.div>
                              </div>
                            );
                          })()}

                          {/* Node 4: Delivered */}
                          {(() => {
                            const isCompleted = searchedOrder.status === 'delivered';
                            const isCancelled = searchedOrder.status === 'cancelled';
                            const isReached = isCompleted;
                            
                            let nodeStyle = 'bg-navy-900 border-navy-800 text-navy-400';
                            if (isCancelled) {
                              nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                            } else if (isCompleted) {
                              nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400 ring-4 ring-emerald-950/40';
                            }

                            return (
                              <div className="flex flex-col items-center">
                                <motion.div 
                                  className="relative"
                                  animate={isReached && !isCancelled ? {
                                    scale: [1, 1.1, 1],
                                  } : {}}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2.2,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${nodeStyle}`}>
                                    <Package className="w-4 h-4" />
                                  </div>
                                  {isCompleted && !isCancelled && (
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">
                                      Check
                                    </div>
                                  )}
                                </motion.div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Node Labels */}
                      <div className="grid grid-cols-4 text-center text-[10px] font-sans font-medium text-gray-400 select-none pt-1">
                        <span className={searchedOrder.status === 'cancelled' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {searchedOrder.status === 'cancelled' ? 'Aborted' : '1. Placed'}
                        </span>
                        <span className={
                          searchedOrder.status === 'cancelled' ? 'text-red-900/60' :
                          searchedOrder.status === 'pending' || searchedOrder.status === 'processing' ? 'text-gold-400 font-bold' :
                          searchedOrder.status !== 'pending' ? 'text-emerald-400 font-bold' : 'text-gray-400'
                        }>
                          2. Processing
                        </span>
                        <span className={
                          searchedOrder.status === 'cancelled' ? 'text-red-900/60' :
                          searchedOrder.status === 'shipped' ? 'text-gold-400 font-bold' :
                          searchedOrder.status === 'delivered' ? 'text-emerald-400 font-bold' : 'text-gray-400'
                        }>
                          3. Dispatched
                        </span>
                        <span className={
                          searchedOrder.status === 'cancelled' ? 'text-red-900/60' :
                          searchedOrder.status === 'delivered' ? 'text-emerald-400 font-bold' : 'text-gray-400'
                        }>
                          4. Delivered
                        </span>
                      </div>
                    </div>

                    {/* Courier Consignment Details Card & Transit Ledger */}
                    {(() => {
                      const courier = getCourierDetails(searchedOrder);
                      const transitLogs = getCourierLogs(searchedOrder, courier.partner);
                      
                      return (
                        <div className="space-y-6">
                          {/* Courier Partner Header Card */}
                          <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2 text-left">
                              <span className="text-[9px] font-mono font-bold tracking-widest text-gold-600 uppercase block">Courier Dispatch Partner</span>
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-navy-950 text-white font-display font-black text-xs rounded-lg uppercase tracking-wide">
                                  {courier.partner}
                                </div>
                                <span className="text-xs text-slate-500 font-medium">Official Cargo Consignment</span>
                              </div>
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                <span className="text-xs font-mono text-navy-900 font-bold">AWB Tracking Code:</span>
                                <span className="font-mono text-xs font-black text-gold-600 bg-white border px-2 py-0.5 rounded shadow-2xs select-all">
                                  {courier.awb}
                                </span>
                                <button
                                  onClick={() => handleCopyAWB(courier.awb)}
                                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-navy-950 rounded-lg transition active:scale-95"
                                  title="Copy Airway Bill Number"
                                >
                                  {copiedAWB ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {copiedAWB && (
                                  <span className="text-[10px] font-mono text-emerald-600 font-bold animate-pulse">Copied!</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 shrink-0">
                              <a
                                href={courier.portalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 bg-navy-950 hover:bg-navy-900 text-white font-display font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer active:scale-95 shadow-sm inline-flex items-center justify-center gap-2"
                              >
                                <span>Track on {courier.partner.split(' ')[0]} Portal</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <span className="text-[8px] font-mono text-gray-400 text-center uppercase tracking-widest">
                                Verification via partner network portal
                              </span>
                            </div>
                          </div>

                          {/* Consignment Handoff Slip Specs Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-white border rounded-xl text-left font-sans">
                              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Est. Weight</span>
                              <span className="text-xs font-bold text-navy-950 block mt-0.5">2.45 Kg</span>
                            </div>
                            <div className="p-3 bg-white border rounded-xl text-left font-sans">
                              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Package Count</span>
                              <span className="text-xs font-bold text-navy-950 block mt-0.5">1 Safe Carton</span>
                            </div>
                            <div className="p-3 bg-white border rounded-xl text-left font-sans">
                              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Cottage Cleared</span>
                              <span className="text-xs font-bold text-emerald-600 block mt-0.5 flex items-center gap-1">Check Verified</span>
                            </div>
                            <div className="p-3 bg-white border rounded-xl text-left font-sans">
                              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Service Category</span>
                              <span className="text-xs font-bold text-navy-950 block mt-0.5">
                                {searchedOrder.shippingMethod === 'express' ? 'Air Cargo Prime' : 'Surface Prime'}
                              </span>
                            </div>
                          </div>

                          {/* Real-time Transit Logs / Timeline Tracker */}
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-mono tracking-widest text-gray-400 uppercase text-left">
                              Official Logistics Transit Logs
                            </h5>
                            
                            <div className="relative pl-6 sm:pl-8 space-y-6 py-2 border-l-2 border-gray-100 ml-4">
                              {transitLogs.map((log, idx) => {
                                const isLatest = idx === 0;
                                const isSuccess = log.status === 'success';
                                const isActive = log.status === 'active';
                                const isPending = log.status === 'pending';
                                
                                return (
                                  <div key={idx} className="relative text-left">
                                    {/* Icon circle pin */}
                                    <div className="absolute -left-[35px] sm:-left-[43px] top-0.5 z-10">
                                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition shadow-2xs ${
                                        isLatest
                                          ? isSuccess
                                            ? 'bg-emerald-500 border-emerald-400 text-white ring-4 ring-emerald-100'
                                            : isActive
                                              ? 'bg-gold-500 border-gold-400 text-white ring-4 ring-gold-100'
                                              : 'bg-navy-950 border-navy-800 text-white ring-4 ring-navy-100'
                                          : 'bg-white border-gray-200 text-gray-400'
                                      }`}>
                                        {isSuccess ? (
                                          <Check className="w-3 h-3 font-bold" />
                                        ) : isActive ? (
                                          <Truck className="w-3 h-3 animate-pulse" />
                                        ) : isPending ? (
                                          <Clock className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Package className="w-3 h-3" />
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Text content */}
                                    <div className="font-sans space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-mono font-semibold text-gray-400">{log.time}</span>
                                        {isLatest && (
                                          <span className="text-[8px] font-mono font-bold bg-navy-950 text-gold-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                            LATEST PULSE
                                          </span>
                                        )}
                                      </div>
                                      <h6 className={`text-xs font-bold ${isLatest ? 'text-navy-950' : 'text-gray-500'}`}>
                                        {log.title}
                                      </h6>
                                      <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xl font-sans">
                                        {log.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Cancel status handling */}
                    {searchedOrder.status === 'cancelled' && (
                      <div className="p-4 bg-red-50 text-red-800 text-xs border border-red-100 rounded-xl flex items-center gap-2 font-sans">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <div>
                          <p className="font-bold">Purchase Cancelled</p>
                          <p>This transaction sequence is aborted. Check email details or request inquiry via support@meris.com.</p>
                        </div>
                      </div>
                    )}

                    {/* Database controller / Live demo tool styled as a clean developer panel override */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
                      <div className="space-y-1">
                        <h5 className="font-display font-bold text-slate-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                          Developer Developer Override - Simulate Partner Handoff
                        </h5>
                        <p className="text-slate-400 text-[10px] leading-relaxed">
                          Test pending, processing, shipped, or delivered states. Tap below to advance this order's database status.
                        </p>
                      </div>
                      <button
                        onClick={handleForceAdvanceStatus}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shrink-0 shadow-2xs"
                      >
                        Advance Advance Status
                      </button>
                    </div>

                    {/* Order items inside tracking display */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <p className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Items In This Package</p>
                      <div className="space-y-1.5 font-sans">
                        {searchedOrder.items.map((it) => (
                          <div key={it.product.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg">
                            <span className="font-semibold text-navy-900">{it.product.name} (x{it.quantity})</span>
                            <span className="font-mono text-gray-500">Rs.{(it.product.discountPrice || it.product.price) * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-2xl p-8 text-center text-gray-400 text-xs bg-gray-50/20 max-w-lg space-y-2 font-sans">
                    <Package className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="font-medium text-gray-600">Pending Tracker Lookup</p>
                    <p className="text-gray-400">Please choose one of your active order buttons above, or type in a code manually to show real-time progress.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist management lists */}
            {/* Wishlist management lists */}
            {subTab === 'wishlist' && (() => {
              const wishlistProductIds = wishlistProducts.map(p => p.id).join(',');
              const shareUrl = `${window.location.origin}/?wishlist=${encodeURIComponent(wishlistProductIds)}`;
              const shareText = `Check out my handcrafted wishlist on Meris E-Shop! 🌟 ${shareUrl}`;

              const downloadWishlistPdf = () => {
                const doc = new jsPDF({
                  orientation: 'portrait',
                  unit: 'mm',
                  format: 'a4',
                });

                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(22);
                doc.text('M E R I S', 20, 20);
                doc.setFontSize(10);
                doc.setTextColor(202, 138, 4);
                doc.text('MY HANDCRAFTED WISHLIST COLLECTION', 20, 25);

                doc.setDrawColor(226, 232, 240);
                doc.line(20, 28, 190, 28);

                let currentY = 38;
                doc.setFontSize(10);
                doc.setTextColor(15, 23, 42);

                wishlistProducts.forEach((p, index) => {
                  if (currentY > 260) {
                    doc.addPage();
                    currentY = 20;
                  }
                  doc.setFont('Helvetica', 'bold');
                  doc.text(`${index + 1}. ${p.name}`, 20, currentY);
                  doc.setFont('Helvetica', 'normal');
                  doc.setFontSize(9);
                  doc.text(`Category: ${p.category} | Price: Rs. ${p.discountPrice || p.price}`, 20, currentY + 5);
                  doc.text(p.shortDescription || '', 20, currentY + 10);
                  currentY += 20;
                });

                doc.save('meris_my_wishlist.pdf');
              };

              const handleCopyLink = () => {
                navigator.clipboard.writeText(shareUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              };

              return (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
                    <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest">Saved Wishlist Items</h3>
                    {wishlistProducts.length > 0 && (
                      <button
                        onClick={downloadWishlistPdf}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer animate-fade-in"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                    )}
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Heart className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-500">Your wishlist is currently clear.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Wishlist Sharing Controls Card */}
                      <div className="p-4 rounded-3xl bg-gray-50 dark:bg-navy-950 border border-gray-150 dark:border-navy-800 text-xs font-sans space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1">
                            <span className="font-bold text-navy-950 dark:text-white block">Share My Collection</span>
                            <span className="text-[10px] text-gray-400">Share your handpicked crafts with friends or public visitors.</span>
                          </div>
                          
                          {/* Privacy Toggle */}
                          <div className="flex bg-white dark:bg-navy-900 p-0.5 rounded-lg border border-gray-250 dark:border-navy-800 text-[10px]">
                            {['Public', 'Friends', 'Private'].map(priv => (
                              <button
                                key={priv}
                                onClick={() => setWishlistPrivacy(priv as any)}
                                className={`px-2.5 py-1 rounded-md font-bold uppercase transition cursor-pointer ${
                                  wishlistPrivacy === priv ? 'bg-navy-950 dark:bg-navy-850 text-white' : 'text-gray-400'
                                }`}
                              >
                                {priv}
                              </button>
                            ))}
                          </div>
                        </div>

                        {wishlistPrivacy !== 'Private' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            
                            {/* QR Code display */}
                            <div className="flex items-center gap-3 bg-white dark:bg-navy-900 p-3 rounded-2xl border border-gray-200 dark:border-navy-800">
                              <img
                                src={getQrCodeUrl(shareUrl)}
                                alt="Wishlist QR Code"
                                className="w-16 h-16 rounded border bg-white shrink-0"
                              />
                              <div className="space-y-0.5 text-left">
                                <span className="font-semibold text-[10px] text-navy-950 dark:text-white block">Scan to Share</span>
                                <span className="text-[9px] text-gray-400 leading-normal block">Scan QR Code with any camera to instantly load this wishlist.</span>
                              </div>
                            </div>

                            {/* Share button links */}
                            <div className="md:col-span-2 space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                <a
                                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-[10px] transition"
                                >
                                  WhatsApp
                                </a>
                                <a
                                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-[10px] transition"
                                >
                                  Twitter (X)
                                </a>
                                <a
                                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-[10px] transition"
                                >
                                  Telegram
                                </a>
                                <button
                                  onClick={handleCopyLink}
                                  className="px-3 py-2 bg-gray-200 dark:bg-navy-800 hover:bg-gray-300 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-[10px] transition cursor-pointer"
                                >
                                  {copiedLink ? 'Copied!' : 'Copy Link'}
                                </button>
                              </div>
                              <span className="font-mono text-[9px] text-gray-400 dark:text-gray-500 truncate block bg-white dark:bg-navy-900 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-navy-800">
                                {shareUrl}
                              </span>
                            </div>

                          </div>
                        )}
                      </div>

                      {/* Wishlist Items Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wishlistProducts.map((prod) => (
                          <div key={prod.id} className="p-3.5 rounded-2xl border border-gray-100 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectProduct(prod.id)}>
                              <img src={prod.images[0]} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0" />
                              <div className="text-left font-sans space-y-0.5">
                                <h5 className="text-xs font-semibold text-navy-900 dark:text-navy-50 line-clamp-1">{prod.name}</h5>
                                <span className="text-[10px] text-gray-400 font-mono block">{prod.category}</span>
                                <span className="text-xs font-bold text-navy-900 dark:text-navy-50 block mt-0.5">Rs.{prod.discountPrice || prod.price}</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 shrink-0 select-none">
                              <button
                                onClick={() => onMoveToCart(prod)}
                                className="p-2 border border-gold-300 bg-gold-400 hover:bg-gold-500 rounded-lg text-navy-950 hover:text-navy-950 flex items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition active:scale-95"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Add Bag</span>
                              </button>
                              <button
                                onClick={() => onRemoveFromWishlist(prod.id)}
                                className="text-gray-400 hover:text-red-500 text-[10px] font-mono cursor-pointer underline text-center"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* Coupons catalogs available */}
            {subTab === 'coupons' && (
              <motion.div
                key="coupons"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Discounts & Coupons</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.code} className="p-4 rounded-2xl border-2 border-dashed border-gold-400/30 bg-gradient-to-br from-gold-50/20 to-transparent flex flex-col justify-between text-left space-y-3 relative overflow-hidden">
                      {/* Background circular stamp */}
                      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gold-400/5 rounded-full" />
                      
                      <div className="space-y-1 relative z-10 text-xs">
                        <span className="text-gold-600 font-bold font-mono tracking-widest uppercase bg-gold-100 px-2.5 py-0.5 rounded-full">
                          {c.code}
                        </span>
                        <p className="font-semibold text-navy-900 pt-2">{c.description}</p>
                        <p className="text-[10px] text-gray-400">Min order cart value: Rs.{c.minimumCartValue}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono relative z-10 pt-2 border-t border-gray-100">
                        <span>Expires on {c.expiryDate}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-navy-900 hover:text-gold-500 transition cursor-pointer flex items-center gap-1 ml-2 font-semibold"
                        >
                          <Clipboard className="w-3 h-3 text-gold-400" /> Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Returns & Refund workflow page */}
            {subTab === 'returns' && (
              <motion.div
                key="returns"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Returns & Refunds Request</h3>
                
                {orders.length === 0 ? (
                  <div className="text-center py-10 space-y-2 text-xs">
                    <RotateCcw className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-gray-400">Requesting a return requires an active order on file.</p>
                  </div>
                ) : (
                  <form onSubmit={handleTriggerRefundRequest} className="space-y-4 max-w-md">
                    {returnSuccess && (
                      <div className="p-4 bg-emerald-50 text-emerald-800 text-xs border border-emerald-100 rounded-xl flex items-center gap-2">
                        <Check className="w-5 h-5 bg-emerald-500 text-white p-0.5 rounded-full" />
                        <div>
                          <p className="font-bold">Refund Request Submitted!</p>
                          <p>Our audit team is reviewing your reason and will process within 48 hours.</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">1. Select Order Record</label>
                      <select
                        required
                        value={selectedReturnOrder}
                        onChange={(e) => setSelectedReturnOrder(e.target.value)}
                        className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none"
                      >
                        <option value="">-- Choose Order Number --</option>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>{o.orderNumber} (Rs.{o.total})</option>
                        ))}
                      </select>
                    </div>

                    {selectedReturnOrder && (
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">2. Select Product Item</label>
                        <select
                          required
                          value={selectedReturnItem}
                          onChange={(e) => setSelectedReturnItem(e.target.value)}
                          className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none"
                        >
                          <option value="">-- Choose Item for Return --</option>
                          {orders.find(o => o.id === selectedReturnOrder)?.items.map(it => (
                            <option key={it.product.id} value={it.product.name}>{it.product.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">3. Describe Refund Reason</label>
                      <textarea
                        required
                        rows={3}
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="e.g., The wooden stacking dowel contains slight wood knot blemish..."
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-display font-medium text-xs uppercase tracking-wider rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4 text-navy-950" />
                      <span>Submit Secure Refund Ticket</span>
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* Live Email Notifications Panel */}
            {subTab === 'emails' && (
              <motion.div
                key="emails"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest">
                      Live Email Notifications
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      System records of real SMTP and simulated invoice receipts sent to your address
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-navy-50 text-navy-700 text-[10px] font-mono rounded-full self-start">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Verified: {currentUser.email}</span>
                  </div>
                </div>

                {emails.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                    <Mail className="w-10 h-10 text-gray-300 mx-auto animate-bounce" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-navy-900">Your Mailbox is Clear</p>
                      <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-normal">
                        No emails have been triggered for this address yet. Complete a booking in checkout to view your luxury email notification live!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Email list */}
                    <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {emails.map((emailItem) => (
                        <button
                          key={emailItem.id}
                          onClick={() => setSelectedEmail(emailItem)}
                          className={`w-full text-left p-4 rounded-2xl border transition flex flex-col gap-2 relative overflow-hidden group cursor-pointer ${
                            selectedEmail?.id === emailItem.id
                              ? 'bg-navy-900 text-white border-navy-950 shadow-md'
                              : 'bg-white hover:bg-gray-50 border-gray-100 text-navy-950'
                          }`}
                        >
                          {/* Top row */}
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                              selectedEmail?.id === emailItem.id ? 'bg-white/10 text-gold-400' : 'bg-gold-50 text-gold-600'
                            }`}>
                              ID: {emailItem.orderNumber}
                            </span>
                            <span className={`text-[9px] font-mono ${
                              selectedEmail?.id === emailItem.id ? 'text-gray-400' : 'text-gray-400'
                            }`}>
                              {emailItem.sentAt.split(',')[1] || emailItem.sentAt}
                            </span>
                          </div>

                          {/* Subject and preview */}
                          <div className="space-y-0.5">
                            <h4 className="text-[11px] font-bold truncate leading-snug group-hover:text-gold-500 transition-colors">
                              {emailItem.subject}
                            </h4>
                            <p className={`text-[10px] truncate font-light leading-normal ${
                              selectedEmail?.id === emailItem.id ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              Handcrafted toys and artisanal gifts confirmation delivered successfully...
                            </p>
                          </div>

                          {/* Footer with email verification badge */}
                          <div className="flex items-center gap-1 text-[8px] font-mono tracking-widest uppercase mt-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className={selectedEmail?.id === emailItem.id ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold'}>
                              SMTP Dispatch Success
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Right Column: HTML Email Render Area */}
                    <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-4">
                      {selectedEmail ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                              <h4 className="text-xs font-bold text-navy-950 truncate max-w-xs sm:max-w-md">
                                {selectedEmail.subject}
                              </h4>
                              <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                                Sent to: {selectedEmail.recipient} - {selectedEmail.sentAt}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-mono font-bold uppercase shrink-0">
                              Delivered
                            </span>
                          </div>

                          {/* Renders the precise luxury HTML in standard email sandbox container */}
                          <div 
                            className="border border-gray-100 rounded-2xl overflow-y-auto max-h-[420px] bg-slate-50 p-1"
                            style={{ scale: '0.98' }}
                          >
                            <div 
                              className="bg-white rounded-xl shadow-sm"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.bodyHtml) }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-24 space-y-3">
                          <Mail className="w-8 h-8 text-gold-400 mx-auto animate-pulse" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-navy-950">Select an email to view</p>
                            <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-normal">
                              Click on any logged notification on the left to read the full responsive rich HTML newsletter invoice sent to the customer inbox.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Live WhatsApp Notifications Panel */}
            {subTab === 'whatsapp' && (
              <motion.div
                key="whatsapp"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest">
                      Live WhatsApp Alerts
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Booking, shipping, and refund messages linked to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-mono rounded-full self-start">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{whatsappAlerts.length} alerts</span>
                  </div>
                </div>

                {whatsappAlerts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                    <Smartphone className="w-10 h-10 text-gray-300 mx-auto animate-bounce" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-navy-900">No WhatsApp Alerts Yet</p>
                      <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-normal">
                        Place an order from this account to see booking and delivery WhatsApp notifications here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {whatsappAlerts.map((alertItem) => (
                        <button
                          key={alertItem.id}
                          onClick={() => setSelectedWhatsapp(alertItem)}
                          className={`w-full text-left p-4 rounded-2xl border transition flex flex-col gap-2 cursor-pointer ${
                            selectedWhatsapp?.id === alertItem.id
                              ? 'bg-emerald-950 text-white border-emerald-950 shadow-md'
                              : 'bg-white hover:bg-gray-50 border-gray-100 text-navy-950'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                              selectedWhatsapp?.id === alertItem.id ? 'bg-white/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {alertItem.badge || alertItem.type}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400">
                              {alertItem.sentAt?.split(',')[1] || alertItem.sentAt}
                            </span>
                          </div>
                          <h4 className="text-[11px] font-bold truncate leading-snug">
                            {alertItem.orderNumber}
                          </h4>
                          <p className={`text-[10px] line-clamp-2 leading-normal ${
                            selectedWhatsapp?.id === alertItem.id ? 'text-emerald-100' : 'text-gray-500'
                          }`}>
                            {alertItem.message}
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                      {selectedWhatsapp ? (
                        <>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100 gap-3">
                            <div>
                              <h4 className="text-xs font-bold text-navy-950">
                                {selectedWhatsapp.badge || 'WhatsApp Alert'}
                              </h4>
                              <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                                Sent to: {selectedWhatsapp.recipientPhone} - {selectedWhatsapp.sentAt}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-mono font-bold uppercase shrink-0">
                              Delivered
                            </span>
                          </div>
                          <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4">
                            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
                              <div className="flex items-center gap-2 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                                <MessageSquare className="w-4 h-4" />
                                WhatsApp Message
                              </div>
                              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-navy-900 font-sans">{selectedWhatsapp.message}</pre>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-24 space-y-3">
                          <Smartphone className="w-8 h-8 text-emerald-500 mx-auto animate-pulse" />
                          <p className="text-xs font-bold text-navy-950">Select an alert to view</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}



          </AnimatePresence>
        </div>

      </div>

      {/* Order Details Modal Overlay */}
      <AnimatePresence>
        {selectedDetailsOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden relative text-left"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-navy-950 to-slate-900 p-6 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold font-semibold">Past Purchase Details</span>
                    <span className="px-1.5 py-0.5 text-[8px] font-mono rounded bg-white/10 text-white border border-white/20">
                      ID: {selectedDetailsOrder.orderNumber}
                    </span>
                  </div>
                  <h4 className="font-display font-medium text-base text-white tracking-wide mt-1">
                    Order Registered on {selectedDetailsOrder.date}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedDetailsOrder(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Visual Status Tracker Milestones */}
                <div className="bg-gray-50 border rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-gold-600 uppercase font-bold border-b border-gray-100 pb-2">
                    <span>Individual Logistics Status</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-sans ${selectedDetailsOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : selectedDetailsOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gold-100 text-gold-800'}`}>
                      {selectedDetailsOrder.status}
                    </span>
                  </div>

                  {/* High Fidelity Interactive Timeline Stepper */}
                  <div className="relative pt-4 pb-2">
                    <div className="absolute top-[37px] left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0 hidden sm:block"></div>
                    
                    {/* Filled progress bar */}
                    {selectedDetailsOrder.status !== 'cancelled' && (
                      <div 
                        className="absolute top-[37px] left-4 h-1 bg-gold-400 -translate-y-1/2 z-0 origin-left transition-all duration-500 hidden sm:block"
                        style={{
                          width: selectedDetailsOrder.status === 'pending' ? '12.5%' :
                                 selectedDetailsOrder.status === 'processing' ? '37.5%' :
                                 selectedDetailsOrder.status === 'shipped' ? '62.5%' : '100%'
                        }}
                      ></div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                      {[
                        { key: 'pending', title: '1. Placed', desc: 'Secure order recorded', icon: Clipboard, color: 'text-gold-500' },
                        { key: 'processing', title: '2. Polished', desc: 'Crafted & QA checked', icon: Clock, color: 'text-blue-500' },
                        { key: 'shipped', title: '3. Dispatched', desc: 'BlueDart air transit', icon: Truck, color: 'text-indigo-500' },
                        { key: 'delivered', title: '4. Arrived', desc: 'Successfully delivered', icon: Check, color: 'text-emerald-500' }
                      ].map((step, idx) => {
                        const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                        const currentIdx = statusOrder.indexOf(selectedDetailsOrder.status);
                        const stepIdx = statusOrder.indexOf(step.key);
                        
                        const isCompleted = selectedDetailsOrder.status !== 'cancelled' && stepIdx <= currentIdx;
                        const isActive = selectedDetailsOrder.status !== 'cancelled' && stepIdx === currentIdx;
                        const isCancelled = selectedDetailsOrder.status === 'cancelled';
                        
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition duration-300 border ${
                              isCancelled ? 'bg-red-50 border-red-200 text-red-400' :
                              isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-500' :
                              isActive ? 'bg-gold-50 border-gold-300 text-gold-500 ring-2 ring-gold-200' :
                              'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                              {isCancelled ? <AlertCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                            </div>
                            <div className="text-left sm:text-center">
                              <h5 className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
                                isCancelled ? 'text-red-500' :
                                isActive ? 'text-gold-600 font-extrabold' :
                                isCompleted ? 'text-emerald-600' : 'text-gray-400'
                              }`}>{step.title}</h5>
                              <p className="text-[9px] text-gray-400 leading-none mt-0.5">{isCancelled ? 'Order Cancelled' : step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Item-level breakdown */}
                <div className="space-y-3">
                  <h4 className="font-display font-medium text-xs text-navy-900 uppercase tracking-widest pb-1 border-b">
                    Item-Level Package Breakdown
                  </h4>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                    {selectedDetailsOrder.items.map((it) => (
                      <div key={it.product.id} className="py-3 flex justify-between items-center text-xs gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.product.images?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=120&auto=format&fit=crop&q=60'}
                            alt={it.product.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0 bg-slate-50"
                          />
                          <div>
                            <p className="font-semibold text-navy-950">{it.product.name}</p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Rs.{it.product.discountPrice || it.product.price} x {it.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-navy-950">
                          Rs.{(it.product.discountPrice || it.product.price) * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details and gift coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-navy-950">
                  <div className="p-4 bg-gray-50 border rounded-2xl">
                    <h5 className="font-mono text-[9px] tracking-wider uppercase text-gray-400 mb-2 font-bold">Shipping Destination</h5>
                    <p className="font-bold">{selectedDetailsOrder.customerInfo.name}</p>
                    <p className="mt-1 font-light text-gray-600 leading-relaxed">{selectedDetailsOrder.customerInfo.address}</p>
                    <p className="font-light text-gray-600">{selectedDetailsOrder.customerInfo.pincode}</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-2">Phone {selectedDetailsOrder.customerInfo.phone}</p>
                  </div>

                  <div className="p-4 bg-gray-50 border rounded-2xl flex flex-col justify-between">
                    <div>
                      <h5 className="font-mono text-[9px] tracking-wider uppercase text-gray-400 mb-2 font-bold">Delivery Parameters</h5>
                      <p className="font-medium flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-gold-500" />
                        <span>Method: {selectedDetailsOrder.shippingMethod === 'express' ? 'BlueDart Express Air' : 'Standard Delivery'}</span>
                      </p>
                      <p className="font-mono text-[10px] text-gray-500 mt-1">Payment: {selectedDetailsOrder.paymentMethod} ({selectedDetailsOrder.paymentStatus.toUpperCase()})</p>
                    </div>

                    {selectedDetailsOrder.giftWrappingRequested && (
                      <div className="mt-3 p-2.5 bg-gold-50 border border-gold-200 rounded-xl text-[11px]">
                        <p className="font-bold text-gold-800 flex items-center gap-1 mb-1">
                          <Gift className="w-3 h-3" />
                          <span>Premium {selectedDetailsOrder.giftWrappingType?.toUpperCase() || 'CLASSIC'} Wrap Gift</span>
                        </p>
                        {selectedDetailsOrder.giftMessage && (
                          <p className="italic text-gray-600">"{selectedDetailsOrder.giftMessage}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Summary */}
                <div className="bg-gray-50 border rounded-2xl p-4 md:p-5 space-y-2.5 text-xs text-navy-950">
                  <h5 className="font-mono text-[9px] tracking-wider uppercase text-gray-400 mb-3 font-bold border-b pb-1.5">Invoice Financial Ledger</h5>
                  
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-mono">Rs.{selectedDetailsOrder.subtotal}</span>
                  </div>

                  {selectedDetailsOrder.discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Discount {selectedDetailsOrder.couponCode ? `(${selectedDetailsOrder.couponCode})` : ''}</span>
                      </span>
                      <span className="font-mono font-semibold">-Rs.{selectedDetailsOrder.discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-gray-600">
                    <span>Shipping Handling Cost</span>
                    <span className="font-mono">Rs.{selectedDetailsOrder.shippingCost}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span>GST (Goods & Services Tax)</span>
                    <span className="font-mono">Rs.{selectedDetailsOrder.tax}</span>
                  </div>

                  <div className="flex justify-between items-center border-t pt-3 font-display font-bold text-sm text-navy-900">
                    <span>Total Net Amount Paid</span>
                    <span className="font-mono text-gold-600">Rs.{selectedDetailsOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setTrackingInput(selectedDetailsOrder.orderNumber);
                    setSearchedOrder(selectedDetailsOrder);
                    setTrackingError('');
                    setSelectedDetailsOrder(null);
                    setSubTab('tracking');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-gold-500" />
                  <span>Interactive Live Track</span>
                </button>

                <button
                  onClick={() => generateInvoicePDF(selectedDetailsOrder)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Digital Invoice PDF</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
