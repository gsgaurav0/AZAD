'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function LoginModal() {
  const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen);
  const closeLoginModal = useUIStore((state) => state.closeLoginModal);
  const addToast = useUIStore((state) => state.addToast);
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP field when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  if (!isLoginModalOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setError('');
    setStep('otp');
    setTimer(30);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance to next field
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
    const enteredOtp = otp.join('');
    // Mock OTP verification (123456)
    if (enteredOtp === '123456') {
      login(phoneNumber, fullName || 'Patron');
      addToast('Welcome back to the Maison MewaK.', 'success');
      closeLoginModal();
      setStep('phone');
      setPhoneNumber('');
      setOtp(['', '', '', '', '', '']);
    } else {
      setError('Invalid OTP code. Please enter 123456.');
    }
  };

  const fillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    setError('');
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setError('');
      addToast('New OTP sent to +91 ' + phoneNumber, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] max-w-md w-full overflow-hidden relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-1.5 text-[#2B1A16]/50 hover:text-[#2B1A16] transition-colors"
          aria-label="Close login modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <Logo size="md" showSubtitle />
            <h3 className="font-serif text-xl text-[#2B1A16] mt-4 font-semibold">
              {step === 'phone' ? 'Patron Sign In' : 'Verify One-Time Password'}
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mt-1 font-sans">
              {step === 'phone'
                ? 'Enter your mobile number to access your curated wardrobe, orders, and privileges.'
                : `We sent a 6-digit authentication code to +91 ${phoneNumber}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs rounded-[3px]">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex rounded-[4px] border border-[#DDD2C0] bg-white overflow-hidden focus-within:border-[#9A8029]">
                  <span className="bg-[#EFE8DD] px-3 py-2.5 text-xs font-medium text-[#2B1A16] border-r border-[#DDD2C0] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#9A8029]" />
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    required
                    className="w-full px-3 py-2.5 text-sm text-[#2B1A16] bg-transparent outline-none font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Siddharth Kashyap"
                  className="w-full px-3 py-2.5 text-sm text-[#2B1A16] bg-white border border-[#DDD2C0] rounded-[4px] outline-none focus:border-[#9A8029]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Request OTP <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#2B1A16]/60">
                  Mock demonstration: Any 10-digit number accepted
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-12 text-center text-lg font-bold text-[#2B1A16] bg-white border border-[#DDD2C0] rounded-[4px] focus:border-[#9A8029] outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Demo Helper & Resend Timer */}
              <div className="flex items-center justify-between text-xs text-[#2B1A16]/70 pt-2 font-sans">
                <button
                  type="button"
                  onClick={fillDemoOtp}
                  className="text-[#9A8029] hover:underline font-medium text-[11px]"
                >
                  Auto-fill demo OTP (123456)
                </button>

                <div>
                  {timer > 0 ? (
                    <span>Resend OTP in <strong>{timer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-[#9A8029] font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#9A8029] hover:bg-[#7F6A1F] text-white py-3 rounded-[4px] text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                Verify & Enter Maison <Lock className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-[11px] text-[#2B1A16]/60 hover:text-[#2B1A16] pt-1"
              >
                Change mobile number
              </button>
            </form>
          )}

          {/* Privacy footer */}
          <div className="mt-6 pt-4 border-t border-[#DDD2C0] flex items-center justify-center gap-1.5 text-[10px] text-[#2B1A16]/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4C7A34]" />
            <span>Encrypted patron verification • Never shared with third parties</span>
          </div>
        </div>
      </div>
    </div>
  );
}
