'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_DATA: { category: string; questions: FAQItem[] }[] = [
  {
    category: 'Orders & Concierge Checkout',
    questions: [
      {
        q: 'How do I place an order as a guest versus registered patron?',
        a: 'You may browse freely and check out by entering your 10-digit Indian mobile number for instant 6-digit OTP verification. No complex passwords are required.',
      },
      {
        q: 'Can I apply promotional coupons to my shopping bag?',
        a: 'Yes. Enter promo code MEWAK10 at checkout or in the bag drawer for 10% off your order, or WELCOME50 for ₹500 discount on orders above ₹1,999.',
      },
      {
        q: 'What payment modes are accepted at MewaK?',
        a: 'We accept instant UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit and Debit Cards (Visa, Mastercard, RuPay, Amex), Indian Net Banking, and Cash on Delivery.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    questions: [
      {
        q: 'What is the complimentary shipping threshold?',
        a: 'Doorstep express delivery is complimentary across all Indian pin codes for orders valued at ₹999 or higher. For orders under ₹999, a flat nominal delivery fee of ₹99 is applicable.',
      },
      {
        q: 'How long does dispatch take?',
        a: 'Every piece undergoes a final white-glove quality inspection at our atelier and is dispatched within 24 to 48 hours via express air logistics (Delhivery / BlueDart). Delivery is typically completed within 3 to 5 business days.',
      },
    ],
  },
  {
    category: 'Returns & Complimentary Doorstep Pickup',
    questions: [
      {
        q: 'What is the return policy duration?',
        a: 'We offer a complimentary 15-day return and size exchange window from the day of delivery. Our courier agent will visit your residence for doorstep pickup.',
      },
      {
        q: 'What condition must garments remain in?',
        a: 'Pieces must remain unworn, unwashed, and in their original packaging with the gold security tags affixed.',
      },
      {
        q: 'When will my refund be processed?',
        a: 'Once the returned item is inspected at our atelier, refunds are credited back to your original source account within 48 to 72 hours.',
      },
    ],
  },
  {
    category: 'Fabrics & Garment Care',
    questions: [
      {
        q: 'Are MewaK silks 100% natural?',
        a: 'Yes. We strictly employ 100% pure Mulberry silk, Chanderi cotton-silk handlooms, Grade-A Mongolian cashmere, and Normandy flax linens. Zero polyester blends are used.',
      },
      {
        q: 'How should I care for Mulberry silk and half-canvas tailoring?',
        a: 'We advise specialized dry cleaning for our tailored outerwear, suits, and silk dresses. Linen and organic cotton pieces can be gently laundered in cold water.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
    '0-0': true,
    '1-0': true,
  });

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            KNOWLEDGE BASE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2B1A16] font-normal mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans">
            Everything you need to know about purchasing, shipping, sizing, and artisan care.
          </p>
        </div>

        {/* Categorized Accordions */}
        <div className="space-y-10">
          {FAQ_DATA.map((cat, catIdx) => (
            <div key={cat.category} className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl text-[#2B1A16] font-semibold border-b border-[#DDD2C0] pb-2">
                {cat.category}
              </h2>
              <div className="space-y-2 font-sans">
                {cat.questions.map((item, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div
                      key={qIdx}
                      className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="w-full p-4 flex items-center justify-between text-left font-serif font-medium text-sm sm:text-base text-[#2B1A16]"
                      >
                        <span>{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#9A8029] shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#2B1A16]/50 shrink-0 ml-2" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs sm:text-sm text-[#2B1A16]/80 leading-relaxed border-t border-[#DDD2C0]/40 font-sans">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
