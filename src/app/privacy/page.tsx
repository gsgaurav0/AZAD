import React from 'react';

export const metadata = {
  title: 'Privacy Policy | MewaK Atelier',
  description: 'Our policy regarding data encryption, patron confidentiality, and cookies.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1A16] font-normal mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#2B1A16]/60 font-sans mb-8">
          Last revised: October 2026
        </p>

        <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-6 font-sans text-xs sm:text-sm text-[#2B1A16]/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#2B1A16]">
              1. Patron Confidentiality
            </h2>
            <p>
              At MewaK, patron confidentiality is paramount. We do not sell, rent, or trade your contact information, phone numbers, or purchase archives with commercial data brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#2B1A16]">
              2. Data Encryption & Storage
            </h2>
            <p>
              All customer sessions, authentication tokens, and order details are transmitted across 256-bit SSL encrypted channels. Card details are tokenized through RBI-compliant Indian payment aggregators.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold text-[#2B1A16]">
              3. Local Storage Cookies
            </h2>
            <p>
              We utilize browser localStorage solely to persist your curated cart items, saved wishlist, and address preferences between visits.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
