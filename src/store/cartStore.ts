import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import { useCouponStore } from '@/store/couponStore';
import { getBrowserClient } from '@/lib/supabase/client';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  appliedCoupon: string | null;
  couponDiscountPercent: number;
  couponDiscountFlat: number;

  // Supabase Sync
  syncWithSupabase: (userId?: string) => Promise<void>;

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
const STANDARD_SHIPPING_FEE = 150;

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

      syncWithSupabase: async (userId?: string) => {
        if (typeof window === 'undefined') return;
        const supabase = getBrowserClient();

        try {
          let targetUserId = userId;
          if (!targetUserId) {
            const { data: { session } } = await supabase.auth.getSession();
            targetUserId = session?.user?.id;
          }

          if (!targetUserId) return;

          // Fetch items from server cart
          const { data: serverCart } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('user_id', targetUserId);

          if (serverCart && serverCart.length > 0) {
            const serverItems: CartItem[] = serverCart
              .filter((c: any) => c.product)
              .map((c: any) => ({
                product: c.product,
                selectedColor: c.selected_color,
                selectedSize: c.selected_size,
                quantity: c.quantity,
              }));

            // Merge local guest items with server items
            const localItems = get().items;
            const merged = [...serverItems];

            for (const local of localItems) {
              const existingIdx = merged.findIndex(
                (m) =>
                  m.product.id === local.product.id &&
                  m.selectedColor === local.selectedColor &&
                  m.selectedSize === local.selectedSize
              );
              if (existingIdx > -1) {
                merged[existingIdx].quantity = Math.max(merged[existingIdx].quantity, local.quantity);
              } else {
                merged.push(local);
              }
            }

            set({ items: merged });
          }
        } catch (err) {
          console.warn('Cart Supabase sync notice:', err);
        }
      },

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

        // Sync with Supabase asynchronously
        if (typeof window !== 'undefined') {
          const supabase = getBrowserClient();
          supabase.auth.getSession().then(async ({ data }: { data: any }) => {
            if (data?.session?.user) {
              try {
                await supabase.from('cart_items').upsert({
                  user_id: data.session.user.id,
                  product_id: product.id,
                  selected_color: selectedColor,
                  selected_size: selectedSize,
                  quantity,
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,product_id,selected_color,selected_size' });
              } catch (err) {
                console.warn('Cart Supabase upsert notice:', err);
              }
            }
          });
        }
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

        if (typeof window !== 'undefined') {
          const supabase = getBrowserClient();
          supabase.auth.getSession().then(async ({ data }: { data: any }) => {
            if (data?.session?.user) {
              try {
                await supabase.from('cart_items')
                  .delete()
                  .eq('user_id', data.session.user.id)
                  .eq('product_id', productId)
                  .eq('selected_color', selectedColor)
                  .eq('selected_size', selectedSize);
              } catch (err) {
                console.warn('Cart Supabase delete notice:', err);
              }
            }
          });
        }
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

        if (typeof window !== 'undefined') {
          const supabase = getBrowserClient();
          supabase.auth.getSession().then(async ({ data }: { data: any }) => {
            if (data?.session?.user) {
              try {
                await supabase.from('cart_items')
                  .update({ quantity, updated_at: new Date().toISOString() })
                  .eq('user_id', data.session.user.id)
                  .eq('product_id', productId)
                  .eq('selected_color', selectedColor)
                  .eq('selected_size', selectedSize);
              } catch (err) {
                console.warn('Cart Supabase update notice:', err);
              }
            }
          });
        }
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

      applyCoupon: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        const couponStore = useCouponStore.getState();
        const currentSubtotal = get().getSubtotal();

        const validation = couponStore.validateCoupon(cleanCode, currentSubtotal);
        if (!validation.isValid || !validation.coupon) {
          return { success: false, message: validation.message };
        }

        const coupon = validation.coupon;
        if (coupon.discountType === 'percentage') {
          set({
            appliedCoupon: coupon.code,
            couponDiscountPercent: coupon.discountValue,
            couponDiscountFlat: 0,
          });
        } else {
          set({
            appliedCoupon: coupon.code,
            couponDiscountPercent: 0,
            couponDiscountFlat: coupon.discountValue,
          });
        }

        return { success: true, message: validation.message };
      },

      removeCoupon: () => {
        set({
          appliedCoupon: null,
          couponDiscountPercent: 0,
          couponDiscountFlat: 0,
        });
      },

      clearCart: () => {
        set({
          items: [],
          appliedCoupon: null,
          couponDiscountPercent: 0,
          couponDiscountFlat: 0,
        });

        if (typeof window !== 'undefined') {
          const supabase = getBrowserClient();
          supabase.auth.getSession().then(async ({ data }: { data: any }) => {
            if (data?.session?.user) {
              try {
                await supabase.from('cart_items').delete().eq('user_id', data.session.user.id);
              } catch (err) {
                console.warn('Cart Supabase clear notice:', err);
              }
            }
          });
        }
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
          return 0;
        }
        return STANDARD_SHIPPING_FEE;
      },

      getCouponDiscount: () => {
        const subtotal = get().getSubtotal();
        const { couponDiscountPercent, couponDiscountFlat, appliedCoupon } = get();

        if (!appliedCoupon) return 0;

        if (couponDiscountPercent > 0) {
          const coupon = useCouponStore.getState().getCouponByCode(appliedCoupon);
          const raw = (subtotal * couponDiscountPercent) / 100;
          return coupon?.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
        }

        return Math.min(couponDiscountFlat, subtotal);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee();
        const discount = get().getCouponDiscount();
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getFreeShippingRemaining: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
      },
    }),
    {
      name: 'mewak_cart_storage',
    }
  )
);
