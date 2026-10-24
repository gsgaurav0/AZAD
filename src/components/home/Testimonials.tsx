'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Aanya Sharma',
    city: 'New Delhi',
    garment: 'Pleated Mulberry Silk Maxi Dress',
    rating: 5,
    quote:
      'Wore the Mulberry silk dress to an international art biennale in Delhi. The fluid accordion micro-pleating and muted gold sheen made me feel untouchably elegant. You cannot find this finishing at mass retail.',
  },
  {
    id: 2,
    name: 'Kabir Malhotra',
    city: 'Mumbai',
    garment: 'Sartorial Italian Wool Blazer',
    rating: 5,
    quote:
      'The half-canvas Neapolitan drape is extraordinary. It moulds effortlessly to my shoulders and commands reverence in client meetings. MewaK has completely converted my wardrobe.',
  },
  {
    id: 3,
    name: 'Priyanka Dasgupta',
    city: 'Kolkata',
    garment: 'Chanderi Silk Heritage Saree',
    rating: 5,
    quote:
      'As someone deeply passionate about authentic Indian handlooms, holding this Chanderi saree brought tears of joy. The gold zari bootis are genuine artisan work, not screen-printed shortcuts.',
  },
];

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((curr) => (curr === 0 ? TESTIMONIALS.length - 1 : curr - 1));
  const next = () => setActiveIdx((curr) => (curr === TESTIMONIALS.length - 1 ? 0 : curr + 1));

  const current = TESTIMONIALS[activeIdx];

  return (
    <section className="py-24 bg-[#FBF7F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
          VOICES OF DISCERNING PATRONS
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#2B1A16] mb-12">
          Patron Impressions
        </h2>

        {/* Testimonial Card */}
        <div className="relative bg-[#EFE8DD] border border-[#DDD2C0] rounded-[4px] p-8 sm:p-12 shadow-sm">
          <Quote className="w-10 h-10 text-[#9A8029]/30 mx-auto mb-6" />

          {/* Star Rating */}
          <div className="flex justify-center gap-1 text-[#9A8029] mb-6">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          {/* Quote Body */}
          <blockquote className="font-serif text-lg sm:text-xl md:text-2xl text-[#2B1A16] font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          {/* Author Details */}
          <div>
            <div className="font-serif font-bold text-base text-[#2B1A16]">
              {current.name}
            </div>
            <div className="text-xs text-[#2B1A16]/60 font-sans mt-0.5">
              {current.city} • <span className="text-[#9A8029] font-medium">{current.garment}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-[#4C7A34] font-medium mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Patron
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between absolute inset-y-0 -left-4 -right-4 sm:-left-6 sm:-right-6 pointer-events-none">
            <button
              type="button"
              onClick={prev}
              className="pointer-events-auto w-10 h-10 rounded-full border border-[#DDD2C0] bg-white text-[#2B1A16] hover:bg-[#2B1A16] hover:text-[#EFE8DD] shadow-md flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="pointer-events-auto w-10 h-10 rounded-full border border-[#DDD2C0] bg-white text-[#2B1A16] hover:bg-[#2B1A16] hover:text-[#EFE8DD] shadow-md flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === i ? 'w-6 bg-[#9A8029]' : 'w-2 bg-[#DDD2C0]'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
