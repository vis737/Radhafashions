import React, { useState, useEffect } from 'react';
import { useUser, useClerk, useSignIn } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, Lock, Mail, Clipboard, Heart, Tag, RotateCcw, Compass, MapPin, Truck, AlertCircle, ShoppingCart, Check, Search, Package, Clock, ArrowRight, Download, X, Eye, EyeOff, Gift, ShieldCheck, MessageSquare, Smartphone, Copy, ExternalLink, AlertTriangle, Plus, Trash2, LogOut } from 'lucide-react';
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
import { evaluatePasswordStrength } from '../utils/passwordValidator';

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

const glassFieldClass =
  'w-full h-11 rounded-md bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-white/80 shadow-inner focus:ring-2 focus:ring-black/10';
const glassButtonClass =
  'w-full h-11 rounded-md bg-black text-white text-[15px] font-semibold tracking-wide hover:bg-neutral-900 transition disabled:opacity-60 cursor-pointer';

const SakuraAccent = () => (
  <svg
    className="pointer-events-none absolute -right-7 top-8 w-20 h-20 drop-shadow-sm"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <g>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="40"
          cy="22"
          rx="9"
          ry="16"
          fill="#F4A7C1"
          opacity="0.95"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
      <circle cx="40" cy="40" r="6" fill="#FCE7F3" />
      <circle cx="40" cy="40" r="3.2" fill="#E86A9A" />
    </g>
  </svg>
);

const GoogleMark = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const AppleMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#000000"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"
    />
  </svg>
);

const socialButtonClass =
  'w-full h-11 rounded-md bg-white text-black text-[13px] font-semibold border border-[#d4d4d4] flex items-center justify-center gap-2 hover:bg-neutral-50 transition cursor-pointer disabled:opacity-60';

