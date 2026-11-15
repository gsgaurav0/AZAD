'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  const { isLoggedIn, login, signup, loginWithOtp, resetPasswordForEmail } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // OTP State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sign Up State
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

  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectTarget);
    }
  }, [isLoggedIn, router, redirectTarget]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSignInPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signInIdentifier.trim()) {
      setError('Please enter your email or 10-digit mobile number.');
      return;
    }
    if (!signInPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(signInIdentifier, signInPassword);
      setLoading(false);
      if (res.success) {
        addToast(`Welcome back, ${res.user?.name || 'Patron'}!`, 'success');
        router.push(redirectTarget);
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = otpPhone.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please provide a valid 10-digit Indian mobile number.');
      return;
    }
    setError('');
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setOtpSent(true);
    setTimer(30);
    setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the authentication token.');
      return;
    }

    if (entered !== generatedOtp) {
      setError('Invalid OTP code. Please enter the generated authentication code.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithOtp(otpPhone, entered);
      setLoading(false);
      if (res.success) {
        addToast(`Welcome to Mewak, ${res.user?.name || 'Patron'}!`, 'success');
        router.push(redirectTarget);
      } else {
        setError(res.error || 'Could not verify OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Could not verify OTP.');
    }
  };

  const handleOtpInput = (index: number, val: string) => {
    const char = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

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
        addToast(`Account created successfully! Welcome, ${res.user?.name}.`, 'success');
        router.push(redirectTarget);
      } else {
        setError(res.error || 'Registration failed. Try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed. Try again.');
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
      const res = await resetPasswordForEmail(forgotEmail);
      setLoading(false);
      if (res.success) {
        setForgotSent(true);
        addToast('Password reset link sent to your email!', 'success');
      } else {
        setError(res.error || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="bg-[#EFE8DD] min-h-[85vh] flex items-center justify-center py-16 px-4 border-b border-[#DDD2C0]">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-xl rounded-[4px] max-w-lg w-full p-8 font-sans">
        <div className="text-center mb-6">
          <Logo size="md" showSubtitle />
          <h1 className="font-serif text-3xl text-[#2B1A16] font-normal mt-4">
            {mode === 'signin'
              ? 'Patron Authentication'
              : mode === 'signup'
              ? 'Create Patron Profile'
              : 'Recover Password'}
          </h1>
          <p className="text-xs text-[#2B1A16]/70 mt-1 max-w-sm mx-auto">
            {mode === 'signin'
              ? 'Access your curated orders, delivery addresses, and personal patron profile.'
              : mode === 'signup'
              ? 'Join Mewak for authentic hardware, lifetime warranties, and priority dispatch.'
              : 'Enter your registered email address to receive an official password reset link.'}
          </p>
        </div>

        {/* Tab switch: Sign In vs Sign Up */}
        {mode !== 'forgot' && (
          <div className="flex border border-[#DDD2C0] rounded-[4px] p-1 bg-[#EFE8DD]/70 mb-6 text-xs font-semibold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`flex-1 py-2.5 text-center rounded-[3px] transition-colors ${
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
              className={`flex-1 py-2.5 text-center rounded-[3px] transition-colors ${
                mode === 'signup'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                  : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
              }`}
            >
              Create Profile
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs rounded-[3px] flex items-center justify-between gap-2">
            <span>{error}</span>
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

        {/* SIGN IN */}
        {mode === 'signin' && (
          <div>
            <div className="flex gap-4 border-b border-[#DDD2C0] pb-2 mb-5 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setError('');
                }}
                className={`pb-1 transition-colors ${
                  authMethod === 'password'
                    ? 'border-b-2 border-[#9A8029] text-[#2B1A16] font-bold'
                    : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setError('');
                }}
                className={`pb-1 transition-colors ${
                  authMethod === 'otp'
                    ? 'border-b-2 border-[#9A8029] text-[#2B1A16] font-bold'
                    : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
              >
                Mobile OTP Login
              </button>
            </div>

            {authMethod === 'password' ? (
              <form onSubmit={handleSignInPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Email or Mobile Number
                  </label>
                  <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                    <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      placeholder="yourname@domain.com or 98XXXXXXXX"
                      className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('otp')}
                      className="text-[11px] text-[#9A8029] hover:underline"
                    >
                      Login via OTP instead
                    </button>
                  </div>
                  <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                    <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter account password"
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
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                        setForgotSent(false);
                      }}
                      className="text-[11px] text-[#9A8029] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Profile'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                        10-Digit Mobile Number
                      </label>
                      <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                        <span className="bg-[#EFE8DD] px-3 py-2.5 font-medium text-[#2B1A16] border-r border-[#DDD2C0] flex items-center gap-1">
                          <Phone className="w-4 h-4 text-[#9A8029]" />
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 9812345678"
                          className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      Transmit 6-Digit OTP <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                    <div className="p-3.5 bg-[#9A8029]/10 border border-[#9A8029]/30 rounded-[4px] text-center">
                      <span className="text-xs text-[#2B1A16]/80 block">
                        Authentication code sent to <strong>+91 {otpPhone}</strong>
                      </span>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-xs text-[#9A8029] font-bold">Code: {generatedOtp}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpDigits(generatedOtp.split(''));
                            setError('');
                          }}
                          className="text-[10px] bg-[#2B1A16] text-[#EFE8DD] px-2.5 py-1 rounded-[2px] font-bold uppercase tracking-wider hover:bg-[#9A8029]"
                        >
                          Auto-fill
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 my-4">
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpInputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          className="w-12 h-12 text-center font-serif text-lg font-bold border border-[#DDD2C0] rounded-[4px] bg-white text-[#2B1A16] focus:border-[#9A8029] outline-none"
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs text-[#2B1A16]/60">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpDigits(['', '', '', '', '', '']);
                        }}
                        className="text-[#9A8029] hover:underline"
                      >
                        Change number
                      </button>
                      {timer > 0 ? (
                        <span>Resend in {timer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          className="text-[#9A8029] font-semibold hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? 'Verifying...' : 'Verify & Enter Profile'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* SIGN UP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Full Legal Name *
              </label>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                Email Address *
              </label>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="e.g. aarav@example.com"
                  className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Mobile Number *
                </label>
                <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                  <span className="bg-[#EFE8DD] px-2.5 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] text-[11px] font-medium text-[#2B1A16]">
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
                    className="w-full px-2.5 py-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Create Password *
                </label>
                <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                  <span className="bg-[#EFE8DD] px-2.5 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-2.5 py-2.5 text-xs text-[#2B1A16] outline-none"
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
                  className="w-full bg-white border border-[#DDD2C0] rounded-[4px] p-2.5 text-xs text-[#2B1A16] outline-none"
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
                  className="w-full bg-white border border-[#DDD2C0] rounded-[4px] p-2.5 text-xs text-[#2B1A16] outline-none"
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
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Complete & Save Profile'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <div className="space-y-4 text-xs">
            {forgotSent ? (
              <div className="p-4 bg-[#4C7A34]/10 border border-[#4C7A34]/30 rounded-[4px] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#4C7A34] mx-auto" />
                <h3 className="font-serif text-base text-[#2B1A16] font-normal">Recovery Email Dispatched</h3>
                <p className="text-xs text-[#2B1A16]/80">
                  We have dispatched a secure password reset link to <strong>{forgotEmail}</strong>.
                  Please check your inbox (and spam folder) and click the link to configure a new password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="mt-3 inline-block bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] px-5 py-2 rounded-[3px] font-semibold uppercase tracking-wider text-[11px] transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Registered Email Address *
                  </label>
                  <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                    <span className="bg-[#EFE8DD] px-3 py-2.5 text-[#9A8029] border-r border-[#DDD2C0] flex items-center">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. patron@domain.com"
                      className="w-full px-3 py-2.5 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
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

        <div className="mt-8 pt-4 border-t border-[#DDD2C0] flex items-center justify-center gap-2 text-xs text-[#2B1A16]/60">
          <ShieldCheck className="w-4 h-4 text-[#4C7A34]" />
          <span>256-Bit TLS Bank-Grade Encryption • Official Warranty</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EFE8DD] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#9A8029] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}