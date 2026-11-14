'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, PhoneCall, ChevronRight } from 'lucide-react';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function AnnouncementBar() {
  const pathname = usePathname();
  const isMounted = useIsMounted();
  const cmsAnnouncement = useCMSStore((state) => state.cms.announcement);
  const config = isMounted ? cmsAnnouncement : DEFAULT_CMS_DATA.announcement;

  const [currentIndex, setCurrentIndex] = useState(0);

  const messages = [
    config.message || DEFAULT_CMS_DATA.announcement.message,
    'Complimentary Express Air Logistics on all orders above ₹999',
    '15-Day Risk-Free Replacement & 2-Year Official Brand Warranty',
    'Exclusive Launch Privilege: Use code MEWAK10 for 10% Off',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    return null;
  }

  if (!config.enabled) {
    return null;
  }

  return (
    <div className="bg-[#2B1A16] text-[#EFE8DD] text-xs font-sans border-b border-[#DDD2C0]/20 relative z-50">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
        {/* Left: Concierge / Assistance */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] tracking-wider uppercase text-[#EFE8DD]/70">
          <span className="flex items-center gap-1.5 hover:text-[#9A8029] transition-colors">
            <PhoneCall className="w-3 h-3 text-[#9A8029]" />
            Official Hardware Concierge
          </span>
          <span className="text-[#DDD2C0]/30">•</span>
          <span className="text-[#9A8029] font-medium tracking-widest">
            {config.badge || 'AUTHENTIC BRAND WARRANTY'}
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
              {messages[currentIndex]}
            </span>
            <Link
              href={config.linkUrl || '/shop'}
              className="hidden sm:inline-flex items-center gap-0.5 text-[#9A8029] hover:underline ml-1 font-semibold"
            >
              {config.linkText || 'Shop Now'} <ChevronRight className="w-3 h-3" />
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