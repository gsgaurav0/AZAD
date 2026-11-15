'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useProductStore } from '@/store/productStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import ProductDetailView from './ProductDetailView';

interface ProductClientWrapperProps {
  slug: string;
  initialProduct?: Product | null;
}

export default function ProductClientWrapper({ slug, initialProduct }: ProductClientWrapperProps) {
  const isMounted = useIsMounted();
  const getProduct = useProductStore((state) => state.getProductBySlugOrId);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const [dynamicProduct, setDynamicProduct] = React.useState<Product | null>(initialProduct || null);
  const [isSearching, setIsSearching] = React.useState(!initialProduct);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  React.useEffect(() => {
    if (initialProduct) {
      setDynamicProduct(initialProduct);
      setIsSearching(false);
      return;
    }

    const found = getProduct(slug);
    if (found) {
      setDynamicProduct(found);
      setIsSearching(false);
      return;
    }

    // Direct fetch from API
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setDynamicProduct(data.products[0]);
        }
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));
  }, [slug, initialProduct, getProduct]);

  const product = dynamicProduct || (isMounted ? getProduct(slug) : null) || initialProduct;

  if (isSearching || !isMounted) {
    return (
      <div className="min-h-screen bg-[#EFE8DD] flex items-center justify-center py-20 px-4">
        <div className="w-8 h-8 border-2 border-[#2B1A16] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#EFE8DD] flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[#2B1A16] mb-3">Hardware Edition Not Found</h1>
        <p className="text-xs uppercase tracking-widest text-[#2B1A16]/70 max-w-md mb-8">
          The requested electronic item or prototype may have been archived or updated in the catalog.
        </p>
        <Link
          href="/shop"
          className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded-[3px] transition-colors"
        >
          Explore All Hardware
        </Link>
      </div>
    );
  }

  return <ProductDetailView product={product} />;
}
