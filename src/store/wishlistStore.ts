import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { getBrowserClient } from '@/lib/supabase/client';

interface WishlistState {
  items: Product[];
  syncWithSupabase: (userId?: string) => Promise<void>;
  toggleWishlist: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

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

          const { data: serverWishlist } = await supabase
            .from('wishlist_items')
            .select('product:products(*)')
            .eq('user_id', targetUserId);

          if (serverWishlist && serverWishlist.length > 0) {
            const serverProducts: Product[] = serverWishlist
              .filter((w: any) => w.product)
              .map((w: any) => w.product);

            // Merge with local items
            const local = get().items;
            const merged = [...serverProducts];
            for (const loc of local) {
              if (!merged.some((m) => m.id === loc.id)) {
                merged.push(loc);
              }
            }
            set({ items: merged });
          }
        } catch (err) {
          console.warn('Wishlist Supabase sync notice:', err);
        }
      },

      toggleWishlist: (product: Product) => {
        const current = get().items;
        const exists = current.some((item) => item.id === product.id);

        if (exists) {
          set({ items: current.filter((item) => item.id !== product.id) });

          if (typeof window !== 'undefined') {
            const supabase = getBrowserClient();
            supabase.auth.getSession().then(async ({ data }: { data: any }) => {
              if (data?.session?.user) {
                try {
                  await supabase.from('wishlist_items')
                    .delete()
                    .eq('user_id', data.session.user.id)
                    .eq('product_id', product.id);
                } catch (err) {
                  console.warn('Wishlist Supabase delete notice:', err);
                }
              }
            });
          }

          return false;
        } else {
          set({ items: [product, ...current] });

          if (typeof window !== 'undefined') {
            const supabase = getBrowserClient();
            supabase.auth.getSession().then(async ({ data }: { data: any }) => {
              if (data?.session?.user) {
                try {
                  await supabase.from('wishlist_items')
                    .upsert({
                      user_id: data.session.user.id,
                      product_id: product.id,
                    }, { onConflict: 'user_id,product_id' });
                } catch (err) {
                  console.warn('Wishlist Supabase upsert notice:', err);
                }
              }
            });
          }

          return true;
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));

        if (typeof window !== 'undefined') {
          const supabase = getBrowserClient();
          supabase.auth.getSession().then(async ({ data }: { data: any }) => {
            if (data?.session?.user) {
              try {
                await supabase.from('wishlist_items')
                  .delete()
                  .eq('user_id', data.session.user.id)
                  .eq('product_id', productId);
              } catch (err) {
                console.warn('Wishlist Supabase delete notice:', err);
              }
            }
          });
        }
      },

      clearWishlist: () => {
        set({ items: [] });
        if (typeof window !== 'undefined') {
          const supabase = getBrowserClient();
          supabase.auth.getSession().then(async ({ data }: { data: any }) => {
            if (data?.session?.user) {
              try {
                await supabase.from('wishlist_items').delete().eq('user_id', data.session.user.id);
              } catch (err) {
                console.warn('Wishlist Supabase clear notice:', err);
              }
            }
          });
        }
      },
    }),
    {
      name: 'mewak_wishlist_storage',
    }
  )
);
