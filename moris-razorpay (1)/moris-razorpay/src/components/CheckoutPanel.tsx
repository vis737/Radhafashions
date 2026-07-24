import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, Truck, Lock, ArrowLeft, Landmark, Wallet, PhoneCall, CheckCircle, Gift, Sparkles, QrCode, FileText, Check, Copy, Upload, Hash, User, Link, Image } from 'lucide-react';
import { CartItem, CustomerInfo, Coupon, Order } from '../types';
import { calculateCartTotals } from '../utils/premiumData';

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
    upiNotes?: string
  ) => void;
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
  
  // Selected payment route
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_qr'>(upiEnabled ? 'upi_qr' : 'cod');

  useEffect(() => {
    if (!upiEnabled && paymentMethod === 'upi_qr') {
      setPaymentMethod('cod');
    }
    if (!codEnabled && paymentMethod === 'cod') {
      setPaymentMethod('upi_qr');
    }
  }, [codEnabled, upiEnabled]);
  
  const [upiTxnId, setUpiTxnId] = useState('');
  const [upiSenderName, setUpiSenderName] = useState('');
  const [upiScreenshot, setUpiScreenshot] = useState('');

  // Simulated gateway trigger
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'idle' | 'authorizing' | 'success'>('idle');

  // Gift wrapping and messages options
  const [giftWrapped, setGiftWrapped] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftTheme, setGiftTheme] = useState<'Birthday' | 'Anniversary' | 'Wedding' | 'Baby Shower' | 'Christmas' | 'Diwali' | 'Generic'>('Generic');
  const [giftSender, setGiftSender] = useState('');
  const [giftHidePrice, setGiftHidePrice] = useState(false);

  // Math calculators
  const totals = calculateCartTotals(cartItems, activeCoupon, shippingMethod, giftWrapped);
  const subtotal = totals.subtotal;
  const bundleDiscount = totals.bundleDiscount;
  const couponDiscount = totals.couponDiscount;
  const discountAmount = bundleDiscount + couponDiscount;
  const gstTax = totals.tax;
  const shippingCharges = totals.shippingCost;
  const giftWrappingCost = totals.giftWrappingCost;
  const finalTotal = totals.grandTotal;

  // Razorpay temporarily disabled.
  // Enable after GST registration and production credentials are available.
  /*
  const handleTriggerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) return;

    setGatewayProcessing(true);
    setGatewayStep('authorizing');

    try {
      if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
        throw new Error('Razorpay checkout script is not loaded.');
      }

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
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Meris E-Shop',
        description: 'Handcrafted Luxury Purchase',
        order_id: orderData.id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: { color: '#C9A84C' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
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
            setGatewayProcessing(false);
            setGatewayStep('idle');
            return;
          }

          setGatewayStep('success');
          setTimeout(() => {
            setGatewayProcessing(false);
            setGatewayStep('idle');
            onPlaceOrder(
              { name, email, phone, address, pincode },
              paymentMethod.toUpperCase(),
              giftWrapped,
              giftMessage,
              giftTheme,
              giftSender,
              giftHidePrice
            );
          }, 1500);
        },
        modal: {
          ondismiss: () => {
            setGatewayProcessing(false);
            setGatewayStep('idle');
          },
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Razorpay] Payment initiation error:', message);
      alert('Could not initiate payment: ' + message);
      setGatewayProcessing(false);
      setGatewayStep('idle');
    }
  };
  */

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      alert("Please fill in all shipment coordinates.");
      return;
    }

    if (paymentMethod === 'cod') {
      onPlaceOrder(
        { name, email, phone, address, pincode },
        'COD',
        giftWrapped,
        giftMessage,
        giftTheme,
        giftSender,
        giftHidePrice
      );
    } else if (paymentMethod === 'upi_qr') {
      if (!showConfirmationForm) {
        setShowConfirmationForm(true);
        return;
      }

      if (!upiTxnId.trim()) {
        alert("Transaction ID is required to process UPI payments verification.");
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
        upiSenderName,
        upiScreenshot,
        upiNotes
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Return triggers */}
      <button
        onClick={onBackToCart}
        className="mb-6 py-2 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 font-display font-medium text-xs text-gray-700 hover:text-navy-900 tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition"
      >
        <ArrowLeft className="w-4 h-4 text-gold-500" />
        <span>Return To Cart Summary</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Columns form: Shipment details & Payment methods */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_10px_40px_rgb(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-2 text-left pb-4 border-b border-gray-100">
            <Truck className="w-5 h-5 text-gold-400" />
            <h2 className="font-display font-medium text-sm tracking-wider uppercase text-navy-900">Secure Checkout Information</h2>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
            {/* Customer coordinates */}
            <div className="space-y-3">
              <h3 className="font-display font-medium text-xs tracking-wider uppercase text-gold-500">1. Customer Shipment Address</h3>
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Checkout is linked to your signed-in Meris account. Receipts and WhatsApp alerts will be saved against this profile.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Charan Kumar"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Email Coordinates</label>
                  <input
                    type="email"
                    required
                    value={email}
                    readOnly
                    placeholder="e.g. charankumar@gmail.com"
                    className="w-full px-3 py-2 text-xs border border-emerald-100 bg-emerald-50/60 text-emerald-900 rounded-xl focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 95020 XXXXX"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Pincode / Postal Area Code</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 500033"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Full Delivery Apartment Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="5/339, Fathima Road, nager, Azhagappapuram, Tamil Nadu"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            {/* Gift Wrapping & Personalized Messaging */}
            <div className="p-4 rounded-2xl bg-orange-50/40 dark:bg-navy-900/40 border border-orange-200/60 space-y-3.5 my-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={giftWrapped}
                  onChange={(e) => setGiftWrapped(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-400"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-gray-800 dark:text-orange-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Gift className="w-4 h-4 text-orange-500" />
                    Add Handcrafted Gift Wrap (Rs.100)
                  </span>
                  <p className="text-[10px] text-gray-400">Authentic wax-sealed banana fiber pouch with dried marigold buds.</p>
                </div>
              </label>

              {giftWrapped && (
                <div className="space-y-4 text-left pt-2 border-t border-orange-200/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Gift Sender Name</label>
                      <input
                        type="text"
                        value={giftSender}
                        onChange={(e) => setGiftSender(e.target.value)}
                        placeholder="e.g. Grandma & Grandpa"
                        className="w-full px-3 py-2 text-xs border border-gray-250 rounded-xl focus:ring-1 focus:ring-orange-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Select Theme</label>
                      <select
                        value={giftTheme}
                        onChange={(e: any) => setGiftTheme(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-250 rounded-xl focus:ring-1 focus:ring-orange-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800 bg-white"
                      >
                        {['Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Christmas', 'Diwali', 'Generic'].map(theme => (
                          <option key={theme} value={theme}>{theme} Theme</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400">Calligraphy Message</label>
                    <textarea
                      rows={2}
                      maxLength={250}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Enter a message to be written with an ink dip pen on handmade cotton pulp paper (max 250 chars)..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800"
                    />
                    <p className="text-[9px] text-gray-400 font-mono text-right">{250 - giftMessage.length} characters remaining</p>
                  </div>

                  {/* Live Preview Card */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-mono tracking-wider uppercase text-gray-400">Live Note Preview</span>
                    <div className={`p-4 rounded-2xl border border-dashed text-xs ${
                      giftTheme === 'Diwali' ? 'bg-amber-600/10 border-amber-500 text-amber-950 dark:text-amber-100' :
                      giftTheme === 'Christmas' ? 'bg-red-700/10 border-red-500 text-red-950 dark:text-red-100' :
                      giftTheme === 'Wedding' ? 'bg-yellow-600/10 border-yellow-500 text-yellow-950 dark:text-yellow-100' :
                      giftTheme === 'Anniversary' ? 'bg-rose-500/10 border-rose-400 text-rose-950 dark:text-rose-100' :
                      giftTheme === 'Birthday' ? 'bg-sky-500/10 border-sky-400 text-sky-950 dark:text-sky-100' :
                      giftTheme === 'Baby Shower' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-950 dark:text-emerald-100' :
                      'bg-amber-50/50 border-amber-200 text-amber-900 dark:bg-navy-950 dark:border-navy-800 dark:text-slate-100'
                    }`}>
                      <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-1.5 mb-2 font-mono text-[9px] tracking-wider uppercase">
                        <span>{giftTheme} Greeting</span>
                        <span>Meris Calligraphy</span>
                      </div>
                      <p className="italic leading-relaxed font-sans">{giftMessage || 'Your message will appear here...'}</p>
                      {giftSender && (
                        <p className="text-right font-semibold mt-3 text-[10px]">With Love, {giftSender}</p>
                      )}
                    </div>
                  </div>

                  {/* Invoice Display Options */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={giftHidePrice}
                        onChange={(e) => setGiftHidePrice(e.target.checked)}
                        className="w-3.5 h-3.5 text-orange-500 rounded border-gray-300 focus:ring-orange-400"
                      />
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Hide item prices on invoice receipt (Gift Invoice)</span>
                    </label>
                  </div>

                </div>
              )}
            </div>

            {/* Select Gateway Method */}
            <div className="space-y-3 pt-4 border-t border-gray-100 font-sans">
              <h3 className="font-display font-medium text-xs tracking-wider uppercase text-gold-500 text-left">2. Select Payment Route</h3>
              
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                {codEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cod');
                      setShowConfirmationForm(false);
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition capitalize cursor-pointer ${paymentMethod === 'cod' ? 'bg-white border text-gold-500 border-gold-300 shadow-sm' : 'text-gray-500 hover:text-navy-950 hover:bg-white/40'}`}
                  >
                    <Truck className="w-4.5 h-4.5 text-navy-950" />
                    <span className="text-[10px]">Cash on Delivery</span>
                  </button>
                )}
                {upiEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_qr')}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition capitalize cursor-pointer ${paymentMethod === 'upi_qr' ? 'bg-white border text-gold-500 border-gold-300 shadow-sm' : 'text-gray-500 hover:text-navy-950 hover:bg-white/40'}`}
                  >
                    <PhoneCall className="w-4.5 h-4.5 text-navy-950" />
                    <span className="text-[10px]">UPI QR Code Payment</span>
                  </button>
                )}
                {!codEnabled && !upiEnabled && (
                  <p className="col-span-2 text-center text-xs text-red-500 p-2 font-semibold">Store checkouts are temporarily deactivated by administration.</p>
                )}
              </div>

              {/* Dynamic inputs for selected payment route */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 mt-3 min-h-24">
                <AnimatePresence mode="wait">
                  {paymentMethod === 'cod' && (
                    <motion.div
                      key="codForm"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1 text-left"
                    >
                      <h5 className="font-bold text-navy-950">Cash on Delivery (COD) Option</h5>
                      <p className="text-[10px] text-gray-400 font-sans leading-relaxed">Pay inside your delivery coordinates upon receiving packages. Secure handovers verified via dispatch signatures.</p>
                    </motion.div>
                  )}

                  {paymentMethod === 'upi_qr' && (
                    <motion.div
                      key="upiQrForm"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 text-left"
                    >
                      {/* Premium Secure Gateway Header */}
                      <div className="w-full bg-navy-950 border border-[#C5A021]/30 rounded-3xl p-5 shadow-lg relative overflow-hidden text-center space-y-4">
                        {/* Background light gradient effect */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A021] to-transparent animate-pulse" />
                        
                        <div className="flex justify-between items-center w-full pb-3 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#C5A021]" />
                            <span className="text-[10px] font-display font-bold tracking-widest text-white uppercase">MERIS PAY</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-wider">SECURE LINK</span>
                          </div>
                        </div>

                        {/* Transaction Receipt Card */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400 font-sans">Merchant Name:</span>
                            <span className="text-white font-semibold font-display">MERIS ARTISANAL STUDIO</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400 font-sans">Payment Method:</span>
                            <span className="text-[#C5A021] font-medium font-mono">UPI Instant Transfer</span>
                          </div>
                          <div className="border-t border-white/5 pt-2 flex justify-between items-end">
                            <span className="text-gray-400 text-[10px] font-sans pb-0.5">Amount Payable:</span>
                            <span className="text-lg font-bold text-white font-mono">₹{finalTotal}</span>
                          </div>
                        </div>

                        {/* Scan stage */}
                        <div className="flex flex-col items-center space-y-3 pt-2">
                          <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">STEP 1 — SCAN QR CODE WITH ANY UPI APP</span>
                          <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-inner inline-block transition hover:scale-102 transform duration-300">
                            <img
                              src="/upi_qr_payment.jpg"
                              alt="Scan to pay via UPI"
                              className="w-36 h-36 object-contain"
                            />
                          </div>
                          
                          <div className="flex flex-col items-center space-y-1.5 w-full max-w-xs mx-auto">
                            <span className="text-[8px] text-gray-500 font-mono">OR PAY VIA UPI ID:</span>
                            <div className="flex items-center justify-between w-full p-2 bg-white/5 border border-white/10 rounded-xl text-left">
                              <span className="text-xs font-mono text-gray-200 select-all pl-1.5">meriseshop@upi</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('meriseshop@upi');
                                  setCopiedUpi(true);
                                  setTimeout(() => setCopiedUpi(false), 2000);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-[#C5A021]/20 hover:bg-[#C5A021]/30 text-[#C5A021] rounded-lg text-[9px] font-semibold transition cursor-pointer"
                              >
                                {copiedUpi ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy ID</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Badges footer */}
                        <div className="pt-2 border-t border-white/5 flex justify-center items-center gap-3 text-gray-400">
                          <span className="text-[7px] tracking-wider uppercase font-semibold font-sans">PCI COMPLIANT</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[7px] tracking-wider uppercase font-semibold font-sans">256-BIT SSL ENCRYPTED</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[7px] tracking-wider uppercase font-semibold font-sans">UPI SECURE</span>
                        </div>
                      </div>

                      {/* Payment Notice Banner */}
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-250 dark:border-amber-500/20 rounded-2xl text-left">
                        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <div>
                          <p className="text-[10px] font-bold text-amber-850 dark:text-amber-300 uppercase tracking-wider mb-0.5">Payment Notice</p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed font-sans">
                            Currently, payments are accepted through our secure UPI QR Code only. After scanning and completing the payment, click the button below to submit your transaction details. Your order will be confirmed once our team manually verifies your payment (typically within 2–4 hours during business hours).
                          </p>
                        </div>
                      </div>

                      {showConfirmationForm ? (
                        <div className="p-6 bg-navy-950/95 border border-[#C5A021]/30 dark:border-[#C5A021]/45 rounded-3xl shadow-xl space-y-4.5 animate-fade-in font-sans text-left relative overflow-hidden">
                          {/* Background soft glowing badge */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl pointer-events-none" />
                          
                          <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#C5A021]" />
                              <span className="text-[10px] font-display font-bold tracking-wider text-white uppercase">Secure Audit Gateway</span>
                            </div>
                            <span className="text-[8px] font-mono font-bold text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded uppercase">STEP 2 OF 2</span>
                          </div>

                          <div className="space-y-4">
                            {/* Transaction ID */}
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                                <Hash className="w-3 h-3 text-[#C5A021]" />
                                <span>UPI Transaction ID / Ref No. <span className="text-red-500">*</span></span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Hash className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={upiTxnId}
                                  onChange={(e) => setUpiTxnId(e.target.value)}
                                  placeholder="12-digit transaction index / ref number"
                                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-navy-900 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 focus:outline-none transition-all duration-200 shadow-inner font-mono placeholder-gray-500"
                                />
                              </div>
                            </div>

                            {/* Sender Name */}
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                                <User className="w-3 h-3 text-[#C5A021]" />
                                <span>Sender UPI Name (Optional)</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <User className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  value={upiSenderName}
                                  onChange={(e) => setUpiSenderName(e.target.value)}
                                  placeholder="e.g. Alok Sharma"
                                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-navy-900 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 focus:outline-none transition-all duration-200 shadow-inner placeholder-gray-500"
                                />
                              </div>
                            </div>

                            {/* Screenshot Upload / URL Toggle */}
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                                  <Image className="w-3 h-3 text-[#C5A021]" />
                                  <span>Screenshot Receipt (Optional)</span>
                                </label>
                                <div className="flex gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5 text-[8px] font-semibold font-sans">
                                  <button
                                    type="button"
                                    onClick={() => setScreenshotSourceType('upload')}
                                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${screenshotSourceType === 'upload' ? 'bg-[#C5A021] text-navy-950 font-bold shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                  >
                                    Device File
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setScreenshotSourceType('url')}
                                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${screenshotSourceType === 'url' ? 'bg-[#C5A021] text-navy-950 font-bold shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                  >
                                    Image URL
                                  </button>
                                </div>
                              </div>

                              {screenshotSourceType === 'upload' ? (
                                <div className="space-y-2">
                                  {!upiScreenshot ? (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 hover:border-[#C5A021]/50 rounded-xl cursor-pointer bg-white/2 hover:bg-white/5 transition duration-200">
                                      <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                        <p className="text-[10px] text-gray-300 font-semibold">Click to select receipt screenshot</p>
                                        <p className="text-[8px] text-gray-500 font-mono">JPG, PNG, or WEBP (Max 5MB)</p>
                                      </div>
                                      <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          if (file.size > 5 * 1024 * 1024) {
                                            alert("Maximum file size allowed is 5 MB.");
                                            e.target.value = "";
                                            return;
                                          }
                                          const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                          if (!allowed.includes(file.type)) {
                                            alert("Only JPG, JPEG, PNG, and WEBP formats are allowed.");
                                            e.target.value = "";
                                            return;
                                          }
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            setUpiScreenshot(reader.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  ) : (
                                    <div className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                                      <img
                                        src={upiScreenshot}
                                        alt="Receipt preview"
                                        className="w-12 h-12 object-cover rounded-xl border border-white/10 bg-navy-900"
                                      />
                                      <div className="flex-1 text-left min-w-0">
                                        <p className="text-[10px] font-semibold text-white truncate">Selected Receipt Image</p>
                                        <p className="text-[8px] text-emerald-400 font-medium">Ready to upload</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setUpiScreenshot('')}
                                        className="text-red-400 text-[10px] hover:underline font-semibold pr-1.5 animate-pulse"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Link className="w-3.5 h-3.5 text-gray-500" />
                                    </div>
                                    <input
                                      type="url"
                                      placeholder="Paste receipt image URL (e.g. https://domain.com/receipt.jpg)"
                                      value={upiScreenshot.startsWith('data:') ? '' : upiScreenshot}
                                      onChange={(e) => setUpiScreenshot(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-navy-900 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 focus:outline-none transition-all duration-200 shadow-inner placeholder-gray-500 font-sans"
                                    />
                                  </div>
                                  {upiScreenshot && !upiScreenshot.startsWith('data:') && (
                                    <div className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                                      <img
                                        src={upiScreenshot}
                                        alt="Receipt url preview"
                                        className="w-12 h-12 object-cover rounded-xl border border-white/10 bg-navy-900"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150";
                                        }}
                                      />
                                      <div className="flex-1 text-left min-w-0">
                                        <p className="text-[10px] font-semibold text-white truncate font-display">URL Receipt Image</p>
                                        <p className="text-[8px] text-gray-400 truncate font-mono">{upiScreenshot}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setUpiScreenshot('')}
                                        className="text-red-400 text-[10px] hover:underline font-semibold pr-1.5"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Additional Notes */}
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                                <FileText className="w-3 h-3 text-[#C5A021]" />
                                <span>Additional Notes (Optional)</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  value={upiNotes}
                                  onChange={(e) => setUpiNotes(e.target.value)}
                                  placeholder="e.g. Paid via GPay, reference code attached"
                                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-navy-900 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 focus:outline-none transition-all duration-200 shadow-inner placeholder-gray-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
                              alert("Please fill in shipment coordinates first.");
                              return;
                            }
                            setShowConfirmationForm(true);
                          }}
                          className="w-full py-3 bg-[#C5A021] hover:bg-[#B3901E] text-navy-950 font-display font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transform duration-150"
                        >
                          <FileText className="w-4 h-4 text-navy-950" />
                          <span>I have completed the payment</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Merchant shield notice */}
            <div className="flex items-center gap-2 text-left p-3.5 bg-gradient-to-r from-navy-50 to-navy-100/50 border border-navy-100 rounded-2xl my-4 text-xs">
              <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0" />
              <p className="text-[11px] text-navy-800 font-sans leading-relaxed">
                Your payment coordinates are securely locked under SHA-256 standard SSL gateway rule. Custom invoicing is routed through premium full-stack secure modules.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-semibold text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-xl shadow-gold-500/10 hover:scale-[1.01] transform active:scale-95 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-navy-950" />
              <span>{paymentMethod === 'cod' ? `Place Order (Cash on Delivery - Rs.${finalTotal})` : `Place Order (Confirm UPI Payment - Rs.${finalTotal})`}</span>
            </button>
          </form>
        </div>

        {/* Right Columns form: Cart summaries display */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-navy-900 text-white rounded-3xl p-6 border border-gold-400/20 text-left">
            <h3 className="font-display font-medium text-xs tracking-wider uppercase text-gold-400 mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              Summary of Cart Bag
            </h3>

            {/* Cart products item lines */}
            <div className="space-y-4 max-h-[16rem] overflow-y-auto no-scrollbar pb-3">
              {cartItems.map((item) => {
                const itemPrice = item.product.discountPrice || item.product.price;
                return (
                  <div key={item.product.id} className="flex gap-3 items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        <img src={item.product.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left w-28 sm:w-40 font-sans">
                        <h5 className="text-xs font-semibold text-white line-clamp-1">{item.product.name}</h5>
                        <p className="text-[9px] text-navy-200 truncate mt-0.5">x{item.quantity} units - {item.product.sku}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-gold-300 shrink-0">Rs.{itemPrice * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Billing totals */}
            <div className="space-y-2.5 text-xs border-t border-white/5 pt-4">
              <div className="flex justify-between text-navy-200">
                <span>Items Subtotal</span>
                <span>Rs.{subtotal}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Deduction</span>
                  <span>-Rs.{couponDiscount}</span>
                </div>
              )}
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
                    Bundle Combo Save
                  </span>
                  <span>-Rs.{bundleDiscount}</span>
                </div>
              )}
              {giftWrappingCost > 0 && (
                <div className="flex justify-between text-[#ff9800] font-semibold">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-[#ff9855]" />
                    Premium Gift Packing
                  </span>
                  <span>+Rs.{giftWrappingCost}</span>
                </div>
              )}
              <div className="flex justify-between text-navy-200">
                <span>GST Tax (18% rules)</span>
                <span>Rs.{gstTax}</span>
              </div>
              <div className="flex justify-between text-navy-200">
                <span>Shipment delivery ({shippingMethod})</span>
                <span>{shippingCharges === 0 ? 'FREE' : `Rs.${shippingCharges}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-3 items-baseline">
                <span className="font-display uppercase tracking-widest text-gold-400">Total Net Payable</span>
                <span className="font-mono text-base text-gold-300">Rs.{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>

      </div>



    </div>
  );
}


