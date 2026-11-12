'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Product, Category } from '@/types';

interface AdminProductsTabProps {
  products: Product[];
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleStock: (id: string) => void;
  onDuplicateProduct: (id: string) => void;
  onResetDefaults: () => void;
}

export default function AdminProductsTab({
  products,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onToggleStock,
  onDuplicateProduct,
  onResetDefaults,
}: AdminProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Stock
      const hasStock = p.sizes.some((s) => s.inStock);
      if (stockFilter === 'in_stock' && !hasStock) return false;
      if (stockFilter === 'out_of_stock' && hasStock) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const categories: { label: string; value: Category | 'all'; count: number }[] = [
    { label: 'All Catalog', value: 'all', count: products.length },
    {
      label: 'Headphones',
      value: 'headphones',
      count: products.filter((p) => p.category === 'headphones').length,
    },
    {
      label: 'Smartphones',
      value: 'phones',
      count: products.filter((p) => p.category === 'phones').length,
    },
    {
      label: 'Smartwatches',
      value: 'smartwatches',
      count: products.filter((p) => p.category === 'smartwatches').length,
    },
    {
      label: 'Accessories',
      value: 'accessories',
      count: products.filter((p) => p.category === 'accessories').length,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-[#E5E0D8] p-4 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#2B1A16]/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, category, subcategory, chipset, or slug..."
            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2B1A16] placeholder-[#2B1A16]/40 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-[#2B1A16]/50 hover:text-[#2B1A16]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Stock Filter & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'in_stock' | 'out_of_stock')}
            className="bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3 py-2.5 text-xs text-[#2B1A16] outline-none font-medium"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <button
            onClick={onResetDefaults}
            title="Restore catalog to default 24 items"
            className="p-2.5 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] hover:bg-[#EFE8DD] text-[#2B1A16]/70 hover:text-[#2B1A16] text-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddModal}
            className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-[0.99] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setSelectedCategory(c.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedCategory === c.value
                ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16] shadow-sm'
                : 'bg-white text-[#2B1A16]/70 border-[#E5E0D8] hover:border-[#9A8029] hover:text-[#2B1A16]'
            }`}
          >
            <span>{c.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === c.value
                  ? 'bg-white/20 text-[#EFE8DD]'
                  : 'bg-[#FAF8F5] text-[#2B1A16]/60'
              }`}
            >
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between text-xs text-[#2B1A16]/60 bg-[#FAF8F5]">
          <div>
            Showing <span className="font-semibold text-[#2B1A16]">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold text-[#2B1A16]">{products.length}</span> products in catalog
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-[#DDD2C0] mx-auto mb-3" />
            <h3 className="font-serif text-lg text-[#2B1A16] font-bold">No Products Found</h3>
            <p className="text-xs text-[#2B1A16]/60 max-w-sm mx-auto mt-1 mb-4">
              No catalog items match your search or filter. Try clearing filters or add a new piece.
            </p>
            <button
              onClick={onOpenAddModal}
              className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs px-4 py-2 rounded-xl font-semibold uppercase tracking-wider"
            >
              Add New Product
            </button>
          </div>
        ) : (
          <>
            {/* Phone / Mobile Card Layout */}
            <div className="block lg:hidden divide-y divide-[#E5E0D8]">
              {filteredProducts.map((p) => {
                const hasStock = p.sizes.some((s) => s.inStock);
                const totalStock = p.sizes.reduce((acc, s) => acc + (s.stockCount || 0), 0);

                return (
                  <div key={`mobile-${p.id}`} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-xl bg-[#FAF8F5] border border-[#DDD2C0] overflow-hidden shrink-0">
                        <Image
                          src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'}
                          alt={p.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-block px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16] text-[9px] uppercase font-mono font-medium">
                            {p.category}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              hasStock
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                hasStock ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {hasStock ? `${totalStock || 'In'} Units` : 'Sold Out'}
                          </span>
                        </div>

                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="font-serif text-sm font-bold text-[#2B1A16] hover:text-[#9A8029] transition-colors mt-1 block truncate"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-[#2B1A16]/60 truncate">{p.subtitle}</p>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-mono text-sm font-bold text-[#2B1A16]">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          {p.originalPrice > p.price && (
                            <span className="text-[10px] text-[#2B1A16]/40 line-through">
                              ₹{p.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {p.discountPercent > 0 && (
                            <span className="text-[9px] font-bold text-[#B3402F] bg-[#B3402F]/10 px-1.5 py-0.2 rounded">
                              {p.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar for Mobile Card */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB] gap-2">
                      <button
                        onClick={() => onToggleStock(p.id)}
                        className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-lg border font-semibold transition-colors flex items-center gap-1 ${
                          hasStock
                            ? 'border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100'
                            : 'border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100'
                        }`}
                      >
                        {hasStock ? 'Mark Sold Out' : 'Restock Item'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDuplicateProduct(p.id)}
                          title="Duplicate"
                          className="p-1.5 text-[#2B1A16]/70 hover:text-[#2B1A16] rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(p)}
                          className="px-2.5 py-1.5 text-[#2B1A16] hover:text-[#9A8029] rounded-lg border border-[#DDD2C0] bg-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#9A8029]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-rose-600 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#2B1A16]/60 font-mono">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8] text-[#2B1A16]">
                {filteredProducts.map((p) => {
                  const hasStock = p.sizes.some((s) => s.inStock);
                  const totalStock = p.sizes.reduce((acc, s) => acc + (s.stockCount || 0), 0);

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors group">
                      {/* Product Info with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#DDD2C0] overflow-hidden shrink-0">
                            <Image
                              src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="font-serif text-sm font-bold text-[#2B1A16] hover:text-[#9A8029] transition-colors truncate block flex items-center gap-1.5"
                            >
                              <span>{p.name}</span>
                              <ExternalLink className="w-3 h-3 text-[#2B1A16]/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </Link>
                            <p className="text-[11px] text-[#2B1A16]/60 truncate mt-0.5">
                              {p.subtitle}
                            </p>
                            <span className="font-mono text-[10px] text-[#2B1A16]/40">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16] text-[10px] uppercase font-mono font-medium">
                          {p.category}
                        </span>
                        <div className="text-[11px] text-[#2B1A16]/60 mt-1">{p.subcategory}</div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-sm font-bold text-[#2B1A16]">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                        {p.originalPrice > p.price && (
                          <div className="text-[10px] text-[#2B1A16]/40 line-through">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                        {p.discountPercent > 0 && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-[#B3402F] bg-[#B3402F]/10 px-1.5 py-0.2 rounded">
                            {p.discountPercent}% OFF
                          </span>
                        )}
                      </td>

                      {/* Stock Status & Quick Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleStock(p.id)}
                          title="Click to toggle stock availability"
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                            hasStock
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {hasStock ? 'IN STOCK' : 'OUT OF STOCK'}
                        </button>
                        <div className="text-[10px] text-[#2B1A16]/50 font-mono mt-1">
                          {p.sizes.length} editions • ~{totalStock || (hasStock ? 25 : 0)} units
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isNew && (
                            <span className="bg-[#9A8029]/15 text-[#9A8029] text-[9px] font-bold px-2 py-0.5 rounded">
                              NEW
                            </span>
                          )}
                          {p.isTrending && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded">
                              TRENDING
                            </span>
                          )}
                          {p.isFeatured && (
                            <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded">
                              FEATURED
                            </span>
                          )}
                          {!p.isNew && !p.isTrending && !p.isFeatured && (
                            <span className="text-[10px] text-[#2B1A16]/40 font-mono">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onDuplicateProduct(p.id)}
                            title="Duplicate as new edition"
                            className="p-1.5 text-[#2B1A16]/60 hover:text-[#2B1A16] rounded-lg hover:bg-[#FAF8F5] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenEditModal(p)}
                            title="Edit Product Specifications"
                            className="p-1.5 text-[#2B1A16]/60 hover:text-[#9A8029] rounded-lg hover:bg-[#FAF8F5] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setProductToDelete(p)}
                            title="Delete Product"
                            className="p-1.5 text-[#2B1A16]/40 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-serif text-lg font-bold text-[#2B1A16]">
                Delete Hardware Item?
              </h4>
            </div>
            <p className="text-xs text-[#2B1A16]/80 leading-relaxed mb-4">
              Are you sure you want to remove{' '}
              <strong className="text-[#2B1A16]">&quot;{productToDelete.name}&quot;</strong> from
              the active Mewak catalog? This will remove it from all storefront listings immediately.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#DDD2C0] hover:bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
