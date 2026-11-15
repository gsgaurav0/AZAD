'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, PhoneCall, ChevronRight, AlertTriangle, Flame, Info, X } from 'lucide-react';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function AnnouncementBar() {
  const pathname = usePathname();
  const isMounted = useIsMounted();
  const cmsAnnouncement = useCMSStore((state) => state.cms.announcement);
  const cmsSocials = useCMSStore((state) => state.cms.socials);
  const config = isMounted && cmsAnnouncement ? cmsAnnouncement : DEFAULT_CMS_DATA.announcement;
  const socials = isMounted && cmsSocials ? cmsSocials : DEFAULT_CMS_DATA.socials;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const alertType = config.alertType || 'default';
  const displayMode = config.displayMode || 'rotate';
  const isStatic = displayMode === 'static' || alertType === 'urgent';

  const defaultPerks = [
    'Complimentary Express Air Logistics on all orders above ₹999',
    '15-Day Risk-Free Replacement & 2-Year Official Brand Warranty',
    'Exclusive Launch Privilege: Use code MEWAK10 for 10% Off',
  ];

  const adminMessage = config.message || DEFAULT_CMS_DATA.announcement.message;
  const messages = isStatic ? [adminMessage] : [adminMessage, ...defaultPerks];

  useEffect(() => {
    if (isStatic || messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length, isStatic]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    return null;
  }

  if (!config.enabled || dismissed) {
    return null;
  }

  // Theme styling based on Alert Type
  const themeStyles = (() => {
    switch (alertType) {
      case 'urgent':
        return {
          wrapper: 'bg-[#881337] text-rose-50 border-b border-rose-500/40 shadow-sm',
          badge: 'bg-rose-500 text-white shadow-xs',
          accent: 'text-white font-bold',
          link: 'text-rose-200 hover:text-white',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-300 animate-pulse shrink-0" />,
        };
      case 'sale':
        return {
          wrapper: 'bg-[#451A03] text-amber-50 border-b border-amber-500/40 shadow-sm',
          badge: 'bg-[#D97706] text-white shadow-xs',
          accent: 'text-[#FCD34D] font-bold',
          link: 'text-[#FCD34D] hover:underline',
          icon: <Flame className="w-3.5 h-3.5 text-[#FCD34D] shrink-0" />,
        };
      case 'info':
        return {
          wrapper: 'bg-[#0F172A] text-sky-50 border-b border-sky-500/30 shadow-sm',
          badge: 'bg-sky-600 text-white shadow-xs',
          accent: 'text-sky-300 font-bold',
          link: 'text-sky-300 hover:text-white',
          icon: <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
        };
      case 'default':
      default:
        return {
          wrapper: 'bg-[#2B1A16] text-[#EFE8DD] border-b border-[#DDD2C0]/20',
          badge: 'bg-[#9A8029]/20 text-[#9A8029] border border-[#9A8029]/40',
          accent: 'text-[#9A8029] font-medium',
          link: 'text-[#9A8029] hover:underline',
          icon: <Sparkles className="w-3 h-3 text-[#9A8029] shrink-0" />,
        };
    }
  })();

  const currentMsg = messages[currentIndex] || messages[0];

  return (
    <div className={`${themeStyles.wrapper} text-xs font-sans relative z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between gap-3">
        {/* Left: Concierge / Support Hotline */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] tracking-wider uppercase opacity-85 shrink-0">
          <a
            href={socials?.supportPhone ? `tel:${socials.supportPhone}` : '/contact'}
            className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
          >
            <PhoneCall className="w-3 h-3 opacity-90" />
            <span>Concierge: {socials?.supportPhone || '+91 80 4920 1800'}</span>
          </a>
          <span className="opacity-40">•</span>
          <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-[3px] ${themeStyles.badge}`}>
            {config.badge || 'AUTHENTIC BRAND WARRANTY'}
          </span>
        </div>

        {/* Center: Live Alert Message */}
        <div className="flex-1 flex items-center justify-center text-center overflow-hidden h-full min-w-0">
          <div
            key={`${alertType}-${currentIndex}`}
            className="flex items-center gap-2 animate-fadeIn transition-all duration-300 text-[11px] md:text-xs tracking-wider truncate"
          >
            {themeStyles.icon}
            
            {/* Show badge inline on smaller screens */}
            <span className={`lg:hidden text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded shrink-0 ${themeStyles.badge}`}>
              {config.badge || 'ALERT'}
            </span>

            <span className="font-medium truncate">
              {currentMsg}
            </span>

            {config.linkUrl && (
              <Link
                href={config.linkUrl}
                className={`hidden sm:inline-flex items-center gap-0.5 ml-1 font-semibold shrink-0 ${themeStyles.link}`}
              >
                {config.linkText || 'Learn More'} <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Right: Boutiques & Dismiss */}
        <div className="flex items-center gap-3 text-[11px] tracking-wider shrink-0">
          <div className="hidden md:flex items-center gap-3 opacity-80">
            <Link href="/contact" className="hover:opacity-100 transition-opacity">
              Boutiques
            </Link>
            <span className="opacity-40">•</span>
            <span className={themeStyles.accent}>INR (₹)</span>
          </div>

          {config.dismissible && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss alert"
              className="p-1 rounded hover:bg-black/20 opacity-70 hover:opacity-100 transition-all text-current"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}