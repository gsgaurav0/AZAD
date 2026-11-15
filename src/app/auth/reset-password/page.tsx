'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/store/uiStore';

export default function ResetPasswordPage() {
  const router = useRouter();
  const addToast = useUIStore((state) => state.addToast);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.updateUser({
        password: password,
      });

      setLoading(false);
      if (resetError) {
        setError(resetError.message || 'Unable to update password. Recovery link may have expired.');
      } else {
        setSuccess(true);
        addToast('Password successfully updated!', 'success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred while updating your password.');
    }
  };

  return (
    <div className="bg-[#EFE8DD] min-h-[85vh] flex items-center justify-center py-16 px-4 border-b border-[#DDD2C0]">
      <div className="bg-[#FBF7F0] border border-[#DDD2C0] shadow-xl rounded-[4px] max-w-md w-full p-8 font-sans">
        <div className="text-center mb-6">
          <Logo size="md" showSubtitle />
          <h1 className="font-serif text-3xl text-[#2B1A16] font-normal mt-4">Set New Password</h1>
          <p className="text-xs text-[#2B1A16]/70 mt-1 max-w-sm mx-auto">
            Choose a strong, encrypted password to protect your patron account and private records.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs rounded-[3px]">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-[#4C7A34]/10 border border-[#4C7A34]/30 rounded-[4px] text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#4C7A34] mx-auto" />
            <h3 className="font-serif text-lg text-[#2B1A16]">Password Updated</h3>
            <p className="text-xs text-[#2B1A16]/80">
              Your password has been changed securely. Redirecting you to sign in...
            </p>
            <Link
              href="/login"
              className="inline-block bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] px-5 py-2 rounded-[3px] font-semibold uppercase tracking-wider text-[11px] transition-colors"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
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
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3 rounded-[4px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-[#9A8029] font-medium hover:underline">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-[#DDD2C0] flex items-center justify-center gap-2 text-xs text-[#2B1A16]/60">
          <ShieldCheck className="w-4 h-4 text-[#4C7A34]" />
          <span>256-Bit TLS Bank-Grade Encryption • Official Warranty</span>
        </div>
      </div>
    </div>
  );
}
