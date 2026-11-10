'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { LogoTechIcon } from '@/components/common/Logo';

export default function BrandStory() {
  return (
    <section className="py-24 bg-[#FBF7F0] border-b border-[#DDD2C0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
                alt="Acoustic tuning laboratory"
                fill
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shadow-lg translate-y-8">
              <Image
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
                alt="Precision CNC Titanium Chassis"
                fill
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover"
              />
            </div>

            {/* Floating Gold Monogram Seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-24 h-24 rounded-full bg-[#0F172A] border-2 border-[#9A8029] flex flex-col items-center justify-center text-center shadow-2xl p-2 text-white">
              <LogoTechIcon size={24} />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#DDD2C0] font-sans mt-0.5 font-bold">
                AZAD TECH
              </span>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-6 space-y-6 lg:pl-6 mt-8 lg:mt-0">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
                ENGINEERING PHILOSOPHY
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16] leading-tight mb-4">
                The Convergence of Silicon & Acoustic Mastery
              </h2>
              <p className="font-sans italic text-base sm:text-lg text-[#2B1A16]/80 mb-4">
                &ldquo;True technological luxury does not distract; it elevates your human potential through uncompromising acoustic and tactile perfection.&rdquo;
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#2B1A16]/75 leading-relaxed mb-4">
                Born to challenge the disposable nature of modern consumer electronics, AZAD engineers devices crafted from enduring materials — aerospace Grade 5 titanium, hand-matched walnut wood, sapphire crystal glass, and bulletproof 1500D aramid fibers.
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#2B1A16]/75 leading-relaxed">
                By pairing custom beryllium diaphragms and planar transducers with flagship Snapdragon silicon and intelligent GaN thermal architectures, we deliver hardware calibrated for years of peak performance.
              </p>
            </div>

            {/* Three Pillar Icons */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#DDD2C0]">
              <div className="space-y-1">
                <Cpu className="w-5 h-5 text-[#9A8029]" />
                <h4 className="font-sans text-xs font-semibold text-[#2B1A16]">
                  Acoustic Lab
                </h4>
                <p className="text-[11px] text-[#2B1A16]/60 font-sans">
                  Custom planar & beryllium drivers
                </p>
              </div>
              <div className="space-y-1">
                <Zap className="w-5 h-5 text-[#9A8029]" />
                <h4 className="font-sans text-xs font-semibold text-[#2B1A16]">
                  Aerospace Chassis
                </h4>
                <p className="text-[11px] text-[#2B1A16]/60 font-sans">
                  Grade 5 Titanium & Sapphire
                </p>
              </div>
              <div className="space-y-1">
                <ShieldCheck className="w-5 h-5 text-[#9A8029]" />
                <h4 className="font-sans text-xs font-semibold text-[#2B1A16]">
                  Total Care Shield
                </h4>
                <p className="text-[11px] text-[#2B1A16]/60 font-sans">
                  2-Year Full Brand Warranty
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A8029] hover:text-[#7F6A1F] border-b border-[#9A8029] pb-1 transition-colors"
              >
                <span>Read Our Technology Manifesto</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
