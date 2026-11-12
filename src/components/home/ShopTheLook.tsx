'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function ShopTheLook() {
  const isMounted = useIsMounted();
  const cmsLook = useCMSStore((state) => state.cms.shopTheLook);
  const config = isMounted ? cmsLook : DEFAULT_CMS_DATA.shopTheLook;

  const pins = config.pins && config.pins.length > 0 ? config.pins : DEFAULT_CMS_DATA.shopTheLook.pins;
  const [activePinId, setActivePinId] = useState<string | null>(pins[0]?.id || null);

  const addItem = useCartStore((state) => state.addItem);
  const addToast = useUIStore((state) => state.addToast);
  const getProduct = useProductStore((state) => state.getProductBySlugOrId);

  if (!config.enabled) {
    return null;
  }

  const activePin = pins.find((p) => p.id === activePinId) || pins[0];

  const handleQuickAddPinProduct = (productId: string) => {
    const prod = getProduct(productId) || PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;
    const defaultColor = prod.colors?.[0]?.name || 'Standard';
    const defaultSize = prod.sizes?.find((s) => s.inStock)?.size || prod.sizes?.[0]?.size || 'One Size';
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
              src={config.lookImage || DEFAULT_CMS_DATA.shopTheLook.lookImage}
              alt={config.lookTitle}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Interactive Pins */}
            {pins.map((pin) => {
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
                </div>
              );
            })}
          </div>

          {/* Right Column: Editorial Narrative & Active Hotspot Card */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {config.eyebrow && (
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
                  {config.eyebrow}
                </span>
              )}
              <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-[#2B1A16] mb-3 leading-tight">
                {config.title}
              </h2>
              {config.description && (
                <p className="text-xs sm:text-sm text-[#2B1A16]/70 font-sans leading-relaxed">
                  {config.description}
                </p>
              )}
            </div>

            {/* Active Pin Item Highlight Card */}
            {activePin && (
              <div className="bg-[#EFE8DD] border border-[#DDD2C0] rounded-[4px] p-4 sm:p-5 shadow-sm transition-all animate-fadeIn">
                <span className="text-[9px] uppercase tracking-widest text-[#9A8029] font-semibold block mb-2 font-sans">
                  SELECTED IN SETUP
                </span>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-[3px] overflow-hidden bg-white shrink-0 border border-[#DDD2C0]/50">
                    <Image
                      src={activePin.image}
                      alt={activePin.productName}
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm sm:text-base font-semibold text-[#2B1A16] truncate mb-1">
                      {activePin.productName}
                    </h4>
                    <p className="font-serif font-bold text-sm sm:text-base text-[#2B1A16] mb-3">
                      ₹{activePin.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAddPinProduct(activePin.productId)}
                        className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-[2px] transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add Item</span>
                      </button>
                      <Link
                        href={`/product/${activePin.productId}`}
                        className="border border-[#DDD2C0] hover:border-[#2B1A16] bg-white text-[#2B1A16] text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-[2px] transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pin Quick Switcher Bar */}
            <div className="pt-2 border-t border-[#DDD2C0]/60">
              <span className="text-[10px] uppercase tracking-wider text-[#2B1A16]/60 font-sans block mb-2 font-semibold">
                Setup Components ({pins.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {pins.map((pin) => (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setActivePinId(pin.id)}
                    className={`text-xs px-3 py-1.5 rounded-[2px] border transition-colors ${
                      activePinId === pin.id
                        ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                        : 'bg-white border-[#DDD2C0] text-[#2B1A16] hover:border-[#9A8029]'
                    }`}
                  >
                    {pin.productName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
