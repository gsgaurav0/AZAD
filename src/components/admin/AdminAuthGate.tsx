'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { createClient } from '@/lib/supabase/client';

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AdminAuthGateProps {
  onAuthenticated: (admin: AdminUserData) => void;
}

export default function AdminAuthGate({ onAuthenticated }: AdminAuthGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please provide a valid administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your administrator security password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with backend API which checks Supabase Auth and database role
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        setErrorMessage(data.error || 'Authentication failed. Please verify your administrator credentials.');
        return;
      }

      // 2. Establish client browser Supabase session
      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      } catch {
        // Continue even if client-side sync is buffered
      }

      setLoading(false);
      onAuthenticated(data.user);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Network error authenticating to command portal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E5E0D8] rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden font-sans animate-scaleUp">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9A8029]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-7">
          <div className="inline-flex p-3 rounded-2xl bg-[#9A8029]/10 border border-[#9A8029]/30 text-[#9A8029] mb-4 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex justify-center mb-3">
            <Logo size="md" asLink={false} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2B1A16] tracking-tight">
            Superadmin Command
          </h1>
          <p className="text-xs text-[#2B1A16]/60 mt-1 max-w-xs mx-auto">
            Authorized administrator gateway for inventory, orders, customer records, and security.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2B1A16]/80 uppercase tracking-wider mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="e.g. ss3573509@gmail.com"
                className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-[#2B1A16] placeholder-[#2B1A16]/40 outline-none transition-all"
                autoFocus
              />
              <Mail className="w-4 h-4 text-[#2B1A16]/40 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B1A16]/80 uppercase tracking-wider mb-1.5">
              Administrator Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter admin password"
                className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl pl-10 pr-11 py-3 text-sm text-[#2B1A16] placeholder-[#2B1A16]/40 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-[#2B1A16]/40 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#2B1A16]/50 hover:text-[#2B1A16] cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] hover:text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] mt-3 disabled:opacity-50 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-[#9A8029]" />
            <span>{loading ? 'Authenticating...' : 'Authenticate to Command Portal'}</span>
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
            Enterprise Security • Supabase Role Authentication
          </p>
        </div>
      </div>
    </div>
  );
}
