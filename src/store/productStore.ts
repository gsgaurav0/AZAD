import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category, Occasion } from '@/types';
import { PRODUCTS } from '@/data/products';
import { getBrowserClient } from '@/lib/supabase/client';

interface ProductState {
  products: Product[];
  isLoading: boolean;

  // Actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'reviews'> & { id?: string }) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product | null>;
  resetToDefaults: () => Promise<void>;
  getProductBySlugOrId: (identifier: string) => Product | undefined;
  deleteReview: (productId: string, reviewId: string) => Promise<void>;
  addReview: (productId: string, review: import('@/types').Review) => Promise<void>;
  toggleReviewVerified: (productId: string, reviewId: string) => Promise<void>;
}

const STORAGE_KEY = 'mewak_products_catalog';
const SYNC_EVENT = 'mewak_catalog_sync';

// Cross-tab broadcast helper
function notifyCatalogChange() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mewak_catalog_channel');
      channel.postMessage({ type: 'CATALOG_UPDATED', timestamp: Date.now() });
      channel.close();
    }
  } catch (err) {
    console.warn('Cross-tab broadcast error:', err);
  }
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: PRODUCTS,
      isLoading: false,

      fetchProducts: async () => {
        if (typeof window === 'undefined') return;
        set({ isLoading: true });

        try {
          // Attempt admin API endpoint (auto-seeds if empty)
          const apiRes = await fetch('/api/admin/products');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.products && apiData.products.length > 0) {
              const mapped: Product[] = apiData.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                subtitle: p.subtitle || '',
                category: p.category as Category,
                subcategory: p.subcategory || 'Hardware',
                price: Number(p.price),
                originalPrice: Number(p.original_price || p.price),
                discountPercent: p.discount_percent || 0,
                isNew: Boolean(p.is_new),
                isTrending: Boolean(p.is_trending),
                isFeatured: Boolean(p.is_featured),
                occasion: (p.occasion as Occasion) || 'Everyday',
                rating: Number(p.rating || 5.0),
                reviewCount: p.review_count || (p.reviews ? p.reviews.length : 0),
                colors: Array.isArray(p.colors) ? p.colors : [],
                sizes: Array.isArray(p.sizes) ? p.sizes : [],
                images: Array.isArray(p.images) ? p.images : [],
                fabric: p.fabric || '',
                fit: p.fit || '',
                care: Array.isArray(p.care) ? p.care : [],
                description: p.description || '',
                details: Array.isArray(p.details) ? p.details : [],
                returns: p.returns || '',
                reviews: Array.isArray(p.reviews)
                  ? p.reviews.map((r: any) => ({
                      id: r.id,
                      userName: r.user_name,
                      rating: r.rating,
                      title: r.title,
                      comment: r.comment,
                      verified: r.verified,
                      helpfulCount: r.helpful_count || 0,
                      date: new Date(r.created_at).toLocaleDateString('en-GB'),
                    }))
                  : [],
              }));

              set({ products: mapped, isLoading: false });
              return;
            }
          }

          // Fallback to direct client
          const supabase = getBrowserClient();
          const { data, error } = await supabase
            .from('products')
            .select('*, reviews(*)')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped: Product[] = data.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              subtitle: p.subtitle || '',
              category: p.category as Category,
              subcategory: p.subcategory || 'Hardware',
              price: Number(p.price),
              originalPrice: Number(p.original_price || p.price),
              discountPercent: p.discount_percent || 0,
              isNew: Boolean(p.is_new),
              isTrending: Boolean(p.is_trending),
              isFeatured: Boolean(p.is_featured),
              occasion: (p.occasion as Occasion) || 'Everyday',
              rating: Number(p.rating || 5.0),
              reviewCount: p.review_count || (p.reviews ? p.reviews.length : 0),
              colors: Array.isArray(p.colors) ? p.colors : [],
              sizes: Array.isArray(p.sizes) ? p.sizes : [],
              images: Array.isArray(p.images) ? p.images : [],
              fabric: p.fabric || '',
              fit: p.fit || '',
              care: Array.isArray(p.care) ? p.care : [],
              description: p.description || '',
              details: Array.isArray(p.details) ? p.details : [],
              returns: p.returns || '',
              reviews: Array.isArray(p.reviews)
                ? p.reviews.map((r: any) => ({
                    id: r.id,
                    userName: r.user_name,
                    rating: r.rating,
                    title: r.title,
                    comment: r.comment,
                    verified: r.verified,
                    helpfulCount: r.helpful_count || 0,
                    date: new Date(r.created_at).toLocaleDateString('en-GB'),
                  }))
                : [],
            }));

            set({ products: mapped, isLoading: false });
            return;
          }
        } catch (err) {
          console.warn('fetchProducts notice:', err);
        }

        set({ isLoading: false });
      },

      addProduct: async (newProductData) => {
        const id = newProductData.id || `mewak-${Date.now()}`;
        const rawSlug =
          newProductData.slug ||
          newProductData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const slug = rawSlug || `product-${Date.now()}`;

        const safeImages =
          newProductData.images && newProductData.images.length > 0
            ? newProductData.images
            : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'];

        const safeColors =
          newProductData.colors && newProductData.colors.length > 0
            ? newProductData.colors
            : [{ name: 'Space Black', hex: '#111827', image: safeImages[0] }];

        const safeSizes =
          newProductData.sizes && newProductData.sizes.length > 0
            ? newProductData.sizes
            : [{ size: 'Standard Edition', inStock: true, stockCount: 20 }];

        const createdProduct: Product = {
          id,
          name: newProductData.name || 'Untitled Hardware',
          slug,
          subtitle: newProductData.subtitle || 'Next-Gen Silicon Architecture & Precision Engineering',
          category: (newProductData.category as Category) || 'headphones',
          subcategory: (newProductData.subcategory || 'Hardware').trim(),
          price: Number(newProductData.price) || 9999,
          originalPrice: Number(newProductData.originalPrice) || Number(newProductData.price) || 9999,
          discountPercent: Number(newProductData.discountPercent) || 0,
          occasion: (newProductData.occasion as Occasion) || 'Work',
          isNew: Boolean(newProductData.isNew),
          isTrending: Boolean(newProductData.isTrending),
          isFeatured: Boolean(newProductData.isFeatured),
          images: safeImages,
          colors: safeColors,
          sizes: safeSizes,
          fabric: (newProductData.fabric || 'Aero-grade Aluminum & Ceramic').trim(),
          fit: (newProductData.fit || 'Ergonomic Acoustic Seal').trim(),
          description:
            newProductData.description ||
            `${newProductData.name} pioneers the convergence of cutting-edge silicon architecture and acoustic purity.`,
          details: newProductData.details || ['Precision CNC Machined Chassis', 'Industry-leading battery and wireless performance'],
          care: newProductData.care || ['2-Year Official Brand Replacement Warranty', 'Included protective carrying travel case'],
          returns: newProductData.returns || '15-day risk-free home trial with complimentary doorstep replacement',
          rating: newProductData.rating || 4.9,
          reviewCount: newProductData.reviewCount || 1,
          reviews: [],
        };

        // Write directly to Supabase via server API
        let finalProduct = createdProduct;
        try {
          const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdProduct),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.product) {
              finalProduct = {
                ...createdProduct,
                id: data.product.id || createdProduct.id,
                slug: data.product.slug || createdProduct.slug,
              };
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            console.error('Failed to create product in database:', errData);
          }
        } catch (err) {
          console.warn('API product POST notice:', err);
        }

        set((state) => ({
          products: [finalProduct, ...state.products.filter((p) => p.id !== finalProduct.id)],
        }));

        notifyCatalogChange();
        return finalProduct;
      },

      updateProduct: async (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));

        // Write directly to Supabase via server API
        try {
          await fetch('/api/admin/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
          });
        } catch (err) {
          console.warn('API product PUT notice:', err);
        }

        notifyCatalogChange();
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));

        // Delete directly in Supabase via server API
        try {
          await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.warn('API product DELETE notice:', err);
        }

        notifyCatalogChange();
      },

      toggleStock: async (id) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;

        const allInStock = (product.sizes || []).every((s) => s.inStock);
        const updatedSizes = (product.sizes || []).map((s) => ({
          ...s,
          inStock: !allInStock,
          stockCount: !allInStock ? 15 : 0,
        }));

        await get().updateProduct(id, { sizes: updatedSizes });
      },

      duplicateProduct: async (id) => {
        const target = get().products.find((p) => p.id === id);
        if (!target) return null;

        const newId = `mewak-${Date.now()}`;
        const newSlug = `${target.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
        const duplicated: Product = {
          ...target,
          id: newId,
          slug: newSlug,
          name: `${target.name} (Copy)`,
          isNew: true,
        };

        await get().addProduct(duplicated);
        return duplicated;
      },

      resetToDefaults: async () => {
        set({ products: PRODUCTS });
        notifyCatalogChange();
      },

      getProductBySlugOrId: (identifier) => {
        const products = get().products;
        return products.find(
          (p) =>
            p.slug.toLowerCase() === identifier.toLowerCase() ||
            p.id.toLowerCase() === identifier.toLowerCase()
        );
      },

      deleteReview: async (productId, reviewId) => {
        try {
          await fetch(`/api/admin/reviews?id=${encodeURIComponent(reviewId)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.warn('API review delete notice:', err);
        }

        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== productId) return p;
            const updatedReviews = (p.reviews || []).filter((r) => r.id !== reviewId);
            const newCount = updatedReviews.length;
            const newRating =
              newCount > 0
                ? Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1))
                : p.rating;
            return {
              ...p,
              reviews: updatedReviews,
              reviewCount: newCount,
              rating: newRating,
            };
          }),
        }));
        notifyCatalogChange();
      },

      addReview: async (productId, review) => {
        try {
          await fetch('/api/admin/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              userName: review.userName,
              rating: review.rating,
              title: review.title,
              comment: review.comment,
              verified: review.verified,
              helpfulCount: review.helpfulCount || 0,
            }),
          });
        } catch (err) {
          console.warn('API review insert notice:', err);
        }

        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== productId) return p;
            const updatedReviews = [review, ...(p.reviews || [])];
            const newCount = updatedReviews.length;
            const newRating = Number(
              (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1)
            );
            return {
              ...p,
              reviews: updatedReviews,
              reviewCount: newCount,
              rating: newRating,
            };
          }),
        }));
        notifyCatalogChange();
      },

      toggleReviewVerified: async (productId, reviewId) => {
        const product = get().products.find((p) => p.id === productId);
        const review = (product?.reviews || []).find((r) => r.id === reviewId);
        if (review) {
          try {
            await fetch('/api/admin/reviews', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: reviewId,
                verified: !review.verified,
              }),
            });
          } catch (err) {
            console.warn('API review verify toggle notice:', err);
          }
        }

        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== productId) return p;
            return {
              ...p,
              reviews: (p.reviews || []).map((r) =>
                r.id === reviewId ? { ...r, verified: !r.verified } : r
              ),
            };
          }),
        }));
        notifyCatalogChange();
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

// Cross-tab and window synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      useProductStore.persist.rehydrate();
    }
  });

  window.addEventListener(SYNC_EVENT, () => {
    useProductStore.persist.rehydrate();
  });

  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('mewak_catalog_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CATALOG_UPDATED') {
          useProductStore.persist.rehydrate();
          useProductStore.getState().fetchProducts();
        }
      };
    } catch {
      // Ignore
    }
  }
}
