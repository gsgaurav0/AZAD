'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenWhatsApp = () => {
    const phoneNumber = '919876543210';
    const message = encodeURIComponent(
      'Hello MewaK Concierge, I would like personal stylist assistance with your current collection.'
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 z-40 flex flex-col items-end">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 max-w-xs bg-[#FBF7F0] border border-[#DDD2C0] shadow-xl rounded-[4px] p-3.5 text-xs text-[#2B1A16] animate-fadeIn relative">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-[#2B1A16]/50 hover:text-[#2B1A16] p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4C7A34] animate-pulse" />
            <span className="font-serif font-semibold text-sm">MewaK Concierge</span>
          </div>
          <p className="text-[#2B1A16]/75 mb-3 leading-relaxed">
            Need help selecting your size, pairing outfits, or arranging a boutique fitting? Our stylists are active on WhatsApp.
          </p>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#4C7A34] hover:bg-[#3D632A] text-white py-2 px-3 rounded-[3px] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Start Chat
          </button>
        </div>
      )}

      {/* Concierge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] p-3 rounded-full shadow-lg border border-[#DDD2C0]/40 transition-all duration-300 hover:scale-105"
        aria-label="Contact Concierge via WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#4C7A34] rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#4C7A34] rounded-full border-2 border-white" />
        <MessageCircle className="w-6 h-6 text-[#9A8029] group-hover:text-white transition-colors" />
        <span className="hidden md:inline-block text-xs font-semibold tracking-wider pr-1 uppercase">
          Stylist
        </span>
      </button>
    </div>
  );
}