const ClerkSocialButtons = () => {
  const { signIn, isLoaded } = useSignIn();

  const continueWith = (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded || !signIn) return;
    void signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-black/15" />
        <span className="text-[11px] text-neutral-600">or continue with</span>
        <div className="h-px flex-1 bg-black/15" />
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" className={socialButtonClass} disabled={!isLoaded} onClick={() => continueWith('oauth_google')}>
          <GoogleMark />
          Continue with Google
        </button>
        <button type="button" className={socialButtonClass} disabled={!isLoaded} onClick={() => continueWith('oauth_apple')}>
          <AppleMark />
          Continue with Apple
        </button>
      </div>
    </div>
  );
};

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
  // Clerk authentication state & hooks
  const { user: clerkUser, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const handleUserLogout = async () => {
    try {
      if (isClerkSignedIn && clerkSignOut) {
        await clerkSignOut();
      }
    } catch (err) {
      console.error('Clerk logout error:', err);
    }
    onLogout();
  };

  useEffect(() => {
    if (isClerkSignedIn && clerkUser) {
      const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
      const clerkName = clerkUser.fullName || clerkUser.firstName || clerkEmail.split('@')[0];
      const clerkPhone = clerkUser.phoneNumbers?.[0]?.phoneNumber || '';
      const imageUrl = clerkUser.imageUrl || '';
      const authProvider = clerkUser.externalAccounts?.[0]?.provider || 'clerk';

      // Sync user profile to Supabase & local backend DB
      fetch('/api/auth/clerk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: clerkEmail,
          name: clerkName,
          phone: clerkPhone,
          imageUrl,
          authProvider
        })
      }).catch(err => console.error('Clerk sync error:', err));

      if (!currentUser || currentUser.email !== clerkEmail) {
        onLogin(clerkEmail, clerkName);
      }
    }
  }, [isClerkSignedIn, clerkUser]);

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

  // Authentication configuration: Clerk Password/SSO or email OTP
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
      if (!isSignUp && !email.trim().includes('@')) {
        setOtpError('Please enter the email you used as your username.');
        return;
      }

      if (isSignUp) {
        // Enforce strong password validation
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
        title: 'Quality Check Cleared',
        description: 'Items verified, packaged securely, and stamped for dispatch.',
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
        description: `Collected from our Bengaluru warehouse. Sorted and checked at partner depot.`,
        status: 'success'
      });
    } else if (order.status === 'delivered') {
      logs.push({
        time: 'Today, 03:40 PM',
        title: 'Delivered',
        description: 'Item successfully delivered and signed by recipient.',
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

  const resetAuthMessages = () => {
    setOtpError('');
    setRateLimitMessage('');
    setPasswordErrors([]);
    setShowPasswordValidation(false);
    setOtpSuccessMessage('');
  };

  const showSignIn = () => {
    setIsSignUp(false);
    setAuthMethod('password');
    setAuthStep('email');
    resetAuthMessages();
  };

  const showSignUp = () => {
    setIsSignUp(true);
    setAuthMethod('password');
    setAuthStep('email');
    resetAuthMessages();
  };

  const showForgotPassword = () => {
    setIsSignUp(false);
    setAuthMethod('otp');
    setAuthStep('email');
    resetAuthMessages();
    if (email.trim()) setOtpEmail(email.trim());
  };

  const authTitle = isSignUp ? 'Sign Up' : authMethod === 'otp' ? 'Reset' : 'Sign In';
  const authButtonLabel = otpLoading
    ? 'Please wait...'
    : isSignUp
      ? 'Create account'
      : authMethod === 'otp'
        ? authStep === 'otp'
          ? 'Verify'
          : 'Send code'
        : 'Login';

  // --- Render Authentication Gate ---
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center px-4 pt-16 pb-8 font-sans">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/sakura-auth-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-200/25 via-transparent to-fuchsia-900/20" />

        <div
          className="relative z-10 w-full max-w-[340px] rounded-md px-9 py-10 shadow-[0_18px_50px_rgba(80,20,50,0.28)] text-left"
          style={{
            background: 'rgba(232, 214, 220, 0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.35)',
          }}
        >
          <SakuraAccent />

          <h2 className="text-center text-[28px] font-bold text-black tracking-tight mb-7">
            {authTitle}
          </h2>

          {(otpError || rateLimitMessage) && (
            <p className="mb-4 text-center text-[11px] font-medium text-red-700 bg-white/50 rounded px-2 py-1.5">
              {rateLimitMessage || otpError}
            </p>
          )}
          {otpSuccessMessage && authMethod === 'otp' && (
            <p className="mb-4 text-center text-[11px] font-medium text-emerald-800 bg-white/50 rounded px-2 py-1.5">
              {otpSuccessMessage}
            </p>
          )}

          <form
            id={authMethod === 'otp' ? 'otp-login-form' : 'customer-auth-form'}
            onSubmit={handleLoginSubmit}
          >
            {authMethod === 'password' && !isSignUp && (
              <>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  className={`${glassFieldClass} mb-4`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={`${glassFieldClass} mb-5`}
                />
              </>
            )}

            {isSignUp && (
              <>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Username"
                  autoComplete="name"
                  className={`${glassFieldClass} mb-4`}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className={`${glassFieldClass} mb-4`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    const validation = evaluatePasswordStrength(e.target.value);
                    setPasswordErrors(validation.errors);
                    setPasswordStrength(validation.strength);
                    setShowPasswordValidation(true);
                  }}
                  placeholder="Password"
                  autoComplete="new-password"
                  className={`${glassFieldClass} mb-2`}
                />
                {showPasswordValidation && (
                  <p className={`mb-4 text-[10px] ${passwordErrors.length === 0 ? 'text-emerald-800' : 'text-gray-700'}`}>
                    {passwordErrors[0] || 'Strong password'}
                  </p>
                )}
              </>
            )}

            {authMethod === 'otp' && authStep === 'email' && (
              <input
                type="email"
                required
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className={`${glassFieldClass} mb-5`}
              />
            )}

            {authMethod === 'otp' && authStep === 'otp' && (
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit code"
                disabled={otpLoading}
                className={`${glassFieldClass} mb-5 text-center tracking-[0.4em] font-semibold placeholder:tracking-normal`}
              />
            )}

            <button
              type="submit"
              disabled={!!rateLimitMessage || otpLoading || (isSignUp && passwordErrors.length > 0 && password.length > 0)}
              className={glassButtonClass}
            >
              {authButtonLabel}
            </button>
          </form>

          {authMethod === 'otp' && authStep === 'otp' && (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || otpLoading}
              className="mt-3 w-full text-center text-[11px] text-neutral-700 hover:text-black disabled:text-gray-400 cursor-pointer"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
          )}

          {authMethod !== 'otp' && <ClerkSocialButtons />}

          <div className="mt-8 flex items-center justify-between text-[13px] text-neutral-800">
            {authMethod === 'password' && !isSignUp ? (
              <>
                <button type="button" onClick={showForgotPassword} className="hover:text-black cursor-pointer">
                  Forget Password?
                </button>
                <button type="button" onClick={showSignUp} className="hover:text-black cursor-pointer">
                  Signup
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={showSignIn} className="hover:text-black cursor-pointer">
                  {isSignUp ? 'Have an account?' : 'Back to login'}
                </button>
                <button
                  type="button"
                  onClick={isSignUp ? showForgotPassword : showSignUp}
                  className="hover:text-black cursor-pointer"
                >
                  {isSignUp ? 'Forget Password?' : 'Signup'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Render Logged-In User Dashboard ---
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 items-start">
        
        {/* Left Side Navigation panel Menu */}
        <div className="md:col-span-3 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 sm:space-y-6 text-left text-black dark:text-white">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-black dark:bg-pink-600 flex items-center justify-center text-white font-bold font-display text-base sm:text-lg shadow-md shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-xs text-black dark:text-white tracking-wide truncate">{currentUser.name}</h3>
                <span className="text-[9px] font-mono text-neutral-600 dark:text-neutral-400 truncate block">{currentUser.email}</span>
              </div>
            </div>

            <button
              onClick={handleUserLogout}
              className="md:hidden p-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition cursor-pointer shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-row overflow-x-auto no-scrollbar md:flex-col gap-1.5 border-t border-gray-100 dark:border-gray-800 pt-3 sm:pt-4 font-sans -mx-1 px-1 sm:mx-0 sm:px-0">
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
                  className={`py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between whitespace-nowrap md:whitespace-normal gap-2 transition cursor-pointer shrink-0 md:shrink ${subTab === tab.id ? 'bg-rose-50 dark:bg-rose-950/30 text-black dark:text-pink-300 border-l-4 border-pink-500 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <TabIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-pink-400" />
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 font-bold font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleUserLogout}
            className="hidden md:flex w-full py-2.5 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 font-display font-medium text-xs uppercase tracking-widest transition cursor-pointer text-center items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Profile</span>
          </button>
        </div>

        {/* Right Columns details routers */}
        <div className="md:col-span-9 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-[0_10px_40px_rgb(0,0,0,0.015)] text-left min-h-[24rem]">
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
