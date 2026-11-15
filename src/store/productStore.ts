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
        const supabase = getBrowserClient();
        set({ isLoading: true });

        try {
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
          console.warn('Supabase fetchProducts notice:', err);
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

        // Insert into Supabase
        const supabase = getBrowserClient();
        try {
          await supabase.from('products').insert({
            id: createdProduct.id,
            slug: createdProduct.slug,
            name: createdProduct.name,
            subtitle: createdProduct.subtitle,
            category: createdProduct.category,
            subcategory: createdProduct.subcategory,
            price: createdProduct.price,
            original_price: createdProduct.originalPrice,
            discount_percent: createdProduct.discountPercent,
            is_new: createdProduct.isNew,
            is_trending: createdProduct.isTrending,
            is_featured: createdProduct.isFeatured,
            occasion: createdProduct.occasion,
            rating: createdProduct.rating,
            review_count: createdProduct.reviewCount,
            colors: createdProduct.colors,
            sizes: createdProduct.sizes,
            images: createdProduct.images,
            fabric: createdProduct.fabric,
            fit: createdProduct.fit,
            care: createdProduct.care,
            description: createdProduct.description,
            details: createdProduct.details,
            returns: createdProduct.returns,
            in_stock: true,
          });
        } catch (err) {
          console.warn('Supabase product insert notice:', err);
        }

        set((state) => ({
          products: [createdProduct, ...state.products],
        }));

        notifyCatalogChange();
        return createdProduct;
      },

      updateProduct: async (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));

        const supabase = getBrowserClient();
        try {
          const dbUpdates: any = { updated_at: new Date().toISOString() };
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
          if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
          if (updates.category !== undefined) dbUpdates.category = updates.category;
          if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
          if (updates.price !== undefined) dbUpdates.price = updates.price;
          if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
          if (updates.discountPercent !== undefined) dbUpdates.discount_percent = updates.discountPercent;
          if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
          if (updates.isTrending !== undefined) dbUpdates.is_trending = updates.isTrending;
          if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
          if (updates.occasion !== undefined) dbUpdates.occasion = updates.occasion;
          if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
          if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
          if (updates.images !== undefined) dbUpdates.images = updates.images;
          if (updates.fabric !== undefined) dbUpdates.fabric = updates.fabric;
          if (updates.fit !== undefined) dbUpdates.fit = updates.fit;
          if (updates.care !== undefined) dbUpdates.care = updates.care;
          if (updates.description !== undefined) dbUpdates.description = updates.description;
          if (updates.details !== undefined) dbUpdates.details = updates.details;
          if (updates.returns !== undefined) dbUpdates.returns = updates.returns;

          await supabase.from('products').update(dbUpdates).eq('id', id);
        } catch (err) {
          console.warn('Supabase product update notice:', err);
        }

        notifyCatalogChange();
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));

        const supabase = getBrowserClient();
        try {
          await supabase.from('products').delete().eq('id', id);
        } catch (err) {
          console.warn('Supabase product delete notice:', err);
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
        const supabase = getBrowserClient();
        try {
          await supabase.from('reviews').delete().eq('id', reviewId);
        } catch {}

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
        const supabase = getBrowserClient();
        try {
          await supabase.from('reviews').insert({
            product_id: productId,
            user_name: review.userName,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            verified: review.verified,
            helpful_count: review.helpfulCount || 0,
            status: 'approved',
          });
        } catch (err) {
          console.warn('Supabase review insert notice:', err);
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
          const supabase = getBrowserClient();
          try {
            await supabase.from('reviews').update({ verified: !review.verified }).eq('id', reviewId);
          } catch {}
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
