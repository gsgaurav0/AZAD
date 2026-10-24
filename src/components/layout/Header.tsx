'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { CATEGORIES_CONFIG, PRODUCTS } from '@/data/products';
import { Product } from '@/types';

export default function Header() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistItems = useWishlistStore((state) => state.items);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);

  // Detect scroll for subtle shadow/border transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const results = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q)
    ).slice(0, 5);
    setSearchResults(results);
  }, [searchQuery]);

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { id: 'women', label: 'Women', href: '/shop/women' },
    { id: 'men', label: 'Men', href: '/shop/men' },
    { id: 'kids', label: 'Kids', href: '/shop/kids' },
    { id: 'accessories', label: 'Accessories', href: '/shop/accessories' },
    { id: 'new-in', label: 'New In', href: '/shop?filter=new' },
    { id: 'sale', label: 'Sale', href: '/shop?filter=sale', isSale: true },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-[#EFE8DD]/95 backdrop-blur-md transition-all duration-300 ${
          isScrolled
            ? 'border-b border-[#DDD2C0] shadow-sm py-2.5'
            : 'border-b border-[#DDD2C0]/70 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & Desktop Navigation */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[#2B1A16] hover:text-[#9A8029] transition-colors -ml-2"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Desktop Mega-Menu trigger items */}
              <nav
                className="hidden lg:flex items-center space-x-7"
                onMouseLeave={() => setActiveMenu(null)}
              >
                {navLinks.map((link) => (
                  <div
                    key={link.id}
                    className="relative group py-2"
                    onMouseEnter={() => setActiveMenu(link.id)}
                  >
                    <Link
                      href={link.href}
                      className={`text-[13px] tracking-[0.14em] uppercase font-sans font-medium transition-colors duration-200 relative py-1 ${
                        link.isSale
                          ? 'text-[#B3402F] font-semibold hover:text-[#B3402F]/80'
                          : 'text-[#2B1A16] hover:text-[#9A8029]'
                      }`}
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#9A8029] transition-all duration-300 group-hover:w-full" />
                    </Link>

                    {/* Mega Menu Dropdown */}
                    {activeMenu === link.id && (
                      <div
                        className="fixed left-0 right-0 top-[calc(100%+8px)] w-full bg-[#FBF7F0] border-y border-[#DDD2C0] shadow-xl z-50 animate-fadeIn"
                        onMouseEnter={() => setActiveMenu(link.id)}
                        onMouseLeave={() => setActiveMenu(null)}
                      >
                        <div className="max-w-7xl mx-auto px-8 py-8">
                          {link.id === 'new-in' ? (
                            <div className="grid grid-cols-4 gap-8">
                              <div>
                                <h4 className="font-serif text-base font-semibold text-[#2B1A16] mb-3">
                                  Fresh Off The Atelier
                                </h4>
                                <ul className="space-y-2 text-sm text-[#2B1A16]/80 font-sans">
                                  <li>
                                    <Link href="/shop/women?filter=new" className="hover:text-[#9A8029] transition-colors">
                                      Women New Arrivals
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/shop/men?filter=new" className="hover:text-[#9A8029] transition-colors">
                                      Men New Arrivals
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/shop/kids?filter=new" className="hover:text-[#9A8029] transition-colors">
                                      Kids Miniatures
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/shop/accessories?filter=new" className="hover:text-[#9A8029] transition-colors">
                                      Fine Leather & Jewelry
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                              <div className="col-span-3 grid grid-cols-3 gap-4">
                                {PRODUCTS.filter((p) => p.isNew)
                                  .slice(0, 3)
                                  .map((np) => (
                                    <Link
                                      key={np.id}
                                      href={`/product/${np.slug}`}
                                      className="group/card flex flex-col"
                                    >
                                      <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] bg-[#DDD2C0]/20 mb-2">
                                        <Image
                                          src={np.images[0]}
                                          alt={np.name}
                                          fill
                                          sizes="(max-width: 1200px) 300px, 400px"
                                          className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-2 left-2 bg-[#9A8029] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2 py-0.5 rounded-[2px]">
                                          NEW
                                        </span>
                                      </div>
                                      <span className="text-xs font-serif font-medium text-[#2B1A16] line-clamp-1 group-hover/card:text-[#9A8029]">
                                        {np.name}
                                      </span>
                                      <span className="text-xs text-[#2B1A16]/70 mt-0.5">
                                        ₹{np.price.toLocaleString('en-IN')}
                                      </span>
                                    </Link>
                                  ))}
                              </div>
                            </div>
                          ) : link.id === 'sale' ? (
                            <div className="grid grid-cols-4 gap-8">
                              <div>
                                <div className="inline-flex items-center gap-1.5 text-[#B3402F] text-xs font-semibold uppercase tracking-wider mb-2">
                                  <Tag className="w-3.5 h-3.5" />
                                  Private Seasonal Sale
                                </div>
                                <h4 className="font-serif text-xl font-semibold text-[#2B1A16] mb-3">
                                  Up to 40% Off Selected Styles
                                </h4>
                                <p className="text-xs text-[#2B1A16]/70 mb-4 leading-relaxed">
                                  Archival pieces and limited seasonal editions crafted in noble materials.
                                </p>
                                <Link
                                  href="/shop?filter=sale"
                                  className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-[#9A8029] hover:underline uppercase"
                                >
                                  View All Sale Items <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                              <div className="col-span-3 grid grid-cols-3 gap-4">
                                {PRODUCTS.filter((p) => p.discountPercent >= 33)
                                  .slice(0, 3)
                                  .map((sp) => (
                                    <Link
                                      key={sp.id}
                                      href={`/product/${sp.slug}`}
                                      className="group/card flex flex-col"
                                    >
                                      <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] bg-[#DDD2C0]/20 mb-2">
                                        <Image
                                          src={sp.images[0]}
                                          alt={sp.name}
                                          fill
                                          sizes="(max-width: 1200px) 300px, 400px"
                                          className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-2 left-2 bg-[#B3402F] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2 py-0.5 rounded-[2px]">
                                          {sp.discountPercent}% OFF
                                        </span>
                                      </div>
                                      <span className="text-xs font-serif font-medium text-[#2B1A16] line-clamp-1 group-hover/card:text-[#9A8029]">
                                        {sp.name}
                                      </span>
                                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                                        <span className="font-semibold text-[#B3402F]">
                                          ₹{sp.price.toLocaleString('en-IN')}
                                        </span>
                                        <span className="line-through text-[#2B1A16]/40 text-[11px]">
                                          ₹{sp.originalPrice.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    </Link>
                                  ))}
                              </div>
                            </div>
                          ) : (
                            (() => {
                              const categoryData = CATEGORIES_CONFIG.find(
                                (c) => c.id === link.id
                              );
                              if (!categoryData) return null;
                              return (
                                <div className="grid grid-cols-12 gap-8 items-start">
                                  <div className="col-span-4">
                                    <h4 className="font-serif text-lg font-semibold text-[#2B1A16] mb-1">
                                      {categoryData.name} Collection
                                    </h4>
                                    <p className="text-xs text-[#2B1A16]/70 mb-4 font-sans">
                                      {categoryData.description}
                                    </p>
                                    <Link
                                      href={`/shop/${categoryData.slug}`}
                                      className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#9A8029] hover:underline"
                                    >
                                      Explore Full Catalog <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>

                                  <div className="col-span-4 border-l border-[#DDD2C0] pl-8">
                                    <span className="text-[11px] uppercase tracking-widest text-[#2B1A16]/50 font-semibold block mb-3">
                                      Categories
                                    </span>
                                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-sans text-[#2B1A16]/80">
                                      {categoryData.subcategories.map((sub) => (
                                        <Link
                                          key={sub}
                                          href={`/shop/${categoryData.slug}?sub=${encodeURIComponent(sub)}`}
                                          className="hover:text-[#9A8029] transition-colors py-0.5"
                                        >
                                          {sub}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="col-span-4 border-l border-[#DDD2C0] pl-8">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] mb-2 group/feat">
                                      <Image
                                        src={categoryData.featuredImage}
                                        alt={categoryData.featuredTitle}
                                        fill
                                        sizes="(max-width: 1200px) 400px, 500px"
                                        className="object-cover group-hover/feat:scale-105 transition-transform duration-700"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                                        <div className="text-white">
                                          <span className="text-[10px] tracking-widest uppercase text-[#DDD2C0]">
                                            CURATED EDIT
                                          </span>
                                          <h5 className="font-serif text-sm font-semibold">
                                            {categoryData.featuredTitle}
                                          </h5>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex-1 flex justify-center text-center">
              <Logo size="md" showSubtitle />
            </div>

            {/* Right: Actions (Search, Wishlist, Account, Cart) */}
            <div className="flex items-center gap-3 md:gap-5">
              {/* Search Icon Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-[#2B1A16] hover:text-[#9A8029] transition-colors relative"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-1.5 text-[#2B1A16] hover:text-[#9A8029] transition-colors relative"
                aria-label="View wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#9A8029] text-white text-[10px] font-sans font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Account / Login */}
              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="p-1.5 text-[#2B1A16] hover:text-[#9A8029] transition-colors relative"
                  aria-label="My Account"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="p-1.5 text-[#2B1A16] hover:text-[#9A8029] transition-colors"
                  aria-label="Login or sign up"
                >
                  <User className="w-5 h-5" />
                </button>
              )}

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="p-1.5 text-[#2B1A16] hover:text-[#9A8029] transition-colors relative flex items-center gap-1 group"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#2B1A16] text-[#EFE8DD] text-[10px] font-sans font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Search Modal / Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex flex-col justify-start pt-16 px-4 animate-fadeIn">
          <div className="max-w-2xl w-full mx-auto bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] shadow-2xl overflow-hidden">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-[#DDD2C0] px-4 py-3.5">
              <Search className="w-5 h-5 text-[#9A8029] mr-3 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Mulberry silk, blazers, Chanderi saree, linen..."
                className="w-full bg-transparent text-[#2B1A16] text-base font-sans outline-none placeholder:text-[#2B1A16]/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-[#2B1A16]/50 hover:text-[#2B1A16] mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs uppercase tracking-wider font-semibold text-[#2B1A16]/70 hover:text-[#2B1A16] ml-2"
              >
                ESC
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#2B1A16]/60 uppercase tracking-widest font-semibold mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-[#9A8029]" />
                    Trending Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Mulberry Silk Dress', 'Italian Wool Blazer', 'Linen Camp Shirt', 'Chanderi Saree', 'Leather Tote', 'Pashmina Wrap'].map((trend) => (
                      <button
                        key={trend}
                        type="button"
                        onClick={() => {
                          setSearchQuery(trend);
                        }}
                        className="text-xs bg-[#EFE8DD] hover:bg-[#DDD2C0] text-[#2B1A16] px-3 py-1.5 rounded-[4px] transition-colors"
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold text-[#2B1A16]/60 uppercase tracking-widest mb-3">
                    Matching Products ({searchResults.length})
                  </div>
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-[4px] hover:bg-[#EFE8DD] transition-colors group"
                      >
                        <div className="relative w-12 h-14 bg-[#DDD2C0]/40 rounded-[2px] overflow-hidden shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-serif text-sm font-medium text-[#2B1A16] group-hover:text-[#9A8029] truncate">
                            {product.name}
                          </h6>
                          <div className="flex items-center gap-2 text-xs text-[#2B1A16]/70 mt-0.5">
                            <span className="capitalize">{product.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#2B1A16]">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.discountPercent > 0 && (
                              <span className="text-[11px] text-[#B3402F] font-medium">
                                ({product.discountPercent}% OFF)
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#2B1A16]/40 group-hover:text-[#9A8029] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full mt-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[#9A8029] hover:bg-[#EFE8DD] rounded-[4px] transition-colors"
                  >
                    View all matching results for &ldquo;{searchQuery}&rdquo; →
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[#2B1A16]/60">
                  No fashion pieces matching &ldquo;{searchQuery}&rdquo;. Try searching by fabric, style, or occasion.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Hamburger Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2B1A16]/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#FBF7F0] shadow-2xl flex flex-col z-10 animate-slideRight">
            <div className="p-4 border-b border-[#DDD2C0] flex items-center justify-between">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#2B1A16] hover:text-[#9A8029]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category Links */}
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#2B1A16]/50 font-semibold block mb-2">
                  Collections
                </span>
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-2.5 text-base font-serif font-medium border-b border-[#DDD2C0]/40 ${
                        link.isSale ? 'text-[#B3402F]' : 'text-[#2B1A16]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Informational Links */}
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#2B1A16]/50 font-semibold block mb-2">
                  Maison MewaK
                </span>
                <div className="space-y-2 text-sm font-sans text-[#2B1A16]/80">
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 hover:text-[#9A8029]"
                  >
                    About Us & Heritage
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 hover:text-[#9A8029]"
                  >
                    Boutiques & Concierge
                  </Link>
                  <Link
                    href="/size-guide"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 hover:text-[#9A8029]"
                  >
                    Atelier Size Guide
                  </Link>
                  <Link
                    href="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 hover:text-[#9A8029]"
                  >
                    Frequently Asked Questions
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-[#DDD2C0] bg-[#EFE8DD] text-xs text-[#2B1A16]/70">
              <p className="font-serif italic text-center mb-1">
                &ldquo;Elegance is the only beauty that never fades.&rdquo;
              </p>
              <p className="text-[10px] text-center uppercase tracking-widest text-[#9A8029] font-medium">
                NEW DELHI • MUMBAI • BENGALURU
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
