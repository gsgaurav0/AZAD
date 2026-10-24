import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetailView from '@/components/product/ProductDetailView';
import { PRODUCTS } from '@/data/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    return { title: 'Product Not Found | MewaK' };
  }

  return {
    title: `${product.name} | MewaK Atelier`,
    description: product.description,
    openGraph: {
      title: `${product.name} - MewaK Haute Couture`,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
