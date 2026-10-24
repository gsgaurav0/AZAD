import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LogoLeafIcon } from '@/components/common/Logo';

export const metadata = {
  title: 'Our Heritage & Maison Story | MewaK Atelier',
  description:
    'The philosophy behind MewaK: reviving noble Indian handloom textiles and harmonizing them with Neapolitan sartorial tailoring.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold mb-3 font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE MAISON PHILOSOPHY</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#2B1A16] font-normal mb-6">
            Sartorial Quietude & Living Heritage
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#2B1A16]/80 max-w-2xl mx-auto">
            &ldquo;We craft garments not for seasonal disposal, but for enduring reverence.&rdquo;
          </p>
        </div>

        {/* Feature Hero Image */}
        <div className="relative aspect-[16/9] rounded-[4px] overflow-hidden border border-[#DDD2C0] shadow-xl mb-16 bg-[#2B1A16]">
          <Image
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=85"
            alt="MewaK Handcrafting Process"
            fill
            className="object-cover"
          />
        </div>

        {/* Narrative Chapters */}
        <div className="space-y-12 font-sans text-xs sm:text-sm text-[#2B1A16]/85 leading-relaxed">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] space-y-4">
            <h2 className="font-serif text-2xl text-[#2B1A16]">
              I. The Genesis of MewaK
            </h2>
            <p>
              Founded in 2024, MewaK was born from a singular conviction: the ancient textile guilds of India—the gossamer Chanderis of Madhya Pradesh, the raw matka silks of Bengal, and the Pashmina weavers of Kashmir—deserve a stage stripped of ornamental excess.
            </p>
            <p>
              By paring down silhouettes to pure architectural proportions inspired by Savile Row and Neapolitan tailoring, we allow the intrinsic nobility of the fiber to become the protagonist.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] space-y-4">
            <h2 className="font-serif text-2xl text-[#2B1A16]">
              II. Noble Materials & Zero Plastics
            </h2>
            <p>
              Every garment in our catalog begins with organic, non-synthetic origins. We utilize Grade-A Mongolian cashmere, Normandy long-staple flax linen, certified Biella merino wool, and pure 19-momme Mulberry silk charmeuse.
            </p>
            <p>
              Our fastenings are shaped from natural Australian mother-of-pearl, horn, and solid hand-turned brass rivets. Zero polyester linings, zero synthetic coatings.
            </p>
          </div>

          <div id="sustainability" className="bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] space-y-4">
            <h2 className="font-serif text-2xl text-[#2B1A16]">
              III. Sustainable Patronage
            </h2>
            <p>
              MewaK practices strict slow fashion: we release small capsule edits and produce garments in controlled batches. This guarantees fair living wages and healthcare for our master artisan clusters while ensuring zero deadstock wastage.
            </p>
          </div>

          <div className="text-center pt-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-[4px] transition-colors"
            >
              <span>Explore The Current Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
