import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coupon } from '@/types/coupon';

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
    code: 'STUDIO20',
    description: '20% off high-end planar audio & accessories above ₹4,999.',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 4999,
    maxDiscount: 3000,
    usageLimit: 150,
    usageCount: 29,
    isActive: true,
    expiresAt: '2026-11-30',
    createdAt: '2026-10-15',
  },
  {
    id: 'coup-4',
    code: 'VIP5000',
    description: '₹5,000 Direct Concierge Voucher on titanium flagships above ₹25,000.',
    discountType: 'flat',
    discountValue: 5000,
    minOrderValue: 25000,
    usageLimit: 50,
    usageCount: 11,
    isActive: true,
    expiresAt: '2026-12-15',
    createdAt: '2026-10-20',
  },
  {
    id: 'coup-5',
    code: 'AUDIO25',
    description: '25% Acoustic Celebration on Planar Driver headphones above ₹9,999.',
    discountType: 'percentage',
    discountValue: 25,
    minOrderValue: 9999,
    maxDiscount: 4000,
    usageLimit: 100,
    usageCount: 18,
    isActive: false, // Paused promo
    expiresAt: '2026-11-15',
    createdAt: '2026-11-01',
  },
];

interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number;
}

interface CouponState {
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => Coupon;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  validateCoupon: (code: string, subtotal: number) => CouponValidationResult;
  incrementUsage: (code: string) => void;
  resetToDefaults: () => void;
}

// Cross-tab broadcast channel
let couponChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    couponChannel = new BroadcastChannel('mewak_coupons_channel');
  } catch {
    // Ignore in unsupported environments
  }
}

const broadcastCouponSync = () => {
  if (couponChannel) {
    couponChannel.postMessage({ type: 'COUPONS_UPDATED', timestamp: Date.now() });
  }
};

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: DEFAULT_COUPONS,

      addCoupon: (newCouponData) => {
        const id = `coup-${Date.now()}`;
        const newCoupon: Coupon = {
          ...newCouponData,
          id,
          code: newCouponData.code.trim().toUpperCase(),
          usageCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          coupons: [newCoupon, ...state.coupons],
        }));

        broadcastCouponSync();
        return newCoupon;
      },

      updateCoupon: (id, updates) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  ...(updates.code ? { code: updates.code.trim().toUpperCase() } : {}),
                }
              : c
          ),
        }));
        broadcastCouponSync();
      },

      deleteCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));
        broadcastCouponSync();
      },

      toggleCouponActive: (id) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        }));
        broadcastCouponSync();
      },

      validateCoupon: (rawCode, subtotal) => {
        const cleanCode = rawCode.trim().toUpperCase();
        if (!cleanCode) {
          return { valid: false, error: 'Please enter a promo code.' };
        }

        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === cleanCode
        );

        if (!coupon) {
          return {
            valid: false,
            error: `Promo code "${cleanCode}" was not found. Please verify spelling.`,
          };
        }

        if (!coupon.isActive) {
          return {
            valid: false,
            error: `Promo code "${coupon.code}" is currently paused or inactive.`,
          };
        }

        // Check expiration
        if (coupon.expiresAt) {
          const expiryDate = new Date(coupon.expiresAt);
          // Set to end of expiry day
          expiryDate.setHours(23, 59, 59, 999);
          if (new Date() > expiryDate) {
            return {
              valid: false,
              error: `Promo code "${coupon.code}" expired on ${coupon.expiresAt}.`,
            };
          }
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return {
            valid: false,
            error: `Promo code "${coupon.code}" has reached its maximum redemption quota.`,
          };
        }

        // Check minimum order value
        if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
          return {
            valid: false,
            error: `Coupon "${coupon.code}" requires a minimum cart subtotal of ₹${coupon.minOrderValue.toLocaleString('en-IN')}. Current subtotal is ₹${subtotal.toLocaleString('en-IN')}.`,
          };
        }

        // Compute discount amount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }

        return {
          valid: true,
          coupon,
          discountAmount,
        };
      },

      incrementUsage: (code) => {
        const cleanCode = code.trim().toUpperCase();
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.code.toUpperCase() === cleanCode
              ? { ...c, usageCount: c.usageCount + 1 }
              : c
          ),
        }));
        broadcastCouponSync();
      },

      resetToDefaults: () => {
        set({ coupons: DEFAULT_COUPONS });
        broadcastCouponSync();
      },
    }),
    {
      name: 'mewak_coupons_storage',
    }
  )
);

// Listen to other tabs for live sync
if (couponChannel) {
  couponChannel.onmessage = (event) => {
    if (event.data?.type === 'COUPONS_UPDATED') {
      try {
        const stored = localStorage.getItem('mewak_coupons_storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.coupons) {
            useCouponStore.setState({ coupons: parsed.state.coupons });
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  };
}

