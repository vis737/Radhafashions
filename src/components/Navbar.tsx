import React, { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Search, ShoppingCart, Heart, User, Key, Sparkles, LogIn, Menu, X, HelpCircle, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Product } from '../types';
import { CATEGORIES } from '../utils/mockData';
import ThemeSwitcher from './ThemeSwitcher';

const MerisLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="logoBg" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </radialGradient>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="glitterGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#FFF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#D97706" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    {/* Background circle */}
    <circle cx="100" cy="100" r="96" fill="url(#logoBg)" stroke="url(#goldGradient)" strokeWidth="1.2" />

    {/* Dense golden glitter ring wreath */}
    <circle cx="100" cy="100" r="86" stroke="url(#goldGradient)" strokeWidth="4.5" strokeDasharray="3 6 1 4 8 3" className="opacity-80" />
    <circle cx="100" cy="100" r="89" stroke="url(#glitterGradient)" strokeWidth="2.5" strokeDasharray="1 5 12 4" />
    <circle cx="100" cy="100" r="82" stroke="url(#goldGradient)" strokeWidth="1.5" strokeDasharray="6 2 3 5 1 3" className="opacity-90" />
    <circle cx="100" cy="100" r="92" stroke="#FFF" strokeWidth="1" strokeDasharray="1 8 2 12" className="opacity-45" />

    {/* Rich detailed wreath sparkle leaf elements */}
    <g fill="url(#goldGradient)">
      <path d="M100 8 L101.5 12 L105.5 13 L101.5 14 L100 18 L98.5 14 L94.5 13 L98.5 12 Z" />
      <path d="M100 182 L101.5 186 L105.5 187 L101.5 188 L100 192 L98.5 188 L94.5 187 L98.5 186 Z" />
      <path d="M187 100 L191 101.5 L192 105.5 L193 101.5 L197 100 L193 98.5 L192 94.5 L191 98.5 Z" />
      <path d="M13 100 L17 101.5 L18 105.5 L19 101.5 L23 100 L19 98.5 L18 94.5 L17 98.5 Z" />
      
      {/* Diagonals */}
      <path d="M161 39 L164 41 L166 44 L165 41 L168 39 L165 38 L164 35 L163 38 Z" />
      <path d="M39 161 L42 163 L44 166 L43 163 L46 161 L43 160 L42 157 L41 160 Z" />
      <path d="M161 161 L163 164 L166 165 L163 166 L161 169 L160 166 L157 165 L160 164 Z" />
      <path d="M39 39 L41 42 L44 43 L41 44 L39 47 L38 44 L35 43 L38 42 Z" />
    </g>

    {/* Random organic glitter flakes */}
    <g fill="#FBBF24">
      <circle cx="100" cy="22" r="1.5" />
      <circle cx="145" cy="30" r="1.2" />
      <circle cx="155" cy="42" r="1.8" />
      <circle cx="172" cy="65" r="1" />
      <circle cx="178" cy="85" r="1.5" />
      <circle cx="174" cy="120" r="1.2" />
      <circle cx="165" cy="142" r="1.6" />
      <circle cx="142" cy="165" r="1.4" />
      <circle cx="118" cy="174" r="1.8" />
      <circle cx="82" cy="174" r="1.3" />
      <circle cx="58" cy="165" r="1.5" />
      <circle cx="35" cy="142" r="1.2" />
      <circle cx="26" cy="120" r="1.6" />
      <circle cx="22" cy="85" r="1" />
      <circle cx="28" cy="65" r="1.4" />
      <circle cx="45" cy="30" r="1.8" />
      <circle cx="55" cy="22" r="1.2" />
    </g>

    {/* Elegant Typography inside */}
    <text
      x="100"
      y="75"
      textAnchor="middle"
      fill="url(#goldGradient)"
      fontSize="24"
      fontFamily="'Times New Roman', Times, 'Playfair Display', Georgia, serif"
      fontWeight="bold"
      letterSpacing="2.5"
    >
      MERIS
    </text>
    <text
      x="100"
      y="108"
      textAnchor="middle"
      fill="url(#goldGradient)"
      fontSize="23"
      fontFamily="'Times New Roman', Times, 'Playfair Display', Georgia, serif"
      fontWeight="bold"
      letterSpacing="2.5"
    >
      E-SHOP
    </text>

    {/* Horizontal divider lines */}
    <line x1="55" y1="118" x2="145" y2="118" stroke="url(#goldGradient)" strokeWidth="1" strokeOpacity="0.7" />

    <text
      x="100"
      y="134"
      textAnchor="middle"
      fill="#FFF"
      fontSize="10"
      fontFamily="'Courier New', Courier, monospace, sans-serif"
      fontWeight="bold"
      letterSpacing="3"
      className="opacity-90"
    >
      EST 2025
    </text>

    {/* Hand Craft sub-bullets inside */}
    <text
      x="100"
      y="151"
      textAnchor="middle"
      fill="#94A3B8"
      fontSize="7.5"
      fontFamily="system-ui, sans-serif"
      fontWeight="bold"
      letterSpacing="0.3"
      className="opacity-80"
    >
      - Kids Toys - Gifts -
    </text>
    <text
      x="100"
      y="163"
      textAnchor="middle"
      fill="#94A3B8"
      fontSize="7.5"
      fontFamily="system-ui, sans-serif"
      fontWeight="bold"
      letterSpacing="0.3"
      className="opacity-80"
    >
      - Stationeries -
    </text>
  </svg>
);

