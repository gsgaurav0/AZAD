'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';

export default function TrendingGrid() {
  const trendingProducts = PRODUCTS.filter((p) => p.isTrending).slice(0, 8);

  return (
    <section className="py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B3402F] font-semibold mb-2 font-sans">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>THE PATRON FAVORITES</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#2B1A16]">
              Trending This Season
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2B1A16] hover:text-[#9A8029] transition-colors mt-3 sm:mt-0"
          >
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8-Item Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
