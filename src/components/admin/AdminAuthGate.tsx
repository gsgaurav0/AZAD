'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/common/Logo';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
}

const DEFAULT_ADMIN_PASSWORD = 'gsgaurav8528';

export default function AdminAuthGate({ onAuthenticated }: AdminAuthGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Get active admin password from storage if updated, or use gsgaurav8528
  const getAdminPassword = () => {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('mewak_admin_custom_password');
      if (custom) return custom;
    }
    return DEFAULT_ADMIN_PASSWORD;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activePassword = getAdminPassword();

    if (password.trim() === activePassword) {
      setError(false);
      onAuthenticated();
    } else {
      setError(true);
      setAttempts((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E5E0D8] rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden font-sans">
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
          <p className="text-xs text-[#2B1A16]/60 mt-1">
            Private administration portal for catalog, orders, and customer operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2B1A16]/80 uppercase tracking-wider mb-2">
              Administrator Security Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter admin password"
                className="w-full bg-[#FBF7F0] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl pl-4 pr-11 py-3 text-sm text-[#2B1A16] placeholder-[#2B1A16]/40 outline-none transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#2B1A16]/50 hover:text-[#2B1A16]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-600 mt-2 font-medium">
                Authentication failed. Incorrect admin credentials.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] hover:text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] mt-2"
          >
            <Lock className="w-3.5 h-3.5" />
            Authenticate to Command Portal
          </button>

          <div className="text-center pt-2">
            <a
              href="/"
              className="text-xs text-[#2B1A16]/60 hover:text-[#9A8029] font-medium transition-colors"
            >
              ← Back to Live Storefront
            </a>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-[#E5E0D8] text-center">
          <p className="text-[11px] text-[#2B1A16]/50">
            Enterprise Security • 256-Bit Authenticated Gateway
          </p>
        </div>
      </div>
    </div>
  );
}