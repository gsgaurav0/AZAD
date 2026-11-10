'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function BentoCategories() {
  return (
    <section className="py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
              HARDWARE ARCHITECTURE
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16]">
              Curated Tech Ecosystem
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B1A16]/70 max-w-md mt-3 md:mt-0 font-sans">
            Explore our defining hardware lines — from audiophile planar acoustic drivers to aerospace titanium flagships and connected horology.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Tile 1: Headphones & Audio (Hero Large Tile - 7 cols) */}
          <Link
            href="/shop/headphones"
            className="group relative block md:col-span-7 h-[420px] sm:h-[480px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A]"
          >
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
              alt="Headphones & Audio"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-[#9A8029] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  ACOUSTIC PURITY
                </span>
                <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-1 font-sans">
                  SPATIAL ANC & PLANAR
                </span>
                <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                  Headphones & Audio
                </h3>
                <p className="text-xs text-white/80 max-w-sm font-sans line-clamp-2 font-light">
                  Beryllium drivers, studio planar open-backs, true wireless ANC earbuds & spatial gaming headsets.
                </p>
              </div>
            </div>
          </Link>

          {/* Tile 2: Smartphones (5 cols) */}
          <Link
            href="/shop/phones"
            className="group relative block md:col-span-5 h-[420px] sm:h-[480px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A]"
          >
            <Image
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80"
              alt="Smartphones"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  FLAGSHIP SILICON
                </span>
                <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-1 font-sans">
                  TITANIUM 5G
                </span>
                <h3 className="font-sans text-2xl sm:text-3xl font-bold mb-2">
                  Smartphones
                </h3>
                <p className="text-xs text-white/80 max-w-xs font-sans line-clamp-2 font-light">
                  Snapdragon 8 Gen 3 flagships, dual-screen foldables, minimalist transparent phones & periscope cameras.
                </p>
              </div>
            </div>
          </Link>

          {/* Tile 3: Smartwatches (5 cols) */}
          <Link
            href="/shop/smartwatches"
            className="group relative block md:col-span-5 h-[340px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A]"
          >
            <Image
              src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1000&q=80"
              alt="Smartwatches"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  HOROLOGY
                </span>
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-0.5 font-sans">
                  TITANIUM & SAPPHIRE
                </span>
                <h3 className="font-sans text-2xl font-bold mb-1">
                  Smartwatches
                </h3>
                <p className="text-xs text-white/80 font-sans line-clamp-1 font-light">
                  Rugged 49mm titanium dive watches, sapphire AMOLED dials & solar multisport GPS.
                </p>
              </div>
            </div>
          </Link>

          {/* Tile 4: Accessories (7 cols) */}
          <Link
            href="/shop/accessories"
            className="group relative block md:col-span-7 h-[340px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A]"
          >
            <Image
              src="https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=1200&q=80"
              alt="Tech Accessories"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  POWER & ECOSYSTEM
                </span>
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-0.5 font-sans">
                  CHARGING & PROTECTION
                </span>
                <h3 className="font-sans text-2xl font-bold mb-1">
                  Tech Accessories
                </h3>
                <p className="text-xs text-white/80 font-sans line-clamp-1 font-light">
                  MagSafe 3-in-1 desktop docks, 140W GaN chargers, aramid carbon fiber cases & slim magnetic power banks.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
