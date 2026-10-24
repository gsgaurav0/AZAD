'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Check } from 'lucide-react';
import Logo, { GoldFlowerIcon } from '@/components/common/Logo';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '@/components/common/SocialIcons';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#2B1A16] text-[#EFE8DD] border-t border-[#DDD2C0]/20 font-sans pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand Note */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-[#DDD2C0]/15">
          <div className="lg:col-span-5 space-y-4">
            <Logo size="lg" className="items-start" />
            <p className="text-xs text-[#EFE8DD]/70 max-w-sm leading-relaxed font-sans">
              MewaK embodies the intersection of ancestral Indian textile craftsmanship and sharp European editorial tailoring. Silks, handloomed linens, and slow luxury.
            </p>
            <div className="flex items-center gap-4 pt-2 text-[#DDD2C0]/80">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#9A8029] transition-colors p-1"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#9A8029] transition-colors p-1"
                aria-label="Facebook"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#9A8029] transition-colors p-1"
                aria-label="YouTube"
              >
                <YoutubeIcon size={18} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-widest text-[#9A8029] font-semibold mb-2 block">
              THE PATRON BULLETIN
            </span>
            <h4 className="font-serif text-xl sm:text-2xl text-[#EFE8DD] mb-2">
              Receive private invitations to seasonal edits & runway previews
            </h4>
            <p className="text-xs text-[#EFE8DD]/60 mb-4">
              Enjoy 10% off your inaugural order with personal concierge privileges.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 bg-[#9A8029]/20 border border-[#9A8029] text-[#EFE8DD] px-4 py-3 rounded-[4px] text-xs">
                <Check className="w-4 h-4 text-[#9A8029]" />
                <span>Welcome to the Maison MewaK. Your welcome code <strong>MEWAK10</strong> has been noted.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DDD2C0]/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="w-full bg-[#EFE8DD]/10 border border-[#DDD2C0]/30 rounded-[4px] pl-10 pr-4 py-2.5 text-xs text-[#EFE8DD] placeholder:text-[#EFE8DD]/40 outline-none focus:border-[#9A8029] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#9A8029] hover:bg-[#7F6A1F] text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-[4px] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  Join <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#DDD2C0]/15 text-xs">
          {/* Col 1: Collections */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-[#EFE8DD] uppercase tracking-wider mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-[#EFE8DD]/70">
              <li>
                <Link href="/shop/women" className="hover:text-[#9A8029] transition-colors">
                  Women Haute Edition
                </Link>
              </li>
              <li>
                <Link href="/shop/men" className="hover:text-[#9A8029] transition-colors">
                  Men Neapolitan Tailoring
                </Link>
              </li>
              <li>
                <Link href="/shop/kids" className="hover:text-[#9A8029] transition-colors">
                  Kids Heirloom Cotton
                </Link>
              </li>
              <li>
                <Link href="/shop/accessories" className="hover:text-[#9A8029] transition-colors">
                  Florentine Leather & Silk
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="hover:text-[#9A8029] transition-colors">
                  New In Runway
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=sale" className="text-[#B3402F] hover:text-[#B3402F]/80 transition-colors">
                  Archival Private Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Client Services */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-[#EFE8DD] uppercase tracking-wider mb-4">
              Client Concierge
            </h5>
            <ul className="space-y-2.5 text-[#EFE8DD]/70">
              <li>
                <Link href="/account" className="hover:text-[#9A8029] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#9A8029] transition-colors">
                  Complimentary Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#9A8029] transition-colors">
                  15-Day Doorstep Returns
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-[#9A8029] transition-colors">
                  Atelier Size Conversion
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#9A8029] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#9A8029] transition-colors">
                  Book a Stylist Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: The Maison */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-[#EFE8DD] uppercase tracking-wider mb-4">
              The Maison
            </h5>
            <ul className="space-y-2.5 text-[#EFE8DD]/70">
              <li>
                <Link href="/about" className="hover:text-[#9A8029] transition-colors">
                  Heritage & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about#sustainability" className="hover:text-[#9A8029] transition-colors">
                  Slow Sustainable Craft
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#9A8029] transition-colors">
                  Flagship Boutiques
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#9A8029] transition-colors">
                  Press & Editorial Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Security */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-[#EFE8DD] uppercase tracking-wider mb-4">
              Legal & Privacy
            </h5>
            <ul className="space-y-2.5 text-[#EFE8DD]/70">
              <li>
                <Link href="/privacy" className="hover:text-[#9A8029] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#9A8029] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#9A8029] transition-colors">
                  Return & Exchange Policy
                </Link>
              </li>
              <li>
                <span className="text-[#9A8029] block pt-2 text-[11px] font-medium">
                  100% Encrypted 256-Bit SSL Checkout
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Payment Badges & Powered By Kashyap Communication */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#EFE8DD]/60">
          <div>
            © {new Date().getFullYear()} MewaK Atelier Ltd. All rights reserved.
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-3 text-[10px] tracking-widest text-[#DDD2C0]/70 uppercase font-mono">
            <span className="border border-[#DDD2C0]/30 px-2 py-0.5 rounded-[2px]">UPI</span>
            <span className="border border-[#DDD2C0]/30 px-2 py-0.5 rounded-[2px]">RUPAY</span>
            <span className="border border-[#DDD2C0]/30 px-2 py-0.5 rounded-[2px]">VISA</span>
            <span className="border border-[#DDD2C0]/30 px-2 py-0.5 rounded-[2px]">MASTERCARD</span>
            <span className="border border-[#DDD2C0]/30 px-2 py-0.5 rounded-[2px]">NETBANKING</span>
          </div>

          {/* Required: "Powered by Kashyap Communication" with small gold flower icon */}
          <div className="flex items-center gap-1.5 text-xs text-[#EFE8DD]/80">
            <span>Powered by <strong className="font-serif font-normal text-[#EFE8DD]">Kashyap Communication</strong></span>
            <GoldFlowerIcon size={14} className="text-[#9A8029]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
