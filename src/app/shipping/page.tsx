import React from 'react';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Complimentary Shipping & Express Delivery | MewaK Atelier',
  description:
    'Information regarding our domestic complimentary shipping, express air dispatch, and signature gift packaging.',
};

export default function ShippingPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            DELIVERY LOGISTICS
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2B1A16] font-normal mb-3">
            Shipping & White-Glove Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans">
            Every order is carefully inspected, steam-pressed, and wrapped in acid-free archival tissue.
          </p>
        </div>

        <div className="space-y-6 font-sans text-xs sm:text-sm text-[#2B1A16]/85">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              1. Complimentary Shipping Threshold
            </h2>
            <p>
              We are pleased to provide complimentary express shipping across all postal codes within India for orders valued at <strong>₹999 or above</strong>. For orders below this threshold, a flat delivery fee of ₹99 is added at checkout.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              2. Processing & Dispatch Timelines
            </h2>
            <p>
              Orders are packaged and handed to our logistics partners (BlueDart, Delhivery, or Express Air Cargo) within 24–48 hours of confirmation. Delivery times range from 2 to 4 business days for metropolitan centers, and 4 to 6 business days for other regions.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              3. Signature Keepsake Packaging
            </h2>
            <p>
              Every garment arrives inside an embossed MewaK linen-textured keepsake box, accompanied by cedar blocks for insect protection and a certificate of handloom authenticity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
