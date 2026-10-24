'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
  ChevronDown,
  X,
  Star,
  Check,
  RotateCcw,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';
import { Category, Product } from '@/types';

interface ListingViewProps {
  initialCategory?: Category | 'all';
  searchQuery?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function ListingView({
  initialCategory = 'all',
  searchQuery = '',
  pageTitle,
  pageSubtitle,
}: ListingViewProps) {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter'); // 'new' | 'sale'
  const subcategoryParam = searchParams.get('sub');
  const occasionParam = searchParams.get('occasion');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(initialCategory);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    subcategoryParam ? [subcategoryParam] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(12000);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  // Sync category prop if route changes
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Extract distinct fabrics and fits across dataset
  const allFabrics = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS.forEach((p) => {
      if (p.fabric.includes('Silk')) set.add('Mulberry Silk');
      if (p.fabric.includes('Linen')) set.add('Belgian/French Linen');
      if (p.fabric.includes('Wool')) set.add('Merino/Cashmere Wool');
      if (p.fabric.includes('Cotton')) set.add('Organic Cotton');
      if (p.fabric.includes('Leather')) set.add('Florentine Leather');
    });
    return Array.from(set);
  }, []);

  const allFits = useMemo(() => {
    return ['Relaxed', 'Tailored', 'Slim', 'Oversized', 'Fluid A-Line'];
  }, []);

  const allColors = useMemo(() => {
    return [
      { name: 'Ochre Gold', hex: '#9A8029' },
      { name: 'Deep Espresso', hex: '#2B1A16' },
      { name: 'Ivory Sand', hex: '#FBF7F0' },
      { name: 'Camel Tan', hex: '#C29B72' },
      { name: 'Royal Navy', hex: '#1E293B' },
      { name: 'Crimson Red', hex: '#B3402F' },
      { name: 'Olive Green', hex: '#555543' },
    ];
  }, []);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Subcategories for current category
  const availableSubcategories = useMemo(() => {
    const relevant = PRODUCTS.filter((p) =>
      selectedCategory === 'all' ? true : p.category === selectedCategory
    );
    return Array.from(new Set(relevant.map((p) => p.subcategory)));
  }, [selectedCategory]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.subcategory.toLowerCase().includes(q) ||
          product.fabric.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Route params (new / sale / occasion)
      if (filterParam === 'new' && !product.isNew) return false;
      if (filterParam === 'sale' && product.discountPercent <= 0) return false;
      if (occasionParam && product.occasion.toLowerCase() !== occasionParam.toLowerCase()) return false;

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;

      // Subcategory filter
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategory)) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const hasSize = product.sizes.some((s) => selectedSizes.includes(s.size) && s.inStock);
        if (!hasSize) return false;
      }

      // Color filter
      if (selectedColors.length > 0) {
        const hasColor = product.colors.some((c) => selectedColors.includes(c.name));
        if (!hasColor) return false;
      }

      // Price filter
      if (product.price > priceRange) return false;

      // Fabric filter
      if (selectedFabrics.length > 0) {
        const matchesFabric = selectedFabrics.some((f) => {
          if (f.includes('Silk') && product.fabric.includes('Silk')) return true;
          if (f.includes('Linen') && product.fabric.includes('Linen')) return true;
          if (f.includes('Wool') && product.fabric.includes('Wool')) return true;
          if (f.includes('Cotton') && product.fabric.includes('Cotton')) return true;
          if (f.includes('Leather') && product.fabric.includes('Leather')) return true;
          return false;
        });
        if (!matchesFabric) return false;
      }

      // Fit filter
      if (selectedFits.length > 0) {
        const matchesFit = selectedFits.some((fit) =>
          product.fit.toLowerCase().includes(fit.toLowerCase())
        );
        if (!matchesFit) return false;
      }

      // Discount filter
      if (selectedDiscount > 0 && product.discountPercent < selectedDiscount) return false;

      // Rating filter
      if (selectedRating > 0 && product.rating < selectedRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0); // default 'featured'
    });
  }, [
    searchQuery,
    filterParam,
    occasionParam,
    selectedCategory,
    selectedSubcategories,
    selectedSizes,
    selectedColors,
    priceRange,
    selectedFabrics,
    selectedFits,
    selectedDiscount,
    selectedRating,
    sortBy,
  ]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const resetFilters = () => {
    setSelectedCategory(initialCategory);
    setSelectedSubcategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(12000);
    setSelectedFabrics([]);
    setSelectedFits([]);
    setSelectedDiscount(0);
    setSelectedRating(0);
    setSortBy('featured');
    setVisibleCount(12);
  };

  const activeFilterCount =
    (selectedCategory !== initialCategory ? 1 : 0) +
    selectedSubcategories.length +
    selectedSizes.length +
    selectedColors.length +
    (priceRange < 12000 ? 1 : 0) +
    selectedFabrics.length +
    selectedFits.length +
    (selectedDiscount > 0 ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const toggleFit = (fit: string) => {
    setSelectedFits((prev) =>
      prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit]
    );
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 8);
      setIsLoading(false);
    }, 400);
  };

  // Title fallback
  const computedTitle =
    pageTitle ||
    (searchQuery
      ? `Search results for "${searchQuery}"`
      : selectedCategory === 'all'
      ? 'The Complete Haute Collection'
      : `${selectedCategory.toUpperCase()} Silhouette Catalog`);

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-8 md:py-12 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#2B1A16]/60 mb-6 font-sans">
          <Link href="/" className="hover:text-[#9A8029]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#9A8029]">
            Shop
          </Link>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-[#2B1A16] font-medium capitalize">
                {selectedCategory}
              </span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-[#DDD2C0]">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B1A16] font-normal capitalize">
              {computedTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#2B1A16]/70 mt-2 font-sans max-w-xl">
              {pageSubtitle ||
                'Impeccable garments tailored in natural noble fibers. Filter by fit, shade, size, and architectural silhouette.'}
            </p>
          </div>
          <span className="text-xs text-[#2B1A16]/60 font-sans mt-3 md:mt-0 font-medium">
            Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} pieces
          </span>
        </div>

        {/* Action Controls Bar (Mobile Filter Toggle, Sort, Column Switchers) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#FBF7F0] border border-[#DDD2C0] p-3 rounded-[4px]">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold px-4 py-2 rounded-[3px] uppercase tracking-wider"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Active Filter Chips (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap text-xs">
            {activeFilterCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[#B3402F] hover:underline font-semibold text-xs mr-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All
                </button>
                {selectedSizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 bg-[#EFE8DD] border border-[#DDD2C0] text-[#2B1A16] px-2.5 py-1 rounded-[2px]"
                  >
                    Size: {s}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSize(s)} />
                  </span>
                ))}
                {selectedColors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 bg-[#EFE8DD] border border-[#DDD2C0] text-[#2B1A16] px-2.5 py-1 rounded-[2px]"
                  >
                    {c}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleColor(c)} />
                  </span>
                ))}
                {selectedSubcategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1 bg-[#EFE8DD] border border-[#DDD2C0] text-[#2B1A16] px-2.5 py-1 rounded-[2px]"
                  >
                    {sub}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSubcategory(sub)} />
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Sort Dropdown & Column Toggles */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="text-[#2B1A16]/60 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#DDD2C0] rounded-[3px] px-3 py-1.5 text-xs text-[#2B1A16] font-medium outline-none focus:border-[#9A8029]"
              >
                <option value="featured">Featured / Trending</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* Desktop Column Grid Toggle */}
            <div className="hidden sm:flex items-center border border-[#DDD2C0] rounded-[3px] bg-white overflow-hidden p-0.5">
              <button
                type="button"
                onClick={() => setColumns(2)}
                className={`p-1.5 transition-colors ${
                  columns === 2 ? 'bg-[#2B1A16] text-[#EFE8DD]' : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
                title="2 Columns"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setColumns(3)}
                className={`p-1.5 transition-colors ${
                  columns === 3 ? 'bg-[#2B1A16] text-[#EFE8DD]' : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
                title="3 Columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setColumns(4)}
                className={`p-1.5 transition-colors ${
                  columns === 4 ? 'bg-[#2B1A16] text-[#EFE8DD]' : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
                title="4 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDD2C0]">
              <span className="font-serif font-semibold text-base text-[#2B1A16]">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#B3402F] hover:underline font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                Collection
              </span>
              <div className="space-y-1 text-xs font-sans">
                {['all', 'women', 'men', 'kids', 'accessories'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat as Category | 'all')}
                    className={`w-full text-left py-1 px-2 rounded-[2px] capitalize transition-colors flex justify-between ${
                      selectedCategory === cat
                        ? 'bg-[#EFE8DD] text-[#9A8029] font-bold'
                        : 'text-[#2B1A16]/80 hover:bg-[#EFE8DD]/50'
                    }`}
                  >
                    <span>{cat === 'all' ? 'All Collections' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            {availableSubcategories.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                  Categories
                </span>
                <div className="space-y-1 max-h-44 overflow-y-auto text-xs font-sans">
                  {availableSubcategories.map((sub) => {
                    const isChecked = selectedSubcategories.includes(sub);
                    return (
                      <label
                        key={sub}
                        className="flex items-center gap-2 py-1 cursor-pointer text-[#2B1A16]/80 hover:text-[#2B1A16]"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubcategory(sub)}
                          className="w-3.5 h-3.5 rounded-[2px] accent-[#9A8029]"
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Filter */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                Size
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {allSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`py-1.5 text-xs font-semibold rounded-[2px] border transition-colors ${
                        isSelected
                          ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                          : 'bg-white border-[#DDD2C0] text-[#2B1A16] hover:border-[#9A8029]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                Color Palette
              </span>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#2B1A16] ring-2 ring-[#9A8029]'
                          : 'border-[#DDD2C0] hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 mb-2 font-sans">
                <span>Max Price</span>
                <span className="text-[#9A8029] font-bold">₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={12000}
                step={500}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#9A8029] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#2B1A16]/50 mt-1 font-sans">
                <span>₹1,000</span>
                <span>₹12,000</span>
              </div>
            </div>

            {/* Fabric Filter */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                Noble Fabrics
              </span>
              <div className="space-y-1 text-xs font-sans">
                {allFabrics.map((fabric) => (
                  <label
                    key={fabric}
                    className="flex items-center gap-2 py-1 cursor-pointer text-[#2B1A16]/80 hover:text-[#2B1A16]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fabric)}
                      onChange={() => toggleFabric(fabric)}
                      className="w-3.5 h-3.5 rounded-[2px] accent-[#9A8029]"
                    />
                    <span>{fabric}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fit Filter */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                Silhouette & Fit
              </span>
              <div className="space-y-1 text-xs font-sans">
                {allFits.map((fit) => (
                  <label
                    key={fit}
                    className="flex items-center gap-2 py-1 cursor-pointer text-[#2B1A16]/80 hover:text-[#2B1A16]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFits.includes(fit)}
                      onChange={() => toggleFit(fit)}
                      className="w-3.5 h-3.5 rounded-[2px] accent-[#9A8029]"
                    />
                    <span>{fit}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                Minimum Rating
              </span>
              <div className="space-y-1 text-xs font-sans">
                {[4.5, 4.0].map((starVal) => (
                  <label
                    key={starVal}
                    className="flex items-center gap-2 py-1 cursor-pointer text-[#2B1A16]/80"
                  >
                    <input
                      type="radio"
                      name="minRating"
                      checked={selectedRating === starVal}
                      onChange={() => setSelectedRating(starVal)}
                      className="w-3.5 h-3.5 accent-[#9A8029]"
                    />
                    <div className="flex items-center gap-1 text-[#9A8029]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{starVal}★ & above</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-12 text-center my-8">
                <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#2B1A16] mb-2">
                  No garments match your filters
                </h3>
                <p className="text-xs sm:text-sm text-[#2B1A16]/70 max-w-md mx-auto mb-6 font-sans">
                  Try adjusting your price range, clearing selected shades or sizes to explore more pieces from our catalog.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-[4px] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    columns === 2
                      ? 'grid-cols-2'
                      : columns === 3
                      ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Button */}
                {displayedProducts.length < filteredProducts.length && (
                  <div className="text-center mt-12 pt-8 border-t border-[#DDD2C0]">
                    <p className="text-xs text-[#2B1A16]/60 mb-4 font-sans">
                      Showing {displayedProducts.length} of {filteredProducts.length} pieces
                    </p>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleLoadMore}
                      className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Loading Atelier Edits...' : 'Load More Garments'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#2B1A16]/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-[#FBF7F0] rounded-t-xl shadow-2xl flex flex-col z-10 animate-slideUp">
            <div className="p-4 border-b border-[#DDD2C0] flex items-center justify-between">
              <span className="font-serif font-semibold text-base text-[#2B1A16]">
                Filters ({activeFilterCount})
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#2B1A16]/70 hover:text-[#2B1A16]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                  Collection
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['all', 'women', 'men', 'kids', 'accessories'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat as Category | 'all')}
                      className={`py-2 px-3 rounded-[3px] capitalize border text-left ${
                        selectedCategory === cat
                          ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                          : 'bg-white border-[#DDD2C0] text-[#2B1A16]'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 block mb-2 font-sans">
                  Size
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-xs font-semibold rounded-[3px] border ${
                        selectedSizes.includes(size)
                          ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                          : 'bg-white border-[#DDD2C0] text-[#2B1A16]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/70 mb-2 font-sans">
                  <span>Max Price</span>
                  <span className="text-[#9A8029]">₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={12000}
                  step={500}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#9A8029]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#DDD2C0] bg-[#EFE8DD] flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-3 border border-[#2B1A16] text-[#2B1A16] text-xs font-semibold uppercase tracking-wider rounded-[3px]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider rounded-[3px]"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
