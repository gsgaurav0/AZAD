'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function TrendingGrid() {
  const isMounted = useIsMounted();

  const storeProducts = useProductStore((state) => state.products);
  const catalog = isMounted ? storeProducts : PRODUCTS;

  const cmsTrending = useCMSStore((state) => state.cms.trending);
  const config = isMounted ? cmsTrending : DEFAULT_CMS_DATA.trending;

  if (!config.enabled) {
    return null;
  }

  // Filter products based on mode
  let productsToDisplay = catalog;
  if (config.selectionMode === 'manual' && config.manualProductIds && config.manualProductIds.length > 0) {
    productsToDisplay = config.manualProductIds
      .map((id) => catalog.find((p) => p.id === id))
      .filter((p): p is typeof catalog[0] => Boolean(p));
  } else {
    productsToDisplay = catalog.filter((p) => p.isTrending);
  }

  // Fallback if empty
  if (productsToDisplay.length === 0) {
    productsToDisplay = catalog.slice(0, config.displayCount || 8);
  } else {
    productsToDisplay = productsToDisplay.slice(0, config.displayCount || 8);
  }

  return (
    <section className="py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            {config.badge && (
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B3402F] font-semibold mb-2 font-sans">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{config.badge}</span>
              </div>
            )}
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16]">
              {config.title}
            </h2>
          </div>

          <Link
            href={config.linkUrl || '/shop'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2B1A16] hover:text-[#9A8029] transition-colors mt-3 sm:mt-0"
          >
            {config.linkText || 'Explore Catalog'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dynamic Item Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {productsToDisplay.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
