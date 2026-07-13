import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, Truck, Lock, ArrowLeft, Landmark, Wallet, PhoneCall, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { CartItem, CustomerInfo, Coupon, Order } from '../types';
import { calculateCartTotals } from '../utils/premiumData';

interface CheckoutPanelProps {
  cartItems: CartItem[];
  shippingMethod: 'standard' | 'express';
  activeCoupon: Coupon | null;
  onBackToCart: () => void;
  onPlaceOrder: (customer: CustomerInfo, paymentMethod: string, giftWrapped?: boolean, giftMessage?: string) => void;
}

export default function CheckoutPanel({
  cartItems,
  shippingMethod,
  activeCoupon,
  onBackToCart,
  onPlaceOrder
}: CheckoutPanelProps) {
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Selected payment route
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [upiId, setUpiId] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Simulated gateway trigger
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'idle' | 'authorizing' | 'success'>('idle');

  // Gift wrapping and messages options
  const [giftWrapped, setGiftWrapped] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

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

  const handleTriggerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) return;

    setGatewayProcessing(true);
    setGatewayStep('authorizing');

    try {
      // Step 1: Create a Razorpay order on the backend
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
        throw new Error(err.error || 'Failed to create payment order');
      }

      const orderData = await orderRes.json();

      // Step 2: Open the real Razorpay checkout popup
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
          // Step 3: Verify payment signature on backend
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

          if (verifyData.verified) {
            setGatewayStep('success');
            setTimeout(() => {
              setGatewayProcessing(false);
              setGatewayStep('idle');
              onPlaceOrder(
                { name, email, phone, address, pincode },
                paymentMethod.toUpperCase(),
                giftWrapped,
                giftMessage
              );
            }, 1500);
          } else {
            alert('⚠️ Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
            setGatewayProcessing(false);
            setGatewayStep('idle');
          }
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

          <form onSubmit={handleTriggerPayment} className="space-y-4 text-left">
            {/* Customer coordinates */}
            <div className="space-y-3">
              <h3 className="font-display font-medium text-xs tracking-wider uppercase text-gold-500">1. Customer Shipment Address</h3>
              
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. charankumar@gmail.com"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none focus:border-gold-400"
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
            <div className="p-4 rounded-2xl bg-orange-50/40 dark:bg-navy-900/40 border border-orange-250/30 space-y-3.5 my-4">
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
                    Add Handcrafted Gift Wrap (₹100)
                  </span>
                  <p className="text-[10px] text-gray-400">Authentic wax-sealed banana fiber pouch with dried marigold buds.</p>
                </div>
              </label>

              {giftWrapped && (
                <div className="space-y-1.5 text-left pt-1">
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400">Handwritten Calligraphy Message</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Enter a message to be written with an ink dip pen on handmade cotton pulp paper (max 200 chars)..."
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-400 focus:outline-none dark:bg-navy-950 dark:border-navy-800"
                  />
                  <p className="text-[9px] text-gray-400 font-mono text-right">{giftMessage.length}/200 characters remaining</p>
                </div>
              )}
            </div>

            {/* Select Gateway Method */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h3 className="font-display font-medium text-xs tracking-wider uppercase text-gold-500">2. Select Payment Route</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                {(['card', 'upi', 'netbanking', 'wallet'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition capitalize cursor-pointer ${paymentMethod === method ? 'bg-white border text-gold-500 border-gold-300 shadow-sm' : 'text-gray-500 hover:text-navy-950 hover:bg-white/40'}`}
                  >
                    {method === 'card' && <CreditCard className="w-4 h-4" />}
                    {method === 'upi' && <PhoneCall className="w-4 h-4" />}
                    {method === 'netbanking' && <Landmark className="w-4 h-4" />}
                    {method === 'wallet' && <Wallet className="w-4 h-4" />}
                    <span className="text-[10px]">{method === 'upi' ? 'UPI / GPay' : method}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic inputs for selected payment route */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 mt-3 min-h-24">
                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div
                      key="cardForm"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider text-gray-400 mb-0.5">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value)}
                          placeholder="4321 •••• •••• ••••"
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-gray-400 mb-0.5">Expiry Date</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-gray-400 mb-0.5">CVV / CVV2</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'upi' && (
                    <motion.div
                      key="upiForm"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="block text-[10px] font-mono tracking-wider text-gray-400 mb-0.5">UPI ID (VPA Code)</label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. charankumar@apl"
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400"
                      />
                      <span className="block text-[9px] text-gray-400">Supports Google Pay, PhonePe, Paytm, and BHIM UPI client grids.</span>
                    </motion.div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <motion.div
                      key="nbForm"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="block text-[10px] font-mono tracking-wider text-gray-400 mb-0.5">Choose Popular Indian Institution Bank</label>
                      <select className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank Prime Portal</option>
                        <option>ICICI Institution Bank</option>
                        <option>Axis Bank Limited</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </motion.div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <motion.div
                      key="wlForm"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 text-left"
                    >
                      <span className="text-xs text-gray-600 block">Available Mobile Wallets:</span>
                      <div className="flex gap-2.5">
                        <span className="px-3 py-1.5 bg-white rounded-lg border text-[10px] font-mono text-gray-500">Paytm Wallet</span>
                        <span className="px-3 py-1.5 bg-white rounded-lg border text-[10px] font-mono text-gray-500">Amazon Pay</span>
                        <span className="px-3 py-1.5 bg-white rounded-lg border text-[10px] font-mono text-gray-500">PhonePe Wallet</span>
                      </div>
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
              className="w-full py-3 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-semibold text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-xl shadow-gold-500/10 hover:scale-[1.01] transform active:scale-95 transition"
            >
              <Lock className="w-3.5 h-3.5 text-navy-950" />
              <span>Authorize Secured Payment (₹{finalTotal})</span>
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
                        <p className="text-[9px] text-navy-200 truncate mt-0.5">x{item.quantity} units • {item.product.sku}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-gold-300 shrink-0">₹{itemPrice * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Billing totals */}
            <div className="space-y-2.5 text-xs border-t border-white/5 pt-4">
              <div className="flex justify-between text-navy-200">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Deduction</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
                    Bundle Combo Save
                  </span>
                  <span>-₹{bundleDiscount}</span>
                </div>
              )}
              {giftWrappingCost > 0 && (
                <div className="flex justify-between text-[#ff9800] font-semibold">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-[#ff9855]" />
                    Premium Gift Packing
                  </span>
                  <span>+₹{giftWrappingCost}</span>
                </div>
              )}
              <div className="flex justify-between text-navy-200">
                <span>GST Tax (18% rules)</span>
                <span>₹{gstTax}</span>
              </div>
              <div className="flex justify-between text-navy-200">
                <span>Shipment delivery ({shippingMethod})</span>
                <span>{shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-3 items-baseline">
                <span className="font-display uppercase tracking-widest text-gold-400">Total Net Payable</span>
                <span className="font-mono text-base text-gold-300">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- Razorpay Simulated Payment Modal Portal Overlay --- */}
      {gatewayProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gold-300/30"
          >
            {/* razorpay header banner */}
            <div className="bg-[#1f2c47] text-white p-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
                  R
                </div>
                <div className="text-left font-sans">
                  <h4 className="font-semibold text-xs text-white leading-none">Razorpay Secure</h4>
                  <span className="text-[9px] text-gray-400">Merchant Code: MERIS EST 2025</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-gray-300">₹{finalTotal}</span>
            </div>

            {/* Gateway processing content */}
            <div className="p-8 text-center space-y-4 font-sans">
              {gatewayStep === 'authorizing' ? (
                <>
                  <div className="w-14 h-14 rounded-full border-4 border-gold-400 border-t-transparent animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h5 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest">Validating VPA/Card Core</h5>
                    <p className="text-[11px] text-gray-400">Please do not hit back button or close client tabs...</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-display font-semibold text-sm text-emerald-800 uppercase tracking-widest">Payment Confirmed</h5>
                    <p className="text-[11px] text-gray-500">Authorized. Custom receipt generating via Express...</p>
                  </div>
                </>
              )}
            </div>

            {/* razorpay bottom badge */}
            <div className="bg-gray-50 p-3 text-center border-t border-gray-100 text-[10px] text-gray-400 font-mono">
              Powered by Razorpay payment integrations • TLS 1.3 standard
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
