import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Tag, Check, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { CartItem, Coupon } from '../types';
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
      setCouponError(`Min order value of ₹${matchedCoupon.minimumCartValue} required for this coupon.`);
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
                <div className="w-16 h-16 bg-gold-50 text-gold-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="font-display font-semibold text-xs text-navy-950 uppercase tracking-widest">Your Bag is Empty</h4>
                <p className="text-xs text-gray-400 font-light max-w-xs">Return back to catalog and select handcrafted items for your cart.</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = item.product.discountPrice || item.product.price;
                return (
                  <div key={item.product.id} className="flex gap-4 p-3 rounded-2xl border border-gray-100 bg-white shadow-xs hover:border-gold-200 transition">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-gray-50"
                    />
                    <div className="flex-1 text-left flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h5 className="font-display font-medium text-xs text-navy-900 line-clamp-1 pr-2">{item.product.name}</h5>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono italic">{item.product.category}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {/* Quantity inputs */}
                        <div className="flex items-center gap-2 border border-gray-100 rounded-lg p-1 bg-gray-50 scale-90 -ml-1">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:text-navy-950 text-gray-400 rounded-md bg-white hover:bg-gray-100 transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold px-1 min-w-4 text-center font-mono">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (item.quantity < item.product.stock) {
                                onUpdateQuantity(item.product.id, item.quantity + 1);
                              }
                            }}
                            className="p-1 hover:text-navy-950 text-gray-400 rounded-md bg-white hover:bg-gray-100 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-navy-900 font-sans">₹{itemPrice * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing breakdowns overlay */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4 relative">
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
                    <Tag className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter code (MERIS10, FESTIVE20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-gold-300 rounded-xl text-xs focus:ring-1 focus:ring-gold-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy-900 hover:bg-gold-500 hover:text-navy-950 text-white font-display font-medium text-xs rounded-xl transition cursor-pointer font-semibold uppercase"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-sans font-medium">
                    <Check className="w-4 h-4 bg-emerald-500 text-white rounded-full p-0.5" />
                    <span>Coupon <span className="font-bold">{activeCoupon.code}</span> Applied!</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 font-mono text-xs border border-gray-200 rounded px-1.5 hover:bg-white transition cursor-pointer">
                    Remove
                  </button>
                </div>
              )}

              {couponError && <p className="text-[10px] text-red-500 font-sans text-left mt-0.5">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-emerald-500 font-sans text-left mt-0.5">{couponSuccess}</p>}

              {/* Delivery rate Selector option */}
              <div className="space-y-1.5 text-left border-b border-gray-200/50 pb-2">
                <span className="text-[9px] font-mono tracking-wider uppercase text-gray-400 font-medium">Delivery Speed</span>
                <div className="flex gap-3">
                  <label className="flex-1 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-gold-300 flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-gray-700 flex items-center gap-1.5 font-medium">
                      <input
                        type="radio"
                        checked={shippingMethod === 'standard'}
                        onChange={() => onUpdateShipping('standard')}
                        name="shippingOption"
                        className="text-gold-500 focus:ring-gold-400 font-sans"
                      />
                      Standard
                    </span>
                    <span className="text-[10px] font-bold font-mono text-gray-500">{subtotal > 1500 ? 'FREE' : '₹80'}</span>
                  </label>
                  <label className="flex-1 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-gold-300 flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-gray-700 flex items-center gap-1.5 font-medium">
                      <input
                        type="radio"
                        checked={shippingMethod === 'express'}
                        onChange={() => onUpdateShipping('express')}
                        name="shippingOption"
                        className="text-gold-500 focus:ring-gold-400 font-sans"
                      />
                      Express
                    </span>
                    <span className="text-[10px] font-bold font-mono text-gray-500">₹180</span>
                  </label>
                </div>
              </div>

              {/* Recalculate billing values */}
              <div className="space-y-1 pt-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Bag Subtotal</span>
                  <span className="font-mono">₹{subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount Code</span>
                    <span className="font-mono">-₹{couponDiscount}</span>
                  </div>
                )}
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-gold-500 animate-pulse" />
                      Automatic Bundle Offer Off
                    </span>
                    <span className="font-mono">-₹{bundleDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>GST / Tax (18% inclusive rule)</span>
                  <span className="font-mono">₹{gstTax}</span>
                </div>
                <div className="flex justify-between text-gray-500 pb-2">
                  <span>Delivery Charges</span>
                  <span className="font-mono">{shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-navy-950 border-t border-gray-200 pt-2.5">
                  <span className="font-display uppercase tracking-wider">Total Cart Payable</span>
                  <span className="font-mono text-base">₹{finalTotal}</span>
                </div>
              </div>

              {/* Final Proceed Checkout button */}
              <button
                onClick={() => { onClose(); onProceedToCheckout(); }}
                className="w-full py-3 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-gold-500/10"
              >
                <span>Proceed To Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
