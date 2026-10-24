'use client';

import React, { useState } from 'react';
import { X, Ruler, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function SizeGuideModal() {
  const isSizeGuideOpen = useUIStore((state) => state.isSizeGuideOpen);
  const closeSizeGuide = useUIStore((state) => state.closeSizeGuide);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [gender, setGender] = useState<'women' | 'men' | 'kids'>('women');

  if (!isSizeGuideOpen) return null;

  const womenData = [
    { size: 'XS', bust: unit === 'inches' ? '32 - 33"' : '81 - 84 cm', waist: unit === 'inches' ? '25 - 26"' : '63 - 66 cm', hip: unit === 'inches' ? '35 - 36"' : '89 - 91 cm' },
    { size: 'S', bust: unit === 'inches' ? '34 - 35"' : '86 - 89 cm', waist: unit === 'inches' ? '27 - 28"' : '68 - 71 cm', hip: unit === 'inches' ? '37 - 38"' : '94 - 96 cm' },
    { size: 'M', bust: unit === 'inches' ? '36 - 37"' : '91 - 94 cm', waist: unit === 'inches' ? '29 - 30"' : '74 - 76 cm', hip: unit === 'inches' ? '39 - 40"' : '99 - 102 cm' },
    { size: 'L', bust: unit === 'inches' ? '38.5 - 40"' : '98 - 102 cm', waist: unit === 'inches' ? '31.5 - 33"' : '80 - 84 cm', hip: unit === 'inches' ? '41.5 - 43"' : '105 - 109 cm' },
    { size: 'XL', bust: unit === 'inches' ? '41.5 - 43"' : '105 - 109 cm', waist: unit === 'inches' ? '34.5 - 36"' : '88 - 92 cm', hip: unit === 'inches' ? '44.5 - 46"' : '113 - 117 cm' },
    { size: 'XXL', bust: unit === 'inches' ? '44.5 - 46"' : '113 - 117 cm', waist: unit === 'inches' ? '37.5 - 39"' : '95 - 99 cm', hip: unit === 'inches' ? '47.5 - 49"' : '121 - 125 cm' },
  ];

  const menData = [
    { size: 'S (38)', chest: unit === 'inches' ? '37 - 39"' : '94 - 99 cm', waist: unit === 'inches' ? '30 - 32"' : '76 - 81 cm', neck: unit === 'inches' ? '15"' : '38 cm' },
    { size: 'M (40)', chest: unit === 'inches' ? '40 - 41"' : '101 - 104 cm', waist: unit === 'inches' ? '33 - 34"' : '84 - 86 cm', neck: unit === 'inches' ? '15.5"' : '39.5 cm' },
    { size: 'L (42)', chest: unit === 'inches' ? '42 - 44"' : '107 - 112 cm', waist: unit === 'inches' ? '35 - 37"' : '89 - 94 cm', neck: unit === 'inches' ? '16.5"' : '42 cm' },
    { size: 'XL (44)', chest: unit === 'inches' ? '45 - 47"' : '114 - 119 cm', waist: unit === 'inches' ? '38 - 40"' : '96 - 102 cm', neck: unit === 'inches' ? '17.5"' : '44.5 cm' },
    { size: 'XXL (46)', chest: unit === 'inches' ? '48 - 50"' : '122 - 127 cm', waist: unit === 'inches' ? '41 - 43"' : '104 - 109 cm', neck: unit === 'inches' ? '18.5"' : '47 cm' },
  ];

  const kidsData = [
    { size: '2-3Y', height: unit === 'inches' ? '35 - 38"' : '89 - 96 cm', chest: unit === 'inches' ? '21"' : '53 cm', waist: unit === 'inches' ? '20.5"' : '52 cm' },
    { size: '3-4Y', height: unit === 'inches' ? '39 - 41"' : '99 - 104 cm', chest: unit === 'inches' ? '22"' : '56 cm', waist: unit === 'inches' ? '21.5"' : '54 cm' },
    { size: '4-5Y', height: unit === 'inches' ? '42 - 44"' : '107 - 112 cm', chest: unit === 'inches' ? '23"' : '58 cm', waist: unit === 'inches' ? '22"' : '56 cm' },
    { size: '5-6Y', height: unit === 'inches' ? '45 - 47"' : '114 - 119 cm', chest: unit === 'inches' ? '24"' : '61 cm', waist: unit === 'inches' ? '22.5"' : '57 cm' },
    { size: '7-8Y', height: unit === 'inches' ? '48 - 52"' : '122 - 132 cm', chest: unit === 'inches' ? '26"' : '66 cm', waist: unit === 'inches' ? '23.5"' : '60 cm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 sm:p-8">
        <button
          type="button"
          onClick={closeSizeGuide}
          className="absolute top-4 right-4 p-1.5 text-[#2B1A16]/50 hover:text-[#2B1A16] transition-colors"
          aria-label="Close size guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-5 h-5 text-[#9A8029]" />
          <h3 className="font-serif text-2xl font-semibold text-[#2B1A16]">
            Atelier Size Guide
          </h3>
        </div>
        <p className="text-xs text-[#2B1A16]/70 font-sans mb-6">
          MewaK garments are sculpted to authentic Indian & Neapolitan sartorial proportions. If you fall between sizes, we recommend opting for the larger size for a relaxed drape.
        </p>

        {/* Gender Tabs & Unit Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DDD2C0]">
          <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#EFE8DD] p-0.5 text-xs font-semibold uppercase tracking-wider">
            {(['women', 'men', 'kids'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`px-3 py-1.5 rounded-[3px] transition-colors ${
                  gender === g ? 'bg-white text-[#2B1A16] shadow-xs' : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-[#2B1A16]/60">Units:</span>
            <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#EFE8DD] p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnit('inches')}
                className={`px-2.5 py-1 rounded-[3px] transition-colors ${
                  unit === 'inches' ? 'bg-[#9A8029] text-white' : 'text-[#2B1A16]/70'
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 rounded-[3px] transition-colors ${
                  unit === 'cm' ? 'bg-[#9A8029] text-white' : 'text-[#2B1A16]/70'
                }`}
              >
                CM
              </button>
            </div>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto mb-8 border border-[#DDD2C0] rounded-[4px]">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#EFE8DD] text-[#2B1A16] uppercase tracking-wider font-semibold border-b border-[#DDD2C0]">
              <tr>
                <th className="py-3 px-4">Size</th>
                {gender === 'women' && (
                  <>
                    <th className="py-3 px-4">Bust</th>
                    <th className="py-3 px-4">Natural Waist</th>
                    <th className="py-3 px-4">Hips</th>
                  </>
                )}
                {gender === 'men' && (
                  <>
                    <th className="py-3 px-4">Chest</th>
                    <th className="py-3 px-4">Waist</th>
                    <th className="py-3 px-4">Collar / Neck</th>
                  </>
                )}
                {gender === 'kids' && (
                  <>
                    <th className="py-3 px-4">Height</th>
                    <th className="py-3 px-4">Chest</th>
                    <th className="py-3 px-4">Waist</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD2C0]/50 bg-white">
              {gender === 'women' &&
                womenData.map((row) => (
                  <tr key={row.size} className="hover:bg-[#FBF7F0]">
                    <td className="py-3 px-4 font-bold text-[#2B1A16]">{row.size}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.bust}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.waist}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.hip}</td>
                  </tr>
                ))}
              {gender === 'men' &&
                menData.map((row) => (
                  <tr key={row.size} className="hover:bg-[#FBF7F0]">
                    <td className="py-3 px-4 font-bold text-[#2B1A16]">{row.size}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.chest}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.waist}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.neck}</td>
                  </tr>
                ))}
              {gender === 'kids' &&
                kidsData.map((row) => (
                  <tr key={row.size} className="hover:bg-[#FBF7F0]">
                    <td className="py-3 px-4 font-bold text-[#2B1A16]">{row.size}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.height}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.chest}</td>
                    <td className="py-3 px-4 text-[#2B1A16]/80">{row.waist}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Guide Advice */}
        <div className="bg-[#EFE8DD] p-4 rounded-[4px] text-xs text-[#2B1A16]/80 space-y-2">
          <div className="flex items-center gap-1.5 font-serif font-semibold text-sm text-[#2B1A16]">
            <Sparkles className="w-4 h-4 text-[#9A8029]" />
            How to Measure Correctly
          </div>
          <p>
            <strong>Chest / Bust:</strong> Measure around the fullest part of your chest, keeping the tape snug under your arms and across shoulder blades.
          </p>
          <p>
            <strong>Waist:</strong> Measure at your narrowest natural waistline (usually an inch above your belly button).
          </p>
          <p>
            <strong>Hips:</strong> Stand with feet together and measure around the widest part of your hips.
          </p>
        </div>
      </div>
    </div>
  );
}
