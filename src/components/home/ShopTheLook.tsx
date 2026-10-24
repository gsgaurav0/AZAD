'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { LOOKBOOK_LOOKS, PRODUCTS } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export default function ShopTheLook() {
  const look = LOOKBOOK_LOOKS[0];
  const [activePinId, setActivePinId] = useState<string | null>(look.pins[0].id);
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useUIStore((state) => state.addToast);

  const handleQuickAddPinProduct = (productId: string) => {
    const prod = PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;
    const defaultColor = prod.colors[0]?.name || 'Standard';
    const defaultSize = prod.sizes.find((s) => s.inStock)?.size || prod.sizes[0]?.size || 'One Size';
    addItem(prod, defaultColor, defaultSize, 1);
    addToast(`Added "${prod.name}" to your bag`, 'success');
  };

  return (
    <section className="py-14 sm:py-20 bg-[#FBF7F0] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Interactive Image Stage with Hotspot Pins */}
          <div className="lg:col-span-7 relative aspect-[4/5] rounded-[4px] overflow-hidden border border-[#DDD2C0] shadow-xl bg-[#2B1A16]">
            <Image
              src={look.image}
              alt={look.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Interactive Pins */}
            {look.pins.map((pin) => {
              const isActive = activePinId === pin.id;
              return (
                <div
                  key={pin.id}
                  className="absolute z-20"
                  style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
                >
                  <button
                    type="button"
                    onClick={() => setActivePinId(isActive ? null : pin.id)}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-[#9A8029] text-white scale-110 shadow-lg'
                        : 'bg-white/90 text-[#2B1A16] hover:bg-[#9A8029] hover:text-white shadow-md'
                    }`}
                    aria-label={`View ${pin.productName}`}
                  >
                    <span className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-60" />
                    {isActive ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>

                  {/* Hotspot Popover Tooltip */}
                  {isActive && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 sm:w-56 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] shadow-2xl p-2.5 sm:p-3 z-30 animate-fadeIn text-left">
                      <span className="text-[9px] text-[#9A8029] uppercase tracking-wider font-semibold block mb-0.5">
                        FEATURED GARMENT
                      </span>
                      <h4 className="font-serif text-xs font-semibold text-[#2B1A16] line-clamp-1 mb-1">
                        {pin.productName}
                      </h4>
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#DDD2C0]/50">
                        <span className="font-serif font-bold text-xs text-[#2B1A16]">
                          {pin.price}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAddPinProduct(pin.productId)}
                            className="p-1 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] rounded-[2px]"
                            title="Add to Bag"
                          >
                            <ShoppingBag className="w-3 h-3" />
                          </button>
                          <Link
                            href={`/product/${pin.productId}`}
                            className="text-[10px] font-semibold text-[#9A8029] hover:underline"
                          >
                            Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Editorial Narrative & Garment Breakdown */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-1.5 font-sans">
                RUNWAY CURATION
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#2B1A16] font-normal mb-2">
                {look.title}
              </h2>
              <p className="text-xs text-[#2B1A16]/70 italic font-sans mb-3">
                &ldquo;{look.tagline}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-[#2B1A16]/80 font-sans leading-relaxed">
                Tap the interactive plus badges on the model portrait to inspect each garment in this runway ensemble.
              </p>
            </div>

            {/* List of items in this look */}
            <div className="space-y-2.5 pt-1">
              {look.pins.map((pin) => {
                const prod = PRODUCTS.find((p) => p.id === pin.productId);
                return (
                  <div
                    key={pin.id}
                    onClick={() => setActivePinId(pin.id)}
                    className={`p-3 rounded-[4px] border transition-all cursor-pointer flex items-center justify-between ${
                      activePinId === pin.id
                        ? 'border-[#9A8029] bg-[#EFE8DD]'
                        : 'border-[#DDD2C0] bg-white hover:border-[#9A8029]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {prod && (
                        <div className="relative w-11 h-13 rounded-[2px] overflow-hidden bg-[#DDD2C0]/30 shrink-0">
                          <Image
                            src={prod.images[0]}
                            alt={pin.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#2B1A16] line-clamp-1">
                          {pin.productName}
                        </h4>
                        <span className="text-[11px] text-[#2B1A16]/70 font-sans">
                          {pin.price}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAddPinProduct(pin.productId);
                      }}
                      className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-[11px] font-semibold uppercase px-2.5 py-1.5 rounded-[2px] transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A8029] hover:text-[#7F6A1F] transition-colors"
              >
                <span>Browse All Runway Lookbooks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
