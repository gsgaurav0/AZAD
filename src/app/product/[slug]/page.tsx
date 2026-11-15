import React from 'react';
import ProductClientWrapper from '@/components/product/ProductClientWrapper';
import { PRODUCTS } from '@/data/products';
import { createAdminClient } from '@/lib/supabase/admin';
import { Product, Category, Occasion } from '@/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function findProduct(slugOrId: string): Promise<Product | null> {
  const local = PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (local) return local;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('products')
      .select('*')
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .maybeSingle();

    if (data) {
      const { data: revs } = await admin.from('reviews').select('*').eq('product_id', data.id);
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        subtitle: data.subtitle || '',
        category: data.category as Category,
        subcategory: data.subcategory || 'Hardware',
        price: Number(data.price),
        originalPrice: Number(data.original_price || data.price),
        discountPercent: data.discount_percent || 0,
        isNew: Boolean(data.is_new),
        isTrending: Boolean(data.is_trending),
        isFeatured: Boolean(data.is_featured),
        occasion: (data.occasion as Occasion) || 'Everyday',
        rating: Number(data.rating || 5.0),
        reviewCount: data.review_count || 0,
        colors: Array.isArray(data.colors) ? data.colors : [],
        sizes: Array.isArray(data.sizes) ? data.sizes : [],
        images: Array.isArray(data.images) ? data.images : [],
        fabric: data.fabric || '',
        fit: data.fit || '',
        care: Array.isArray(data.care) ? data.care : [],
        description: data.description || '',
        details: Array.isArray(data.details) ? data.details : [],
        returns: data.returns || '',
        reviews: Array.isArray(revs)
          ? revs.map((r: any) => ({
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
      };
    }
  } catch (err) {
    console.warn('Dynamic product lookup notice:', err);
  }

  return null;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) {
    return { title: 'Product Details | Mewak' };
  }

  return {
    title: `${product.name} | Mewak Electronics`,
    description: product.description,
    openGraph: {
      title: `${product.name} - Mewak Electronics`,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findProduct(slug);

  return <ProductClientWrapper slug={slug} initialProduct={product} />;
}
