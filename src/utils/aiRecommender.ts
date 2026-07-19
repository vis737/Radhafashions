import { Product, CartItem, Order } from '../types';

export interface AffinityProfile {
  categories: Record<string, number>;
  ageGroups: string[];
}

export function getAffinityProfile(
  cartItems: CartItem[],
  wishlistIds: string[],
  recentlyViewedIds: string[],
  allProducts: Product[],
  selectedAgeGroup?: string
): AffinityProfile {
  const profile: AffinityProfile = {
    categories: {},
    ageGroups: selectedAgeGroup ? [selectedAgeGroup] : []
  };

  // Add weight for cart items
  cartItems.forEach(item => {
    const slug = item.product.categorySlug;
    profile.categories[slug] = (profile.categories[slug] || 0) + 3 * item.quantity;
    if (item.product.ageGroup) {
      profile.categories[item.product.ageGroup] = (profile.categories[item.product.ageGroup] || 0) + 1;
    }
  });

  // Add weight for wishlist items
  wishlistIds.forEach(id => {
    const prod = allProducts.find(p => p.id === id);
    if (prod) {
      profile.categories[prod.categorySlug] = (profile.categories[prod.categorySlug] || 0) + 2;
    }
  });

  // Add weight for recently viewed
  recentlyViewedIds.forEach(id => {
    const prod = allProducts.find(p => p.id === id);
    if (prod) {
      profile.categories[prod.categorySlug] = (profile.categories[prod.categorySlug] || 0) + 1;
    }
  });

  return profile;
}

export function getAIRecommendations(
  allProducts: Product[],
  cartItems: CartItem[],
  wishlistIds: string[],
  recentlyViewedIds: string[],
  orders: Order[],
  selectedAgeGroup?: string
) {
  const profile = getAffinityProfile(cartItems, wishlistIds, recentlyViewedIds, allProducts, selectedAgeGroup);

  // Compute local metrics dynamically if not seeded
  const products = allProducts.map(p => {
    const viewCount = p.viewCount || (recentlyViewedIds.includes(p.id) ? 12 : 3);
    const wishlistCount = p.wishlistCount || (wishlistIds.includes(p.id) ? 8 : 1);
    
    // Calculate purchase count from order database
    let purchaseCount = p.purchaseCount || 0;
    orders.forEach(o => {
      o.items.forEach(item => {
        if (item.product.id === p.id) {
          purchaseCount += item.quantity;
        }
      });
    });

    const trendScore = p.trendScore || (viewCount * 0.4 + purchaseCount * 1.5 + wishlistCount * 0.8);
    const recommendationScore = p.recommendationScore || (trendScore + (profile.categories[p.categorySlug] || 0) * 5);

    return {
      ...p,
      viewCount,
      wishlistCount,
      purchaseCount,
      trendScore,
      recommendationScore
    };
  });

  // 1. Recommended For You
  const recommendedForYou = [...products]
    .filter(p => !cartItems.some(item => item.product.id === p.id))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 4);

  // 2. You May Also Like
  const favoriteSlug = Object.entries(profile.categories)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const youMayAlsoLike = [...products]
    .filter(p => p.categorySlug !== favoriteSlug && !cartItems.some(item => item.product.id === p.id))
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 4);

  // 3. Customers Similar To You Bought
  const customersSimilar = [...products]
    .filter(p => p.categorySlug === favoriteSlug && !cartItems.some(item => item.product.id === p.id))
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, 4);

  // 4. Because You Viewed
  const lastViewedId = recentlyViewedIds[0];
  const lastViewedProd = products.find(p => p.id === lastViewedId);
  const becauseYouViewed = lastViewedProd
    ? [...products]
        .filter(p => p.categorySlug === lastViewedProd.categorySlug && p.id !== lastViewedId)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)
    : [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  // 5. Inspired By Your Wishlist
  const inspiredByWishlist = wishlistIds.length > 0
    ? [...products]
        .filter(p => !wishlistIds.includes(p.id) && wishlistIds.some(wid => {
          const wp = products.find(prod => prod.id === wid);
          return wp && wp.categorySlug === p.categorySlug;
        }))
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 4)
    : [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  // 6. Recently Trending
  const recentlyTrending = [...products]
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 4);

  return {
    recommendedForYou,
    youMayAlsoLike,
    customersSimilar,
    becauseYouViewed,
    inspiredByWishlist,
    recentlyTrending
  };
}
