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
              ARCHITECTURAL CATEGORIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#2B1A16]">
              Curated Wardrobe Edits
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B1A16]/70 max-w-md mt-3 md:mt-0 font-sans">
            Explore our defining silhouettes, where heritage Indian loom-work merges effortlessly with international editorial styling.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Tile 1: Women (Hero Large Tile - 7 cols) */}
          <Link
            href="/shop/women"
            className="group relative block md:col-span-7 h-[420px] sm:h-[480px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#2B1A16]"
          >
            <Image
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80"
              alt="Women Haute Fashion"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-[#9A8029] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  NEW SILHOUETTES
                </span>
                <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-1 font-sans">
                  HAUTE COUTURE
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal mb-2">
                  Women
                </h3>
                <p className="text-xs text-white/80 max-w-sm font-sans line-clamp-2 font-light">
                  Mulberry silk slip dresses, Banarasi Chanderi drapes, tailored trench coats & fluid trousers.
                </p>
              </div>
            </div>
          </Link>

          {/* Tile 2: Men (5 cols) */}
          <Link
            href="/shop/men"
            className="group relative block md:col-span-5 h-[420px] sm:h-[480px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#2B1A16]"
          >
            <Image
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
              alt="Men Tailoring"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  SARTORIAL
                </span>
                <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-1 font-sans">
                  NEAPOLITAN CUTS
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal mb-2">
                  Men
                </h3>
                <p className="text-xs text-white/80 max-w-xs font-sans line-clamp-2 font-light">
                  Biella wool blazers, French linen camp shirts, Gurkha trousers & imperial bandhgalas.
                </p>
              </div>
            </div>
          </Link>

          {/* Tile 3: Kids (5 cols) */}
          <Link
            href="/shop/kids"
            className="group relative block md:col-span-5 h-[340px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#2B1A16]"
          >
            <Image
              src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80"
              alt="Kids Miniature Collection"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  HEIRLOOM
                </span>
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-0.5 font-sans">
                  MINI CONNOISSEURS
                </span>
                <h3 className="font-serif text-2xl font-normal mb-1">
                  Kids
                </h3>
                <p className="text-xs text-white/80 font-sans line-clamp-1 font-light">
                  Organic hand-smocked cottons and itch-free festive waistcoats.
                </p>
              </div>
            </div>
          </Link>

          {/* Tile 4: Accessories (7 cols) */}
          <Link
            href="/shop/accessories"
            className="group relative block md:col-span-7 h-[340px] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#2B1A16]"
          >
            <Image
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80"
              alt="Artisanal Accessories"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                  CRAFT
                </span>
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-0.5 font-sans">
                  FLORENTINE ACCENTS
                </span>
                <h3 className="font-serif text-2xl font-normal mb-1">
                  Accessories
                </h3>
                <p className="text-xs text-white/80 font-sans line-clamp-1 font-light">
                  Vegetable-tanned leather totes, hand-rolled silk foulards & 18K vermeil cuffs.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
