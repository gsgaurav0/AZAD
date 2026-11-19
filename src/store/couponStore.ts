import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coupon } from '@/types/coupon';
import { getBrowserClient } from '@/lib/supabase/client';

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'MEWAK10',
    description: '10% Inaugural Patron Discount storewide with official warranty protection.',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: 10000,
    usageLimit: 500,
    usageCount: 84,
    isActive: true,
    expiresAt: '2026-12-31',
    createdAt: '2026-10-01',
  },
  {
    id: 'coup-2',
    code: 'WELCOME50',
    description: '₹500 Instant Discount on orders above ₹1,999.',
    discountType: 'flat',
    discountValue: 500,
    minOrderValue: 1999,
    usageLimit: 300,
    usageCount: 42,
    isActive: true,
    expiresAt: '2026-12-31',
    createdAt: '2026-10-05',
  },
  {
    id: 'coup-3',
    code: 'VIP1000',
    description: 'Exclusive ₹1,000 privilege savings on flagship orders above ₹20,000.',
    discountType: 'flat',
    discountValue: 1000,
    minOrderValue: 20000,
    usageLimit: 250,
    usageCount: 11,
    isActive: true,
    expiresAt: '2026-12-15',
    createdAt: '2026-10-20',
  },
];

interface CouponState {
  coupons: Coupon[];
  isLoading: boolean;

  // Supabase Sync
  fetchCoupons: () => Promise<void>;

  // Actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => Promise<Coupon>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  deleteAllCoupons: () => Promise<void>;
  toggleCouponActive: (id: string) => Promise<void>;
  incrementUsage: (code: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Helpers
  getCouponByCode: (code: string) => Coupon | undefined;
  validateCoupon: (code: string, cartSubtotal: number) => {
    isValid: boolean;
    coupon?: Coupon;
    message: string;
  };
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: DEFAULT_COUPONS,
      isLoading: false,

      fetchCoupons: async () => {
        if (typeof window === 'undefined') return;
        set({ isLoading: true });

        try {
          const apiRes = await fetch('/api/admin/coupons');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (Array.isArray(apiData.coupons)) {
              const mapped: Coupon[] = apiData.coupons.map((c: any) => ({
                id: c.id,
                code: c.code,
                description: c.description || '',
                discountType: c.discountType || c.discount_type || 'percentage',
                discountValue: Number(c.discountValue ?? c.discount_value ?? 0),
                minOrderValue: Number(c.minOrderValue ?? c.min_order_value ?? 0),
                maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : (c.max_discount ? Number(c.max_discount) : undefined),
                usageLimit: c.usageLimit ?? c.usage_limit ?? undefined,
                usageCount: Number(c.usageCount ?? c.usage_count ?? 0),
                isActive: c.isActive !== undefined ? Boolean(c.isActive) : (c.is_active !== undefined ? Boolean(c.is_active) : true),
                expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : (c.expires_at ? c.expires_at.split('T')[0] : undefined),
                createdAt: c.createdAt ? c.createdAt.split('T')[0] : (c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
              }));

              set({ coupons: mapped, isLoading: false });
              return;
            }
          }

          // Fallback to direct client
          const supabase = getBrowserClient();
          const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            const mapped: Coupon[] = data.map((c: any) => ({
              id: c.id,
              code: c.code,
              description: c.description || '',
              discountType: c.discount_type || c.discountType || 'percentage',
              discountValue: Number(c.discount_value ?? c.discountValue ?? 0),
              minOrderValue: Number(c.min_order_value ?? c.minOrderValue ?? 0),
              maxDiscount: c.max_discount ? Number(c.max_discount) : (c.maxDiscount ? Number(c.maxDiscount) : undefined),
              usageLimit: c.usage_limit ?? c.usageLimit ?? undefined,
              usageCount: Number(c.usage_count ?? c.usageCount ?? 0),
              isActive: c.is_active !== undefined ? Boolean(c.is_active) : (c.isActive !== undefined ? Boolean(c.isActive) : true),
              expiresAt: c.expires_at ? c.expires_at.split('T')[0] : (c.expiresAt ? c.expiresAt.split('T')[0] : undefined),
              createdAt: c.created_at ? c.created_at.split('T')[0] : (c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            }));

            set({ coupons: mapped, isLoading: false });
            return;
          }
        } catch (err) {
          console.warn('Coupon fetch notice:', err);
        }

        set({ isLoading: false });
      },

      addCoupon: async (couponData) => {
        const id = `coup-${Date.now()}`;
        const createdAt = new Date().toISOString().split('T')[0];
        const newCoupon: Coupon = {
          ...couponData,
          id,
          code: couponData.code.trim().toUpperCase(),
          usageCount: 0,
          createdAt,
        };

        try {
          const res = await fetch('/api/admin/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCoupon),
          });
          if (res.ok) {
            const resData = await res.json();
            if (resData.coupon) {
              set((state) => ({
                coupons: [resData.coupon, ...state.coupons.filter((c) => c.id !== id)],
              }));
              return resData.coupon;
            }
          }
        } catch (err) {
          console.warn('Coupon API insert notice:', err);
        }

        set((state) => ({
          coupons: [newCoupon, ...state.coupons],
        }));

        return newCoupon;
      },

