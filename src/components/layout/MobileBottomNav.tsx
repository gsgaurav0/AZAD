'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistItems = useWishlistStore((state) => state.items);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Hide bottom nav on Product Detail Page (which has its own sticky purchase bar) and Checkout
  if (pathname.startsWith('/product/') || pathname === '/checkout') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF7F0]/95 backdrop-blur-md border-t border-[#DDD2C0] shadow-lg px-1 py-1.5 safe-area-pb">
      <div className="grid grid-cols-5 items-center justify-around text-center h-12">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            isActive('/') ? 'text-[#9A8029]' : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-sans font-medium tracking-wider uppercase">
            Home
          </span>
          {isActive('/') && (
            <span className="absolute bottom-0 w-1 h-1 bg-[#9A8029] rounded-full" />
          )}
        </Link>

        {/* Shop */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            isActive('/shop') || isActive('/search')
              ? 'text-[#9A8029]'
              : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-sans font-medium tracking-wider uppercase">
            Shop
          </span>
          {(isActive('/shop') || isActive('/search')) && (
            <span className="absolute bottom-0 w-1 h-1 bg-[#9A8029] rounded-full" />
          )}
        </Link>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            isActive('/wishlist') ? 'text-[#9A8029]' : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#9A8029] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                {wishlistItems.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-sans font-medium tracking-wider uppercase">
            Wishlist
          </span>
          {isActive('/wishlist') && (
            <span className="absolute bottom-0 w-1 h-1 bg-[#9A8029] rounded-full" />
          )}
        </Link>

        {/* Bag */}
        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center py-1 text-[#2B1A16]/70 hover:text-[#9A8029] transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#2B1A16] text-[#EFE8DD] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-sans font-medium tracking-wider uppercase">
            Bag
          </span>
        </button>

        {/* Account */}
        {isLoggedIn ? (
          <Link
            href="/account"
            className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
              isActive('/account') ? 'text-[#9A8029]' : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-sans font-medium tracking-wider uppercase">
              Account
            </span>
            {isActive('/account') && (
              <span className="absolute bottom-0 w-1 h-1 bg-[#9A8029] rounded-full" />
            )}
          </Link>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex flex-col items-center justify-center py-1 text-[#2B1A16]/70 hover:text-[#9A8029] transition-colors"
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-sans font-medium tracking-wider uppercase">
              Login
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
