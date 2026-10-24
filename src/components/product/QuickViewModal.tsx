'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Star, Heart, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function QuickViewModal() {
  const quickViewProduct = useUIStore((state) => state.quickViewProduct);
  const closeQuickView = useUIStore((state) => state.closeQuickView);
  const addToast = useUIStore((state) => state.addToast);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    quickViewProduct ? state.items.some((item) => item.id === quickViewProduct.id) : false
  );

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Sync state whenever quickViewProduct changes
  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors[0]?.name || 'Standard');
      setSelectedImage(quickViewProduct.images[0]);
      const firstInStock = quickViewProduct.sizes.find((s) => s.inStock)?.size || quickViewProduct.sizes[0]?.size || '';
      setSelectedSize(firstInStock);
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      addToast('Please select a size', 'error');
      return;
    }
    addItem(quickViewProduct, selectedColor, selectedSize, quantity);
    addToast(`Added "${quickViewProduct.name}" (${selectedSize}) to your bag`, 'success');
    closeQuickView();
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(quickViewProduct);
    addToast(
      added ? `Saved "${quickViewProduct.name}" to wishlist` : 'Removed from wishlist',
      'info'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] max-w-3xl w-full max-h-[92vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-1.5 bg-white/80 hover:bg-white text-[#2B1A16] rounded-full transition-colors shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="p-4 sm:p-6 bg-[#EFE8DD]/40 flex flex-col justify-between">
            <div className="relative aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-[#DDD2C0]/30 mb-3">
              <Image
                src={selectedImage || quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                fill
                className="object-cover"
              />
              {quickViewProduct.discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-[#B3402F] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2 py-0.5 rounded-[2px]">
                  {quickViewProduct.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickViewProduct.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-14 h-16 rounded-[2px] overflow-hidden border shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-[#9A8029] ring-1 ring-[#9A8029]'
                      : 'border-[#DDD2C0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-[#2B1A16]/60 mb-1">
                <span className="uppercase tracking-widest font-semibold">
                  {quickViewProduct.category} • {quickViewProduct.subcategory}
                </span>
                <div className="flex items-center gap-1 text-[#9A8029]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-semibold text-[#2B1A16]">
                    {quickViewProduct.rating}
                  </span>
                  <span className="text-[#2B1A16]/50">
                    ({quickViewProduct.reviewCount})
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                {quickViewProduct.name}
              </h3>
              <p className="text-xs text-[#2B1A16]/70 italic mt-0.5 font-sans">
                {quickViewProduct.subtitle}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 my-3">
                <span className="font-serif text-2xl font-bold text-[#2B1A16]">
                  ₹{quickViewProduct.price.toLocaleString('en-IN')}
                </span>
                {quickViewProduct.originalPrice > quickViewProduct.price && (
                  <span className="line-through text-sm text-[#2B1A16]/40 font-sans">
                    ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {quickViewProduct.discountPercent > 0 && (
                  <span className="text-xs font-semibold text-[#B3402F]">
                    Save {quickViewProduct.discountPercent}%
                  </span>
                )}
              </div>

              {/* Fabric & Fit badges */}
              <div className="bg-[#EFE8DD] p-2.5 rounded-[4px] text-xs text-[#2B1A16]/80 space-y-1 mb-4">
                <div>
                  <strong>Fabric:</strong> {quickViewProduct.fabric}
                </div>
                <div>
                  <strong>Fit:</strong> {quickViewProduct.fit}
                </div>
              </div>

              {/* Color swatches */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1.5">
                  Color: <span className="font-normal normal-case">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  {quickViewProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        if (c.image) setSelectedImage(c.image);
                      }}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        selectedColor === c.name
                          ? 'border-[#2B1A16] ring-2 ring-[#9A8029]'
                          : 'border-[#DDD2C0]'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className="w-3 h-3 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1.5">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map((s) => (
                    <button
                      key={s.size}
                      type="button"
                      disabled={!s.inStock}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-[3px] border transition-all ${
                        !s.inStock
                          ? 'border-[#DDD2C0]/40 text-[#2B1A16]/30 line-through bg-[#DDD2C0]/20 cursor-not-allowed'
                          : selectedSize === s.size
                          ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                          : 'border-[#DDD2C0] bg-white text-[#2B1A16] hover:border-[#9A8029]'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2 border-t border-[#DDD2C0]">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#9A8029] hover:bg-[#7F6A1F] text-white py-3 px-4 rounded-[4px] text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add To Bag
                </button>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-[4px] border transition-colors ${
                    isInWishlist
                      ? 'border-[#B3402F] text-[#B3402F] bg-[#B3402F]/10'
                      : 'border-[#DDD2C0] text-[#2B1A16] hover:text-[#9A8029]'
                  }`}
                  aria-label="Wishlist toggle"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                href={`/product/${quickViewProduct.slug}`}
                onClick={closeQuickView}
                className="block text-center py-2 text-xs font-semibold uppercase tracking-wider text-[#2B1A16] hover:text-[#9A8029] transition-colors"
              >
                View Full Product Narrative & Reviews <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
