'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Heart,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';

export default function CartDrawer() {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    updateSize,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getShippingFee,
    getCouponDiscount,
    getTotal,
    getFreeShippingRemaining,
  } = useCartStore();

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addToast = useUIStore((state) => state.addToast);

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const discount = getCouponDiscount();
  const total = getTotal();
  const freeShippingRemaining = getFreeShippingRemaining();
  const progressPercent = Math.min(100, Math.round(((999 - freeShippingRemaining) / 999) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      addToast(res.message, 'success');
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleMoveToWishlist = (item: (typeof items)[0]) => {
    toggleWishlist(item.product);
    removeItem(item.product.id, item.selectedColor, item.selectedSize);
    addToast(`Moved "${item.product.name}" to your wishlist`, 'info');
  };

  const handleCheckoutClick = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2B1A16]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FBF7F0] border-l border-[#DDD2C0] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#DDD2C0] flex items-center justify-between bg-[#EFE8DD]/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#9A8029]" />
              <h3 className="font-serif text-lg font-semibold text-[#2B1A16]">
                Your Shopping Bag
              </h3>
              <span className="text-xs bg-[#2B1A16] text-[#EFE8DD] px-2 py-0.5 rounded-full font-sans font-medium">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-[#2B1A16]/70 hover:text-[#2B1A16] transition-colors rounded-[4px]"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#EFE8DD] px-4 py-3 border-b border-[#DDD2C0]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              <span className="flex items-center gap-1.5 font-medium text-[#2B1A16]">
                <Sparkles className="w-3.5 h-3.5 text-[#9A8029]" />
                {freeShippingRemaining > 0 ? (
                  <>
                    Add <span className="font-semibold text-[#9A8029]">₹{freeShippingRemaining.toLocaleString('en-IN')}</span> more for Complimentary Shipping
                  </>
                ) : (
                  <span className="text-[#4C7A34] font-semibold">
                    You unlocked Complimentary Shipping!
                  </span>
                )}
              </span>
              <span className="text-[11px] text-[#2B1A16]/60">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#DDD2C0] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#9A8029] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#DDD2C0]/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h4 className="font-serif text-lg font-medium text-[#2B1A16] mb-1">
                  Your bag is currently empty
                </h4>
                <p className="text-xs text-[#2B1A16]/60 max-w-xs mb-6">
                  Discover our timeless silhouettes, Mulberry silks, and artisanal tailoring.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-[4px] transition-colors"
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              items.map((item, idx) => {
                const colorObj = item.product.colors.find((c) => c.name === item.selectedColor);
                return (
                  <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`} className="py-4 flex gap-3 sm:gap-4 first:pt-0 last:pb-0">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-26 sm:w-22 sm:h-28 bg-[#DDD2C0]/30 rounded-[3px] overflow-hidden shrink-0">
                      <Image
                        src={colorObj?.image || item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-serif text-sm font-medium text-[#2B1A16] hover:text-[#9A8029] line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id, item.selectedColor, item.selectedSize)}
                            className="text-[#2B1A16]/40 hover:text-[#B3402F] p-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Color & Size Select */}
                        <div className="flex items-center gap-3 text-xs text-[#2B1A16]/70 mt-1">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-[#DDD2C0]"
                              style={{ backgroundColor: colorObj?.hex || '#9A8029' }}
                            />
                            {item.selectedColor}
                          </span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span>Size:</span>
                            <select
                              value={item.selectedSize}
                              onChange={(e) =>
                                updateSize(item.product.id, item.selectedColor, item.selectedSize, e.target.value)
                              }
                              className="bg-transparent border border-[#DDD2C0] rounded-[2px] px-1 py-0.5 text-xs text-[#2B1A16] outline-none"
                            >
                              {item.product.sizes.map((s) => (
                                <option key={s.size} value={s.size} disabled={!s.inStock}>
                                  {s.size} {!s.inStock ? '(Sold out)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-semibold text-sm text-[#2B1A16]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {item.product.originalPrice > item.product.price && (
                            <span className="line-through text-xs text-[#2B1A16]/40">
                              ₹{(item.product.originalPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper & Move to Wishlist */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#DDD2C0]/30 mt-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#DDD2C0] rounded-[3px] bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="p-1 hover:bg-[#EFE8DD] text-[#2B1A16] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-[#2B1A16] min-w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            className="p-1 hover:bg-[#EFE8DD] text-[#2B1A16] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Move to Wishlist */}
                        <button
                          type="button"
                          onClick={() => handleMoveToWishlist(item)}
                          className="flex items-center gap-1 text-[11px] text-[#2B1A16]/70 hover:text-[#9A8029] transition-colors font-sans"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>Save for later</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#DDD2C0] bg-[#EFE8DD]/70 space-y-3">
              {/* Promo Code Input / Chip */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#FBF7F0] border border-[#9A8029]/50 rounded-[4px] px-3 py-1.5 text-xs text-[#2B1A16]">
                  <span className="flex items-center gap-1.5 text-[#9A8029] font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    Coupon <strong className="uppercase">{appliedCoupon}</strong> Applied
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[#B3402F] text-[11px] hover:underline uppercase font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Promo code (MEWAK10, WELCOME50)"
                    className="flex-1 bg-white border border-[#DDD2C0] rounded-[4px] px-3 py-1.5 text-xs text-[#2B1A16] uppercase outline-none placeholder:normal-case placeholder:text-[#2B1A16]/40"
                  />
                  <button
                    type="submit"
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] px-3 py-1.5 text-xs uppercase font-semibold tracking-wider rounded-[4px] transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-[#B3402F]">{couponError}</p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#2B1A16]/80 font-sans pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#4C7A34]">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-[#4C7A34] uppercase font-semibold">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#2B1A16] pt-2 border-t border-[#DDD2C0]">
                  <span>Total Payable</span>
                  <span className="font-serif text-base">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center py-2.5 px-3 border border-[#2B1A16] text-[#2B1A16] hover:bg-[#2B1A16] hover:text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider rounded-[4px] transition-colors"
                >
                  View Bag
                </Link>
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="w-full py-2.5 px-3 bg-[#9A8029] hover:bg-[#7F6A1F] text-white text-xs font-semibold uppercase tracking-wider rounded-[4px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trust Tagline */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-[#2B1A16]/60 pt-1">
                <ShieldCheck className="w-3 h-3 text-[#4C7A34]" />
                <span>100% Genuine Luxury • 15-Day Hassle-Free Returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