interface NavbarProps {
  cartItems: CartItem[];
  wishlistIds: string[];
  allProducts: Product[];
  currentCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  onNavigate: (view: 'home' | 'category' | 'product' | 'checkout' | 'account' | 'admin') => void;
  onSelectProduct: (productId: string) => void;
  onSetProductsFilter: (filtered: Product[]) => void;
  onOpenCart: () => void;
  currentUser: { email: string; name: string } | null;
  onLogout: () => void;
}

export default function Navbar({
  cartItems,
  wishlistIds,
  allProducts,
  currentCategory,
  onSelectCategory,
  onNavigate,
  onSelectProduct,
  onSetProductsFilter,
  onOpenCart,
  currentUser,
  onLogout
}: NavbarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiGreeting, setAiGreeting] = useState('');
  const [suggestedSlug, setSuggestedSlug] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  const { isSignedIn: isClerkSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const handleLogoutClick = async () => {
    try {
      if (isClerkSignedIn && clerkSignOut) {
        await clerkSignOut();
      }
    } catch (err) {
      console.error('Navbar Clerk logout error:', err);
    }
    onLogout();
  };

  // Total items in cart
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Debounced search engine with full-stack Gemini suggestions
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      setAiGreeting('');
      setSuggestedSlug('');
      onSetProductsFilter(allProducts);
      return;
    }

    const timer = setTimeout(async () => {
      // Filter products locally first
      const matched = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.category.toLowerCase().includes(searchInput.toLowerCase())
      );
      onSetProductsFilter(matched);

      // Call Express server-side Gemini search intelligence
      try {
        const res = await fetch('/api/gemini/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchInput, allCategories: CATEGORIES })
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.aiSuggestions || []);
          setAiGreeting(data.smartQueryResponse || '');
          setSuggestedSlug(data.suggestedCategorySlug || '');
        }
      } catch (err) {
        console.error('AI search suggests error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, allProducts, onSetProductsFilter]);

  // Click outside suggestions cleanup
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  const handleSuggestionClick = (term: string) => {
    setSearchInput(term);
    setSearchFocused(false);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSuggestions([]);
    setAiGreeting('');
    setSuggestedSlug('');
    onSetProductsFilter(allProducts);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b-[3px] border-[#C5A021] text-white font-sans shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 sm:hidden text-slate-300 hover:text-[#C5A021] border border-slate-700/60 rounded-xl hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Luxury Gold/Navy Brand Typography Logo */}
          <div
            onClick={() => { onNavigate('home'); clearSearch(); }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-gold-500/10 border border-[#C5A021]/30 bg-[#0F172A] hover:scale-105 transition duration-300">
              <MerisLogo className="w-full h-full" />
            </div>
            <div>
              <span className="font-display font-black text-xl sm:text-2xl tracking-[0.5px] text-[#C5A021] uppercase">
                MERIS<span className="text-white"> E-SHOP</span>
              </span>
              <p className="text-[9px] text-slate-400 tracking-[0.18em] font-medium leading-none">PREMIUM SELECTION</p>
            </div>
          </div>

          {/* Navigation Category list (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => { onNavigate('home'); clearSearch(); }}
              className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${currentCategory === '' ? 'text-[#C5A021]' : 'text-slate-300 hover:text-[#C5A021]'}`}
            >
              Shop All
            </button>
            
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="text-xs font-bold tracking-wider uppercase flex items-center gap-1 text-slate-300 hover:text-[#C5A021] transition cursor-pointer"
              >
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              <AnimatePresence>
                {categoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-8 left-0 w-64 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl p-2 grid grid-cols-1 gap-1 z-50 text-left"
                  >
                    {CATEGORIES.map((category, idx) => (
                      <motion.button
                        key={category.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.2 }}
                        onClick={() => {
                          onSelectCategory(category.id);
                          onNavigate('category');
                          setCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-[#C5A021] rounded-lg transition"
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* AI-Integrated advanced Search Bar Container */}
          <div ref={searchRef} className="hidden sm:block flex-1 max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search premium toys, gold stencils, gifts..."
                value={searchInput}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-slate-700 text-slate-200 placeholder-slate-400 focus:bg-[#1E293B] focus:border-[#C5A021] rounded-full text-xs focus:outline-none transition leading-normal"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3.5 top-3 w-5 h-5 text-slate-400 hover:text-slate-200 font-mono text-xs"
                >
                  x
                </button>
              )}
            </div>

            {/* Smart suggestions popover */}
            {searchFocused && (searchInput || aiGreeting) && (
              <div className="absolute top-12 left-0 right-0 bg-[#0F172A] border border-slate-700 shadow-2xl rounded-2xl p-4 z-50 space-y-3">
                {aiGreeting && (
                  <div className="p-3 bg-slate-800/80 border border-[#C5A021]/20 rounded-xl text-left">
                    <p className="text-[11px] text-slate-400 font-display font-medium tracking-wide uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A021]" />
                      AI Search Assistant
                    </p>
                    <p className="text-xs text-slate-200 font-sans italic mt-1 leading-relaxed">
                      "{aiGreeting}"
                    </p>
                    {suggestedSlug && (
                      <button
                        onClick={() => {
                          onSelectCategory(suggestedSlug);
                          onNavigate('category');
                          setSearchFocused(false);
                        }}
                        className="mt-2 text-[11px] font-semibold text-[#C5A021] hover:text-[#C5A021]/80 flex items-center gap-1"
                      >
                        Visit Category Page &gt;
                      </button>
                    )}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="text-left">
                    <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase mb-1">Recommended Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(term)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#C5A021] rounded-lg text-xs font-semibold border border-slate-700/50 transition whitespace-nowrap"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Action Elements */}
          <div className="flex items-center gap-2 sm:gap-4 select-none pr-1">
            {/* Wishlist triggers */}
            <button
              onClick={() => onNavigate('account')}
              className="p-2 text-slate-300 hover:text-[#C5A021] hover:bg-slate-800 transition rounded-xl relative cursor-pointer font-semibold"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Profile trigger / Login status indicator */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-[#C5A021]/15 border border-[#C5A021]/30 rounded-xl p-1">
                <button
                  onClick={() => onNavigate('account')}
                  className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer pr-1"
                  title="View Account Profile"
                >
                  <div className="w-7 h-7 bg-[#C5A021] rounded-lg text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[10px] font-bold text-white truncate leading-none">{currentUser.name}</p>
                    <p className="text-[8px] text-[#C5A021] font-mono tracking-wider">MEMBER</p>
                  </div>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                  title="Log Out Profile"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('account')}
                className="p-2 text-slate-400 hover:text-[#C5A021] hover:bg-slate-800 transition rounded-xl cursor-pointer"
                title="Account Login"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Inline Theme Toggle */}
            <ThemeSwitcher />

            {/* Shopping Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="p-2 text-slate-300 hover:text-[#C5A021] hover:bg-slate-800 transition rounded-xl relative cursor-pointer"
              title="Your Bag"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#C5A021] rounded-full text-[9px] text-white flex items-center justify-center font-bold border border-[#0F172A]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* --- Mobile Menu Drawer --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex sm:hidden">
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 z-10 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-medium text-sm tracking-widest text-navy-900 uppercase">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-full bg-gray-50 border border-gray-100">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Mobile Categories lists */}
              <div className="space-y-4">
                <button
                  onClick={() => { onNavigate('home'); clearSearch(); setMobileMenuOpen(false); }}
                  className="block text-left w-full pb-2 border-b border-gray-100 text-sm font-semibold text-gray-800"
                >
                  Shop All
                </button>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Categories</span>
                  {CATEGORIES.map((category, idx) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 + 0.08, duration: 0.2 }}
                      onClick={() => {
                        onSelectCategory(category.id);
                        onNavigate('category');
                        setMobileMenuOpen(false);
                      }}
                      className="block text-left w-full py-1.5 text-xs text-slate-700 hover:text-[#C5A021] font-medium"
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Help Block information */}
              <div className="pt-8 border-t border-gray-100 space-y-2">
                <p className="text-[10px] font-mono text-gray-400 uppercase">Assistance Contact</p>
                <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-gold-400" />
                  +91 93842 92229
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}


