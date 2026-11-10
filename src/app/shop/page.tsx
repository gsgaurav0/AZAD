import React, { Suspense } from 'react';
import ListingView from '@/components/listing/ListingView';

export const metadata = {
  title: 'Shop All Hardware & Audio | Mewak',
  description:
    'Browse our full lineup of planar magnetic headphones, titanium 5G smartphones, sapphire smartwatches, and GaN power accessories.',
};

export default function ShopAllPage() {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <ListingView
        initialCategory="all"
        pageTitle="The Complete Hardware Lineup"
        pageSubtitle="Explore our full ecosystem of precision acoustic headphones, titanium smartphones, smartwatches, and fast charging docks."
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
