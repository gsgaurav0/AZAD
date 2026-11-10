import React from 'react';

export const metadata = {
  title: 'Terms of Service | AZAD',
  description: 'Terms governing the purchase of electronics, hardware, and audio products at AZAD.',
};

export default function TermsPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-sans text-3xl sm:text-4xl text-[#2B1A16] font-bold mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-[#2B1A16]/60 font-sans mb-8">
          Last revised: October 2026
        </p>

        <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-6 font-sans text-xs sm:text-sm text-[#2B1A16]/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-sans text-lg font-semibold text-[#2B1A16]">
              1. The Contract of Sale
            </h2>
            <p>
              By finalizing an order on the AZAD digital storefront, you enter into a sale agreement for premium consumer electronics, audio hardware, and tech accessories governed by Indian commerce laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-sans text-lg font-semibold text-[#2B1A16]">
              2. Official Warranty & Coverage
            </h2>
            <p>
              All hardware products purchased through authorized AZAD channels include our 2-Year Official Brand Warranty. Coverage protects against driver failure, motherboard defects, and manufacturing anomalies under normal operational usage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-sans text-lg font-semibold text-[#2B1A16]">
              3. Intellectual Property
            </h2>
            <p>
              The AZAD trademark, hardware industrial designs, acoustic calibration profiles, and product photography remain the exclusive intellectual property of AZAD Electronics Ltd.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
