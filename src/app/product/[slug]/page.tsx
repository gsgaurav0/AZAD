import React from 'react';
import ProductClientWrapper from '@/components/product/ProductClientWrapper';
import { PRODUCTS } from '@/data/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    return { title: 'Product Details | Mewak' };
  }

  return {
    title: `${product.name} | Mewak Electronics`,
    description: product.description,
    openGraph: {
      title: `${product.name} - Mewak Electronics`,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;

  return <ProductClientWrapper slug={slug} initialProduct={product} />;
}
