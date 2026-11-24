'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function LoginModal() {
  const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen);
  const closeLoginModal = useUIStore((state) => state.closeLoginModal);
  const addToast = useUIStore((state) => state.addToast);
  const { login, signup, verifyAndCompleteSignup } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotResending, setForgotResending] = useState(false);

  // Sign Up State
  const [signupStep, setSignupStep] = useState<'form' | 'verify'>('form');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyName, setVerifyName] = useState('');
  const [verifyDigits, setVerifyDigits] = useState(['', '', '', '', '', '']);
  const [verifyCooldown, setVerifyCooldown] = useState(0);
  const [verifyResending, setVerifyResending] = useState(false);
  const verifyInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: 'Prefer not to say' as 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (!isLoginModalOpen) {
      setError('');
      setSignupStep('form');
      setForgotSent(false);
    }
  }, [isLoginModalOpen]);

  // Countdown timer for signup verification resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (verifyCooldown > 0) {
      interval = setInterval(() => setVerifyCooldown((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [verifyCooldown]);

  // Countdown timer for forgot password resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (forgotCooldown > 0) {
      interval = setInterval(() => setForgotCooldown((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [forgotCooldown]);

  if (!isLoginModalOpen) return null;

  // Handle Sign In with Password / Email / Phone
  const handleSignInPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signInIdentifier.trim()) {
      setError('Please enter your registered email or 10-digit mobile number.');
      return;
    }
    if (!signInPassword) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(signInIdentifier, signInPassword);
      setLoading(false);
      if (res.success) {
        addToast(`Welcome back, ${res.user?.name || 'Patron'}!`, 'success');
        closeLoginModal();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication error.');
    }
  };

  const handleVerifyDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const updated = [...verifyDigits];
    updated[index] = char;
    setVerifyDigits(updated);

    if (char && index < 5) {
      verifyInputRefs.current[index + 1]?.focus();
    }
  };

  const handleConfirmSignupVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verifyDigits.join('').trim();
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyAndCompleteSignup(verifyEmail, code);
      setLoading(false);

      if (res.success) {
        addToast('Email verified & Patron Profile created! Welcome to Mewak.', 'success');
        closeLoginModal();
      } else {
        setError(res.error || 'Invalid or expired verification code.');
      }
    } catch {
      setLoading(false);
      setError('Network error confirming verification code.');
    }
  };

  const handleResendSignupEmail = async () => {
    if (verifyCooldown > 0 || verifyResending) return;
    setVerifyResending(true);
    setError('');

    try {
      const res = await fetch('/api/email/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, name: verifyName }),
      });
      const data = await res.json();
      setVerifyResending(false);

      if (res.ok && data.success) {
        setVerifyCooldown(data.waitSeconds || 30);
        addToast(`Fresh verification code sent to ${verifyEmail}`, 'success');
        setVerifyDigits(['', '', '', '', '', '']);
        verifyInputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to dispatch verification email.');
        if (data.waitSeconds) setVerifyCooldown(data.waitSeconds);
      }
    } catch {
      setVerifyResending(false);
      setError('Network error requesting fresh verification email.');
    }
  };

  // Handle Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupForm.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const emailClean = signupForm.email.trim().toLowerCase();
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      setError('Please enter a valid, complete email address (e.g. patron@domain.com).');
      return;
    }
    if (emailClean.endsWith('@gmail.com') && emailClean.split('@gmail.com')[0].length < 6) {
      setError('Gmail usernames must contain at least 6 characters before @gmail.com.');
      return;
    }
    const cleanPhone = signupForm.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a 10-digit mobile number.');
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        name: signupForm.name,
        email: signupForm.email,
        phone: cleanPhone,
        password: signupForm.password,
        dateOfBirth: signupForm.dateOfBirth,
        gender: signupForm.gender,
      });
      setLoading(false);
      if (res.success) {
        setVerifyEmail(signupForm.email);
        setVerifyName(signupForm.name);
        setSignupStep('verify');
        setVerifyCooldown(res.waitSeconds || 30);
        addToast(`Verification code dispatched to ${signupForm.email}. Enter code to complete profile creation.`, 'success');
      } else {
        setError(res.error || 'Registration failed. Try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/email/reset-password/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setForgotSent(true);
        setForgotCooldown(data.waitSeconds || 30);
        addToast(`Password recovery code dispatched to ${forgotEmail}`, 'success');
      } else {
        setError(data.error || 'Failed to dispatch recovery email.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to send recovery email.');
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forgotCode.trim()) {
      setError('Please enter the 6-digit recovery code from your email.');
      return;
    }
    if (forgotNewPass.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/email/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          code: forgotCode.trim(),
          newPassword: forgotNewPass,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        addToast('Password successfully reset! You can now sign in.', 'success');
        setMode('signin');
        setForgotSent(false);
        setForgotCode('');
        setForgotNewPass('');
        setForgotConfirmPass('');
        setSignInIdentifier(forgotEmail);
      } else {
        setError(data.error || 'Failed to reset password. Code may have expired.');
      }
    } catch {
      setLoading(false);
      setError('Network error updating password.');
    }
  };

  const handleResendForgotEmail = async () => {
    if (forgotCooldown > 0 || forgotResending) return;
    setForgotResending(true);
    setError('');

    try {
      const res = await fetch('/api/email/reset-password/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      setForgotResending(false);

      if (res.ok && data.success) {
        setForgotCooldown(data.waitSeconds || 30);
        addToast(`Fresh recovery email dispatched to ${forgotEmail}`, 'success');
      } else {
        setError(data.error || 'Failed to dispatch email.');
        if (data.waitSeconds) setForgotCooldown(data.waitSeconds);
      }
    } catch {
      setForgotResending(false);
      setError('Network error dispatching recovery email.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8 font-sans max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <Logo size="md" showSubtitle />
          <h2 className="font-serif text-2xl font-medium text-[#2B1A16] mt-3">
            {mode === 'signin'
              ? 'Patron Authentication'
              : mode === 'signup'
              ? 'Create Patron Profile'
              : 'Recover Password'}
          </h2>
          <p className="text-xs text-[#2B1A16]/70 mt-1">
            {mode === 'signin'
              ? 'Access your orders, bespoke delivery addresses, and concierge.'
              : mode === 'signup'
              ? 'Join Mewak for authentic hardware, lifetime warranties, and priority dispatch.'
              : 'Enter your registered email to receive an encrypted reset link.'}
          </p>
        </div>

        {/* Mode Toggle (Sign In vs Sign Up) */}
        {mode !== 'forgot' && (
          <div className="flex border border-[#DDD2C0] rounded-[4px] p-1 bg-[#EFE8DD]/70 mb-5 text-xs font-semibold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`flex-1 py-2 text-center rounded-[3px] transition-colors ${
                mode === 'signin'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                  : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 text-center rounded-[3px] transition-colors ${
                mode === 'signup'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                  : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
              }`}
            >
              Create Profile
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs rounded-[3px] flex items-center justify-between gap-2">
            <span className="font-medium">{error}</span>
            {error.includes('create an account') && (
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="underline font-bold text-[#2B1A16] whitespace-nowrap hover:text-[#9A8029] text-xs shrink-0"
              >
                Sign Up Now →
              </button>
            )}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Registered Email Address
              </label>
              <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="e.g. yourname@domain.com"
                  className="w-full px-3 py-2 text-xs text-[#2B1A16] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Password
              </label>
              <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full px-3 py-2 text-xs text-[#2B1A16] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-[#2B1A16]/50 hover:text-[#2B1A16]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setForgotSent(false);
                    if (signInIdentifier.includes('@')) {
                      setForgotEmail(signInIdentifier.trim());
                    }
                  }}
                  className="text-[11px] text-[#9A8029] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-2.5 rounded-[3px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Profile'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* SIGN UP / CREATE PROFILE FORM */}
        {mode === 'signup' && signupStep === 'form' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Full Legal Name *
              </label>
              <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  required
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 text-xs text-[#2B1A16] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Email Address *
              </label>
              <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="e.g. aarav@example.com"
                  className="w-full px-3 py-2 text-xs text-[#2B1A16] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Mobile Number *
                </label>
                <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                  <span className="bg-[#EFE8DD] px-2.5 py-2 text-[#9A8029] border-r border-[#DDD2C0] text-[11px] font-medium text-[#2B1A16]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={signupForm.phone}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="98XXXXXXXX"
                    className="w-full px-2.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Create Password *
                </label>
                <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                  <span className="bg-[#EFE8DD] px-2.5 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-2.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={signupForm.dateOfBirth}
                  onChange={(e) => setSignupForm({ ...signupForm, dateOfBirth: e.target.value })}
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Gender (Optional)
                </label>
                <select
                  value={signupForm.gender}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      gender: e.target.value as any,
                    })
                  }
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-2.5 rounded-[3px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Profile...' : 'Complete & Save Profile'}
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* SIGN UP VERIFICATION STEP */}
        {mode === 'signup' && signupStep === 'verify' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-[#9A8029]/10 border border-[#9A8029]/30 rounded-[4px] text-center space-y-1.5">
              <Mail className="w-7 h-7 text-[#9A8029] mx-auto animate-pulse" />
              <h3 className="font-serif text-sm text-[#2B1A16] font-normal">Verification Code Dispatched</h3>
              <p className="text-[11px] text-[#2B1A16]/80 leading-relaxed">
                We sent a 6-digit code to <strong>{verifyEmail}</strong> via Resend.
                Enter it below to confirm your email.
              </p>
            </div>

            <form onSubmit={handleConfirmSignupVerification} className="space-y-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1.5 text-center text-[11px]">
                  Enter 6-Digit Code
                </label>
                <div className="flex gap-1.5 justify-center">
                  {verifyDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        verifyInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerifyDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          verifyInputRefs.current[idx - 1]?.focus();
                        }
                      }}
                      className="w-9 h-10 text-center text-base font-mono font-bold border border-[#DDD2C0] rounded-[3px] bg-white text-[#2B1A16] outline-none focus:border-[#9A8029] focus:ring-1 focus:ring-[#9A8029]"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-2.5 rounded-[3px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-1 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying Code...' : 'Verify Email'}
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>

              {/* Resend Verification Email Button */}
              <div className="pt-1.5 text-center space-y-1">
                <p className="text-[10px] text-[#2B1A16]/60">Did not receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendSignupEmail}
                  disabled={verifyResending || verifyCooldown > 0}
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#9A8029] font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${verifyResending ? 'animate-spin' : ''}`} />
                  {verifyCooldown > 0
                    ? `Resend Email in ${verifyCooldown}s`
                    : verifyResending
                    ? 'Dispatching Email...'
                    : 'Resend Verification Email'}
                </button>
              </div>

              <div className="pt-2 border-t border-[#DDD2C0]/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSignupStep('form');
                    setError('');
                  }}
                  className="text-[11px] text-[#9A8029] hover:underline font-medium"
                >
                  ← Edit Registration Details
                </button>
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="text-[11px] text-[#2B1A16]/60 hover:text-[#2B1A16]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <div className="space-y-4 text-xs">
            {forgotSent ? (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-3">
                <div className="p-3 bg-[#4C7A34]/10 border border-[#4C7A34]/30 rounded-[4px] text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-[#4C7A34] mx-auto" />
                  <h3 className="font-serif text-sm text-[#2B1A16] font-normal">Recovery Email Dispatched</h3>
                  <p className="text-[11px] text-[#2B1A16]/80 leading-relaxed">
                    We sent a 6-digit recovery code and reset link to <strong>{forgotEmail}</strong>.
                    Enter code and new password below:
                  </p>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1 text-[11px]">
                    6-Digit Recovery Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] px-2.5 py-2 text-xs text-[#2B1A16] font-mono tracking-widest outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1 text-[11px]">
                    New Password *
                  </label>
                  <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                    <span className="bg-[#EFE8DD] px-2.5 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-2.5 py-2 text-xs text-[#2B1A16] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-2.5 text-[#2B1A16]/50 hover:text-[#2B1A16]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1 text-[11px]">
                    Confirm New Password *
                  </label>
                  <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                    <span className="bg-[#EFE8DD] px-2.5 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={forgotConfirmPass}
                      onChange={(e) => setForgotConfirmPass(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-2.5 py-2 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-2.5 rounded-[3px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-1 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password & Sign In'}
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                {/* Resend Password Reset Email Button */}
                <div className="pt-1.5 text-center space-y-1">
                  <p className="text-[10px] text-[#2B1A16]/60">Did not receive the recovery email?</p>
                  <button
                    type="button"
                    onClick={handleResendForgotEmail}
                    disabled={forgotResending || forgotCooldown > 0}
                    className="inline-flex items-center gap-1.5 text-[11px] text-[#9A8029] font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${forgotResending ? 'animate-spin' : ''}`} />
                    {forgotCooldown > 0
                      ? `Resend Email in ${forgotCooldown}s`
                      : forgotResending
                      ? 'Dispatching Recovery Email...'
                      : 'Resend Password Reset Email'}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                    className="text-xs text-[#9A8029] font-medium hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Registered Email Address *
                  </label>
                  <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                    <span className="bg-[#EFE8DD] px-3 py-2 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. patron@domain.com"
                      className="w-full px-3 py-2 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-2.5 rounded-[3px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending Recovery Code...' : 'Send Password Reset Code'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                    className="text-xs text-[#9A8029] font-medium hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-[#DDD2C0]/60 flex items-center justify-center gap-2 text-[11px] text-[#2B1A16]/60">
          <ShieldCheck className="w-4 h-4 text-[#4C7A34]" />
          <span>256-Bit TLS Encryption • No spam, strictly authenticated</span>
        </div>
      </div>
    </div>
  );
}