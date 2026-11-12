'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function NewArrivalsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();

  const storeProducts = useProductStore((state) => state.products);
  const catalog = isMounted ? storeProducts : PRODUCTS;

  const cmsNewArrivals = useCMSStore((state) => state.cms.newArrivals);
  const config = isMounted ? cmsNewArrivals : DEFAULT_CMS_DATA.newArrivals;

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
    productsToDisplay = catalog.filter((p) => p.isNew);
  }

  // Fallback if empty
  if (productsToDisplay.length === 0) {
    productsToDisplay = catalog.slice(0, config.displayCount || 8);
  } else {
    productsToDisplay = productsToDisplay.slice(0, config.displayCount || 10);
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-20 bg-[#FBF7F0] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-10">
          <div>
            {config.eyebrow && (
              <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
                {config.eyebrow}
              </span>
            )}
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16]">
              {config.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={config.buttonUrl || '/shop?filter=new'}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2B1A16] hover:text-[#9A8029] transition-colors mr-4"
            >
              {config.buttonLabel || 'View All'} ({productsToDisplay.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-[#DDD2C0] bg-white hover:bg-[#2B1A16] hover:text-[#EFE8DD] text-[#2B1A16] flex items-center justify-center transition-colors shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-[#DDD2C0] bg-white hover:bg-[#2B1A16] hover:text-[#EFE8DD] text-[#2B1A16] flex items-center justify-center transition-colors shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {productsToDisplay.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
