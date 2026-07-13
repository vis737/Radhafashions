import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import { Coupon } from '../types';

interface ExitIntentOfferProps {
  onApplyCoupon: (coupon: Coupon) => void;
}

export default function ExitIntentOffer({ onApplyCoupon }: ExitIntentOfferProps) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Prevent repeated popups during the same browser session
    const shownThisSession = sessionStorage.getItem('meris_exit_intent_shown');
    if (shownThisSession) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // clientY < 15 indicates cursor moving towards tab headers
      if (e.clientY < 15) {
        setShow(true);
        sessionStorage.setItem('meris_exit_intent_shown', 'true');
        // clean up event after triggering
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Only apply on desktop devices scale
    if (window.innerWidth > 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('STAYGOLD15');
    setCopied(true);
    
    // Auto-apply this exclusive coupon
    const stayGoldCoupon: Coupon = {
      code: 'STAYGOLD15',
      type: 'percentage',
      value: 15,
      expiryDate: '2026-12-31',
      usageLimit: 100,
      usageCount: 2,
      minimumCartValue: 500,
      description: 'Exclusive 15% discount for staying with our local artisans',
      active: true
    };
    onApplyCoupon(stayGoldCoupon);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative max-w-md w-full bg-white dark:bg-navy-950 rounded-3xl overflow-hidden shadow-2xl border border-gold-300 dark:border-gold-800 p-8 text-center text-slate-800 dark:text-gray-100 font-sans"
        >
          {/* Close index controller */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-navy-900 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-amber-400 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-gold-50 dark:bg-gold-950/50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gold-200">
            <Sparkles className="w-8 h-8 text-gold-500 animate-pulse" />
          </div>

          <h3 className="font-display font-bold text-xl uppercase tracking-wider text-slate-900 dark:text-white">
            Wait! Before You Leave...
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Our local artisans have woven an exclusive keepsake opportunity. Enjoy <span className="font-semibold text-gold-500 text-sm">15% off</span> your entire cart, standard packaging included.
          </p>

          {/* Coupon Code Block */}
          <div className="my-6 p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 border border-dashed border-gold-400 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Exclusive Voucher</span>
            <span className="text-2xl font-mono font-black tracking-widest text-gold-500">STAYGOLD15</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopy}
              className="w-full py-3.5 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Coupon Applied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Apply & Claim 15% Offer</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShow(false)}
              className="w-full py-2 text-xs font-mono tracking-wider text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              No thanks, I prefer regular price
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


