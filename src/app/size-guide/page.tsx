'use client';

import React, { useState } from 'react';
import { Ruler, Sparkles } from 'lucide-react';

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [gender, setGender] = useState<'women' | 'men' | 'kids'>('women');

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

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            SARTORIAL PROPORTIONS
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2B1A16] font-normal mb-3">
            Atelier Size Guide & Conversions
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans max-w-xl mx-auto">
            Our garments are tailored according to neoclassical European ease and Indian comfort specifications.
          </p>
        </div>

        {/* Tab & Unit Selector */}
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-[4px] shadow-sm mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DDD2C0]">
            <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#EFE8DD] p-0.5 text-xs font-semibold uppercase tracking-wider font-sans">
              {(['women', 'men'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-4 py-2 rounded-[3px] transition-colors ${
                    gender === g ? 'bg-white text-[#2B1A16] shadow-xs' : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="text-[#2B1A16]/60 font-semibold">Unit:</span>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#EFE8DD] p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1.5 rounded-[3px] transition-colors ${
                    unit === 'inches' ? 'bg-[#9A8029] text-white' : 'text-[#2B1A16]/70'
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1.5 rounded-[3px] transition-colors ${
                    unit === 'cm' ? 'bg-[#9A8029] text-white' : 'text-[#2B1A16]/70'
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-6 border border-[#DDD2C0] rounded-[4px]">
            <table className="w-full text-left text-xs sm:text-sm font-sans">
              <thead className="bg-[#EFE8DD] text-[#2B1A16] uppercase tracking-wider font-semibold border-b border-[#DDD2C0]">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  {gender === 'women' ? (
                    <>
                      <th className="py-3 px-4">Bust</th>
                      <th className="py-3 px-4">Waist</th>
                      <th className="py-3 px-4">Hips</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">Chest</th>
                      <th className="py-3 px-4">Waist</th>
                      <th className="py-3 px-4">Collar / Neck</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD2C0]/50 bg-white">
                {gender === 'women'
                  ? womenData.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FBF7F0]">
                        <td className="py-3.5 px-4 font-bold text-[#2B1A16]">{row.size}</td>
                        <td className="py-3.5 px-4 text-[#2B1A16]/80">{row.bust}</td>
                        <td className="py-3.5 px-4 text-[#2B1A16]/80">{row.waist}</td>
                        <td className="py-3.5 px-4 text-[#2B1A16]/80">{row.hip}</td>
                      </tr>
                    ))
                  : menData.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FBF7F0]">
                        <td className="py-3.5 px-4 font-bold text-[#2B1A16]">{row.size}</td>
                        <td className="py-3.5 px-4 text-[#2B1A16]/80">{row.chest}</td>
                        <td className="py-3.5 px-4 text-[#2B1A16]/80">{row.waist}</td>
                        <td className="py-3.5 px-4 text-[#2B1A16]/80">{row.neck}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
