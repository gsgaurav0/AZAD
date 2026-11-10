'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Ruler } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

type ModalTab = 'smartwatches' | 'headphones' | 'phones';

export default function SizeGuideModal() {
  const isSizeGuideOpen = useUIStore((state) => state.isSizeGuideOpen);
  const closeSizeGuide = useUIStore((state) => state.closeSizeGuide);
  const [activeTab, setActiveTab] = useState<ModalTab>('smartwatches');

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 sm:p-8">
        <button
          type="button"
          onClick={closeSizeGuide}
          className="absolute top-4 right-4 p-1.5 text-[#2B1A16]/50 hover:text-[#2B1A16] transition-colors"
          aria-label="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-5 h-5 text-[#9A8029]" />
          <h3 className="font-sans text-2xl font-bold text-[#2B1A16]">
            Hardware Sizing & Fit Guide
          </h3>
        </div>
        <p className="text-xs text-[#2B1A16]/70 font-sans mb-6">
          Find your ideal device dimensions, wrist circumference, and acoustic ergonomics before ordering.
        </p>

        {/* Category Tabs */}
        <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#EFE8DD] p-1 text-xs font-semibold uppercase tracking-wider mb-6">
          {[
            { id: 'smartwatches' as const, label: 'Smartwatches & Wrist' },
            { id: 'headphones' as const, label: 'Audio & Ear Ergonomics' },
            { id: 'phones' as const, label: 'Phone Displays & Form' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 text-center rounded-[3px] transition-colors truncate px-2 ${
                activeTab === t.id ? 'bg-white text-[#2B1A16] shadow-xs' : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Smartwatches */}
        {activeTab === 'smartwatches' && (
          <div className="space-y-4">
            <table className="w-full text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-[#EFE8DD] text-[#2B1A16] font-semibold border-b border-[#DDD2C0]">
                  <th className="p-2.5 text-left">Case Size</th>
                  <th className="p-2.5 text-left">Display</th>
                  <th className="p-2.5 text-left">Recommended Wrist</th>
                  <th className="p-2.5 text-left">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD2C0]/50 text-[#2B1A16]/80">
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">41mm Slim</td>
                  <td className="p-2.5">1.3-inch AMOLED</td>
                  <td className="p-2.5">130mm – 175mm</td>
                  <td className="p-2.5">Smaller wrists & formal dress wear</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">45mm Classic</td>
                  <td className="p-2.5">1.43-inch AMOLED</td>
                  <td className="p-2.5">155mm – 200mm</td>
                  <td className="p-2.5">Standard universal daily driver</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">49mm Ultra</td>
                  <td className="p-2.5">1.99-inch Sapphire</td>
                  <td className="p-2.5">165mm – 220mm</td>
                  <td className="p-2.5">Rugged athletics, diving & endurance</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-[#EFE8DD]/50 rounded-[3px] border border-[#DDD2C0] text-[11px] text-[#2B1A16]/80 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9A8029] shrink-0 mt-0.5" />
              <span>
                <strong>How to measure your wrist:</strong> Wrap a flexible measuring tape just below your wrist bone where your watch usually sits.
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Headphones */}
        {activeTab === 'headphones' && (
          <div className="space-y-4">
            <table className="w-full text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-[#EFE8DD] text-[#2B1A16] font-semibold border-b border-[#DDD2C0]">
                  <th className="p-2.5 text-left">Type</th>
                  <th className="p-2.5 text-left">Acoustic Driver</th>
                  <th className="p-2.5 text-left">Ear Coupling</th>
                  <th className="p-2.5 text-left">Included Sizing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD2C0]/50 text-[#2B1A16]/80">
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">Over-Ear ANC</td>
                  <td className="p-2.5">40mm Beryllium</td>
                  <td className="p-2.5">Circumaural (Encloses ear)</td>
                  <td className="p-2.5">Universal memory foam lambskin pads</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">In-Ear True Wireless</td>
                  <td className="p-2.5">11mm Dual Coaxial</td>
                  <td className="p-2.5">Intra-aural (Acoustic seal)</td>
                  <td className="p-2.5">4 Pairs: XS, S, M, L silicone tips</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">Open-Back Studio</td>
                  <td className="p-2.5">90mm Planar</td>
                  <td className="p-2.5">Circumaural Open Grille</td>
                  <td className="p-2.5">Perforated cooling velour cushions</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-[#EFE8DD]/50 rounded-[3px] border border-[#DDD2C0] text-[11px] text-[#2B1A16]/80 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9A8029] shrink-0 mt-0.5" />
              <span>
                All Mewak wireless earbuds ship with 4 sizes of hypoallergenic medical-grade silicone ear tips to guarantee a secure, bass-rich acoustic seal.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Phones */}
        {activeTab === 'phones' && (
          <div className="space-y-4">
            <table className="w-full text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-[#EFE8DD] text-[#2B1A16] font-semibold border-b border-[#DDD2C0]">
                  <th className="p-2.5 text-left">Model</th>
                  <th className="p-2.5 text-left">Screen Diagonal</th>
                  <th className="p-2.5 text-left">Weight</th>
                  <th className="p-2.5 text-left">One-Hand Usability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD2C0]/50 text-[#2B1A16]/80">
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">Vertex Compact</td>
                  <td className="p-2.5">6.1-inch OLED</td>
                  <td className="p-2.5">168g</td>
                  <td className="p-2.5">Effortless single-hand thumb reach</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">Horizon Phone</td>
                  <td className="p-2.5">6.55-inch OLED</td>
                  <td className="p-2.5">190g</td>
                  <td className="p-2.5">Balanced everyday handheld size</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">Titan 16 Pro Max</td>
                  <td className="p-2.5">6.7-inch LTPO</td>
                  <td className="p-2.5">221g</td>
                  <td className="p-2.5">Immersive media & large canvas</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#2B1A16]">Nexus Fold 6</td>
                  <td className="p-2.5">6.3-inch Cover / 8.0-inch Inner</td>
                  <td className="p-2.5">239g</td>
                  <td className="p-2.5">Single-hand closed / Two-hand open tablet</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Warranty reassurance */}
        <div className="mt-6 pt-4 border-t border-[#DDD2C0] flex items-center justify-between text-xs text-[#2B1A16]/70">
          <span className="flex items-center gap-1.5 font-semibold text-[#2B1A16]">
            <ShieldCheck className="w-4 h-4 text-[#9A8029]" />
            15-Day Hassle-Free Sizing Exchanges
          </span>
          <button
            type="button"
            onClick={closeSizeGuide}
            className="text-[#9A8029] font-bold hover:underline uppercase text-[11px]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
