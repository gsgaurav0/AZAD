'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function ContactPage() {
  const addToast = useUIStore((state) => state.addToast);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Stylist Consultation',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Your inquiry has reached the Maison Stylist Concierge.', 'success');
  };

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            PATRON ASSISTANCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2B1A16] font-normal mb-4">
            Connect with the Atelier
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans leading-relaxed">
            Our personal stylists and master tailors are available for private appointments, bespoke measurements, and order inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7 bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-10 rounded-[4px] shadow-sm font-sans">
            <h3 className="font-serif text-2xl font-semibold text-[#2B1A16] mb-2">
              Send a Private Message
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-6">
              Inquiries are acknowledged within four business hours.
            </p>

            {submitted ? (
              <div className="bg-[#4C7A34]/15 border border-[#4C7A34] p-8 rounded-[4px] text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#4C7A34] mx-auto" />
                <h4 className="font-serif text-xl font-bold text-[#2B1A16]">
                  Message Inscribed
                </h4>
                <p className="text-xs text-[#2B1A16]/80 max-w-md mx-auto">
                  Thank you, {formData.name}. A senior client liaison will contact you via email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Stylist Consultation', message: '' });
                  }}
                  className="bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[2px]"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Siddharth Kashyap"
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="patron@domain.com"
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                      Nature of Inquiry
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                    >
                      <option>Stylist Consultation</option>
                      <option>Size & Fit Inquiry</option>
                      <option>Order & Tracking Assistance</option>
                      <option>Press & Editorial Loans</option>
                      <option>Flagship Boutique Appointment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share specific garment details, measurements, or event dates..."
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] rounded-[3px] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Flagship Boutiques & Contact Coordinates */}
          <div className="lg:col-span-5 space-y-6 font-sans">
            <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-[4px] space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#2B1A16]">
                Client Concierge
              </h3>
              <div className="space-y-3 text-xs text-[#2B1A16]/80">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#9A8029]" />
                  <span>VIP Line: +91 98765 43210 (10 AM - 8 PM IST)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#9A8029]" />
                  <span>concierge@mewak.fashion</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#9A8029]" />
                  <span>Monday through Sunday, 10:00 AM – 8:00 PM IST</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-[4px] space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#2B1A16]">
                Flagship Boutiques
              </h3>
              <div className="space-y-4 text-xs text-[#2B1A16]/80 divide-y divide-[#DDD2C0]/50">
                <div className="pt-2 first:pt-0">
                  <strong className="font-serif text-sm text-[#2B1A16] block">
                    New Delhi — The Chanakya
                  </strong>
                  <p className="mt-0.5">Level 2, Chanakyapuri Diplomatic Enclave, New Delhi 110021</p>
                </div>
                <div className="pt-3">
                  <strong className="font-serif text-sm text-[#2B1A16] block">
                    Mumbai — Kala Ghoda
                  </strong>
                  <p className="mt-0.5">Heritage Wing, VB Gandhi Marg, Fort, Mumbai 400001</p>
                </div>
                <div className="pt-3">
                  <strong className="font-serif text-sm text-[#2B1A16] block">
                    Bengaluru — Lavelle Road
                  </strong>
                  <p className="mt-0.5">44/1, Prestige Vasant, Lavelle Road, Bengaluru 560001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
