'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingView from '@/components/listing/ListingView';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <ListingView
      searchQuery={query}
      pageTitle={query ? `Search: "${query}"` : 'Search Collections'}
      pageSubtitle={
        query
          ? `Discover garments, accessories, and silhouettes matching "${query}".`
          : 'Enter your inquiry to discover pieces by noble fabric, cut, or occasion.'
      }
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EFE8DD] py-20 text-center font-serif text-lg">
          Searching the Maison catalog...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
