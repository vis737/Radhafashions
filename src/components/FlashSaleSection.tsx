import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { handleImageError } from '../utils/imageUtils';

interface FlashSaleSectionProps {
  products: Product[];
  onAddProductToCart: (product: Product) => void;
  onSelectProduct: (productId: string) => void;
}

export default function FlashSaleSection({ products, onAddProductToCart, onSelectProduct }: FlashSaleSectionProps) {
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (products.length > 0) {
      setActiveProducts(products.slice(0, 6));
    }
  }, [products]);

  // Auto-rotate featured product every 5 seconds
  useEffect(() => {
    if (activeProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeProducts.length]);

  const toggleLike = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setLikedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  if (activeProducts.length === 0) return null;

  const featured = activeProducts[currentIndex];

  return (
    <section className="bg-gradient-to-br from-white via-pink-50/30 to-rose-50/20 dark:from-[#0F172A] dark:via-gray-950 dark:to-[#0F172A] border border-pink-100/60 dark:border-pink-900/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden select-none font-sans max-w-7xl mx-auto my-8 sm:my-12">
      {/* Decorative background elements */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-pink-300/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-64 h-64 bg-rose-200/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-pink-100/50 dark:border-pink-900/15">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/60 dark:bg-pink-900/20 border border-pink-200/50 dark:border-pink-800/20 text-pink-600 dark:text-pink-400 text-[10px] font-mono font-bold tracking-widest uppercase">
            <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
            Editor's Picks
          </div>
          <h3 className="font-display font-black text-gray-900 dark:text-white text-xl sm:text-2xl tracking-tight">
            Trending Now
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
            Handpicked styles our fashion editors love this season. Discover what's trending in ethnic and boutique fashion.
          </p>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex(prev => prev === 0 ? activeProducts.length - 1 : prev - 1)}
            className="w-8 h-8 rounded-full border border-pink-200 dark:border-pink-800/30 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-400 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {activeProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-pink-500 w-5'
                    : 'bg-pink-200 dark:bg-pink-800/30 hover:bg-pink-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % activeProducts.length)}
            className="w-8 h-8 rounded-full border border-pink-200 dark:border-pink-800/30 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-400 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured Product (Large) */}
      <div className="pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Large Image */}
            <div
              className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-pink-100/50 dark:border-pink-900/15 cursor-pointer group"
              onClick={() => onSelectProduct(featured.id)}
            >
              <img
                src={featured.images?.[0] || ''}
                alt={featured.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, featured.category)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-2 py-0.5 bg-white/90 dark:bg-gray-900/90 text-pink-600 text-[9px] font-mono font-bold uppercase tracking-widest rounded-full mb-2">
                  {featured.category}
                </span>
                <h4 className="font-display font-black text-white text-lg sm:text-xl leading-tight">
                  {featured.name}
                </h4>
              </div>
              {/* Like button */}
              <button
                onClick={(e) => toggleLike(e, featured.id)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur flex items-center justify-center transition hover:scale-110"
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    likedProducts.has(featured.id)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            {/* Product Info + Mini Grid */}
            <div className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-pink-500 uppercase tracking-widest font-bold">{featured.category}</span>
                  <h4 className="font-display font-black text-gray-900 dark:text-white text-xl sm:text-2xl leading-tight">
                    {featured.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {featured.shortDescription || featured.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-display font-black text-gray-950 dark:text-white">
                    Rs.{featured.discountPrice || featured.price}
                  </span>
                  {featured.discountPrice && featured.discountPrice < featured.price && (
                    <span className="text-sm text-gray-400 line-through font-mono">
                      Rs.{featured.price}
                    </span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-3.5 h-3.5 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'}`} />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1 font-mono">4.0</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => onAddProductToCart(featured)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Bag
                </button>
                <button
                  onClick={() => onSelectProduct(featured.id)}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-pink-200 dark:border-pink-800/30 text-gray-700 dark:text-gray-300 hover:border-pink-400 hover:text-pink-500 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all"
                >
                  View
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mini Thumbnail Grid */}
              <div className="flex gap-2 mt-6">
                {activeProducts.filter(p => p.id !== featured.id).slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product.id)}
                    className="flex-1 aspect-square rounded-xl overflow-hidden border border-pink-100/50 dark:border-pink-900/15 cursor-pointer hover:border-pink-400 transition group"
                  >
                    <img
                      src={product.images?.[0] || ''}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, product.category)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
