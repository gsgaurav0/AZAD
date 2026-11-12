'use client';

import React from 'react';
import Image from 'next/image';
import { LogoTechIcon } from '@/components/common/Logo';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function BrandStory() {
  const isMounted = useIsMounted();
  const cmsStory = useCMSStore((state) => state.cms.brandStory);
  const story = isMounted ? cmsStory : DEFAULT_CMS_DATA.brandStory;

  if (!story.enabled) {
    return null;
  }

  return (
    <section className="py-24 bg-[#FBF7F0] border-b border-[#DDD2C0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shadow-lg">
              <Image
                src={story.image1 || DEFAULT_CMS_DATA.brandStory.image1}
                alt="Acoustic tuning laboratory"
                fill
                unoptimized
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shadow-lg translate-y-8">
              <Image
                src={story.image2 || DEFAULT_CMS_DATA.brandStory.image2}
                alt="Precision CNC Titanium Chassis"
                fill
                unoptimized
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover"
              />
            </div>

            {/* Floating Gold Monogram Seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-24 h-24 rounded-full bg-[#0F172A] border-2 border-[#9A8029] flex flex-col items-center justify-center text-center shadow-2xl p-2 text-white">
              <LogoTechIcon size={24} />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#DDD2C0] font-sans mt-0.5 font-bold">
                {story.sealText || 'MEWAK'}
              </span>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-6 space-y-6 lg:pl-6 mt-8 lg:mt-0">
            <div>
              {story.eyebrow && (
                <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
                  {story.eyebrow}
                </span>
              )}
              <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1A16] leading-tight mb-4">
                {story.title}
              </h2>
              {story.quote && (
                <p className="font-sans italic text-base sm:text-lg text-[#2B1A16]/80 mb-4">
                  &ldquo;{story.quote}&rdquo;
                </p>
              )}
              {story.paragraph1 && (
                <p className="font-sans text-xs sm:text-sm text-[#2B1A16]/75 leading-relaxed mb-4">
                  {story.paragraph1}
                </p>
              )}
              {story.paragraph2 && (
                <p className="font-sans text-xs sm:text-sm text-[#2B1A16]/75 leading-relaxed">
                  {story.paragraph2}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
