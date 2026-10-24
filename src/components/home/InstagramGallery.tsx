'use client';

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { InstagramIcon } from '@/components/common/SocialIcons';

const INSTA_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    likes: '1.4k',
    caption: 'Pleated Mulberry Silk in Ochre Gold at the National Gallery.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    likes: '980',
    caption: 'Half-canvas Italian wool tailored for commanding boardrooms.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    likes: '2.1k',
    caption: 'Chanderi zari palla catching golden hour radiance.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    likes: '840',
    caption: 'Full-grain Florentine cowhide develops an amber patina.',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    likes: '1.7k',
    caption: 'Wool-cashmere greatcoat for winter promenade strolls.',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    likes: '620',
    caption: '38mm Epoch Chronograph with brushed gold bezel.',
  },
];

export default function InstagramGallery() {
  return (
    <section className="py-20 bg-[#EFE8DD] border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
            SHARED SARTORIAL VISIONS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#2B1A16] mb-2">
            Follow the Maison
          </h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#2B1A16] hover:text-[#9A8029] transition-colors uppercase font-sans"
          >
            <InstagramIcon size={16} className="text-[#9A8029]" />
            @mewakfashion
          </a>
        </div>

        {/* 6 Square Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {INSTA_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#2B1A16]"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#2B1A16]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                <div className="flex justify-end">
                  <InstagramIcon size={16} className="text-[#9A8029]" />
                </div>
                <div>
                  <p className="text-[10px] text-white/90 line-clamp-2 font-sans mb-1">
                    {post.caption}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-[#9A8029]">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
