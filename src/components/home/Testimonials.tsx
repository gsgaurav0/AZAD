'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function Testimonials() {
  const isMounted = useIsMounted();
  const cmsReviews = useCMSStore((state) => state.cms.testimonials);
  const config = isMounted ? cmsReviews : DEFAULT_CMS_DATA.testimonials;

  const items = config.items && config.items.length > 0 ? config.items : DEFAULT_CMS_DATA.testimonials.items;
  const [activeIdx, setActiveIdx] = useState(0);

  if (!config.enabled || items.length === 0) {
    return null;
  }

  const prev = () => setActiveIdx((curr) => (curr === 0 ? items.length - 1 : curr - 1));
  const next = () => setActiveIdx((curr) => (curr === items.length - 1 ? 0 : curr + 1));

  const current = items[activeIdx] || items[0];

  return (
    <section className="py-24 bg-[#FBF7F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {config.eyebrow && (
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
            {config.eyebrow}
          </span>
        )}
        <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#2B1A16] mb-12">
          {config.title}
        </h2>

        {/* Testimonial Card */}
        <div className="relative bg-[#EFE8DD] border border-[#DDD2C0] rounded-[4px] p-8 sm:p-12 shadow-sm">
          <Quote className="w-10 h-10 text-[#9A8029]/30 mx-auto mb-6" />

          {/* Star Rating */}
          <div className="flex justify-center gap-1 text-[#9A8029] mb-6">
            {[...Array(current.rating || 5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          {/* Quote Text */}
          <blockquote className="font-serif italic text-lg sm:text-xl text-[#2B1A16] max-w-2xl mx-auto mb-8 leading-relaxed">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          {/* Author Details */}
          <div>
            <span className="font-sans font-bold text-sm text-[#2B1A16] block">
              {current.author}
            </span>
            <span className="text-xs text-[#2B1A16]/60 font-sans block mt-0.5">
              {current.role} {current.company ? `• ${current.company}` : ''}
            </span>
            {current.productName && (
              <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-0.5 rounded font-mono font-semibold">
                Verified Owner of {current.productName}
              </span>
            )}
          </div>

          {/* Controls */}
          {items.length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                type="button"
                onClick={prev}
                className="w-9 h-9 rounded-full border border-[#DDD2C0] bg-white hover:bg-[#2B1A16] hover:text-[#EFE8DD] text-[#2B1A16] flex items-center justify-center transition-colors shadow-xs"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeIdx === i ? 'w-6 bg-[#9A8029]' : 'bg-[#DDD2C0]'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                className="w-9 h-9 rounded-full border border-[#DDD2C0] bg-white hover:bg-[#2B1A16] hover:text-[#EFE8DD] text-[#2B1A16] flex items-center justify-center transition-colors shadow-xs"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
