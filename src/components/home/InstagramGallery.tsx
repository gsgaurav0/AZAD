'use client';

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { InstagramIcon } from '@/components/common/SocialIcons';

const INSTA_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    likes: '2.4k',
    caption: 'Apex Pro ANC in Space Black on the audio mixing desk.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    likes: '1.8k',
    caption: 'Titan 16 Pro Max forged titanium frame catching golden reflections.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
    likes: '3.1k',
    caption: 'Chronos Ultra 49mm Titanium Watch logging high altitude trail runs.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=600&q=80',
    likes: '1.2k',
    caption: 'Zero cable clutter with MagDock 3-in-1 aluminum desktop stand.',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    likes: '2.7k',
    caption: 'SonicBuds Ultra ANC with low-latency spatial audio.',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    likes: '4.5k',
    caption: 'The ultimate minimalist developer and creator setup powered by AZAD.',
  },
];

export default function InstagramGallery() {
  return (
    <section className="py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
            COMMUNITY & DESK SETUPS
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#2B1A16] mb-2">
            Engineered in the Wild
          </h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#2B1A16] hover:text-[#9A8029] transition-colors uppercase font-sans"
          >
            <InstagramIcon size={16} className="text-[#9A8029]" />
            @azadtech
          </a>
        </div>

        {/* 6 Square Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {INSTA_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#0F172A] block"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                <div className="flex justify-end">
                  <InstagramIcon size={14} className="text-[#EFE8DD]" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#EFE8DD] mb-1 font-sans">
                    <Heart className="w-3 h-3 fill-current text-[#B3402F]" />
                    <span>{post.likes}</span>
                  </div>
                  <p className="text-[10px] text-white/90 line-clamp-2 font-sans leading-tight font-light">
                    {post.caption}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
