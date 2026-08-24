import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, Truck, Lock, ArrowLeft, Landmark, Wallet, PhoneCall, CheckCircle, Gift, Sparkles, Copy, Check, Upload, Image, FileText, QrCode, AlertCircle, Hash, User, Link, ChevronRight, Edit3, Zap } from 'lucide-react';
import { CartItem, CustomerInfo, Coupon, Order, formatSelectedVariation, getCartItemKey } from '../types';
import { handleImageError } from '../utils/imageUtils';
import { calculateCartTotals } from '../utils/premiumData';
import { preparePayUPaymentPayload } from '../utils/payu';

interface CheckoutPanelProps {
  cartItems: CartItem[];
  shippingMethod: 'standard' | 'express';
  activeCoupon: Coupon | null;
  currentUser: { email: string; name: string };
  onBackToCart: () => void;
  onPlaceOrder: (
    customer: CustomerInfo, 
    paymentMethod: string, 
    giftWrapped?: boolean, 
    giftMessage?: string,
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
  ) => Order | Promise<Order | void> | void;
  codEnabled?: boolean;
  upiEnabled?: boolean;
}

export default function CheckoutPanel({
  cartItems,
  shippingMethod,
  activeCoupon,
  currentUser,
  onBackToCart,
  onPlaceOrder,
  codEnabled = true,
  upiEnabled = true
}: CheckoutPanelProps) {
  // Stepper state
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Form fields
  const [name, setName] = useState(currentUser.name || '');
  const [email] = useState(currentUser.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Selected payment route
  const [upiNotes, setUpiNotes] = useState('');
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [screenshotSourceType, setScreenshotSourceType] = useState<'upload' | 'url'>('upload');
  
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'upi_qr'>('razorpay');

  // Ensure Razorpay checkout script is loaded
  const [razorpayReady, setRazorpayReady] = useState(!!(window as any).Razorpay);

  useEffect(() => {
    if ((window as any).Razorpay) {
      setRazorpayReady(true);
      return;
    }
    // Dynamically load the script if not already present
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => setRazorpayReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => console.error('[Razorpay] Failed to load checkout.js script');
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!upiEnabled && paymentMethod === 'upi_qr') {
      setPaymentMethod('razorpay');
    }
    if (!codEnabled && paymentMethod === 'cod') {
      setPaymentMethod('razorpay');
    }
  }, [codEnabled, upiEnabled]);
  
  const [upiTxnId, setUpiTxnId] = useState('');
  const [upiSenderName, setUpiSenderName] = useState('');
  const [upiScreenshot, setUpiScreenshot] = useState('');
  const [paymentApp, setPaymentApp] = useState('Google Pay');

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("Image size too large. Please select a screenshot under 8MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpiScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gift wrapping and messages options
  const [giftWrapped, setGiftWrapped] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftTheme, setGiftTheme] = useState<'Birthday' | 'Anniversary' | 'Wedding' | 'Baby Shower' | 'Christmas' | 'Diwali' | 'Generic'>('Generic');
  const [giftSender, setGiftSender] = useState('');
  const [giftHidePrice, setGiftHidePrice] = useState(false);

  // Math calculators
  const totals = calculateCartTotals(cartItems, activeCoupon, shippingMethod, giftWrapped, pincode);
  const subtotal = totals.subtotal;
  const bundleDiscount = totals.bundleDiscount;
  const couponDiscount = totals.couponDiscount;
  const discountAmount = bundleDiscount + couponDiscount;
  const gstTax = totals.tax;
  const shippingCharges = totals.shippingCost;
  const shippingWeightKg = totals.shippingWeightKg;
  const billableWeightKg = totals.billableWeightKg;
  const shippingZone = totals.shippingZone;
  const giftWrappingCost = totals.giftWrappingCost;
  const finalTotal = totals.grandTotal;
  const normalizedPincode = pincode.replace(/\D/g, '').slice(0, 6);
  const hasCompletePincode = normalizedPincode.length === 6;
  const shippingPreviewLabel = shippingMethod === 'express'
    ? `BLUEDART EXPRESS DELIVERY - RS.${shippingCharges} - ${shippingZone} - 3 DAYS`
    : `NATIONAL STANDARD DELIVERY - RS.${shippingCharges} - ${shippingZone} - 6 DAYS`;

  const handleNextStep = (step: number) => {
    if (step === 1) {
      if (!name.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
        alert("Please fill in all delivery details.");
        return;
      }
      setActiveStep(2);
    } else if (step === 2) {
      if (paymentMethod === 'upi_qr' && !showConfirmationForm) {
        setShowConfirmationForm(true);
      } else if (paymentMethod === 'upi_qr' && showConfirmationForm && !upiTxnId.trim()) {
        alert("Transaction ID is required to process UPI payments verification.");
        return;
      }
      setActiveStep(3);
    } else if (step === 3) {
      setActiveStep(4);
    }
  };

  const submitPayUForm = (actionUrl: string, fields: Record<string, string>) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.style.display = 'none';

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleCheckoutSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      alert("Please fill in all shipment coordinates.");
      setActiveStep(1);
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      if (paymentMethod === 'razorpay') {
        if (!(window as any).Razorpay || !razorpayReady) {
          throw new Error('Razorpay checkout script is still loading. Please wait a moment and try again.');
        }

        const configRes = await fetch('/api/razorpay/config');
        if (!configRes.ok) {
          const err = await configRes.json();
          throw new Error(err.error || 'Razorpay is not configured.');
        }
        const { keyId } = await configRes.json();

        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
          }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json();
          throw new Error(err.error || 'Failed to create payment order.');
        }

        const orderData = await orderRes.json();

        let paymentCompleted = false;
        const options = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Radha Fashions',
          description: 'Radha Fashions Boutique Purchase',
          order_id: orderData.id,
          prefill: {
            name,
            email,
            contact: phone,
          },
          theme: { color: '#D4648A' },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyData.verified) {
                alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
                setIsProcessing(false);
                return;
              }

              // Payment verified — place the order
              paymentCompleted = true;
              onPlaceOrder(
                { name, email, phone, address, pincode },
                'Razorpay Online Payment',
                giftWrapped,
                giftMessage,
                giftTheme,
                giftSender,
                giftHidePrice
              );
            } catch (verifyErr) {
              console.error('[Razorpay] Verification error:', verifyErr);
              alert('Payment was successful but verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              if (paymentCompleted) return;
              setIsProcessing(false);
              setPaymentError('Payment was cancelled. Please try again.');
            },
          },
          payment: {
            failed: (response: any) => {
              console.error('[Razorpay] Payment failed:', JSON.stringify(response?.error));
              setIsProcessing(false);
              setPaymentError(`Payment failed: ${response?.error?.description || response?.error?.reason || 'Unknown error'}. Code: ${response?.error?.code || 'N/A'}`);
            },
          },
        };

        console.log('[Razorpay] Opening checkout with key:', keyId, 'amount:', orderData.amount);
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        // After Razorpay modal closes, listen for payment response
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === 'cod') {
        onPlaceOrder(
          { name, email, phone, address, pincode },
          'Cash on Delivery',
          giftWrapped,
          giftMessage,
          giftTheme,
          giftSender,
          giftHidePrice
        );
      } else if (paymentMethod === 'upi_qr') {
        if (!upiTxnId.trim()) {
          setPaymentError('Please enter your 12-digit UPI Transaction ID / Ref No.');
          setIsProcessing(false);
          return;
        }
        if (!upiScreenshot || !upiScreenshot.trim()) {
          setPaymentError('Payment receipt screenshot upload is MANDATORY for UPI QR payment. Please upload screenshot to proceed.');
          setIsProcessing(false);
          return;
        }
        onPlaceOrder(
          { name, email, phone, address, pincode },
          'UPI QR Payment',
          giftWrapped,
          giftMessage,
          giftTheme,
          giftSender,
          giftHidePrice,
          upiTxnId,
          upiSenderName ? `${upiSenderName} (${paymentApp})` : paymentApp,
          upiScreenshot,
          upiNotes
        );
      }
    } catch (err: any) {
      setPaymentError(err?.message || 'Payment initialization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const StepHeader = ({ step, title, icon: Icon }: { step: number, title: string, icon: any }) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === step ? 'bg-pink-500 text-gray-950' : activeStep > step ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
          {activeStep > step ? <Check className="w-4 h-4" /> : step}
        </div>
        <h2 className={`font-display font-semibold text-sm tracking-wider uppercase ${activeStep === step ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          {title}
        </h2>
      </div>
      {activeStep > step && (
        <button type="button" onClick={() => setActiveStep(step)} className="text-xs font-medium text-pink-500 hover:text-pink-600 flex items-center gap-1">
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans relative">
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl"
          >
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
            <p className="font-display font-bold text-gray-900 dark:text-white tracking-widest uppercase">Processing Secure Order</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted Link</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return triggers */}
      <button
        onClick={onBackToCart}
        className="mb-8 py-2.5 px-5 rounded-2xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 font-display font-medium text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition"
      >
        <ArrowLeft className="w-4 h-4 text-pink-500" />
        <span>Return To Cart Summary</span>
      </button>

      <div className="space-y-6">
        
        {/* Step 1: Delivery Address */}
        <div className={`bg-white dark:bg-gray-900/90 rounded-3xl border ${activeStep === 1 ? 'border-pink-400/50 shadow-xl dark:shadow-pink-900/10' : 'border-gray-100 dark:border-gray-800 shadow-sm'} overflow-hidden transition-all duration-300`}>
          <div className="p-6 sm:p-8">
            <StepHeader step={1} title="Delivery Address & Details" icon={Truck} />
            
            <AnimatePresence initial={false}>
              {activeStep === 1 ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-5">
                    <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      <p>Checkout is linked to your signed-in Radha Fashions account. Receipts and WhatsApp alerts will be saved against this profile.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Charan Kumar"
                          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700/60 rounded-2xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 focus:outline-none transition-all duration-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Email Coordinates</label>
                        <input
                          type="email"
                          required
                          value={email}
                          readOnly
                          className="w-full px-4 py-3 text-sm border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5 text-emerald-900 dark:text-emerald-300 rounded-2xl focus:outline-none cursor-not-allowed shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 95020 XXXXX"
                          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700/60 rounded-2xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 focus:outline-none transition-all duration-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Pincode / Postal Area Code</label>
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="e.g. 500033"
                          inputMode="numeric"
                          maxLength={6}
                          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700/60 rounded-2xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 focus:outline-none transition-all duration-200 shadow-sm"
                        />
                        {hasCompletePincode ? (
                          <p className="mt-2 text-[10px] font-mono font-bold tracking-[0.16em] uppercase text-emerald-600 dark:text-emerald-400">
                            {shippingPreviewLabel}
                          </p>
                        ) : (
                          <p className="mt-2 text-[10px] font-mono font-bold tracking-[0.16em] uppercase text-gray-400">
                            Enter 6-digit pincode for shipping preview
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Full Delivery Apartment Address</label>
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your delivery address..."
                        className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700/60 rounded-2xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 focus:outline-none transition-all duration-200 shadow-sm resize-none"
                      />
                    </div>

                    {/* Gift Options */}
                    <div className="p-5 rounded-2xl bg-orange-50/40 dark:bg-orange-500/5 border border-orange-250/30 dark:border-orange-500/20 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={giftWrapped}
                          onChange={(e) => setGiftWrapped(e.target.checked)}
                          className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-400"
                        />
                        <div className="text-left">
                          <span className="text-sm font-bold text-gray-800 dark:text-orange-300 flex items-center gap-2 uppercase tracking-wide">
                            <Gift className="w-4.5 h-4.5 text-orange-500" />
                            Add Premium Gift Wrap (Rs.100)
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Authentic wax-sealed banana fiber pouch with dried marigold buds.</p>
                        </div>
                      </label>

                      {giftWrapped && (
                        <div className="space-y-4 pt-4 border-t border-orange-200/20">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Gift Sender Name</label>
                              <input
                                type="text"
                                value={giftSender}
                                onChange={(e) => setGiftSender(e.target.value)}
                                placeholder="e.g. Grandma & Grandpa"
                                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-950 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700/60 rounded-2xl focus:ring-2 focus:ring-orange-400/55 focus:border-orange-400 focus:outline-none transition-all shadow-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Select Theme</label>
                              <select
                                value={giftTheme}
                                onChange={(e: any) => setGiftTheme(e.target.value)}
                                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-950 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700/60 rounded-2xl focus:ring-2 focus:ring-orange-400/55 focus:border-orange-400 focus:outline-none transition-all shadow-sm cursor-pointer"
                              >
                                {['Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Christmas', 'Diwali', 'Generic'].map(theme => (
                                  <option key={theme} value={theme}>{theme} Theme</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Calligraphy Message</label>
                            <textarea
                              rows={2}
                              maxLength={250}
                              value={giftMessage}
                              onChange={(e) => setGiftMessage(e.target.value)}
                              placeholder="Enter a message to be written with an ink dip pen..."
                              className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-950 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700/60 rounded-2xl focus:ring-2 focus:ring-orange-400/55 focus:border-orange-400 focus:outline-none transition-all shadow-sm resize-none"
                            />
                          </div>
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={giftHidePrice}
                              onChange={(e) => setGiftHidePrice(e.target.checked)}
                              className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-400"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-500 font-medium">Hide item prices on invoice receipt (Gift Invoice)</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleNextStep(1)}
                        className="py-3 px-8 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-display font-semibold text-xs tracking-widest uppercase rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                      >
                        Continue to Payment <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : activeStep > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-4"
                >
                  <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-2xl text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800/50">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{name} <span className="text-gray-400 font-normal">({phone})</span></p>
                    <p>{address}</p>
                    <p>Pincode: {pincode}</p>
                    {giftWrapped && (
                      <p className="mt-2 text-orange-600 dark:text-orange-400 text-xs font-semibold flex items-center gap-1.5"><Gift className="w-3.5 h-3.5"/> Gift Wrapped ({giftTheme})</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Step 2: Payment Route */}
        <div className={`bg-white dark:bg-gray-900/90 rounded-3xl border ${activeStep === 2 ? 'border-pink-400/50 shadow-xl dark:shadow-pink-900/10' : 'border-gray-100 dark:border-gray-800 shadow-sm opacity-60'} overflow-hidden transition-all duration-300`}>
          <div className="p-6 sm:p-8">
            <StepHeader step={2} title="Payment Route" icon={Landmark} />
            
            <AnimatePresence initial={false}>
              {activeStep === 2 ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Razorpay Option - Active */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setPaymentMethod('razorpay'); setPaymentError(''); }}
                          className={`w-full py-4 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-2 transition-all border cursor-pointer ${paymentMethod === 'razorpay' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-400 dark:border-blue-500 shadow-md scale-[1.02]' : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                          <Zap className="w-6 h-6 text-blue-500" />
                          <span className="uppercase tracking-wider font-bold">Razorpay Online</span>
                          <span className="text-[10px] text-gray-500 font-normal">Cards, UPI, NetBanking, Wallets</span>
                        </button>
                        <div className="absolute -top-2.5 -right-2 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3" /> Recommended
                        </div>
                      </div>

                      {/* Cash on Delivery - Coming Soon */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setPaymentError('Cash on Delivery is Coming Soon. Please use Instant UPI QR Payment below.')}
                          className="w-full py-4 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-2 transition-all border bg-gray-50/50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/60"
                        >
                          <Truck className="w-6 h-6 text-gray-400" />
                          <span className="uppercase tracking-wider font-bold">Cash on Delivery</span>
                          <span className="text-[10px] text-gray-400 font-normal">Pay cash at doorstep</span>
                        </button>
                        <div className="absolute -top-2.5 -right-2 bg-gray-50 dark:bg-gray-800 text-amber-400 border border-amber-400/40 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">
                          Coming Soon
                        </div>
                      </div>

                      {/* Instant UPI QR - Active */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setPaymentMethod('upi_qr'); setPaymentError(''); }}
                          className={`w-full py-4 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-2 transition-all border cursor-pointer ${paymentMethod === 'upi_qr' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-400 dark:border-emerald-500 shadow-md scale-[1.02]' : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                          <QrCode className="w-6 h-6 text-emerald-500" />
                          <span className="uppercase tracking-wider font-bold">Instant UPI QR</span>
                          <span className="text-[10px] text-gray-500 font-normal">Instant QR Scan Payment</span>
                        </button>
                        <div className="absolute -top-2.5 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3" /> Also Available
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <p className="leading-relaxed font-light">
                        <strong>Payments are securely processed through Razorpay. Instant UPI QR is also available for manual verification.</strong>
                      </p>
                    </div>

                    {paymentMethod === 'razorpay' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl space-y-2 text-xs text-gray-900 dark:text-blue-200">
                        <div className="flex items-center gap-2 font-bold uppercase text-blue-600 dark:text-blue-400">
                          <Zap className="w-4 h-4" /> Razorpay Secure Checkout
                        </div>
                        <p className="font-light">
                          Clicking place order will open the Razorpay checkout popup for cards, UPI, netbanking, and wallet payments. Your order is confirmed instantly after successful payment.
                        </p>
                      </motion.div>
                    )}

                    {paymentError && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{paymentError}</p>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl space-y-2 text-xs text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-2 font-bold uppercase text-amber-700 dark:text-amber-300">
                          <Truck className="w-4 h-4" /> Cash on Delivery Confirmation
                        </div>
                        <p className="font-light">
                          Please keep Rs.{finalTotal} ready for the courier agent. COD orders may be verified before dispatch.
                        </p>
                      </motion.div>
                    )}

                    {/* UPI UI Block */}
                    {paymentMethod === 'upi_qr' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="w-full bg-gray-950 border border-[#D4648A]/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-center space-y-6">
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4648A] to-transparent animate-pulse" />
                          
                          <div className="flex justify-between items-center w-full pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                              <Lock className="w-5 h-5 text-[#D4648A]" />
                              <span className="text-xs font-display font-bold tracking-widest text-white uppercase">Radha Fashions PAY SECURE</span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-xl">
                              <img src="/upi_qr_payment.jpg" alt="Scan to pay" className="w-40 h-40 object-contain" />
                            </div>
                            <div className="flex flex-col space-y-3 text-left w-full md:w-auto">
                              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Scan via any UPI App</span>
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-center gap-8">
                                  <span className="text-gray-400 text-xs">Amount:</span>
                                  <span className="text-xl font-bold text-white font-mono">₹{finalTotal}</span>
                                </div>
                                <div className="flex justify-between items-center gap-8">
                                  <span className="text-gray-400 text-xs">Merchant:</span>
                                  <span className="text-[#D4648A] font-medium">Radha Fashions</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {showConfirmationForm ? (
                            <div className="text-left space-y-4 mt-6 pt-6 border-t border-white/10">
                              <h4 className="text-white font-display uppercase tracking-wider text-sm flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Enter Transaction Details
                              </h4>

                              {/* UPI Payment App Dropdown Selection */}
                              <div>
                                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                                  <Wallet className="w-3.5 h-3.5 text-pink-400" /> Select Payment App Used <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={paymentApp}
                                  onChange={(e) => setPaymentApp(e.target.value)}
                                  className="w-full px-4 py-3 text-sm bg-gray-900 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 focus:outline-none transition-all font-sans cursor-pointer"
                                >
                                  <option value="Google Pay">Google Pay (GPay)</option>
                                  <option value="PhonePe">PhonePe</option>
                                  <option value="Paytm">Paytm</option>
                                  <option value="BHIM UPI">BHIM UPI</option>
                                  <option value="CRED">CRED</option>
                                  <option value="Amazon Pay">Amazon Pay</option>
                                  <option value="Net Banking / Bank App">Net Banking / Bank App</option>
                                  <option value="Other App">Other Payment App</option>
                                </select>
                              </div>

                              {/* UPI Transaction Ref ID */}
                              <div>
                                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                                  <Hash className="w-3.5 h-3.5 text-pink-400" /> UPI Transaction ID / Ref No. <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={upiTxnId}
                                  onChange={(e) => setUpiTxnId(e.target.value)}
                                  placeholder="12-digit transaction index / ref number"
                                  className="w-full px-4 py-3 text-sm bg-gray-900 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 focus:outline-none transition-all shadow-inner font-mono placeholder-gray-500"
                                />
                              </div>

                              {/* Payment Receipt Screenshot Upload Dropdown / File Selector */}
                              <div>
                                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                                  <Upload className="w-3.5 h-3.5 text-pink-400" /> Upload Payment Receipt Screenshot (Mandatory) <span className="text-red-500">*</span>
                                </label>
                                {upiScreenshot ? (
                                  <div className="relative p-3 bg-gray-900 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <img src={upiScreenshot} alt="Receipt Preview" className="w-12 h-12 object-cover rounded-xl border border-white/20" />
                                      <div>
                                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                          <Check className="w-3.5 h-3.5" /> Screenshot Uploaded
                                        </span>
                                        <span className="text-[10px] text-gray-400 block">Ready for admin verification</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setUpiScreenshot('')}
                                      className="px-3 py-1.5 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl border border-rose-500/40 transition cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center p-4 bg-gray-900/80 hover:bg-gray-900 border-2 border-dashed border-white/20 hover:border-pink-400/60 rounded-2xl cursor-pointer transition-all group">
                                    <div className="flex items-center gap-2 text-xs text-gray-300 group-hover:text-pink-300">
                                      <Image className="w-4 h-4 text-pink-400" />
                                      <span>Click to upload payment screenshot / receipt image</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP up to 8MB</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleReceiptUpload}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowConfirmationForm(true)}
                              className="w-full py-4 bg-[#D4648A] hover:bg-[#B3901E] text-gray-950 font-display font-bold text-sm uppercase tracking-widest rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform duration-150"
                            >
                              <CheckCircle className="w-5 h-5 text-gray-950" />
                              <span>I have completed the payment</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleNextStep(2)}
                        className="py-3 px-8 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-display font-semibold text-xs tracking-widest uppercase rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                      >
                        Continue to Summary <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : activeStep > 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold uppercase tracking-wider text-xs">{paymentMethod === 'upi_qr' ? 'UPI QR Secure Payment' : paymentMethod === 'razorpay' ? 'Razorpay Online Payment' : 'Cash on Delivery'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Step 3: Order Summary */}
        <div className={`bg-white dark:bg-gray-900/90 rounded-3xl border ${activeStep === 3 ? 'border-pink-400/50 shadow-xl dark:shadow-pink-900/10' : 'border-gray-100 dark:border-gray-800 shadow-sm opacity-60'} overflow-hidden transition-all duration-300`}>
          <div className="p-6 sm:p-8">
            <StepHeader step={3} title="Order Summary & Cart" icon={FileText} />
            
            <AnimatePresence initial={false}>
              {activeStep === 3 ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-6">
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const itemPrice = item.product.discountPrice || item.product.price;
                        return (
                          <div key={getCartItemKey(item)} className="flex gap-4 items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 shadow-sm">
                                <img src={item.product.images && item.product.images[0] ? item.product.images[0] : ''} alt="" referrerPolicy="no-referrer" onError={(e) => handleImageError(e, item.product.category)} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left font-sans">
                                <h5 className="text-sm font-bold text-gray-900 dark:text-white">{item.product.name}</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Qty: {item.quantity} | SKU: {item.product.sku}</p>
                                {item.selectedVariation && <p className="text-xs font-semibold text-pink-600 mt-1">{formatSelectedVariation(item)}</p>}
                              </div>
                            </div>
                            <span className="font-mono text-sm font-bold text-pink-500">Rs.{itemPrice * item.quantity}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-5 rounded-2xl bg-gray-900 text-white shadow-xl space-y-3 font-sans">
                      <div className="flex justify-between text-gray-200 text-sm">
                        <span>Items Subtotal</span>
                        <span>Rs.{subtotal}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-400 text-sm font-semibold">
                          <span>Coupon Deduction</span>
                          <span>-Rs.{couponDiscount}</span>
                        </div>
                      )}
                      {bundleDiscount > 0 && (
                        <div className="flex justify-between text-amber-400 text-sm font-semibold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> Bundle Discount
                          </span>
                          <span>-Rs.{bundleDiscount}</span>
                        </div>
                      )}
                      {giftWrappingCost > 0 && (
                        <div className="flex justify-between text-[#ff9800] text-sm font-semibold">
                          <span>Gift Packing</span>
                          <span>+Rs.{giftWrappingCost}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-200 text-sm">
                        <span>GST (18%)</span>
                        <span>Rs.{gstTax}</span>
                      </div>
                      <div className="flex justify-between text-gray-200 text-sm">
                        <span>Shipping ({shippingMethod}, {billableWeightKg.toFixed(2)} kg)</span>
                        <span>{shippingCharges === 0 ? 'FREE' : `Rs.${shippingCharges}`}</span>
                      </div>
                      <div className="flex justify-between text-gray-300 text-xs">
                        <span>Delivery zone</span>
                        <span>{shippingZone} {shippingWeightKg > 0 ? `(${shippingWeightKg.toFixed(2)} kg actual)` : ''}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                        <span className="font-display font-bold uppercase tracking-widest text-pink-400 text-sm">Grand Total</span>
                        <span className="font-mono text-xl font-bold text-pink-300">Rs.{finalTotal}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleNextStep(3)}
                        className="py-3 px-8 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-display font-semibold text-xs tracking-widest uppercase rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                      >
                        Proceed to Confirmation <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : activeStep > 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{cartItems.length} items summarized</span>
                    <span className="font-mono font-bold text-pink-500">Total: Rs.{finalTotal}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Step 4: Final Confirmation */}
        <div className={`bg-white dark:bg-gray-900/90 rounded-3xl border ${activeStep === 4 ? 'border-pink-400/50 shadow-2xl dark:shadow-pink-900/10' : 'border-gray-100 dark:border-gray-800 shadow-sm opacity-40'} overflow-hidden transition-all duration-300`}>
          <div className="p-6 sm:p-8">
            <StepHeader step={4} title="Final Confirmation" icon={CheckCircle} />
            
            <AnimatePresence initial={false}>
              {activeStep === 4 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-8 space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white uppercase tracking-wider">Ready to securely place your order?</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">By clicking the button below, your order will be processed securely using 256-bit encryption.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckoutSubmit}
                      disabled={isProcessing}
                      className="w-full py-5 bg-gradient-to-tr from-pink-500 to-pink-400 hover:from-pink-600 text-gray-950 font-display font-bold text-sm tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-pink-500/20 hover:scale-[1.01] transform active:scale-95 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-950/20 border-t-gray-950 rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Place Secure Order • Rs.{finalTotal}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
