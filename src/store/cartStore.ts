import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

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
        const code = rawCode.trim().toUpperCase();
        const subtotal = get().getSubtotal();

        if (code === 'MEWAK10') {
          set({
            appliedCoupon: 'MEWAK10',
            couponDiscountPercent: 10,
            couponDiscountFlat: 0,
          });
          return { success: true, message: 'Coupon MEWAK10 applied: 10% Off!' };
        }

        if (code === 'WELCOME50') {
          if (subtotal < 1999) {
            return {
              success: false,
              message: 'Coupon WELCOME50 requires a minimum order of ₹1,999.',
            };
          }
          set({
            appliedCoupon: 'WELCOME50',
            couponDiscountPercent: 0,
            couponDiscountFlat: 500,
          });
          return {
            success: true,
            message: 'Coupon WELCOME50 applied: ₹500 Instant Discount!',
          };
        }

        return {
          success: false,
          message: 'Invalid promo code. Try MEWAK10 or WELCOME50.',
        };
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
        const { couponDiscountPercent, couponDiscountFlat } = get();
        const subtotal = get().getSubtotal();
        if (couponDiscountPercent > 0) {
          return Math.round((subtotal * couponDiscountPercent) / 100);
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
