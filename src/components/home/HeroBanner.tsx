'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative min-h-[75vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#2B1A16]">
      {/* Background Hero Image with refined gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
          alt="MewaK Autumn Winter Haute Couture"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-75 transform scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1A16] via-[#2B1A16]/50 to-[#2B1A16]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B1A16]/60 via-transparent to-[#2B1A16]/50" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center flex flex-col items-center">
        {/* Editorial Sub-badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 border border-[#9A8029]/60 bg-[#2B1A16]/80 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-6 text-[10px] sm:text-xs text-[#DDD2C0] tracking-[0.2em] uppercase font-sans">
          <Sparkles className="w-3 h-3 text-[#9A8029] shrink-0" />
          <span>Autumn / Winter 2026 Atelier</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-[#EFE8DD] font-normal tracking-tight leading-[1.12] sm:leading-[1.08] max-w-5xl mb-4 sm:mb-6">
          The Art of <br className="hidden sm:inline" />
          <span className="italic font-light text-[#9A8029]">Sartorial</span> Poise
        </h1>

        {/* Editorial Paragraph */}
        <p className="font-sans text-xs sm:text-base md:text-lg text-[#EFE8DD]/85 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-light px-2">
          Sculpted in pure mulberry silks, Neapolitan virgin wools, and hand-loomed heritage linens. Crafted for patrons who understand that true luxury never shouts.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <Link
            href="/shop"
            className="w-full sm:w-auto bg-[#9A8029] hover:bg-[#7F6A1F] text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-[4px] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/shop?filter=new"
            className="w-full sm:w-auto border border-[#DDD2C0]/50 hover:border-[#EFE8DD] text-[#EFE8DD] hover:bg-white/10 px-7 sm:px-8 py-3.5 sm:py-4 rounded-[4px] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-xs text-center"
          >
            New Arrivals
          </Link>
        </div>

        {/* Floating Value Props Banner */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-[#DDD2C0]/20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-left max-w-4xl w-full text-xs">
          <div className="bg-[#2B1A16]/50 sm:bg-transparent p-2 sm:p-0 rounded-[3px]">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5">
              FABRICS
            </span>
            <span className="font-serif text-xs sm:text-sm text-[#EFE8DD]">100% Pure Mulberry Silk</span>
          </div>
          <div className="bg-[#2B1A16]/50 sm:bg-transparent p-2 sm:p-0 rounded-[3px]">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5">
              TAILORING
            </span>
            <span className="font-serif text-xs sm:text-sm text-[#EFE8DD]">Half-Canvas Build</span>
          </div>
          <div className="bg-[#2B1A16]/50 sm:bg-transparent p-2 sm:p-0 rounded-[3px]">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5">
              ATELIER
            </span>
            <span className="font-serif text-xs sm:text-sm text-[#EFE8DD]">Handcrafted in India</span>
          </div>
          <div className="bg-[#2B1A16]/50 sm:bg-transparent p-2 sm:p-0 rounded-[3px]">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5">
              CONCIERGE
            </span>
            <span className="font-serif text-xs sm:text-sm text-[#EFE8DD]">15-Day Free Trial</span>
          </div>
        </div>
      </div>
    </section>
  );
}
