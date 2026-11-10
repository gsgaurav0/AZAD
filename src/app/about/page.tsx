import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LogoTechIcon } from '@/components/common/Logo';

export const metadata = {
  title: 'Our Technology & Engineering Manifesto | Mewak',
  description:
    'The philosophy behind Mewak: converging planar acoustic purity, Grade 5 titanium, and next-generation silicon architectures.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold mb-3 font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE HARDWARE MANIFESTO</span>
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl text-[#2B1A16] font-bold mb-6">
            Acoustic Purity & Silicon Mastery
          </h1>
          <p className="font-sans italic text-lg sm:text-xl text-[#2B1A16]/80 max-w-2xl mx-auto">
            &ldquo;We engineer devices not for planned obsolescence, but for enduring daily excellence.&rdquo;
          </p>
        </div>

        {/* Feature Hero Image */}
        <div className="relative aspect-[16/9] rounded-[4px] overflow-hidden border border-[#DDD2C0] shadow-xl mb-16 bg-[#0F172A]">
          <Image
            src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1600&q=85"
            alt="Mewak Engineering Laboratory"
            fill
            className="object-cover"
          />
        </div>

        {/* Narrative Chapters */}
        <div className="space-y-12 font-sans text-xs sm:text-sm text-[#2B1A16]/85 leading-relaxed">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] space-y-4">
            <h2 className="font-sans text-2xl font-bold text-[#2B1A16]">
              I. The Genesis of Mewak
            </h2>
            <p>
              Founded in 2024, Mewak was born from a singular conviction: premium electronics should not be fragile, disposable plastic gadgets that lose value in six months.
            </p>
            <p>
              By pairing planar magnetic transducer engineering with forged titanium chassis and high-efficiency silicon, Mewak crafts hardware designed for professional creators, audiophiles, and discerning technophiles.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] space-y-4">
            <h2 className="font-sans text-2xl font-bold text-[#2B1A16]">
              II. Aerospace Materials & Micro-Engineering
            </h2>
            <p>
              Every device in our catalog utilizes unyielding materials: aerospace Grade 5 titanium, hand-finished walnut wood acoustic enclosures, diamond-cut sapphire crystal dials, and ballistic 1500D aramid fiber composites.
            </p>
            <p>
              Our acoustic drivers are drafted with custom vapor-deposited beryllium diaphragms to achieve vanishingly low distortion (&lt;0.05% THD) and holographic spatial separation.
            </p>
          </div>

          <div id="sustainability" className="bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] space-y-4">
            <h2 className="font-sans text-2xl font-bold text-[#2B1A16]">
              III. Sustainable Hardware Longevity
            </h2>
            <p>
              Unlike fast-consumer tech, we reject planned obsolescence. Our smart devices receive extended software updates, user-replaceable ear cushions, and comprehensive 2-year warranty shields with complimentary door-to-door concierge service.
            </p>
          </div>

          {/* Seal */}
          <div className="text-center py-6 border-t border-[#DDD2C0] flex flex-col items-center">
            <LogoTechIcon size={32} className="mb-2" />
            <span className="font-sans font-bold text-sm text-[#2B1A16]">
              MEWAK HARDWARE LABS
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#2B1A16]/50 mt-1">
              Bengaluru • San Francisco • Tokyo
            </span>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#9A8029] hover:bg-[#7F6A1F] text-white px-8 py-3.5 rounded-[4px] text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm"
            >
              <span>Explore All Hardware</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
