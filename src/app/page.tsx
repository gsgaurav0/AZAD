import React from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import BentoCategories from '@/components/home/BentoCategories';
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel';
import ShopByOccasion from '@/components/home/ShopByOccasion';
import ShopTheLook from '@/components/home/ShopTheLook';
import TrendingGrid from '@/components/home/TrendingGrid';
import BrandStory from '@/components/home/BrandStory';
import InstagramGallery from '@/components/home/InstagramGallery';
import Testimonials from '@/components/home/Testimonials';

export default function HomePage() {
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
