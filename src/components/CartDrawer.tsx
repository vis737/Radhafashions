import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Tag, Check, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { handleImageError } from '../utils/imageUtils';
import { INITIAL_COUPONS } from '../utils/mockData';
import { calculateCartTotals } from '../utils/premiumData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  activeCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  shippingMethod: 'standard' | 'express';
  onUpdateShipping: (method: 'standard' | 'express') => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  activeCoupon,
  onApplyCoupon,
  shippingMethod,
  onUpdateShipping,
  onProceedToCheckout
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string; delay: number }[]>([]);

  if (!isOpen) return null;

  // Calculators
  const totals = calculateCartTotals(cartItems, activeCoupon, shippingMethod);
  const subtotal = totals.subtotal;
  const bundleDiscount = totals.bundleDiscount;
  const couponDiscount = totals.couponDiscount;
  const discountAmount = bundleDiscount + couponDiscount;
  const gstTax = totals.tax;
  const shippingCharges = totals.shippingCost;
  const billableWeightKg = totals.billableWeightKg;
  const finalTotal = totals.grandTotal;

  const handleApplyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput.trim()) return;

    const matchedCoupon = INITIAL_COUPONS.find(
      c => c.code.toUpperCase() === couponInput.toUpperCase() && c.active
    );

    if (!matchedCoupon) {
      setCouponError('Invalid coupon code.');
      onApplyCoupon(null);
      return;
    }

    if (subtotal < matchedCoupon.minimumCartValue) {
      setCouponError(`Min order value of Rs.${matchedCoupon.minimumCartValue} required for this coupon.`);
      onApplyCoupon(null);
      return;
    }

    onApplyCoupon(matchedCoupon);
    setCouponSuccess(`Coupon code "${matchedCoupon.code}" applied successfully!`);
    setCouponInput('');

    // Trigger golden/emerald sparkle burst animation
    const colors = ['#F59E0B', '#10B981', '#FBBF24', '#34D399', '#FFF'];
    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 220,
      y: -Math.random() * 150 - 40,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.15
    }));
    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 1800);
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Black backdrop with fade animation */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="w-screen max-w-md bg-white h-full flex flex-col shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gold-500" />
              <h3 className="font-display font-medium text-sm tracking-widest text-navy-950 uppercase">Your Shopping Bag</h3>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy-950 hover:bg-gray-50 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-gold-50 dark:bg-gold-950/40 text-gold-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="font-display font-semibold text-xs text-navy-950 dark:text-white uppercase tracking-widest">Your Bag is Empty</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-light max-w-xs">Return back to catalog and select handcrafted items for your cart.</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = item.product.discountPrice || item.product.price;
                return (
                  <div key={item.product.id} className="flex gap-4 p-3.5 rounded-2xl border-2 border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm hover:border-gold-400 transition">
                    <img
                      src={item.product.images && item.product.images[0] ? item.product.images[0] : ''}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, item.product.category)}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-200 dark:border-navy-700 shrink-0"
                    />
                    <div className="flex-1 text-left flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h5 className="font-display font-semibold text-xs text-navy-950 dark:text-white line-clamp-1 pr-2">{item.product.name}</h5>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-slate-400 hover:text-red-500 transition p-1 rounded-md cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize tracking-wide mt-0.5">{item.product.category}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* High-Contrast Quantity Selector */}
                        <div className="flex items-center gap-1 border-2 border-slate-300 dark:border-navy-700 rounded-xl p-1 bg-slate-100 dark:bg-navy-950 shadow-inner">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-navy-800 text-navy-950 dark:text-white border border-slate-300 dark:border-navy-700 shadow-xs hover:bg-gold-50 dark:hover:bg-gold-950/50 hover:border-gold-400 active:scale-95 transition cursor-pointer font-bold"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="text-sm font-extrabold px-2 min-w-[28px] text-center font-mono text-navy-950 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (item.quantity < item.product.stock) {
                                onUpdateQuantity(item.product.id, item.quantity + 1);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-navy-800 text-navy-950 dark:text-white border border-slate-300 dark:border-navy-700 shadow-xs hover:bg-gold-50 dark:hover:bg-gold-950/50 hover:border-gold-400 active:scale-95 transition cursor-pointer font-bold"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                        <span className="text-sm font-extrabold text-navy-950 dark:text-gold-400 font-sans">Rs.{itemPrice * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing breakdowns overlay */}
          {cartItems.length > 0 && (
            <div className="border-t-2 border-gray-200 dark:border-navy-800 p-6 bg-slate-50 dark:bg-navy-900/90 space-y-4 relative">
              {/* Floating Confetti Particle Burst Layer */}
              <div className="absolute inset-x-0 bottom-full h-0 pointer-events-none overflow-visible flex items-center justify-center">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      opacity: 0,
                      scale: [1, 1.2, 0.4],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                      delay: p.delay
                    }}
                    style={{
                      position: 'absolute',
                      width: p.size,
                      height: p.size,
                      borderRadius: '50%',
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}`,
                    }}
                  />
                ))}
              </div>

              {/* Promo box input */}
              {!activeCoupon ? (
                <form onSubmit={handleApplyCouponCode} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter code (MERIS10, FESTIVE20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-navy-950 border-2 border-gray-300 dark:border-navy-700 focus:border-gold-500 rounded-xl text-xs text-navy-950 dark:text-white font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy-950 dark:bg-gold-500 hover:bg-gold-500 hover:text-navy-950 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-display font-bold text-xs rounded-xl transition cursor-pointer uppercase tracking-wider border border-navy-900 dark:border-gold-400"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-sans font-semibold">
                    <Check className="w-4 h-4 bg-emerald-600 text-white rounded-full p-0.5" />
                    <span>Coupon <span className="font-bold">{activeCoupon.code}</span> Applied!</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-slate-500 hover:text-red-500 font-mono text-xs border border-gray-300 dark:border-navy-700 rounded px-1.5 hover:bg-white dark:hover:bg-navy-800 transition cursor-pointer font-bold">
                    Remove
                  </button>
                </div>
              )}

              {couponError && <p className="text-xs font-semibold text-red-600 font-sans text-left mt-0.5">{couponError}</p>}
              {couponSuccess && <p className="text-xs font-semibold text-emerald-600 font-sans text-left mt-0.5">{couponSuccess}</p>}

              {/* Delivery rate Selector option */}
              <div className="space-y-2 text-left border-b-2 border-gray-200 dark:border-navy-800 pb-3">
                <span className="text-xs font-display font-bold tracking-wider uppercase text-navy-950 dark:text-slate-200">Delivery Speed</span>
                <div className="flex gap-3">
                  <label className={`flex-1 p-2.5 rounded-xl border-2 transition flex items-center justify-between cursor-pointer ${shippingMethod === 'standard' ? 'border-gold-500 bg-gold-50/60 dark:bg-gold-950/30' : 'border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-950 hover:border-gray-400'}`}>
                    <span className="text-xs text-navy-950 dark:text-white flex items-center gap-2 font-bold">
                      <input
                        type="radio"
                        checked={shippingMethod === 'standard'}
                        onChange={() => onUpdateShipping('standard')}
                        name="shippingOption"
                        className="w-4 h-4 text-gold-500 accent-gold-500 focus:ring-gold-400 cursor-pointer"
                      />
                      Standard
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{shippingMethod === 'standard' && shippingCharges === 0 ? 'FREE' : 'By pincode'}</span>
                  </label>
                  <label className={`flex-1 p-2.5 rounded-xl border-2 transition flex items-center justify-between cursor-pointer ${shippingMethod === 'express' ? 'border-gold-500 bg-gold-50/60 dark:bg-gold-950/30' : 'border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-950 hover:border-gray-400'}`}>
                    <span className="text-xs text-navy-950 dark:text-white flex items-center gap-2 font-bold">
                      <input
                        type="radio"
                        checked={shippingMethod === 'express'}
                        onChange={() => onUpdateShipping('express')}
                        name="shippingOption"
                        className="w-4 h-4 text-gold-500 accent-gold-500 focus:ring-gold-400 cursor-pointer"
                      />
                      Express
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">By pincode</span>
                  </label>
                </div>
              </div>

              {/* High-Contrast Recalculate billing values */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between items-center text-navy-950 dark:text-slate-100 font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">Bag Subtotal</span>
                  <span className="font-mono text-sm font-extrabold text-navy-950 dark:text-white">Rs.{subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>Coupon Discount Code</span>
                    <span className="font-mono text-sm font-extrabold">-Rs.{couponDiscount}</span>
                  </div>
                )}
                {bundleDiscount > 0 && (
                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
                      Automatic Bundle Offer Off
                    </span>
                    <span className="font-mono text-sm font-extrabold">-Rs.{bundleDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-navy-950 dark:text-slate-100 font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">GST / Tax (18% inclusive rule)</span>
                  <span className="font-mono text-sm font-extrabold text-navy-950 dark:text-white">Rs.{gstTax}</span>
                </div>
                <div className="flex justify-between items-center text-navy-950 dark:text-slate-100 font-semibold pb-2 border-b-2 border-gray-200 dark:border-navy-800">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    Delivery Charges <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">(final by pincode, {billableWeightKg.toFixed(2)} kg)</span>
                  </span>
                  <span className="font-mono text-sm font-extrabold text-navy-950 dark:text-white">{shippingCharges === 0 ? 'FREE' : `Rs.${shippingCharges}`}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-navy-950 dark:text-white pt-2">
                  <span className="font-display uppercase tracking-wider text-sm font-extrabold">Total Cart Payable</span>
                  <span className="font-mono text-lg font-black text-navy-950 dark:text-gold-400">Rs.{finalTotal}</span>
                </div>
              </div>

              {/* Final Proceed Checkout button */}
              <button
                onClick={() => { onClose(); onProceedToCheckout(); }}
                className="w-full py-3.5 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-gold-500/10"
              >
                <span>Proceed To Secure Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


