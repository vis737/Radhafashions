import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { handleImageError, getProductPrimaryImage } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (productId: string) => void;
  key?: any;
  variants?: any;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onSelectProduct,
  variants
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  // Derive stock badge labels
  let stockLabel = 'In Stock';
  if (product.stock === 0) {
    stockLabel = 'Out of Stock';
  } else if (product.stock <= 5) {
    stockLabel = `Low Stock (${product.stock})`;
  }

  // Derive discount percent
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <motion.article
      {...(!variants ? {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 }
      } : {})}
      variants={variants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col relative text-left h-full select-none"
    >
      {/* Absolute Badges Layer */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.isNew && (
          <span className="px-2 py-0.5 rounded-sm bg-background border border-primary/20 text-foreground text-[8px] font-mono tracking-wider uppercase font-semibold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-primary" /> New
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 rounded-sm bg-primary text-primary-foreground text-[9px] font-bold tracking-wide uppercase">
            -{discountPercent}% OFF
          </span>
        )}
        {product.stock === 0 && (
          <span className="px-2 py-0.5 rounded-sm bg-destructive text-destructive-foreground text-[8px] font-mono tracking-wider uppercase font-semibold">
            Sold Out
          </span>
        )}
      </div>

      {/* Floating Wishlist Heart Trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background border border-border shadow-soft text-muted-foreground hover:text-primary transition-all cursor-pointer focus:outline-none"
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-primary text-primary scale-110' : 'transition-transform hover:scale-110'}`} />
      </button>

      {/* Product Image Stage */}
      <div
        onClick={() => onSelectProduct(product.id)}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-primary-soft cursor-pointer"
      >
        <img
          src={getProductPrimaryImage(product)}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => handleImageError(e, product.category)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover quick views layout */}
        {hovered && product.stock > 0 && (
          <div className="absolute inset-0 bg-background/25 backdrop-blur-[1px] transition flex items-center justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="p-3 bg-background hover:bg-accent rounded-full border border-border shadow-soft text-foreground hover:text-primary active:scale-95 transition cursor-pointer"
              title="Quick View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Card Information metadata */}
      <div className="flex flex-1 flex-col pt-4 justify-between">
        <div className="space-y-1">
          {/* Category Tag */}
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-medium">
            {product.category}
          </span>
          
          <h3
            onClick={() => onSelectProduct(product.id)}
            className="font-display font-light text-base sm:text-xl leading-snug text-foreground hover:text-primary transition cursor-pointer line-clamp-2 sm:line-clamp-1 pr-1 sm:pr-4"
          >
            {product.name}
          </h3>
          
          <p className="line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Rating star feedback and stocks label */}
        <div className="flex items-center justify-between gap-1 pt-2 mt-2 border-t border-border/50">
          {/* Star displays */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span className="hidden sm:inline text-[10px] text-muted-foreground font-light">({product.ratingCount})</span>
          </div>

          {/* stock state feedback */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${product.stock === 0 ? 'bg-destructive' : product.stock <= 5 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className="text-[9px] sm:text-[10px] text-muted-foreground tracking-wide truncate">{product.stock === 0 ? 'Sold Out' : product.stock <= 5 ? 'Low Stock' : 'In Stock'}</span>
          </div>
        </div>

        {/* Price & CTA action parameters */}
        <div className="mt-2 sm:mt-3">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  Rs.{product.discountPrice}
                </span>
                <span className="text-[10px] sm:text-xs line-through text-muted-foreground font-mono">
                  Rs.{product.price}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-semibold text-foreground">
                Rs.{product.price}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="w-full mt-2 sm:mt-4 border border-primary/40 text-foreground bg-transparent hover:bg-primary hover:text-primary-foreground py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold rounded-sm tracking-wide transition active:scale-95 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? "Sold out" : "Add to Bag"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
