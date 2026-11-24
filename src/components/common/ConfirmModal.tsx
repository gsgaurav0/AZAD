'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = isDestructive || variant === 'danger';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn"
    >
      <div
        className="relative w-full max-w-md bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-2xl p-6 sm:p-7 font-sans text-left transform transition-all duration-200 scale-100 animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent glow */}
        <div
          className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
            isDanger ? 'bg-rose-500/10' : 'bg-[#9A8029]/15'
          }`}
        />

        {/* Header with Icon and Close Button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isDanger
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-[#9A8029]/10 border-[#9A8029]/25 text-[#9A8029]'
            }`}
          >
            {isDanger ? (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#9A8029]" />
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-[#2B1A16]/50 hover:text-[#2B1A16] hover:bg-[#EFE8DD] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-6">
          <h3 className="font-serif text-lg font-bold text-[#2B1A16] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[#2B1A16]/70 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DDD2C0]/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#DDD2C0] bg-white text-xs font-semibold text-[#2B1A16] hover:bg-[#FAF8F5] transition-all cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD]'
            }`}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
