'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_DATA: { category: string; questions: FAQItem[] }[] = [
  {
    category: 'Orders & Express Checkout',
    questions: [
      {
        q: 'How do I place an order as a guest versus registered patron?',
        a: 'You may browse freely and check out by entering your 10-digit Indian mobile number for instant 6-digit OTP verification. No complex passwords are required.',
      },
      {
        q: 'Can I apply promotional coupons to my shopping cart?',
        a: 'Yes. Enter promo code AZAD10 at checkout or in the bag drawer for 10% off your order, or WELCOME50 for ₹500 discount on orders above ₹1,999.',
      },
      {
        q: 'What payment modes are accepted at AZAD?',
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
        a: 'Every electronic device undergoes diagnostic quality testing and is dispatched within 24 hours via express air logistics (Delhivery / BlueDart). Delivery is typically completed within 2 to 4 business days.',
      },
    ],
  },
  {
    category: 'Returns, Replacements & Warranty',
    questions: [
      {
        q: 'What is the replacement and return policy?',
        a: 'We offer a complimentary 15-day replacement window from the day of delivery. If you experience any sizing, fit, or hardware defect, our courier will visit your residence for doorstep replacement.',
      },
      {
        q: 'What condition must returned hardware be in?',
        a: 'Items must be returned in their original packaging with serial number stickers intact, alongside all bundled charging cables and accessories.',
      },
      {
        q: 'When will my refund be processed?',
        a: 'Once the returned hardware is received and checked at our technical facility, refunds are credited back to your original source account within 48 to 72 hours.',
      },
    ],
  },
  {
    category: 'Warranty & Hardware Support',
    questions: [
      {
        q: 'What warranty is included with AZAD devices?',
        a: 'All AZAD headphones, smartphones, smartwatches, and GaN chargers include an official 2-Year Brand Warranty covering internal electronics, acoustic drivers, and manufacturer defects.',
      },
      {
        q: 'Are AZAD products water and sweat resistant?',
        a: 'Yes. The Chronos Ultra watch is rated 100m / EN13319 dive-certified, the Titan 16 Pro Max is IP68 water & dust sealed, and SonicBuds Ultra earbuds are IPX7 sweatproof.',
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
