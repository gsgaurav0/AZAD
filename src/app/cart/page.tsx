'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';

export default function CartPage() {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const {
    items,
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
    clearCart,
  } = useCartStore();

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addToast = useUIStore((state) => state.addToast);

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
    addToast(`Moved "${item.product.name}" to wishlist`, 'info');
  };

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 md:py-16 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-8 mb-8 border-b border-[#DDD2C0]">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
            YOUR ORDER
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B1A16] font-normal">
            Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-12 sm:p-16 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 opacity-70" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-[#2B1A16] mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-xs sm:text-sm text-[#2B1A16]/70 mb-8 font-sans leading-relaxed">
              Explore our architectural tailoring, Mulberry silks, and slow sustainable garments.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Notification */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-4 rounded-[4px]">
                <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                  <span className="flex items-center gap-1.5 font-medium text-[#2B1A16]">
                    <Sparkles className="w-4 h-4 text-[#9A8029]" />
                    {freeShippingRemaining > 0 ? (
                      <>
                        Add <strong className="text-[#9A8029]">₹{freeShippingRemaining.toLocaleString('en-IN')}</strong> more for Complimentary Delivery
                      </>
                    ) : (
                      <strong className="text-[#4C7A34]">
                        You unlocked Complimentary Express Doorstep Delivery!
                      </strong>
                    )}
                  </span>
                  <span className="text-xs text-[#2B1A16]/60">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#DDD2C0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#9A8029] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] divide-y divide-[#DDD2C0]/50 p-6">
                {items.map((item, idx) => {
                  const colorObj = item.product.colors.find(
                    (c) => c.name === item.selectedColor
                  );
                  return (
                    <div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start justify-between"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-24 h-32 rounded-[3px] overflow-hidden bg-[#DDD2C0]/30 shrink-0">
                          <Image
                            src={colorObj?.image || item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#2B1A16]/60 font-semibold font-sans block mb-1">
                            {item.product.category} • {item.product.subcategory}
                          </span>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-serif text-base sm:text-lg font-medium text-[#2B1A16] hover:text-[#9A8029] line-clamp-1 mb-1 block"
                          >
                            {item.product.name}
                          </Link>

                          {/* Color & Size selectors */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#2B1A16]/70 mt-1 font-sans">
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-full border border-[#DDD2C0]"
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
                                  updateSize(
                                    item.product.id,
                                    item.selectedColor,
                                    item.selectedSize,
                                    e.target.value
                                  )
                                }
                                className="bg-white border border-[#DDD2C0] rounded-[2px] px-2 py-0.5 text-xs text-[#2B1A16] outline-none"
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
                          <div className="flex items-baseline gap-2 mt-3 font-sans">
                            <span className="font-serif font-bold text-base text-[#2B1A16]">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.product.originalPrice > item.product.price && (
                              <span className="line-through text-xs text-[#2B1A16]/40">
                                ₹{(item.product.originalPrice * item.quantity).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stepper, Move to Wishlist, Remove Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-[#DDD2C0]/40">
                        {/* Quantity Stepper */}
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
                            className="p-1.5 hover:bg-[#EFE8DD] text-[#2B1A16] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-[#2B1A16] min-w-6 text-center font-sans">
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
                            className="p-1.5 hover:bg-[#EFE8DD] text-[#2B1A16] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-sans">
                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            className="text-[#2B1A16]/70 hover:text-[#9A8029] flex items-center gap-1 transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.product.id, item.selectedColor, item.selectedSize)
                            }
                            className="text-[#B3402F] hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#9A8029] hover:underline"
                >
                  ← Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-[#2B1A16]/60 hover:text-[#B3402F]"
                >
                  Empty Bag
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary & Coupon */}
            <div className="lg:col-span-4 space-y-4 sticky top-24">
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-5">
                <h3 className="font-serif text-lg font-semibold text-[#2B1A16] pb-3 border-b border-[#DDD2C0]">
                  Price Summary
                </h3>

                {/* Promo Code Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 mb-1.5 font-sans">
                    Have a promo code?
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-[#EFE8DD] border border-[#9A8029]/50 rounded-[3px] px-3 py-2 text-xs">
                      <span className="flex items-center gap-1.5 text-[#9A8029] font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        Coupon <strong>{appliedCoupon}</strong> Applied
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[#B3402F] text-[11px] hover:underline uppercase font-bold"
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
                        placeholder="MEWAK10 or WELCOME50"
                        className="flex-1 bg-white border border-[#DDD2C0] rounded-[3px] px-3 py-2 text-xs text-[#2B1A16] uppercase outline-none focus:border-[#9A8029]"
                      />
                      <button
                        type="submit"
                        className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-[3px] transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-[#B3402F] mt-1">{couponError}</p>
                  )}

                  {/* Quick Click-to-Apply Coupons */}
                  {!appliedCoupon && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const res = applyCoupon('MEWAK10');
                          if (res.success) addToast(res.message, 'success');
                        }}
                        className="text-[10px] bg-[#EFE8DD] hover:bg-[#DDD2C0] text-[#2B1A16] px-2 py-0.5 rounded-[2px] border border-[#DDD2C0]"
                      >
                        Use <strong>MEWAK10</strong> (10% Off)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const res = applyCoupon('WELCOME50');
                          if (res.success) addToast(res.message, 'success');
                          else setCouponError(res.message);
                        }}
                        className="text-[10px] bg-[#EFE8DD] hover:bg-[#DDD2C0] text-[#2B1A16] px-2 py-0.5 rounded-[2px] border border-[#DDD2C0]"
                      >
                        Use <strong>WELCOME50</strong> (₹500 Off &gt; ₹1999)
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary Lines */}
                <div className="space-y-2 text-xs font-sans text-[#2B1A16]/80 pt-2 border-t border-[#DDD2C0]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#4C7A34] font-medium">
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
                  <div className="flex justify-between text-base font-semibold text-[#2B1A16] pt-3 border-t border-[#DDD2C0]">
                    <span>Total Amount</span>
                    <span className="font-serif text-xl">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full bg-[#9A8029] hover:bg-[#7F6A1F] text-white py-3.5 px-4 rounded-[4px] text-xs font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#2B1A16]/60 text-center pt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4C7A34]" />
                  <span>256-Bit SSL Encrypted & Verified Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
