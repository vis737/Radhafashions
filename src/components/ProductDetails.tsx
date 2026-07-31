import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Star, Heart, ShoppingCart, Share2, Sparkles, Check, Send, AlertCircle, Award } from 'lucide-react';
import { Product, Review } from '../types';
import { handleImageError } from '../utils/imageUtils';
import ImageMagnifier from './ImageMagnifier';

interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onSelectProduct: (productId: string) => void;
  onAddReview: (productId: string, review: Omit<Review, 'id'>) => void;
}

export default function ProductDetails({
  product,
  relatedProducts,
  onBack,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  onAddReview
}: ProductDetailsProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  
  // Review inputs
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Share link animation state
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShared(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setShared(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOffset({ x, y });
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) return;

    onAddReview(product.id, {
      author: authorName,
      rating,
      comment: commentText,
      date: new Date().toISOString().split('T')[0],
      approved: false // Requires admin approval before display
    });

    setAuthorName('');
    setRating(5);
    setCommentText('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pb-8 font-sans">
      
      {/* Back button tracker */}
      <button
        onClick={onBack}
        className="mb-6 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 font-display font-medium text-xs text-gray-700 hover:text-navy-900 tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition"
      >
        <ChevronLeft className="w-4 h-4 text-gold-500" />
        <span>Return to Catalog</span>
      </button>

      {/* Main product presentation block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-6 lg:p-10 shadow-[0_10px_40px_rgb(0,0,0,0.02)] border border-gray-100">
        
        {/* Left Side: Images Section */}
        <div className="space-y-4 flex flex-col justify-start">
          
          {/* Zoomable Image Stage */}
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 relative group border border-gray-100 shadow-inner">
            <ImageMagnifier
              src={product.images[activeImageIndex]}
              alt={product.name}
            />
            
            {/* Absolute Badges */}
            {product.isNew && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-navy-900 text-white text-[9px] font-mono tracking-wider uppercase font-semibold flex items-center gap-1 border border-gold-400/20 shadow-md">
                <Sparkles className="w-3 h-3 text-gold-400" /> New Collection
              </span>
            )}
          </div>

          {/* Thumbnail Selectors slider Carousel */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border shrink-0 transition-all ${idx === activeImageIndex ? 'border-gold-400 ring-2 ring-gold-400/20 scale-105' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <img src={img} alt="" referrerPolicy="no-referrer" onError={(e) => handleImageError(e, product.category)} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Information Panel */}
        <div className="flex flex-col justify-between space-y-6 pt-2">
          
          {/* Headline Metadata */}
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-gold-50 text-gold-600 rounded-full text-xs font-mono tracking-wider font-semibold uppercase">
              {product.category}
            </span>
            <h1 className="font-display font-medium text-xl sm:text-2xl text-navy-900 leading-snug pt-1">
              {product.name}
            </h1>
            <p className="text-xs text-gray-400 font-mono">SKU: <span className="text-navy-900">{product.sku}</span> | Brand: <span className="text-navy-900">{product.brand}</span></p>
            {product.shortDescription && (
              <p className="text-xs text-gray-600 font-sans italic pt-0.5">{product.shortDescription}</p>
            )}
            
            {/* Rating Stars summary */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
                <span className="text-xs font-bold text-gray-700 font-sans ml-1">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400 ml-0.5">
                  ({product.ratingCount} reviews)
                </span>
                <button
                  onClick={() => {
                    setActiveTab('reviews');
                    setTimeout(() => {
                      document.getElementById('reviews-section-ref')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-[10px] text-navy-950 font-bold hover:underline cursor-pointer ml-2 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 px-2 py-0.5 rounded-lg border border-[#C5A021]/30 transition select-none"
                >
                  + Add Review
                </button>
              </div>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <Check className="w-4 h-4 bg-emerald-50 text-emerald-500 p-0.5 rounded-full" />
                <span>100% Chef Certified Wood Safe</span>
              </div>
            </div>
          </div>

          {/* Price Range and short detail display */}
          <div className="p-4 bg-gray-50 dark:bg-navy-900 rounded-2xl flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 tracking-wider uppercase font-mono">Pricing (Gold Tag)</p>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  Rs.{product.discountPrice || product.price}
                </span>
                {product.discountPrice && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through font-mono">
                    Rs.{product.price}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 tracking-wider uppercase font-mono">Stock Level</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${product.stock === 0 ? 'bg-red-50 text-red-500 border border-red-100' : product.stock <= 5 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Low Stock (${product.stock} left)` : 'In Stock & Ready'}
              </span>
            </div>
          </div>

          {/* Interactive Bundle Suggestion Cards */}
          {((product.categorySlug === 'toys' || product.category === 'Kids Toys') || (product.id === 'bag-1' || product.id === 'wood-1')) && (
            <div className="p-4 rounded-2xl bg-gold-50/50 dark:bg-navy-900/60 border border-[#C5A021]/30 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-gold-600 dark:text-gold-400 font-bold text-[10px] font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Bundle Offer Activated</span>
              </div>
              
              {product.categorySlug === 'toys' || product.category === 'Kids Toys' ? (
                <>
                  <h5 className="font-display font-medium text-xs text-navy-950 dark:text-white uppercase tracking-wider">Artisanal Toy Jamboree</h5>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Gain a <span className="font-semibold text-gold-500">10% instant reward</span> on each when you add any 2 or more traditional Kids Toys to your bag!
                  </p>
                </>
              ) : (
                <>
                  <h5 className="font-display font-medium text-xs text-navy-950 dark:text-white uppercase tracking-wider">Boutique Carry & Keep Combo</h5>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Combine the Serena Vegan Carryall with our intricate Royal Keepsake chest for a flat <span className="font-semibold text-gold-500">Rs.100 refund voucher</span> during checkout!
                  </p>
                </>
              )}
            </div>
          )}

          <p className="text-left text-sm text-gray-600 leading-relaxed font-light font-sans">
            {product.shortDescription}
          </p>

          {/* Add actions block */}
          <div className="space-y-3.5 select-none pt-4">
            <div className="hidden sm:flex sm:flex-row gap-3">
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className="flex-1 py-3 px-6 rounded-xl bg-navy-900 border border-navy-950 text-white hover:bg-gold-500 hover:text-navy-950 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 active:scale-95 hover:scale-[1.02] transform transition cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add To Cart Bag</span>
              </button>

              <button
                onClick={() => onBuyNow(product)}
                disabled={product.stock === 0}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 border border-gold-300 text-navy-950 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 active:scale-95 hover:scale-[1.02] transform transition cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
              >
                <span>Checkout Now</span>
              </button>
            </div>

            <div className="flex gap-3 justify-center sm:justify-start">
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`py-2 px-4 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {/* Share link */}
              <button
                onClick={handleShare}
                className="py-2 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none text-xs font-semibold text-gray-600 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-gold-400" />
                <span>{shared ? 'Copied Link!' : 'Share Product'}</span>
              </button>
            </div>
          </div>

          {/* Secure details highlights */}
          <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <Award className="w-5 h-5 text-gold-500 shrink-0" />
              <div className="text-left">
                <h5 className="font-display font-medium text-xs text-navy-900 leading-none">Heritage Craft</h5>
                <span className="text-[9px] text-gray-400">Authentic native design</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <Sparkles className="w-5 h-5 text-gold-500 shrink-0" />
              <div className="text-left">
                <h5 className="font-display font-medium text-xs text-navy-900 leading-none">Chemical Free</h5>
                <span className="text-[9px] text-gray-400">Organic beeswax varnish</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Structured tabs for details specifications and user reviews */}
      <div id="reviews-section-ref" className="mt-12 bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-left">
        {/* Navigation Headings */}
        <div className="flex gap-6 border-b border-gray-100 pb-3 mb-6">
          {(['description', 'specifications', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-display font-medium text-xs tracking-wider uppercase transition relative cursor-pointer ${activeTab === tab ? 'text-gold-500' : 'text-gray-400 hover:text-navy-900'}`}
            >
              <span>{tab === 'reviews' ? `Customer Reviews (${product.reviews.length})` : tab}</span>
              {activeTab === tab && (
                <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
              )}
            </button>
          ))}
        </div>

        {/* Tab contents router */}
        <div className="min-h-48">
          <AnimatePresence mode="wait">
            
            {/* Long narrative description */}
            {activeTab === 'description' && (
              <motion.div
                key="desc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-4xl"
              >
                <h3 className="font-display font-medium text-sm text-navy-900">Curators Commentary</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {product.description}
                </p>
              </motion.div>
            )}

            {/* General Technical specs */}
            {activeTab === 'specifications' && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl"
              >
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, val], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-3 font-medium text-navy-900 w-1/3 border-b border-gray-100 font-display uppercase tracking-wider">{key}</td>
                            <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-xs text-gray-400 font-mono">
                      No custom specifications specified for this item.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Customer reviews and write form */}
            {activeTab === 'reviews' && (
              <motion.div
                key="revs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left: display reviews lists */}
                <div className="lg:col-span-2 space-y-4">
                  {product.reviews.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl max-w-md border border-dashed border-gray-200">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-mono">No Certified reviews yet</p>
                      <p className="text-xs text-gray-400 mt-1">Submit your verification feedback using the form.</p>
                    </div>
                  ) : (
                    product.reviews.filter(r => r.approved).map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <h6 className="font-display font-semibold text-xs text-navy-900">{rev.author}</h6>
                          <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                        </div>
                        {/* Rating stars */}
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">"{rev.comment}"</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Right: Submit new review fields */}
                <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-xl space-y-4">
                  <h4 className="font-display font-medium text-sm text-navy-900">Write a Certified Review</h4>
                  
                  {reviewSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 bg-emerald-50 text-emerald-800 text-xs border border-emerald-100 rounded-xl space-y-1"
                    >
                      <p className="font-bold flex items-center gap-1">Check Review submitted!</p>
                      <p>Your feedback goes live instantly in our catalog database.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="e.g. Charan Kumar"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Star rating ({rating} out of 5)</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 rounded-md text-amber-400 hover:scale-110 active:scale-95 transition"
                            >
                              <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">Detailed Comment</label>
                        <textarea
                          required
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="How does the raw material feel in your palm?"
                          rows={3}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-display font-medium text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 hover:shadow-lg hover:shadow-gold-500/10"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Review</span>
                      </button>
                    </form>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Core Related products collection */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 text-left">
          <h3 className="font-display font-medium text-lg uppercase tracking-wider text-navy-900 border-l-4 border-gold-400 pl-3 mb-6">
            Handpicked Complementaries
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((relProduct) => (
              <div
                key={relProduct.id}
                onClick={() => onSelectProduct(relProduct.id)}
                className="bg-white hover:bg-gold-50/20 border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md cursor-pointer transition flex gap-3 h-28 items-center"
              >
                <img
                  src={relProduct.images && relProduct.images[0] ? relProduct.images[0] : ''}
                  alt={relProduct.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, relProduct.category)}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-mono uppercase text-gold-500">{relProduct.category}</span>
                  <h4 className="text-xs font-semibold text-navy-900 line-clamp-1">{relProduct.name}</h4>
                  <p className="text-xs text-navy-950 font-bold font-sans">Rs.{relProduct.discountPrice || relProduct.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar with Elegant Shadow Blur */}
      <div
        id="mobile-sticky-action-bar"
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-40 sm:hidden shadow-[0_-10px_30px_rgba(15,23,42,0.08)] flex items-center gap-3"
      >
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="flex-1 py-3 px-3 rounded-xl bg-[#0F172A] border border-gray-800 text-white active:scale-95 transition duration-200 text-[11px] tracking-[0.05em] uppercase font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
          <span>Add To Bag</span>
        </button>

        <button
          onClick={() => onBuyNow(product)}
          disabled={product.stock === 0}
          className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 border border-gold-300 text-navy-950 active:scale-95 transition duration-200 text-[11px] tracking-[0.05em] uppercase font-semibold flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-inner"
        >
          <span>Buy Now</span>
        </button>
      </div>

    </div>
  );
}


