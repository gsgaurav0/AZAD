'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import { useCouponStore } from '@/store/couponStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function AppInitializer() {
  useEffect(() => {
    // 1. Initialize Supabase Auth & Session listener
    useAuthStore.getState().initializeAuth();

    // 2. Fetch live product catalog & reviews from Supabase
    useProductStore.getState().fetchProducts();

    // 3. Fetch active coupons from Supabase
    useCouponStore.getState().fetchCoupons();

    // 4. Sync Cart & Wishlist with Supabase if logged in
    useCartStore.getState().syncWithSupabase();
    useWishlistStore.getState().syncWithSupabase();
  }, []);

  return null;
}
