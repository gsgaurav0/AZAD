import React from 'react';
import Link from 'next/link';
import { RotateCcw, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: '15-Day Complimentary Returns & Exchanges | MewaK Atelier',
  description:
    'Our commitment to your satisfaction: complimentary 15-day doorstep pickups and swift refund settlements.',
};

export default function ReturnsPage() {
  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            GUARANTEE OF SATISFACTION
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2B1A16] font-normal mb-3">
            15-Day Return & Exchange Privilege
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans">
            Enjoy complete peace of mind with our complimentary doorstep pickup service.
          </p>
        </div>

        <div className="space-y-6 font-sans text-xs sm:text-sm text-[#2B1A16]/85">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              1. The 15-Day Trial Window
            </h2>
            <p>
              We want you to feel entirely at ease with your silhouette, fit, and textile drape. You may request a size exchange or full refund within 15 days of physical delivery.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              2. Doorstep Pickup Process
            </h2>
            <p>
              Simply visit your Patron Account dashboard, select the order, and choose your reason. Our courier representative will arrange a contactless doorstep collection at no expense to you.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-[4px] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2B1A16] font-semibold">
              3. Refund Timelines
            </h2>
            <p>
              Once your item is checked at the Maison atelier, refunds are initiated immediately to your original payment method (UPI, Card, or Net Banking) or credited as MewaK store credit with a complimentary bonus.
            </p>
          </div>

          <div className="text-center pt-8">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-[4px] transition-colors"
            >
              <span>Initiate Return in Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
