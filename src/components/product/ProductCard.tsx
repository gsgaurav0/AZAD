'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Star, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.id === product.id)
  );
  const addItem = useCartStore((state) => state.addItem);
  const openQuickView = useUIStore((state) => state.openQuickView);
  const addToast = useUIStore((state) => state.addToast);

  const activeColor = product.colors[selectedColorIndex] || product.colors[0];
  const primaryImage = activeColor?.image || product.images[0];
  const secondaryImage = product.images[1] || primaryImage;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    addToast(
      added ? `Added "${product.name}" to wishlist` : `Removed from wishlist`,
      'info'
    );
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // find first in-stock size
    const availableSize = product.sizes.find((s) => s.inStock)?.size || product.sizes[0]?.size || 'Standard';
    addItem(product, activeColor.name, availableSize, 1);
    addToast(`Added "${product.name}" (${availableSize}) to your bag`, 'success');
  };

  return (
    <div
      className="group relative flex flex-col bg-[#FBF7F0] border border-[#DDD2C0]/70 rounded-[4px] overflow-hidden transition-all duration-300 hover:border-[#9A8029]/60 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#DDD2C0]/20">
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          {/* Main Image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={`object-cover transition-all duration-700 ease-out ${
              isHovered && secondaryImage !== primaryImage
                ? 'opacity-0 scale-105'
                : 'opacity-100 scale-100'
            }`}
          />

          {/* Secondary Hover Image */}
          {secondaryImage && secondaryImage !== primaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-700 ease-out absolute inset-0 ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          )}
        </Link>

        {/* Badges: NEW / SALE % */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isNew && (
            <span className="bg-[#9A8029] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2 py-0.5 rounded-[2px] shadow-xs">
              NEW
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-[#B3402F] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2 py-0.5 rounded-[2px] shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isInWishlist
              ? 'bg-[#B3402F] text-white shadow-sm'
              : 'bg-white/80 text-[#2B1A16] hover:bg-white hover:text-[#9A8029] shadow-xs'
          }`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View & Quick Add Floating Overlay */}
        <div className="absolute inset-x-2 bottom-2 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="flex-1 bg-white/95 hover:bg-white text-[#2B1A16] text-xs font-semibold py-2 px-2 rounded-[2px] shadow-sm flex items-center justify-center gap-1.5 transition-colors font-sans uppercase tracking-wider"
          >
            <Eye className="w-3.5 h-3.5 text-[#9A8029]" />
            <span className="hidden sm:inline">Quick View</span>
          </button>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] p-2 rounded-[2px] shadow-sm flex items-center justify-center transition-colors"
            title="Instant Add to Bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Subcategory & Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#2B1A16]/60 mb-1 font-sans">
            <span className="uppercase tracking-wider font-medium truncate pr-2">
              {product.subcategory}
            </span>
            <div className="flex items-center gap-0.5 text-[#9A8029] shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-semibold text-[#2B1A16]">{product.rating}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product.slug}`}
            className="font-serif text-sm sm:text-base font-medium text-[#2B1A16] hover:text-[#9A8029] transition-colors line-clamp-1 mb-1 block"
          >
            {product.name}
          </Link>

          {/* Fabric Note */}
          <p className="text-[11px] text-[#2B1A16]/60 line-clamp-1 mb-2 font-sans italic">
            {product.fabric}
          </p>
        </div>

        <div>
          {/* Color Dots */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 mb-2.5">
              {product.colors.map((color, idx) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColorIndex(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColorIndex === idx
                      ? 'border-[#2B1A16] ring-1 ring-[#9A8029]'
                      : 'border-[#DDD2C0] hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              <span className="text-[10px] text-[#2B1A16]/50 ml-1 font-sans">
                {product.colors.length} colors
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-baseline gap-2 pt-1 border-t border-[#DDD2C0]/40">
            <span className="font-serif font-bold text-sm sm:text-base text-[#2B1A16]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="line-through text-xs text-[#2B1A16]/40 font-sans">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
