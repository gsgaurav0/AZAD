'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function BentoCategories() {
  const isMounted = useIsMounted();
  const cmsBento = useCMSStore((state) => state.cms.bento);
  const bento = isMounted ? cmsBento : DEFAULT_CMS_DATA.bento;

  if (!bento.enabled) {
    return null;
  }

  return (
    <section className="py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            {bento.eyebrow && (
              <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
                {bento.eyebrow}
              </span>
            )}
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16]">
              {bento.title}
            </h2>
          </div>
          {bento.description && (
            <p className="text-xs sm:text-sm text-[#2B1A16]/70 max-w-md mt-3 md:mt-0 font-sans">
              {bento.description}
            </p>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {bento.tiles.map((tile) => {
            const colClass = tile.colSpan === 7 ? 'md:col-span-7' : 'md:col-span-5';
            const heightClass = tile.colSpan === 7 ? 'h-[360px] sm:h-[440px]' : 'h-[360px] sm:h-[440px]';

            return (
              <Link
                key={tile.id}
                href={tile.categorySlug || '/shop'}
                className={`group relative block ${colClass} ${heightClass} rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A]`}
              >
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    {tile.badge && (
                      <span className="bg-[#9A8029] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-[2px]">
                        {tile.badge}
                      </span>
                    )}
                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#9A8029] group-hover:rotate-45 transition-all duration-300 ml-auto">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </span>
                  </div>
                  <div>
                    {tile.tagline && (
                      <span className="text-xs uppercase tracking-widest text-[#DDD2C0] block mb-1 font-sans">
                        {tile.tagline}
                      </span>
                    )}
                    <h3 className="font-sans text-2xl sm:text-3xl font-bold mb-2">
                      {tile.title}
                    </h3>
                    {tile.description && (
                      <p className="text-xs text-white/80 max-w-sm font-sans line-clamp-2 font-light">
                        {tile.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
