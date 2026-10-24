import React, { Suspense } from 'react';
import ListingView from '@/components/listing/ListingView';

export const metadata = {
  title: 'Shop All Haute Collections | MewaK Atelier',
  description:
    'Browse our full collection of noble Mulberry silks, Italian wool blazers, handloom Chanderi sarees, and organic linens.',
};

export default function ShopAllPage() {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <ListingView
        initialCategory="all"
        pageTitle="The Complete Atelier Collection"
        pageSubtitle="Explore our full wardrobe of handcrafted garments, architectural outerwear, and slow-crafted accessories."
      />
    </Suspense>
  );
}

function ListingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-10 bg-[#DDD2C0]/50 w-1/3 mb-4 rounded" />
      <div className="h-4 bg-[#DDD2C0]/30 w-1/2 mb-12 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-[#DDD2C0]/40 rounded" />
        ))}
      </div>
    </div>
  );
}
