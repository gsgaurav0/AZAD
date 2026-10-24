'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useUIStore((state) => state.addToast);

  const handleMoveToCart = (product: (typeof items)[0]) => {
    const availableSize =
      product.sizes.find((s) => s.inStock)?.size || product.sizes[0]?.size || 'Standard';
    const color = product.colors[0]?.name || 'Standard';
    addItem(product, color, availableSize, 1);
    removeItem(product.id);
    addToast(`Moved "${product.name}" (${availableSize}) to your shopping bag`, 'success');
  };

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 md:py-16 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-8 border-b border-[#DDD2C0]">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
              CURATED ARCHIVE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B1A16] font-normal">
              My Wishlist
            </h1>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-xs text-[#2B1A16]/70 font-sans">
                {items.length} {items.length === 1 ? 'Garment' : 'Garments'} saved
              </span>
              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs text-[#B3402F] hover:underline font-semibold"
              >
                Clear Wishlist
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-12 sm:p-16 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-4">
              <Heart className="w-8 h-8 opacity-70" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-[#2B1A16] mb-2">
              Your wishlist is currently empty
            </h2>
            <p className="text-xs sm:text-sm text-[#2B1A16]/70 mb-8 font-sans leading-relaxed">
              Save your favorite mulberry silk dresses, Neapolitan jackets, and handcrafted accessories while browsing the collection.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((product) => (
              <div
                key={product.id}
                className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative aspect-[3/4] bg-[#DDD2C0]/20 overflow-hidden">
                  <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(product.id);
                      addToast(`Removed from wishlist`, 'info');
                    }}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/80 hover:bg-white text-[#B3402F] rounded-full transition-colors shadow-xs"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#2B1A16]/60 font-semibold font-sans block mb-1">
                      {product.category}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-serif text-sm font-medium text-[#2B1A16] hover:text-[#9A8029] line-clamp-1 mb-1 block"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-bold text-sm text-[#2B1A16]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="line-through text-xs text-[#2B1A16]/40 font-sans">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider py-2.5 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 font-sans"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
