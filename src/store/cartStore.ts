import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import { useCouponStore } from '@/store/couponStore';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  appliedCoupon: string | null;
  couponDiscountPercent: number;
  couponDiscountFlat: number;
  
  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, selectedColor: string, selectedSize: string, quantity?: number) => void;
  removeItem: (productId: string, selectedColor: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedColor: string, selectedSize: string, quantity: number) => void;
  updateSize: (productId: string, currentColor: string, currentSize: string, newSize: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;

  // Computed values
  getSubtotal: () => number;
  getShippingFee: () => number;
  getCouponDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getFreeShippingRemaining: () => number;
}

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      appliedCoupon: null,
      couponDiscountPercent: 0,
      couponDiscountFlat: 0,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (product, selectedColor, selectedSize, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedColor === selectedColor &&
              item.selectedSize === selectedSize
          );

          let newItems: CartItem[];
          if (existingIndex > -1) {
            newItems = state.items.map((item, idx) =>
              idx === existingIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.items, { product, selectedColor, selectedSize, quantity }];
          }

          return { items: newItems, isCartOpen: true };
        });
      },

      removeItem: (productId, selectedColor, selectedSize) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
              )
          ),
        }));
      },

      updateQuantity: (productId, selectedColor, selectedSize, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedColor, selectedSize);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      updateSize: (productId, currentColor, currentSize, newSize) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.selectedColor === currentColor &&
            item.selectedSize === currentSize
              ? { ...item, selectedSize: newSize }
              : item
          ),
        }));
      },

      applyCoupon: (rawCode: string) => {
        const subtotal = get().getSubtotal();
        const result = useCouponStore.getState().validateCoupon(rawCode, subtotal);

        if (!result.valid || !result.coupon) {
          return {
            success: false,
            message: result.error || 'Invalid promo code. Verify code or active promotions.',
          };
        }

        const coupon = result.coupon;
        if (coupon.discountType === 'percentage') {
          set({
            appliedCoupon: coupon.code,
            couponDiscountPercent: coupon.discountValue,
            couponDiscountFlat: 0,
          });
          const capText = coupon.maxDiscount ? ` (capped at ₹${coupon.maxDiscount.toLocaleString('en-IN')})` : '';
          return {
            success: true,
            message: `Coupon "${coupon.code}" applied: ${coupon.discountValue}% Off${capText}!`,
          };
        } else {
          set({
            appliedCoupon: coupon.code,
            couponDiscountPercent: 0,
            couponDiscountFlat: coupon.discountValue,
          });
          return {
            success: true,
            message: `Coupon "${coupon.code}" applied: ₹${coupon.discountValue.toLocaleString('en-IN')} Flat Discount!`,
          };
        }
      },

      removeCoupon: () => {
        set({
          appliedCoupon: null,
          couponDiscountPercent: 0,
          couponDiscountFlat: 0,
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null, couponDiscountPercent: 0, couponDiscountFlat: 0 }),

      getSubtotal: () => {
        const items = get().items;
        return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
          return 0;
        }
        return STANDARD_SHIPPING_FEE;
      },

      getCouponDiscount: () => {
        const { appliedCoupon, couponDiscountPercent, couponDiscountFlat } = get();
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;

        if (couponDiscountPercent > 0) {
          let discount = Math.round((subtotal * couponDiscountPercent) / 100);
          if (appliedCoupon) {
            const found = useCouponStore.getState().coupons.find(
              (c) => c.code.toUpperCase() === appliedCoupon.toUpperCase()
            );
            if (found?.maxDiscount && discount > found.maxDiscount) {
              discount = found.maxDiscount;
            }
          }
          return discount;
        }
        if (couponDiscountFlat > 0) {
          return Math.min(couponDiscountFlat, subtotal);
        }
        return 0;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const shipping = get().getShippingFee();
        const discount = get().getCouponDiscount();
        return Math.max(0, subtotal + shipping - discount);
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getFreeShippingRemaining: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
      },
    }),
    {
      name: 'mewak_cart_storage',
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        couponDiscountPercent: state.couponDiscountPercent,
        couponDiscountFlat: state.couponDiscountFlat,
      }),
    }
  )
);
