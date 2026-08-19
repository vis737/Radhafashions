import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Timer, ShoppingBag, Zap } from 'lucide-react';
import { Product } from '../types';
import { handleImageError } from '../utils/imageUtils';

interface FlashSaleSectionProps {
  products: Product[];
  onAddProductToCart: (product: Product) => void;
  onSelectProduct: (productId: string) => void;
}

export default function FlashSaleSection({ products, onAddProductToCart, onSelectProduct }: FlashSaleSectionProps) {
  // We'll set the initial sale timer to 2 hours, 14 minutes, 30 seconds from session storage or load time
  const [timeLeft, setTimeLeft] = useState(8070); // in seconds
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Read or initiate target session countdown time to keep it ticking
    const stored = sessionStorage.getItem('radha_flash_sale_end');
    const now = Math.floor(Date.now() / 1000);
    let targetEnd = now + 8070; // 2h 14m 30s in future

    if (stored) {
      const parsed = parseInt(stored);
      if (parsed > now) {
        targetEnd = parsed;
      } else {
        // Reset to another 2 hours if expired so the demo is always lively!
        sessionStorage.setItem('radha_flash_sale_end', targetEnd.toString());
      }
    } else {
      sessionStorage.setItem('radha_flash_sale_end', targetEnd.toString());
    }

    setTimeLeft(targetEnd - now);

    const timer = setInterval(() => {
      const secondsLeft = targetEnd - Math.floor(Date.now() / 1000);
      if (secondsLeft <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(secondsLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter 3 representative products to showcase in the flash sale
  useEffect(() => {
    if (products.length > 0) {
      // Pick some popular items: e.g. Saddle Tote (bag-1), Keepsake box (wood-1), Gold thread (toy-2 if available)
      const list = products.filter(
        p => p.id === 'bag-1' || p.id === 'wood-1' || p.id === 'toy-2'
      );
      // Fallback
      if (list.length === 0) {
        setActiveProducts(products.slice(0, 3));
      } else {
        setActiveProducts(list);
      }
    }
  }, [products]);

  // Format time helper
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  if (timeLeft <= 0) return null; // Hide if expired

  return (
    <section className="bg-gray-50 dark:bg-gradient-to-tr dark:from-[#0F172A] dark:to-gray-950 border border-pink-200 dark:border-pink-900/20 rounded-3xl p-6 md:p-8 text-left relative overflow-hidden select-none font-sans max-w-7xl mx-auto my-12">
      {/* Background Gold Ambient glow blur */}
      <div className="absolute right-0 top-0 translate-y-[-20%] translate-x-[20%] w-96 h-96 bg-pink-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-pink-100 dark:border-pink-900/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold tracking-widest uppercase">
            <Zap className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-bounce" />
            Urgent Hourly Craft Flash Offer
          </div>

          <h3 className="font-display font-black text-gray-900 dark:text-white text-xl sm:text-2xl uppercase tracking-wider">
            Limited Artisan Slots Remaining
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
            Our guild members have released limited back-stocks. Enjoy up to <span className="text-pink-400 font-bold">30% direct drop</span> automatically updated on raw materials while this stopwatch is active.
          </p>
        </div>

        {/* Stopwatch display */}
        <div className="flex items-center gap-3 bg-white/65 dark:bg-gray-950/65 border border-pink-100 dark:border-pink-900/20 p-4 rounded-2xl max-w-sm">
          <Timer className="w-5 h-5 text-pink-400 shrink-0" />
          <div className="space-y-1">
            <span className="text-[9px] font-mono tracking-widest uppercase text-gray-500 dark:text-gray-400 font-bold block">Expiring In</span>
            <div className="flex gap-1.5 font-mono text-lg font-black text-gray-900 dark:text-white">
              <span className="px-2 py-1 bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/20 rounded-lg text-pink-400">{hours}</span>
              <span className="text-pink-400 animate-pulse">:</span>
              <span className="px-2 py-1 bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/20 rounded-lg text-pink-400">{minutes}</span>
              <span className="text-pink-400 animate-pulse">:</span>
              <span className="px-2 py-1 bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/20 rounded-lg text-pink-400">{seconds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of flash products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {activeProducts.map(product => {
          // Calculate direct 30% discount mockup
          const flashPrice = Math.round(product.price * 0.70);
          const percentSavings = 30;

          return (
            <div
              key={product.id}
              className="group p-4 bg-white/40 dark:bg-gray-900/40 hover:bg-white/80 dark:hover:bg-gray-900/80 border border-pink-100 dark:border-pink-900/20 hover:border-pink-500/40 rounded-2xl transition duration-300 flex gap-4 text-left cursor-pointer"
              onClick={() => onSelectProduct(product.id)}
            >
              {/* Image with badge */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-gray-950 shrink-0 border border-pink-100 dark:border-pink-900/20">
                <img src={product.images && product.images[0] ? product.images[0] : ''} alt="" referrerPolicy="no-referrer" onError={(e) => handleImageError(e, product.category)} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-bold px-1 rounded uppercase tracking-[0.5px]">
                  -{percentSavings}%
                </span>
              </div>

              {/* metadata */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-mono text-pink-500 uppercase font-black block">{product.category}</span>
                  <h4 className="font-display font-bold text-xs text-gray-900 dark:text-white line-clamp-1 mt-0.5 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-light line-clamp-1 mt-0.5">{product.shortDescription}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-gray-950 dark:text-white font-mono">Rs.{flashPrice}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through font-mono">Rs.{product.price}</span>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      // Create a promo product copy with flash discount price
                      const copy: Product = {
                        ...product,
                        discountPrice: flashPrice
                      };
                      onAddProductToCart(copy);
                    }}
                    className="p-1 px-2.5 rounded bg-pink-500 text-white hover:bg-pink-600 text-[10px] font-display font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-3 h-3 text-white" />
                    <span>Buy now</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


