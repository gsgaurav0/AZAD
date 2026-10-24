'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/account');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setError('');
    setStep('otp');
    setTimer(30);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code === '123456') {
      login(phoneNumber, fullName || 'Patron');
      addToast('Welcome back to the Maison MewaK.', 'success');
      router.push('/account');
    } else {
      setError('Invalid OTP code. Please enter 123456.');
    }
  };

  const fillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    setError('');
  };

  return (
    <div className="bg-[#EFE8DD] min-h-[80vh] flex items-center justify-center py-16 px-4 border-b border-[#DDD2C0]">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-xl rounded-[4px] max-w-md w-full p-8 font-sans">
        <div className="text-center mb-6">
          <Logo size="md" showSubtitle />
          <h1 className="font-serif text-2xl text-[#2B1A16] font-semibold mt-4">
            {step === 'phone' ? 'Patron Authentication' : 'Verify OTP Code'}
          </h1>
          <p className="text-xs text-[#2B1A16]/70 mt-1">
            {step === 'phone'
              ? 'Access your saved orders, luxury concierge, and wishlist.'
              : `6-digit authentication token transmitted to +91 ${phoneNumber}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs rounded-[3px]">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden">
                <span className="bg-[#EFE8DD] px-3 py-2.5 font-medium text-[#2B1A16] border-r border-[#DDD2C0] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#9A8029]" />
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 text-sm text-[#2B1A16] bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1.5">
                Patron Name (Optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Siddharth Kashyap"
                className="w-full bg-white border border-[#DDD2C0] rounded-[4px] p-2.5 text-sm text-[#2B1A16] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Request 6-Digit OTP <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="flex justify-center gap-2 my-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-10 h-12 text-center text-lg font-bold text-[#2B1A16] bg-white border border-[#DDD2C0] rounded-[4px] outline-none focus:border-[#9A8029]"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-[#2B1A16]/70 pt-1">
              <button
                type="button"
                onClick={fillDemoOtp}
                className="text-[#9A8029] hover:underline font-medium"
              >
                Auto-fill demo code (123456)
              </button>
              <div>
                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTimer(30);
                      addToast('New OTP sent', 'info');
                    }}
                    className="text-[#9A8029] font-bold hover:underline"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#9A8029] hover:bg-[#7F6A1F] text-white py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              Verify OTP & Sign In <Lock className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[#DDD2C0] text-center text-[10px] text-[#2B1A16]/60 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4C7A34]" />
          <span>Encrypted Patron Verification • Mock OTP 123456</span>
        </div>
      </div>
    </div>
  );
}
