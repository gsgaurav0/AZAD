'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, PhoneCall, ChevronRight } from 'lucide-react';

const MESSAGES = [
  'Complimentary Doorstep Shipping on orders above ₹999',
  'Easy 15-Day Hassle-Free Returns & Size Exchanges',
  'Special Season Offer: Use code MEWAK10 for 10% Off',
  'Handcrafted Heritage Luxury | Slow Sustainable Fashion',
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#2B1A16] text-[#EFE8DD] text-xs font-sans border-b border-[#DDD2C0]/20 relative z-50">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
        {/* Left: Concierge / Assistance */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] tracking-wider uppercase text-[#EFE8DD]/70">
          <span className="flex items-center gap-1.5 hover:text-[#9A8029] transition-colors">
            <PhoneCall className="w-3 h-3 text-[#9A8029]" />
            Patron Concierge: +91 98765 43210
          </span>
          <span className="text-[#DDD2C0]/30">•</span>
          <span className="text-[#9A8029] font-medium tracking-widest">
            INDIAN ATELIER
          </span>
        </div>

        {/* Center: Rotating Announcement */}
        <div className="flex-1 flex items-center justify-center text-center overflow-hidden h-full">
          <div
            key={currentIndex}
            className="flex items-center gap-2 animate-fadeIn transition-all duration-500 text-[11px] md:text-xs tracking-wider"
          >
            <Sparkles className="w-3 h-3 text-[#9A8029] shrink-0" />
            <span className="font-medium text-[#EFE8DD]">
              {MESSAGES[currentIndex]}
            </span>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-0.5 text-[#9A8029] hover:underline ml-1 font-semibold"
            >
              Shop Now <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right: Currency & Store Locator */}
        <div className="hidden md:flex items-center gap-3 text-[11px] tracking-wider text-[#EFE8DD]/80">
          <Link href="/contact" className="hover:text-[#9A8029] transition-colors">
            Boutiques
          </Link>
          <span className="text-[#DDD2C0]/30">•</span>
          <span className="font-medium text-[#9A8029]">INR (₹)</span>
        </div>
      </div>
    </div>
  );
}
