'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Cpu, ShieldCheck, Zap, Headphones } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative min-h-[75vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0F172A]">
      {/* Background Hero Image with refined gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=85"
          alt="AZAD Flagship Headphones & Electronics"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65 transform scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-[#0F172A]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-transparent to-[#0F172A]/70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center flex flex-col items-center">
        {/* Editorial Sub-badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 border border-[#9A8029]/60 bg-[#0F172A]/85 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-6 text-[10px] sm:text-xs text-[#DDD2C0] tracking-[0.2em] uppercase font-sans">
          <Sparkles className="w-3 h-3 text-[#9A8029] shrink-0" />
          <span>Next-Gen Audio & Flagship Silicon 2026</span>
        </div>

        {/* Headline */}
        <h1 className="font-sans text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-[#EFE8DD] font-bold tracking-tight leading-[1.12] sm:leading-[1.08] max-w-5xl mb-4 sm:mb-6">
          Architectural Sound. <br className="hidden sm:inline" />
          <span className="italic font-light text-[#9A8029]">Pure Silicon</span> Mastery.
        </h1>

        {/* Editorial Paragraph */}
        <p className="font-sans text-xs sm:text-base md:text-lg text-[#EFE8DD]/85 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-light px-2">
          Engineered with custom beryllium drivers, aerospace Grade 5 titanium, and ultra-low latency wireless architecture. Crafted for those who demand precision.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <Link
            href="/shop"
            className="w-full sm:w-auto bg-[#9A8029] hover:bg-[#7F6A1F] text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-[4px] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>Explore All Gear</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/shop/headphones"
            className="w-full sm:w-auto border border-[#DDD2C0]/50 hover:border-[#EFE8DD] text-[#EFE8DD] hover:bg-white/10 px-7 sm:px-8 py-3.5 sm:py-4 rounded-[4px] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-xs text-center"
          >
            Audio & Headphones
          </Link>
        </div>

        {/* Floating Value Props Banner */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-[#DDD2C0]/20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-left max-w-4xl w-full text-xs">
          <div className="bg-[#0F172A]/70 sm:bg-transparent p-2.5 sm:p-0 rounded-[4px] border border-white/5 sm:border-none">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5 flex items-center gap-1">
              <Headphones className="w-3 h-3" /> ACOUSTICS
            </span>
            <span className="font-sans text-xs sm:text-sm text-[#EFE8DD] font-medium">Beryllium & Planar Drivers</span>
          </div>
          <div className="bg-[#0F172A]/70 sm:bg-transparent p-2.5 sm:p-0 rounded-[4px] border border-white/5 sm:border-none">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> PROCESSING
            </span>
            <span className="font-sans text-xs sm:text-sm text-[#EFE8DD] font-medium">Snapdragon 8 Gen 3</span>
          </div>
          <div className="bg-[#0F172A]/70 sm:bg-transparent p-2.5 sm:p-0 rounded-[4px] border border-white/5 sm:border-none">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3" /> CHARGING
            </span>
            <span className="font-sans text-xs sm:text-sm text-[#EFE8DD] font-medium">140W GaN Fast Charge</span>
          </div>
          <div className="bg-[#0F172A]/70 sm:bg-transparent p-2.5 sm:p-0 rounded-[4px] border border-white/5 sm:border-none">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#9A8029] font-semibold block mb-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> WARRANTY
            </span>
            <span className="font-sans text-xs sm:text-sm text-[#EFE8DD] font-medium">2-Year Official Shield</span>
          </div>
        </div>
      </div>
    </section>
  );
}
