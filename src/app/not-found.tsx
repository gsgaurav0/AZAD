import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { LogoLeafIcon } from '@/components/common/Logo';

export default function NotFound() {
  return (
    <div className="bg-[#EFE8DD] min-h-[75vh] flex items-center justify-center py-20 px-4 text-center border-b border-[#DDD2C0]">
      <div className="max-w-md w-full bg-[#FBF7F0] border border-[#DDD2C0] p-8 sm:p-12 rounded-[4px] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-6">
          <LogoLeafIcon size={28} />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
          ERROR 404
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1A16] font-normal mb-3">
          Archival Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#2B1A16]/70 mb-8 font-sans leading-relaxed">
          The silhouette or catalog edit you seek has either retired to our private archives or resides under another collection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-[3px] transition-colors"
          >
            Return to Home
          </Link>
          <Link
            href="/shop"
            className="border border-[#DDD2C0] bg-white hover:bg-[#EFE8DD] text-[#2B1A16] text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-[3px] transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
