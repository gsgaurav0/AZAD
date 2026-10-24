'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';

export default function NewArrivalsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const newProducts = PRODUCTS.filter((p) => p.isNew).slice(0, 10);

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
            <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
              FRESH OFF THE ATELIER
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#2B1A16]">
              New Arrivals
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop?filter=new"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2B1A16] hover:text-[#9A8029] transition-colors mr-4"
            >
              View All ({newProducts.length}) <ArrowRight className="w-3.5 h-3.5" />
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

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {newProducts.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[290px] md:w-[310px] shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
