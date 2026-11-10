'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';
import { Occasion } from '@/types';

const OCCASIONS: { id: Occasion; label: string; tagline: string }[] = [
  {
    id: 'Work',
    label: 'Work & Studio',
    tagline: 'Planar studio headphones, dual-screen foldables, GaN desktop power hubs & connected smartwatches',
  },
  {
    id: 'Fitness',
    label: 'Sports & Adventure',
    tagline: 'Titanium rugged GPS smartwatches, sweatproof ANC earbuds & slim magnetic kickstand power banks',
  },
  {
    id: 'Gaming',
    label: 'Gaming & Esports',
    tagline: 'Ultra-low latency wireless spatial headsets, cooling gel ear cushions & broadcast-grade mics',
  },
  {
    id: 'Everyday',
    label: 'Daily Flagships',
    tagline: 'Aerospace Grade 5 titanium 200MP smartphones, forged carbon fiber cases & minimal compact form factors',
  },
];

export default function ShopByOccasion() {
  const [activeOccasion, setActiveOccasion] = useState<Occasion>('Work');

  const filteredProducts = PRODUCTS.filter((p) => p.occasion === activeOccasion).slice(0, 4);
  const currentOccasionObj = OCCASIONS.find((o) => o.id === activeOccasion) || OCCASIONS[0];

  return (
    <section className="py-14 sm:py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
            ENGINEERED FOR YOUR WORKFLOW
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16] mb-2 sm:mb-3">
            Shop by Lifestyle & Setup
          </h2>
          <p className="text-xs sm:text-sm text-[#2B1A16]/70 font-sans">
            {currentOccasionObj.tagline}
          </p>
        </div>

        {/* Filter Pills with Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 sm:pb-0 sm:flex-wrap sm:justify-center mb-8 sm:mb-12 -mx-4 px-4 sm:mx-0 sm:px-0">
          {OCCASIONS.map((occ) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => setActiveOccasion(occ.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-[4px] text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 font-sans shrink-0 ${
                activeOccasion === occ.id
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-md'
                  : 'bg-[#FBF7F0] border border-[#DDD2C0] text-[#2B1A16] hover:border-[#9A8029]'
              }`}
            >
              {occ.label}
            </button>
          ))}
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A8029] hover:text-[#7F6A1F] transition-colors group"
          >
            <span>Explore All {currentOccasionObj.label} Hardware</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
