import React from 'react';

export const metadata = {
  title: 'Terms of Service | MewaK Atelier',
  description: 'Terms governing the purchase of garments and bespoke services at MewaK.',
};

export default function TermsPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1A16] font-normal mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-[#2B1A16]/60 font-sans mb-8">
          Last revised: October 2026
        </p>

        <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-6 font-sans text-xs sm:text-sm text-[#2B1A16]/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#2B1A16]">
              1. The Contract of Sale
            </h2>
            <p>
              By finalizing an order on the MewaK digital storefront, you enter into a sale agreement for handcrafted luxury clothing and accessories governed by Indian commerce laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#2B1A16]">
              2. Handcrafted Textile Variations
            </h2>
            <p>
              Due to the authentic handloomed nature of Chanderi zari, Matka raw silk, and vegetable-tanned leathers, slight organic slubs and tonal variations are celebrated hallmarks of artisanal authenticity, rather than defects.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#2B1A16]">
              3. Intellectual Property
            </h2>
            <p>
              The MEWAK trademark, leaf icon monogram, photography, and bespoke garment drafts remain the exclusive intellectual property of MewaK Atelier. Powered by Kashyap Communication.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
