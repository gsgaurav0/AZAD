'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function ShopByOccasion() {
  const isMounted = useIsMounted();
  const cmsOccasions = useCMSStore((state) => state.cms.shopByOccasion);
  const config = isMounted ? cmsOccasions : DEFAULT_CMS_DATA.shopByOccasion;

  const storeProducts = useProductStore((state) => state.products);
  const catalog = isMounted ? storeProducts : PRODUCTS;

  const tabs = config.tabs && config.tabs.length > 0 ? config.tabs : DEFAULT_CMS_DATA.shopByOccasion.tabs;
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || 'work');

  if (!config.enabled) {
    return null;
  }

  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const targetOccasion = currentTab?.occasionKey || 'Work';

  const filteredProducts = catalog
    .filter((p) => (p.occasion || '').toLowerCase() === targetOccasion.toLowerCase())
    .slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          {config.eyebrow && (
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
              {config.eyebrow}
            </span>
          )}
          <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16] mb-2 sm:mb-3">
            {config.title}
          </h2>
          {currentTab?.tagline && (
            <p className="text-xs sm:text-sm text-[#2B1A16]/70 font-sans">
              {currentTab.tagline}
            </p>
          )}
        </div>

        {/* Filter Pills with Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 sm:pb-0 sm:flex-wrap sm:justify-center mb-8 sm:mb-12 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                activeTabId === tab.id
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                  : 'bg-white/80 text-[#2B1A16]/80 hover:bg-white hover:text-[#2B1A16] border border-[#DDD2C0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
