'use client';

import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 bg-[#2B1A16] text-[#EFE8DD] border border-[#DDD2C0]/30 shadow-2xl px-4 py-3 rounded-[4px] w-full text-xs animate-slideUp font-sans"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-[#9A8029] shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-[#DDD2C0] shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-[#B3402F] shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-[#EFE8DD]/50 hover:text-[#EFE8DD] p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
