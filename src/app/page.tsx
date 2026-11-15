'use client';

import React, { useEffect } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import BentoCategories from '@/components/home/BentoCategories';
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel';
import ShopByOccasion from '@/components/home/ShopByOccasion';
import ShopTheLook from '@/components/home/ShopTheLook';
import TrendingGrid from '@/components/home/TrendingGrid';
import BrandStory from '@/components/home/BrandStory';
import InstagramGallery from '@/components/home/InstagramGallery';
import Testimonials from '@/components/home/Testimonials';
import { useCMSStore } from '@/store/cmsStore';
import { useProductStore } from '@/store/productStore';

export default function HomePage() {
  const fetchCMS = useCMSStore((state) => state.fetchCMS);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchCMS();
    fetchProducts();
  }, [fetchCMS, fetchProducts]);

  return (
    <div className="flex flex-col w-full">
      <HeroBanner />
      <BentoCategories />
      <NewArrivalsCarousel />
      <ShopByOccasion />
      <ShopTheLook />
      <TrendingGrid />
      <BrandStory />
      <InstagramGallery />
      <Testimonials />
    </div>
  );
}
