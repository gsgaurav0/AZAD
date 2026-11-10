'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Vikram Malhotra',
    city: 'Bengaluru',
    garment: 'Apex Pro ANC Wireless Headphones',
    rating: 5,
    quote:
      'I spend 10 hours a day in studio editing and coding. The custom beryllium drivers in the Apex Pro create an acoustic soundstage that makes competing headphones sound completely two-dimensional. The noise cancellation on flights is dead silent.',
  },
  {
    id: 2,
    name: 'Rohan Deshmukh',
    city: 'Mumbai',
    garment: 'Titan 16 Pro Max 5G (Natural Titanium)',
    rating: 5,
    quote:
      'The 200MP periscope camera replaced my Sony mirrorless on a trip to Ladakh. Fast night mode, zero shutter lag, and the Grade 5 titanium chassis feels indestructible yet featherlight.',
  },
  {
    id: 3,
    name: 'Meera Nambiar',
    city: 'Hyderabad',
    garment: 'Chronos Ultra 49mm Titanium Watch',
    rating: 5,
    quote:
      'Completed a 100km cycling brevet with dual-frequency GPS active the entire time and still had 48% battery left. The sapphire crystal is spotless despite multiple rough gravel scrapes.',
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
          VERIFIED OWNER TESTIMONIALS
        </span>
        <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#2B1A16] mb-12">
          What the Tech Community Says
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
          <blockquote className="font-sans text-lg sm:text-xl md:text-2xl text-[#2B1A16] font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          {/* Author Details */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-sans font-bold text-base text-[#2B1A16]">
                {current.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#9A8029] bg-[#9A8029]/10 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3" /> Verified Owner
              </span>
            </div>
            <div className="text-xs text-[#2B1A16]/60 font-sans">
              {current.city} • Verified purchase of{' '}
              <strong className="text-[#2B1A16] font-medium">{current.garment}</strong>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between absolute inset-y-0 left-2 right-2 pointer-events-none">
            <button
              type="button"
              onClick={prev}
              className="p-2 rounded-full bg-white/80 hover:bg-[#9A8029] hover:text-white text-[#2B1A16] shadow-sm transition-all pointer-events-auto"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="p-2 rounded-full bg-white/80 hover:bg-[#9A8029] hover:text-white text-[#2B1A16] shadow-sm transition-all pointer-events-auto"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === idx ? 'w-8 bg-[#9A8029]' : 'w-2 bg-[#DDD2C0]'
              }`}
              aria-label={`Jump to review ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
