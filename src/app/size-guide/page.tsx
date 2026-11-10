'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

type GuideTab = 'smartwatches' | 'headphones' | 'phones';

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>('smartwatches');

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            HARDWARE SPECIFICATIONS & ERGONOMICS
          </span>
          <h1 className="font-sans text-4xl sm:text-5xl text-[#2B1A16] font-bold mb-3">
            Device Sizing & Fit Guide
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans max-w-xl mx-auto">
            Review detailed case dimensions, ear-coupling architectures, and wrist sizes to ensure the perfect fit for your setup.
          </p>
        </div>

        {/* Tab & Guide Card */}
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] shadow-sm mb-10">
          <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#EFE8DD] p-1 text-xs font-semibold uppercase tracking-wider font-sans mb-8">
            {[
              { id: 'smartwatches' as const, label: 'Smartwatches & Wrist Sizing' },
              { id: 'headphones' as const, label: 'Audio & Earphone Fit' },
              { id: 'phones' as const, label: 'Smartphones & Canvas Sizing' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2.5 text-center rounded-[3px] transition-colors truncate px-2 ${
                  activeTab === t.id ? 'bg-white text-[#2B1A16] shadow-xs' : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'smartwatches' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-[#EFE8DD] text-[#2B1A16] font-semibold border-b border-[#DDD2C0]">
                      <th className="p-3 text-left">Case Size</th>
                      <th className="p-3 text-left">Display Size</th>
                      <th className="p-3 text-left">Wrist Circumference</th>
                      <th className="p-3 text-left">Strap Lug Width</th>
                      <th className="p-3 text-left">Ideal Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD2C0]/50 text-[#2B1A16]/80">
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">41mm Slim</td>
                      <td className="p-3">1.3-inch AMOLED (1000 nits)</td>
                      <td className="p-3">130mm – 175mm</td>
                      <td className="p-3">20mm Quick-Release</td>
                      <td className="p-3">Slimmer wrists, boardroom meetings & sleep tracking</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">45mm Classic</td>
                      <td className="p-3">1.43-inch AMOLED (1500 nits)</td>
                      <td className="p-3">155mm – 200mm</td>
                      <td className="p-3">22mm Quick-Release</td>
                      <td className="p-3">Universal daily driver, notifications & daily fitness</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">49mm Ultra</td>
                      <td className="p-3">1.99-inch Sapphire (3000 nits)</td>
                      <td className="p-3">165mm – 220mm</td>
                      <td className="p-3">26mm Titanium Lug</td>
                      <td className="p-3">Marathons, scuba diving, mountaineering & solar GPS</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-[#EFE8DD]/50 rounded-[3px] border border-[#DDD2C0] text-xs text-[#2B1A16]/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#9A8029] shrink-0 mt-0.5" />
                <span>
                  <strong>Wrist Measurement Tip:</strong> Use a flexible tailor&apos;s tape around your wrist bone. If your measurement falls right between 41mm and 45mm, choose 41mm for formal suits or 45mm for active lifestyle visibility.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'headphones' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-[#EFE8DD] text-[#2B1A16] font-semibold border-b border-[#DDD2C0]">
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Acoustic Drivers</th>
                      <th className="p-3 text-left">Ear Cup Coupling</th>
                      <th className="p-3 text-left">Included Ear Tips / Pads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD2C0]/50 text-[#2B1A16]/80">
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">Apex Pro Wireless</td>
                      <td className="p-3">40mm Custom Beryllium</td>
                      <td className="p-3">Circumaural (Over-Ear Seal)</td>
                      <td className="p-3">Perforated memory foam lambskin cushions</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">SonicBuds Ultra</td>
                      <td className="p-3">11mm Dual Coaxial</td>
                      <td className="p-3">Intra-Aural (Acoustic In-Ear)</td>
                      <td className="p-3">4 sizes: XS, S, M, L medical-grade silicone</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">Aura Studio Planar</td>
                      <td className="p-3">90mm Planar Magnetic</td>
                      <td className="p-3">Circumaural (Open Grille)</td>
                      <td className="p-3">Breathable velour cooling studio pads</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'phones' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-[#EFE8DD] text-[#2B1A16] font-semibold border-b border-[#DDD2C0]">
                      <th className="p-3 text-left">Smartphone Model</th>
                      <th className="p-3 text-left">Screen Size</th>
                      <th className="p-3 text-left">Chassis Weight</th>
                      <th className="p-3 text-left">Hand Ergonomics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD2C0]/50 text-[#2B1A16]/80">
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">Vertex 5 Compact</td>
                      <td className="p-3">6.1-inch OLED 120Hz</td>
                      <td className="p-3">168g</td>
                      <td className="p-3">Compact pocket fit, seamless one-handed thumb reach</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">Horizon Phone (3)</td>
                      <td className="p-3">6.55-inch Flexible OLED</td>
                      <td className="p-3">190g</td>
                      <td className="p-3">Balanced everyday standard proportions</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">Titan 16 Pro Max</td>
                      <td className="p-3">6.7-inch LTPO AMOLED</td>
                      <td className="p-3">221g</td>
                      <td className="p-3">Maximalist visual canvas for gaming & camera zoom</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2B1A16]">Nexus Fold 6 Ultra</td>
                      <td className="p-3">6.3-inch Cover / 8.0-inch Inner</td>
                      <td className="p-3">239g</td>
                      <td className="p-3">Phone mode in pocket; unfolds into desktop workstation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Guarantee Banner */}
        <div className="p-6 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-2 text-[#2B1A16]">
            <ShieldCheck className="w-5 h-5 text-[#9A8029] shrink-0" />
            <span>Unsure about your sizing? Enjoy our <strong>15-Day Risk-Free Home Trial & Replacement</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
