'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, ArrowRight } from 'lucide-react';
import Logo from '@/components/common/Logo';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
}

export default function AdminAuthGate({ onAuthenticated }: AdminAuthGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      pin.trim() === '1234' ||
      pin.trim().toLowerCase() === 'admin' ||
      pin.trim().toLowerCase() === 'mewak'
    ) {
      onAuthenticated();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E5E0D8] rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9A8029]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-[#9A8029]/10 border border-[#9A8029]/30 text-[#9A8029] mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex justify-center mb-3">
            <Logo size="md" asLink={false} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2B1A16] tracking-tight">
            Superadmin Command
          </h1>
          <p className="text-xs text-[#2B1A16]/60 mt-1 font-sans">
            Private administration portal for catalog provision & fulfillment operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#2B1A16]/80 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Security Passcode</span>
              <span className="text-[11px] text-[#9A8029] font-mono font-medium">Default: 1234</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter 1234 or your admin passcode"
                className="w-full bg-[#FBF7F0] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-4 py-3 text-sm text-[#2B1A16] placeholder-[#2B1A16]/40 outline-none transition-all"
                autoFocus
              />
              <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-[#2B1A16]/40 pointer-events-none" />
            </div>
            {error && (
              <p className="text-xs text-rose-600 mt-2 font-medium">
                Invalid passcode. Enter <span className="font-mono font-bold">1234</span> or click instant access below.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] hover:text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In to Command Portal
          </button>

          <div className="pt-2">
            <button
              type="button"
              onClick={onAuthenticated}
              className="w-full bg-[#F5F1E8] hover:bg-[#EFE8DD] text-[#2B1A16] text-xs py-3 rounded-xl border border-[#DDD2C0] transition-colors flex items-center justify-center gap-1.5 font-medium"
            >
              <span>Instant Access as Superadmin</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9A8029]" />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-[#E5E0D8] text-center">
          <p className="text-[11px] text-[#2B1A16]/50 font-sans">
            Mewak Electronics • Private URL-only Administration System
          </p>
        </div>
      </div>
    </div>
  );
}