      updateCoupon: async (id, updates) => {
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));

        try {
          await fetch('/api/admin/coupons', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
          });
        } catch (err) {
          console.warn('Coupon API update notice:', err);
        }
      },

      deleteCoupon: async (id) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));

        try {
          const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            get().fetchCoupons();
          }
        } catch (err) {
          console.warn('Coupon API delete notice:', err);
          get().fetchCoupons();
        }
      },

      deleteAllCoupons: async () => {
        set({ coupons: [] });

        try {
          const res = await fetch('/api/admin/coupons?all=true', {
            method: 'DELETE',
          });
          if (!res.ok) {
            get().fetchCoupons();
          }
        } catch (err) {
          console.warn('Coupon API deleteAll notice:', err);
          get().fetchCoupons();
        }
      },

      toggleCouponActive: async (id) => {
        const target = get().coupons.find((c) => c.id === id);
        if (!target) return;
        await get().updateCoupon(id, { isActive: !target.isActive });
      },

      incrementUsage: async (code) => {
        const clean = code.trim().toUpperCase();
        const supabase = getBrowserClient();
        try {
          await supabase.rpc('increment_coupon_usage', { p_code: clean });
        } catch {}

        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.code.toUpperCase() === clean ? { ...c, usageCount: c.usageCount + 1 } : c
          ),
        }));
      },

      resetToDefaults: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/admin/coupons?action=seed', {
            method: 'POST',
          });
          if (res.ok) {
            await get().fetchCoupons();
          } else {
            set({ coupons: DEFAULT_COUPONS, isLoading: false });
          }
        } catch (err) {
          console.warn('Coupon API resetToDefaults notice:', err);
          set({ coupons: DEFAULT_COUPONS, isLoading: false });
        }
      },

      getCouponByCode: (code) => {
        const clean = code.trim().toUpperCase();
        return get().coupons.find((c) => c.code.toUpperCase() === clean);
      },

      validateCoupon: (code, cartSubtotal) => {
        const coupon = get().getCouponByCode(code);

        if (!coupon) {
          return {
            isValid: false,
            message: `Coupon code "${code}" is not recognized.`,
          };
        }

        if (!coupon.isActive) {
          return {
            isValid: false,
            coupon,
            message: `Coupon "${coupon.code}" has been deactivated.`,
          };
        }

        if (coupon.expiresAt) {
          const expiryDate = new Date(coupon.expiresAt);
          expiryDate.setHours(23, 59, 59, 999);
          if (new Date() > expiryDate) {
            return {
              isValid: false,
              coupon,
              message: `Coupon "${coupon.code}" expired on ${coupon.expiresAt}.`,
            };
          }
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return {
            isValid: false,
            coupon,
            message: `Coupon "${coupon.code}" has reached its maximum redemption limit.`,
          };
        }

        if (coupon.minOrderValue && cartSubtotal < coupon.minOrderValue) {
          return {
            isValid: false,
            coupon,
            message: `Coupon "${coupon.code}" requires a minimum order of ₹${coupon.minOrderValue.toLocaleString('en-IN')}.`,
          };
        }

        const discountDesc =
          coupon.discountType === 'percentage'
            ? `${coupon.discountValue}% off`
            : `₹${coupon.discountValue.toLocaleString('en-IN')} off`;

        return {
          isValid: true,
          coupon,
          message: `Coupon "${coupon.code}" applied! (${discountDesc})`,
        };
      },
    }),
    {
      name: 'mewak_coupons_storage',
    }
  )
);
