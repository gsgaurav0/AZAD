import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ListingView from '@/components/listing/ListingView';
import { Category } from '@/types';
import { CATEGORIES_CONFIG } from '@/data/products';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const config = CATEGORIES_CONFIG.find((c) => c.slug === category);
  if (!config) {
    return { title: 'Collections | MewaK' };
  }
  return {
    title: `${config.name} Collection | MewaK Atelier`,
    description: config.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const validCategories: Category[] = ['women', 'men', 'kids', 'accessories'];

  if (!validCategories.includes(category as Category)) {
    notFound();
  }

  const categoryConfig = CATEGORIES_CONFIG.find((c) => c.slug === category);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFE8DD] py-20 text-center font-serif text-lg">Curating pieces...</div>}>
      <ListingView
        initialCategory={category as Category}
        pageTitle={`${categoryConfig?.name || category} Collection`}
        pageSubtitle={categoryConfig?.description}
      />
    </Suspense>
  );
}
