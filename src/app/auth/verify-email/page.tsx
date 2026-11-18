'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get('email') || '';
  const initialToken = searchParams?.get('token') || '';

  const { user, updateProfile } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const [email, setEmail] = useState(initialEmail || user?.email || '');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-verify if link token was clicked from email
  useEffect(() => {
    if (initialToken && initialEmail) {
      handleAutoVerify(initialEmail, initialToken);
    }
  }, [initialToken, initialEmail]);

  const handleAutoVerify = async (targetEmail: string, token: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/email/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code: token }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSuccess(true);
        addToast('Email verified successfully! Welcome to Mewak Luxury.', 'success');
        if (data.user) {
          useAuthStore.setState((state) => ({
            user: data.user,
            isLoggedIn: true,
            registeredUsers: [
              ...state.registeredUsers.filter((u) => u.email.toLowerCase() !== (data.user.email || '').toLowerCase()),
              { ...data.user, password: data.password },
            ],
          }));
          if (data.user.id) {
            useAuthStore.getState().syncUserData(data.user.id);
          }
        } else if (user && user.email.toLowerCase() === targetEmail.toLowerCase()) {
          updateProfile({ isEmailVerified: true });
        }
      } else {
        setError(data.error || 'The verification link has expired or is invalid. Enter your 6-digit code or request a fresh email below.');
      }
    } catch {
      setLoading(false);
      setError('Network error validating verification token. Please try entering your code manually.');
    }
  };

  const handleCodeInput = (index: number, val: string) => {
    const char = val.slice(-1);
    const updated = [...codeDigits];
    updated[index] = char;
    setCodeDigits(updated);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = codeDigits.join('').trim();
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/email/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSuccess(true);
        addToast('Email address verified successfully!', 'success');
        if (data.user) {
          useAuthStore.setState((state) => ({
            user: data.user,
            isLoggedIn: true,
            registeredUsers: [
              ...state.registeredUsers.filter((u) => u.email.toLowerCase() !== (data.user.email || '').toLowerCase()),
              { ...data.user, password: data.password },
            ],
          }));
          if (data.user.id) {
            useAuthStore.getState().syncUserData(data.user.id);
          }
        } else if (user && user.email.toLowerCase() === email.toLowerCase()) {
          updateProfile({ isEmailVerified: true });
        }
      } else {
        setError(data.error || 'Invalid or expired verification code.');
      }
    } catch {
      setLoading(false);
      setError('Network error confirming code. Please try again.');
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!email || !email.includes('@')) {
      setError('Please specify the email address to receive the verification code.');
      return;
    }

    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/email/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: user?.name || 'Patron' }),
      });
      const data = await res.json();
      setResending(false);

      if (res.ok && data.success) {
        setResendCooldown(data.waitSeconds || 30);
        addToast(`Fresh verification code dispatched to ${email}`, 'success');
        setCodeDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to dispatch verification email.');
        if (data.waitSeconds) setResendCooldown(data.waitSeconds);
      }
    } catch {
      setResending(false);
      setError('Network error communicating with the email dispatch service.');
    }
  };

  return (
    <div className="bg-[#EFE8DD] min-h-[85vh] flex items-center justify-center py-16 px-4 border-b border-[#DDD2C0]">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-xl rounded-[4px] max-w-md w-full p-8 font-sans">
        <div className="text-center mb-6">
          <Logo size="md" showSubtitle />
          <h1 className="font-serif text-3xl text-[#2B1A16] font-normal mt-4">
            Patron Email Verification
          </h1>
          <p className="text-xs text-[#2B1A16]/70 mt-1 max-w-sm mx-auto">
            Secure your credentials and verify your contact details to access bespoke concierge services.
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
              Email Verified Successfully
            </h3>
            <p className="text-xs text-[#2B1A16]/80 leading-relaxed">
              Your patron email <strong>{email}</strong> has been officially confirmed and linked to your luxury profile.
            </p>
            <div className="pt-2">
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] px-6 py-3 rounded-[3px] font-semibold uppercase tracking-wider text-xs transition-colors"
              >
                Go to My Account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualVerify} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Patron Email Address *
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#2B1A16]/80">
                  6-Digit Verification Token *
                </label>
                <span className="text-[10px] text-[#9A8029]">Expires in 15 mins</span>
              </div>
              <div className="flex gap-2 justify-between">
                {codeDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && idx > 0) {
                        inputRefs.current[idx - 1]?.focus();
                      }
                    }}
                    className="w-11 h-12 text-center text-lg font-mono font-bold border border-[#DDD2C0] rounded-[3px] bg-white text-[#2B1A16] outline-none focus:border-[#9A8029] focus:ring-1 focus:ring-[#9A8029] transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Verification Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying Token...' : 'Confirm Verification'}
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {/* Resend Verification Email Section */}
            <div className="pt-3 border-t border-[#DDD2C0]/50 text-center space-y-2">
              <p className="text-[11px] text-[#2B1A16]/70">
                Did not receive the verification email or code?
              </p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending || resendCooldown > 0}
                className="inline-flex items-center gap-1.5 text-xs text-[#9A8029] font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0
                  ? `Resend Email in ${resendCooldown}s`
                  : resending
                  ? 'Dispatching Email...'
                  : 'Resend Verification Email'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/account"
                className="text-xs text-[#2B1A16]/60 hover:text-[#2B1A16] transition-colors"
              >
                ← Return to Account Dashboard
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-[#DDD2C0] flex items-center justify-center gap-2 text-xs text-[#2B1A16]/60">
          <ShieldCheck className="w-4 h-4 text-[#4C7A34]" />
          <span>Resend Protected TLS Gateway • Official Patron Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EFE8DD] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#9A8029] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
