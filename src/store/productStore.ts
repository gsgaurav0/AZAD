import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category, Occasion } from '@/types';
import { PRODUCTS } from '@/data/products';

interface ProductState {
  products: Product[];

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'reviews'> & { id?: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStock: (id: string) => void;
  duplicateProduct: (id: string) => Product | null;
  resetToDefaults: () => void;
  getProductBySlugOrId: (identifier: string) => Product | undefined;
  deleteReview: (productId: string, reviewId: string) => void;
  addReview: (productId: string, review: import('@/types').Review) => void;
  toggleReviewVerified: (productId: string, reviewId: string) => void;
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

      addProduct: (newProductData) => {
        const id = newProductData.id || `mewak-${Date.now()}`;
        const rawSlug =
          newProductData.slug ||
          newProductData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const slug = rawSlug || `product-${Date.now()}`;

        // Ensure robust default arrays and fields
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

        set((state) => ({
          products: [createdProduct, ...state.products],
        }));

        notifyCatalogChange();
        return createdProduct;
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
        notifyCatalogChange();
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        notifyCatalogChange();
      },

      toggleStock: (id) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== id) return p;
            const allInStock = (p.sizes || []).every((s) => s.inStock);
            const updatedSizes = (p.sizes || []).map((s) => ({
              ...s,
              inStock: !allInStock,
              stockCount: !allInStock ? 15 : 0,
            }));
            return {
              ...p,
              sizes: updatedSizes,
            };
          }),
        }));
        notifyCatalogChange();
      },

      duplicateProduct: (id) => {
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

        set((state) => ({
          products: [duplicated, ...state.products],
        }));

        notifyCatalogChange();
        return duplicated;
      },

      resetToDefaults: () => {
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

      deleteReview: (productId, reviewId) => {
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

      addReview: (productId, review) => {
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

      toggleReviewVerified: (productId, reviewId) => {
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

// Setup client-side cross-tab synchronization listener
if (typeof window !== 'undefined') {
  // Listen for storage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      useProductStore.persist.rehydrate();
    }
  });

  // Listen for BroadcastChannel updates from other tabs
  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('mewak_catalog_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CATALOG_UPDATED') {
          useProductStore.persist.rehydrate();
        }
      };
    } catch {
      // Ignore broadcast channel errors in restricted environments
    }
  }

  // Listen for same-tab custom sync event
  window.addEventListener(SYNC_EVENT, () => {
    useProductStore.persist.rehydrate();
  });
}
