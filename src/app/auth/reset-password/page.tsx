'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, Mail, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/store/uiStore';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get('email') || '';
  const initialToken = searchParams?.get('token') || '';

  const addToast = useUIStore((state) => state.addToast);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide your registered patron email.');
      return;
    }
    if (!code.trim()) {
      setError('Please provide the 6-digit recovery code or link token from your email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      // 1. Try secure server-side reset API via Resend tokens & Supabase Admin
      const res = await fetch('/api/email/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: code.trim(),
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoading(false);
        setSuccess(true);
        addToast('Password successfully reset! You can now sign in.', 'success');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // 2. Fallback to Supabase client session if user arrived via Supabase recovery link
      const supabase = createClient();
      const { error: sbError } = await supabase.auth.updateUser({ password });

      setLoading(false);
      if (!sbError) {
        setSuccess(true);
        addToast('Password successfully reset! You can now sign in.', 'success');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || sbError.message || 'Unable to update password. Code or link may have expired.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred while resetting your password.');
    }
  };

  const handleResendResetEmail = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!email || !email.includes('@')) {
      setError('Please enter your email to receive recovery instructions.');
      return;
    }

    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/email/reset-password/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResending(false);

      if (res.ok && data.success) {
        setResendCooldown(data.waitSeconds || 30);
        addToast(`Password recovery email dispatched to ${email}`, 'success');
      } else {
        setError(data.error || 'Failed to dispatch recovery email.');
        if (data.waitSeconds) setResendCooldown(data.waitSeconds);
      }
    } catch {
      setResending(false);
      setError('Network error requesting recovery email.');
    }
  };

  return (
    <div className="bg-[#EFE8DD] min-h-[85vh] flex items-center justify-center py-16 px-4 border-b border-[#DDD2C0]">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-xl rounded-[4px] max-w-md w-full p-8 font-sans">
        <div className="text-center mb-6">
          <Logo size="md" showSubtitle />
          <h1 className="font-serif text-3xl text-[#2B1A16] font-normal mt-4">
            Reset Account Password
          </h1>
          <p className="text-xs text-[#2B1A16]/70 mt-1 max-w-sm mx-auto">
            Choose a strong, encrypted password to protect your patron profile, addresses, and order history.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs rounded-[3px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-[#4C7A34]/10 border border-[#4C7A34]/30 rounded-[4px] text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#4C7A34] mx-auto animate-bounce" />
            <h3 className="font-serif text-xl text-[#2B1A16] font-medium">
              Password Reset Successfully
            </h3>
            <p className="text-xs text-[#2B1A16]/80 leading-relaxed">
              Your patron password has been securely updated. Redirecting you to sign in...
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] px-6 py-3 rounded-[3px] font-semibold uppercase tracking-wider text-xs transition-colors"
              >
                Sign In Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Registered Email *
              </label>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. patron@domain.com"
                  className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                6-Digit Recovery Code *
              </label>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code from email"
                  className="w-full px-3 py-2.5 text-xs text-[#2B1A16] font-mono tracking-widest outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                New Password *
              </label>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-[#2B1A16]/50 hover:text-[#2B1A16]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Confirm New Password *
              </label>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resend Password Reset Email Button */}
            <div className="pt-3 border-t border-[#DDD2C0]/50 text-center space-y-2">
              <p className="text-[11px] text-[#2B1A16]/70">
                Did not receive the recovery email or expired code?
              </p>
              <button
                type="button"
                onClick={handleResendResetEmail}
                disabled={resending || resendCooldown > 0}
                className="inline-flex items-center gap-1.5 text-xs text-[#9A8029] font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0
                  ? `Resend Email in ${resendCooldown}s`
                  : resending
                  ? 'Dispatching Recovery Email...'
                  : 'Resend Password Reset Email'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-[#9A8029] font-medium hover:underline">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-[#DDD2C0] flex items-center justify-center gap-2 text-xs text-[#2B1A16]/60">
          <ShieldCheck className="w-4 h-4 text-[#4C7A34]" />
          <span>Resend TLS Secured • 256-Bit Bank Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EFE8DD] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#9A8029] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
