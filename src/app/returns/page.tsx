import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: '15-Day Replacement & Returns Policy | AZAD',
  description:
    'Our commitment to your satisfaction: complimentary 15-day doorstep pickups, hardware replacements, and prompt refund settlements.',
};

export default function ReturnsPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            GUARANTEE OF SATISFACTION
          </span>
          <h1 className="font-sans text-4xl sm:text-5xl text-[#2B1A16] font-bold mb-3">
            15-Day Replacement & Return Guarantee
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans">
            Enjoy complete peace of mind with our complimentary doorstep pickup and official warranty support.
          </p>
        </div>

        <div className="space-y-6 font-sans text-xs sm:text-sm text-[#2B1A16]/85">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-sans text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              1. The 15-Day Home Trial Window
            </h2>
            <p>
              We want you to feel entirely confident in your audio fidelity, ergonomics, and device performance. You may request a replacement or full refund within 15 days of physical delivery.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-sans text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              2. Free Doorstep Pickup Process
            </h2>
            <p>
              Simply visit your Account dashboard, select the order, and choose your reason. Our courier representative will arrange a contactless doorstep collection with prepaid shipping.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-sans text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              3. Refund & Replacement Timelines
            </h2>
            <p>
              Once your item is received and checked at our diagnostics center, replacements are dispatched immediately or refunds are initiated to your original payment method (UPI, Card, or Net Banking) or credited as instant AZAD store credit.
            </p>
          </div>

          <div className="text-center pt-8">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-[4px] transition-colors"
            >
              <span>Manage Orders in Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
