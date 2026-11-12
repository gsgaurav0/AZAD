'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Wrench,
  Cpu,
  Headphones,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useInquiryStore } from '@/store/inquiryStore';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useUIStore } from '@/store/uiStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '@/components/common/SocialIcons';

export default function TechSupportPage() {
  const isMounted = useIsMounted();
  const addInquiry = useInquiryStore((state) => state.addInquiry);
  const addToast = useUIStore((state) => state.addToast);
  const cmsSocials = useCMSStore((state) => state.cms.socials);
  const socials = isMounted && cmsSocials ? cmsSocials : DEFAULT_CMS_DATA.socials;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deviceModel: 'Apex Pro Studio ANC Headphones',
    serialNumber: '',
    type: 'warranty' as const,
    priority: 'high' as const,
    subject: '',
    message: '',
  });

  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      addToast('Please fill in your name, email, and description.', 'error');
      return;
    }

    const created = addInquiry({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      deviceModel: formData.deviceModel,
      serialNumber: formData.serialNumber.trim() || 'N/A',
      type: formData.type,
      priority: formData.priority,
      subject: formData.subject.trim() || `${formData.type.toUpperCase()}: ${formData.deviceModel}`,
      message: formData.message.trim(),
    });

    setSubmittedTicketId(created.id);
    addToast(`Ticket #${created.id} dispatched to Mewak Engineering Concierge`, 'success');
  };

  const FAQS = [
    {
      q: 'How does the 2-Year Mewak Total Care Replacement Warranty work?',
      a: 'Every Mewak hardware piece includes complimentary 2-year warranty coverage against driver failure, acoustic transducer degradation, logic board failures, and GaN thermal faults. If an issue is diagnosed, we arrange doorstep pickup and courier replacement.',
    },
    {
      q: 'How do I activate LDAC 990kbps lossless streaming on my headphones?',
      a: 'On Android 14+, enable Developer Options > Bluetooth Audio Codec > select LDAC, then set Bluetooth Audio LDAC Playback Quality to "Optimized for Audio Quality (990kbps)". On Windows/Mac, use our bundled low-latency USB-C audio interconnect.',
    },
    {
      q: 'Can I book a doorstep technician for hardware inspection?',
      a: 'Yes. For verified patrons in Mumbai, Bengaluru, Delhi NCR, and Hyderabad, our certified audio-hardware technicians can visit your residence or studio within 24 business hours for onsite diagnostics.',
    },
    {
      q: 'What is your doorstep evaluation and trial period policy?',
      a: 'We offer a 15-day risk-free home trial on all flagship smartphones, planar headphones, and smartwatches. If the acoustic signature or form factor does not match your expectations, doorstep return pickup is 100% complimentary.',
    },
  ];

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 sm:py-16 border-b border-[#DDD2C0] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Top Header Stage */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#2B1A16] text-[#EFE8DD] px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9A8029]" />
            <span>Mewak Tech Support & Concierge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#2B1A16] font-bold mb-4 tracking-tight">
            Engineering Precision. Guaranteed.
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#2B1A16]/75 leading-relaxed font-sans">
            Direct access to our hardware architects, acoustic acoustic engineers, and 2-Year Total Care Warranty concierge. Submit warranty claims, request firmware tools, or speak with an audio technician.
          </p>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-[#2B1A16]/80 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Desk Response: Under 4 Hours</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#9A8029]" />
              <span>Mon-Sat: 09:00 - 20:00 IST</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <Phone className="w-3.5 h-3.5 text-[#9A8029]" />
              <span>{socials?.supportPhone || '+91 80 4920 1800'}</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Support Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#9A8029]/15 text-[#9A8029] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
              2-Year Total Care
            </h3>
            <p className="text-xs text-[#2B1A16]/70 leading-relaxed">
              Full hardware replacement and transducer protection for all verified patrons. Zero deductibles.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#9A8029]/15 text-[#9A8029] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
              Doorstep Repair
            </h3>
            <p className="text-xs text-[#2B1A16]/70 leading-relaxed">
              Certified technicians dispatched directly to your residence or studio for inspections and repairs.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#9A8029]/15 text-[#9A8029] flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
              Acoustic Calibration
            </h3>
            <p className="text-xs text-[#2B1A16]/70 leading-relaxed">
              Custom frequency curves, planar gain matching, and audiophile DAC/Amp pairing consultations.
            </p>
          </div>

          <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#9A8029]/15 text-[#9A8029] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
              Firmware & Kernel
            </h3>
            <p className="text-xs text-[#2B1A16]/70 leading-relaxed">
              Low-latency wireless firmware updates, GaN thermal profiles, and Snapdragon OS developer builds.
            </p>
          </div>
        </div>

        {/* Main Section: Ticket Submission Form & Direct Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-10 rounded-2xl shadow-md">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2B1A16]">
                  Open a Technical Ticket
                </h2>
                <p className="text-xs text-[#2B1A16]/70 mt-0.5">
                  Your ticket routes directly to our senior hardware engineers.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-1 rounded font-bold">
                PRIORITY QUEUE
              </span>
            </div>

            {submittedTicketId ? (
              <div className="bg-[#4C7A34]/15 border border-[#4C7A34] p-8 rounded-xl text-center space-y-4 animate-fadeIn">
                <CheckCircle2 className="w-14 h-14 text-[#4C7A34] mx-auto" />
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#4C7A34] font-bold block mb-1">
                    TICKET REGISTERED IN COMMAND INBOX
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#2B1A16]">
                    Ticket ID: {submittedTicketId}
                  </h3>
                </div>
                <p className="text-xs text-[#2B1A16]/80 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-bold">{formData.name}</span>. Your {formData.type} request for <span className="font-semibold">{formData.deviceModel}</span> has been assigned to our hardware diagnostic desk. A technician will contact you at <span className="underline">{formData.email}</span>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicketId(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        deviceModel: 'Apex Pro Studio ANC Headphones',
                        serialNumber: '',
                        type: 'warranty',
                        priority: 'high',
                        subject: '',
                        message: '',
                      });
                    }}
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-xl transition-colors shadow-sm"
                  >
                    Open Another Ticket
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B1A16] mb-1">
                      Patron Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Siddharth Kashyap"
                      className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B1A16] mb-1">
                      Email Address (for correspondence) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="patron@domain.com"
                      className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B1A16] mb-1">
                      Phone Number (optional for SMS updates)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98200 00000"
                      className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B1A16] mb-1">
                      Inquiry Classification
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none font-semibold"
                    >
                      <option value="warranty">Warranty Replacement (2-Year Total Care)</option>
                      <option value="support">Technical Support / Firmware Help</option>
                      <option value="repair">Doorstep Repair & Sensor Inspection</option>
                      <option value="consultation">Enterprise Studio Order Consultation</option>
                      <option value="general">General Hardware Question</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B1A16] mb-1">
                      Hardware Model
                    </label>
                    <select
                      value={formData.deviceModel}
                      onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none"
                    >
                      <option value="Apex Pro Studio ANC Headphones">Apex Pro Studio ANC Headphones</option>
                      <option value="Silicon One Flagship Phone">Silicon One Flagship Phone (Titanium)</option>
                      <option value="Chrono Ultra Smartwatch">Chrono Ultra 49mm Titanium Watch</option>
                      <option value="MagDock 3-in-1 GaN Power Station">MagDock 3-in-1 GaN Power Station</option>
                      <option value="Other Hardware / Prototype">Other Hardware / Prototype</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B1A16] mb-1">
                      Device Serial # / Order ID (if known)
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="e.g. MWK-APX-8891 or ORD-1092"
                      className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Subject / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Briefly describe the symptom or question..."
                    className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Detailed Hardware Symptoms & Diagnostics *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe what occurred, acoustic anomalies, connected cables or audio DACs, firmware versions, or delivery address for doorstep evaluation..."
                    className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-[#2B1A16]/60">
                    <ShieldCheck className="w-4 h-4 text-[#9A8029]" />
                    <span>Encrypted submission to private admin inbox</span>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-white font-semibold uppercase tracking-wider text-xs px-7 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Ticket</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Direct Channels & Social Concierge (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Studio Contacts Card */}
            <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] font-bold block">
                DIRECT CONCIERGE CHANNELS
              </span>
              <h3 className="font-serif text-xl font-bold text-[#2B1A16]">
                Speak with Senior Technicians
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                <a
                  href={`mailto:${socials?.supportEmail || 'concierge@mewak.com'}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#DDD2C0] hover:border-[#9A8029] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase text-[#2B1A16]/60 block">Direct Engineering Email</span>
                    <span className="font-semibold text-[#2B1A16] truncate block group-hover:text-[#9A8029]">
                      {socials?.supportEmail || 'concierge@mewak.com'}
                    </span>
                  </div>
                </a>

                <a
                  href={`tel:${socials?.supportPhone || '+918049201800'}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#DDD2C0] hover:border-[#9A8029] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase text-[#2B1A16]/60 block">Dedicated Hotline (Toll-Free)</span>
                    <span className="font-semibold text-[#2B1A16] truncate block group-hover:text-[#9A8029]">
                      {socials?.supportPhone || '+91 80 4920 1800'}
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Social Media Concierge Channels */}
            <div className="bg-[#2B1A16] text-[#EFE8DD] p-6 sm:p-8 rounded-2xl shadow-md space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] font-bold block">
                COMMUNITY & SOCIAL MEDIA CONCIERGE
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Live Channels & Community
              </h3>
              <p className="text-xs text-[#EFE8DD]/70 leading-relaxed">
                Connect with our audio developers, firmware releases, teardown videos, and community beta drops across our official social channels.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                {socials?.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <InstagramIcon size={16} />
                    <span>Instagram</span>
                  </a>
                )}

                {socials?.youtube && (
                  <a
                    href={socials.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <YoutubeIcon size={16} />
                    <span>YouTube Labs</span>
                  </a>
                )}

                {socials?.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <span className="font-bold text-sm">𝕏</span>
                    <span>X (Twitter)</span>
                  </a>
                )}

                {socials?.discord && (
                  <a
                    href={socials.discord}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#9A8029]" />
                    <span>Discord Club</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Link to Knowledge Base */}
            <div className="bg-[#FAF8F5] border border-[#DDD2C0] p-6 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-[#2B1A16] block">
                Technical Knowledge Base FAQs
              </span>
              <div className="space-y-2 text-xs">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-[#E5E0D8] rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left p-3 font-semibold text-[#2B1A16] flex justify-between items-center gap-2 hover:bg-[#FAF8F5]"
                    >
                      <span className="text-xs">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="w-4 h-4 shrink-0 text-[#9A8029]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#2B1A16]/50" />}
                    </button>
                    {openFaq === i && (
                      <div className="p-3 text-[11px] text-[#2B1A16]/75 border-t border-[#E5E0D8] leading-relaxed bg-[#FAF8F5]/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

