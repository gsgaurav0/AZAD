'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, Shield, Award } from 'lucide-react';
import { LogoLeafIcon } from '@/components/common/Logo';

export default function BrandStory() {
  return (
    <section className="py-24 bg-[#FBF7F0] border-b border-[#DDD2C0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#2B1A16] shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
                alt="Hand tailoring at MewaK Atelier"
                fill
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#2B1A16] shadow-lg translate-y-8">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                alt="Zari weaving handloom"
                fill
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover"
              />
            </div>

            {/* Floating Gold Monogram Seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-24 h-24 rounded-full bg-[#2B1A16] border-2 border-[#9A8029] flex flex-col items-center justify-center text-center shadow-2xl p-2">
              <LogoLeafIcon size={24} />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#DDD2C0] font-sans mt-0.5">
                SINCE 2024
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Narrative */}
          <div className="lg:col-span-6 space-y-6 lg:pl-6 mt-8 lg:mt-0">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
                MAISON PHILOSOPHY
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#2B1A16] leading-tight mb-4">
                The Art of Sartorial Harmony
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-[#2B1A16]/80 mb-4">
                &ldquo;Fashion passes; true architectural silhouette and noble materials endure for generations.&rdquo;
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#2B1A16]/75 leading-relaxed mb-4">
                Born out of a reverence for historic Indian textile heritage and modern European minimalism, MewaK exists to restore quiet dignity to modern apparel. Each garment is meticulously drafted using non-synthetic fibers — organic French linens, mulberry silk charmeuse, and Biella merino wools.
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#2B1A16]/75 leading-relaxed">
                By celebrating zero-compromise artisan guilds and slow batch releases, we ensure every stitch honors both the hands that craft it and the patron who wears it.
              </p>
            </div>

            {/* Three Pillar Icons */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#DDD2C0]">
              <div className="space-y-1">
                <Leaf className="w-5 h-5 text-[#9A8029]" />
                <h4 className="font-serif text-xs font-semibold text-[#2B1A16]">
                  Slow Fashion
                </h4>
                <p className="text-[11px] text-[#2B1A16]/60 font-sans">
                  Small batch limited editions
                </p>
              </div>
              <div className="space-y-1">
                <Award className="w-5 h-5 text-[#9A8029]" />
                <h4 className="font-serif text-xs font-semibold text-[#2B1A16]">
                  Master Weavers
                </h4>
                <p className="text-[11px] text-[#2B1A16]/60 font-sans">
                  GI-certified handlooms
                </p>
              </div>
              <div className="space-y-1">
                <Shield className="w-5 h-5 text-[#9A8029]" />
                <h4 className="font-serif text-xs font-semibold text-[#2B1A16]">
                  Ethical Fair Pay
                </h4>
                <p className="text-[11px] text-[#2B1A16]/60 font-sans">
                  Patronage for artisan guilds
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A8029] hover:text-[#7F6A1F] border-b border-[#9A8029] pb-1 transition-colors"
              >
                <span>Read Full Maison Narrative</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
