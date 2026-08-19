import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { CartItem, Product } from '../types';

interface AiRecommendationsProps {
  cartItems: CartItem[];
  recentlyViewedIds: string[];
  allProducts: Product[];
  onSelectProduct: (productId: string) => void;
}

export default function AiRecommendations({
  cartItems,
  recentlyViewedIds,
  allProducts,
  onSelectProduct
}: AiRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<{
    conciergeCommentary: string;
    recommendedProductIds: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const cartToken = JSON.stringify(cartItems.map(item => ({ id: item.product.id, qty: item.quantity })));
  const viewedToken = recentlyViewedIds.join(',');
  const productsCount = allProducts.length;

  useEffect(() => {
    if (productsCount === 0) return;

    const fetchAiRecs = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/gemini/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems,
            recentlyViewedIds,
            allProducts: allProducts.map(p => ({
              id: p.id,
              sku: p.sku,
              name: p.name,
              price: p.price,
              category: p.category
            }))
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        }
      } catch (err) {
        // Log removed for production
      } finally {
        setLoading(false);
      }
    };

    fetchAiRecs();
  }, [cartToken, viewedToken, productsCount]);

  const recommendedProducts = allProducts.filter(p => 
    recommendations?.recommendedProductIds?.includes(p.id)
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-pink-400/20 rounded-2xl p-6 text-white text-center space-y-3 shadow-xl max-w-full">
        <div className="flex items-center justify-center gap-2 text-pink-400">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="font-display font-medium tracking-wide text-xs uppercase">Consulting AI Concierge...</span>
        </div>
        <p className="text-xs text-gray-200 font-mono animate-pulse">Polishing handcrafted shelves...</p>
      </div>
    );
  }

  if (recommendedProducts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white border border-pink-400/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
    >
      {/* Golden Grid Shimmer Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-400/10 via-transparent to-transparent opacity-60 pointer-events-none" />
      
      {/* Corner Luxury Badge */}
      <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-tr from-pink-600 to-pink-400 rotate-45 flex items-end justify-center pb-1">
        <Sparkles className="w-4 h-4 text-gray-950 -rotate-45" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        
        {/* Left Commentary Description */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-pink-400 font-display font-medium text-xs tracking-widest uppercase">
            <UserCheck className="w-4 h-4 text-pink-400" />
            VIRTUAL CONCIERGE RECOMMENDATIONS
          </div>
          <p className="text-sm font-sans italic text-pink-100/90 leading-relaxed font-light">
            "{recommendations?.conciergeCommentary}"
          </p>
        </div>

        {/* Right product recommendation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
          {recommendedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className="bg-gray-800/80 hover:bg-gray-800 border border-pink-400/20 hover:border-pink-400/50 rounded-xl p-3 flex flex-row sm:flex-col items-center gap-3 cursor-pointer transition-all duration-300 group scale-95 hover:scale-100"
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white/5 shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <div className="text-left sm:text-center flex-1">
                <h5 className="font-display font-medium text-xs text-pink-200 line-clamp-1 group-hover:text-pink-400 transition">
                  {product.name}
                </h5>
                <p className="font-mono text-[10px] text-gray-200 mt-0.5">{product.category}</p>
                <div className="flex items-center sm:justify-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-pink-400 font-sans">
                    Rs.{product.discountPrice || product.price}
                  </span>
                  {product.discountPrice && (
                    <span className="text-[10px] line-through text-gray-300">
                      Rs.{product.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}


