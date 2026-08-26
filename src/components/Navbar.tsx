import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Search, ShoppingCart, Heart, User, Key, Sparkles, LogIn, Menu, X, HelpCircle, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Product } from '../types';
import { CATEGORIES } from '../utils/mockData';
import ThemeSwitcher from './ThemeSwitcher';

const RadhaLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
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
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="50%" stopColor="#FBCFE8" />
        <stop offset="100%" stopColor="#BE185D" />
      </linearGradient>
      <linearGradient id="glitterGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#FFF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#DB2777" stopOpacity="0.5" />
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
    <g fill="#FBCFE8">
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
      Radha Fashions
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
      BOUTIQUE
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

    {/* Boutique sub-bullets inside */}
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
      - Sarees - Lehengas -
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
  onNavigate: (view: 'home' | 'category' | 'product' | 'checkout' | 'account' | 'admin' | 'about') => void;
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

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]/95 backdrop-blur-md text-gray-900 dark:text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center w-9 h-9 sm:hidden text-gray-600 dark:text-gray-300 hover:text-pink-500 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-pink-50 dark:hover:bg-pink-950/30 transition shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Boutique brand mark and typography */}
          <div
            onClick={() => { onNavigate('home'); clearSearch(); }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onNavigate('home');
                clearSearch();
              }
            }}
            aria-label="Go to Radha Fashions home"
          >
            <span className="shrink-0 overflow-hidden rounded-full bg-white p-0.5 shadow-sm ring-1 ring-pink-200/70 transition-transform duration-300 group-hover:scale-105 dark:ring-amber-200/35">
              <img
                src="/radha-fashions-logo.png"
                alt="Radha Fashions logo"
                className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full object-cover"
              />
            </span>
            <span className="flex flex-col leading-none min-w-0">
              <span className="font-display text-base sm:text-xl md:text-2xl tracking-tight text-foreground transition-colors group-hover:text-primary truncate">Radha Fashions</span>
              <span className="eyebrow mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] md:text-[10px]">Boutique</span>
            </span>
          </div>

          {/* Navigation Category list (Desktop only) */}
          <nav className="hidden md:flex items-center gap-6 shrink-0">
            <button
              onClick={() => { onNavigate('home'); clearSearch(); }}
              className={`text-xs font-bold tracking-wider uppercase transition cursor-pointer ${currentCategory === '' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Shop All
            </button>
            
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="text-xs font-bold tracking-wider uppercase flex items-center gap-1 text-muted-foreground hover:text-primary transition cursor-pointer"
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
                    className="absolute top-8 left-0 w-64 bg-card border border-border rounded-xl shadow-2xl p-2 grid grid-cols-1 gap-1 z-50 text-left"
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
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-primary rounded-lg transition"
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => { onNavigate('about'); clearSearch(); }}
              className="text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-primary transition cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* AI-Integrated Search Bar (Desktop / Tablet) */}
          <div ref={searchRef} className="hidden sm:block flex-1 max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search premium collections..."
                value={searchInput}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-muted/40 border border-border text-foreground placeholder-muted-foreground focus:bg-background focus:border-primary rounded-full text-xs focus:outline-none transition leading-normal"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3.5 top-3 w-5 h-5 text-muted-foreground hover:text-foreground font-mono text-xs"
                >
                  x
                </button>
              )}
            </div>

            {/* Smart suggestions popover */}
            {searchFocused && (searchInput || aiGreeting) && (
              <div className="absolute top-12 left-0 right-0 bg-card border border-border shadow-2xl rounded-2xl p-4 z-50 space-y-3">
                {aiGreeting && (
                  <div className="p-3 bg-muted/50 border border-primary/20 rounded-xl text-left">
                    <p className="text-[11px] text-primary font-display font-medium tracking-wide uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      AI Search Assistant
                    </p>
                    <p className="text-xs text-foreground font-sans italic mt-1 leading-relaxed">
                      "{aiGreeting}"
                    </p>
                    {suggestedSlug && (
                      <button
                        onClick={() => {
                          onSelectCategory(suggestedSlug);
                          onNavigate('category');
                          setSearchFocused(false);
                        }}
                        className="mt-2 text-[11px] font-semibold text-primary hover:text-primary-deep flex items-center gap-1"
                      >
                        Visit Category Page &gt;
                      </button>
                    )}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="text-left">
                    <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-1">Recommended Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(term)}
                          className="px-3 py-1.5 bg-muted hover:bg-primary-soft text-foreground hover:text-primary rounded-lg text-xs font-semibold border border-border transition whitespace-nowrap"
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

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 select-none shrink-0">
            {/* Wishlist */}
            <button
              onClick={() => onNavigate('account')}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-accent transition rounded-full relative cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[9px] flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Profile / Login */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-1 bg-primary-soft border border-primary/20 rounded-full p-1">
                <button
                  onClick={() => onNavigate('account')}
                  className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer pr-1"
                  title="View Account Profile"
                >
                  <div className="w-7 h-7 bg-primary rounded-full text-primary-foreground font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[10px] font-bold text-foreground truncate leading-none">{currentUser.name}</p>
                    <p className="text-[8px] text-primary font-mono tracking-wider">MEMBER</p>
                  </div>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('account')}
                className="hidden sm:flex p-2 text-muted-foreground hover:text-primary hover:bg-accent transition rounded-full cursor-pointer"
                title="Account Login"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeSwitcher />

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-accent transition rounded-full relative cursor-pointer"
              title="Your Bag"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold border border-background">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ========== MOBILE MENU DRAWER (RENDERED VIA PORTAL TO BODY) ========== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[999999] flex font-sans">
              {/* Dark backdrop */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Slide-in White Panel matching Image 2 */}
              <motion.aside
                key="mobile-panel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="relative z-10 h-full w-[78%] max-w-[320px] flex flex-col bg-white text-gray-900 shadow-2xl overflow-hidden"
              >
                {/* Header: "MENU" + Circular (X) close button */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                  <span className="font-bold text-sm sm:text-base tracking-[0.15em] uppercase text-gray-900 font-sans">
                    MENU
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Menu Body */}
                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 no-scrollbar">
                  
                  {/* Shop All with border bottom */}
                  <div className="pb-3 border-b border-gray-900">
                    <button
                      onClick={() => { onNavigate('home'); clearSearch(); setMobileMenuOpen(false); }}
                      className="w-full text-left font-bold text-base text-gray-900 hover:text-pink-600 transition cursor-pointer"
                    >
                      Shop All
                    </button>
                  </div>

                  {/* CATEGORIES header & list */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-mono tracking-[0.18em] text-gray-400 uppercase font-semibold block">
                      CATEGORIES
                    </span>
                    
                    <div className="space-y-3 pt-1">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            onSelectCategory(category.id);
                            onNavigate('category');
                            setMobileMenuOpen(false);
                          }}
                          className="block text-left w-full text-[15px] font-medium text-gray-800 hover:text-pink-600 transition cursor-pointer"
                        >
                          {category.name}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
                        className="block text-left w-full text-[15px] font-medium text-gray-800 hover:text-pink-600 transition cursor-pointer"
                      >
                        About Us
                      </button>

                      <button
                        onClick={() => { onNavigate('account'); setMobileMenuOpen(false); }}
                        className="block text-left w-full text-[15px] font-medium text-gray-800 hover:text-pink-600 transition cursor-pointer"
                      >
                        My Account
                      </button>

                      {currentUser && (
                        <button
                          onClick={() => { handleLogoutClick(); setMobileMenuOpen(false); }}
                          className="block text-left w-full text-[15px] font-medium text-red-600 hover:text-red-700 transition cursor-pointer"
                        >
                          Sign Out
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-900 pt-3" />

                  {/* ASSISTANCE CONTACT */}
                  <div className="space-y-2.5 pb-8">
                    <span className="text-[11px] font-mono tracking-[0.18em] text-gray-400 uppercase font-semibold block">
                      ASSISTANCE CONTACT
                    </span>
                    <a
                      href="tel:+919731153609"
                      className="flex items-center gap-2.5 text-[15px] font-semibold text-gray-900 hover:text-pink-600 transition"
                    >
                      <span className="w-5 h-5 rounded-full border border-amber-500 text-amber-500 flex items-center justify-center text-xs font-bold font-serif shrink-0">
                        ?
                      </span>
                      <span>+91 97311 53609</span>
                    </a>
                  </div>

                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
