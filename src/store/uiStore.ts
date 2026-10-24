import { create } from 'zustand';
import { Product } from '@/types';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface UIState {
  quickViewProduct: Product | null;
  isSizeGuideOpen: boolean;
  isLoginModalOpen: boolean;
  isSearchOpen: boolean;
  toasts: ToastItem[];

  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  openSizeGuide: () => void;
  closeSizeGuide: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  quickViewProduct: null,
  isSizeGuideOpen: false,
  isLoginModalOpen: false,
  isSearchOpen: false,
  toasts: [],

  openQuickView: (product) => set({ quickViewProduct: product }),
  closeQuickView: () => set({ quickViewProduct: null }),

  openSizeGuide: () => set({ isSizeGuideOpen: true }),
  closeSizeGuide: () => set({ isSizeGuideOpen: false }),

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  addToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3800);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
