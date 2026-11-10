import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface RecentlyViewedState {
  items: Product[];
  addProduct: (product: Product) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (product) => {
        const current = get().items;
        const filtered = current.filter((item) => item.id !== product.id);
        set({ items: [product, ...filtered].slice(0, 10) });
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'mewak_recently_viewed',
    }
  )
);
