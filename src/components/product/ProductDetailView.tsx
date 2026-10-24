'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  ShoppingBag,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Share2,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';
import { Product, Review } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/products';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();

  // State
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.find((s) => s.inStock)?.size || product.sizes[0]?.size || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pincode Checker
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Accordions
  const [openAccordion, setOpenAccordion] = useState<'details' | 'care' | 'returns' | null>('details');

  // Customer Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Stores
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const openSizeGuide = useUIStore((state) => state.openSizeGuide);
  const addToast = useUIStore((state) => state.addToast);
  const addProductToRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);
  const allRecentlyViewed = useRecentlyViewedStore((state) => state.items);
  const recentlyViewed = useMemo(() => {
    return allRecentlyViewed.filter((p) => p.id !== product.id).slice(0, 4);
  }, [allRecentlyViewed, product.id]);

  // Record recently viewed
  useEffect(() => {
    addProductToRecentlyViewed(product);
  }, [product, addProductToRecentlyViewed]);

  const activeColorObj = product.colors.find((c) => c.name === selectedColor);
  const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);

  // Zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      const days = ['Friday', 'Saturday', 'Monday', 'Tuesday'];
      const deliveryDay = days[Math.floor(Math.random() * days.length)];
      setPincodeStatus(
        `Doorstep delivery by ${deliveryDay} to ${pincode.trim()} • Express dispatch & COD eligible.`
      );
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian delivery pincode.');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      addToast('Please select an available size', 'error');
      return;
    }
    addItem(product, selectedColor, selectedSize, quantity);
    addToast(`Added "${product.name}" (${selectedSize}) to your bag`, 'success');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      addToast('Please select an available size', 'error');
      return;
    }
    addItem(product, selectedColor, selectedSize, quantity);
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(product);
    addToast(
      added ? `Saved "${product.name}" to your wishlist` : 'Removed from wishlist',
      'info'
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Just now',
      title: 'Patron Review',
      comment: newReviewComment.trim(),
      verified: true,
      helpfulCount: 0,
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    addToast('Thank you. Your patron review has been published.', 'success');
  };

  // Complete the Look: recommend 2 products from complementary categories
  const completeTheLook = PRODUCTS.filter(
    (p) => p.category !== product.category && p.id !== product.id
  ).slice(0, 2);

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-8 md:py-12 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#2B1A16]/60 mb-6 font-sans">
          <Link href="/" className="hover:text-[#9A8029]">
            Home
          </Link>
          <span>/</span>
          <Link href={`/shop/${product.category}`} className="hover:text-[#9A8029] capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#2B1A16] font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Top Product Section: Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery (Thumbnails + Main Stage) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible shrink-0 pb-2 md:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-[3px] overflow-hidden border transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-[#9A8029] ring-2 ring-[#9A8029]'
                      : 'border-[#DDD2C0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage with Zoom Lens */}
            <div
              className="relative flex-1 aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DDD2C0] bg-[#DDD2C0]/20 shadow-md cursor-crosshair group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={`object-cover transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      }
                    : undefined
                }
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.isNew && (
                  <span className="bg-[#9A8029] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-[2px]">
                    NEW IN
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-[#B3402F] text-white text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-[2px]">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
                  isInWishlist
                    ? 'bg-[#B3402F] text-white shadow-md'
                    : 'bg-white/80 text-[#2B1A16] hover:bg-white hover:text-[#9A8029] shadow-xs'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Purchasing & Specifications */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Category, Occasion, Rating */}
              <div className="flex items-center justify-between text-xs text-[#2B1A16]/60 mb-2 font-sans">
                <span className="uppercase tracking-widest font-semibold">
                  {product.category} • {product.subcategory}
                </span>
                <div className="flex items-center gap-1.5 text-[#9A8029]">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-current'
                            : 'text-[#DDD2C0]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#2B1A16]">{product.rating}</span>
                  <span className="text-[#2B1A16]/50">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1A16] font-normal leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-[#2B1A16]/70 italic mt-1 font-sans">
                {product.subtitle}
              </p>

              {/* Price & Tax Note */}
              <div className="flex items-baseline gap-3 my-4">
                <span className="font-serif text-3xl font-bold text-[#2B1A16]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="line-through text-base text-[#2B1A16]/40 font-sans">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-xs font-semibold text-[#B3402F] bg-[#B3402F]/10 px-2 py-0.5 rounded-[2px]">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#2B1A16]/60 font-sans">
                Inclusive of all taxes. Free shipping on orders above ₹999.
              </p>
            </div>

            {/* Color Swatches */}
            <div className="pt-2 border-t border-[#DDD2C0]">
              <div className="flex items-center justify-between text-xs mb-2 font-sans">
                <span className="font-semibold uppercase tracking-wider text-[#2B1A16]/80">
                  Selected Shade: <strong className="text-[#2B1A16] normal-case">{selectedColor}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color.name);
                      if (color.image) setSelectedImage(color.image);
                    }}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                      selectedColor === color.name
                        ? 'border-[#2B1A16] ring-2 ring-[#9A8029]'
                        : 'border-[#DDD2C0] hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector + Size Guide */}
            <div className="pt-2 border-t border-[#DDD2C0]">
              <div className="flex items-center justify-between text-xs mb-2 font-sans">
                <span className="font-semibold uppercase tracking-wider text-[#2B1A16]/80">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={openSizeGuide}
                  className="flex items-center gap-1 text-[#9A8029] hover:underline font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Guide & Chart
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    disabled={!s.inStock}
                    onClick={() => setSelectedSize(s.size)}
                    className={`min-w-12 py-2 px-3 text-xs font-semibold rounded-[3px] border transition-all ${
                      !s.inStock
                        ? 'border-[#DDD2C0]/40 text-[#2B1A16]/30 line-through bg-[#DDD2C0]/20 cursor-not-allowed'
                        : selectedSize === s.size
                        ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16] shadow-sm'
                        : 'border-[#DDD2C0] bg-white text-[#2B1A16] hover:border-[#9A8029]'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>

              {selectedSizeObj?.stockCount !== undefined && selectedSizeObj.stockCount <= 3 && selectedSizeObj.stockCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-[#B3402F] font-semibold mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  Only {selectedSizeObj.stockCount} pieces left in atelier reserve!
                </div>
              )}
            </div>

            {/* Primary Action Buttons: Add to Bag & Buy Now */}
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-4 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] rounded-[4px] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Bag
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 bg-[#9A8029] hover:bg-[#7F6A1F] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-[4px] transition-colors shadow-sm text-center"
                >
                  Buy Now
                </button>
              </div>

              {/* Concierge Guarantee */}
              <div className="grid grid-cols-3 gap-2 py-3 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] text-center text-[10px] text-[#2B1A16]/70">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-[#9A8029]" />
                  <span>Free Shipping &gt; ₹999</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-[#DDD2C0]">
                  <RotateCcw className="w-4 h-4 text-[#9A8029]" />
                  <span>15-Day Free Returns</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#9A8029]" />
                  <span>Authentic Handloom</span>
                </div>
              </div>
            </div>

            {/* Pincode Delivery Availability Checker */}
            <div className="p-4 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2B1A16]/80 block font-sans">
                Check Delivery Timeline & COD
              </span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode (e.g. 110001)"
                  className="flex-1 bg-white border border-[#DDD2C0] rounded-[3px] px-3 py-1.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                />
                <button
                  type="submit"
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-4 py-1.5 rounded-[3px] transition-colors"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-xs text-[#2B1A16]/80 font-sans pt-1">
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* Accordions: Details, Fabric & Care, Returns */}
            <div className="pt-2 border-t border-[#DDD2C0] space-y-2 text-xs font-sans">
              {/* Accordion 1: Details */}
              <div className="border border-[#DDD2C0] rounded-[4px] bg-[#FBF7F0] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                  className="w-full p-3.5 flex items-center justify-between text-left font-serif font-semibold text-sm text-[#2B1A16]"
                >
                  <span>Sartorial Details & Specifications</span>
                  {openAccordion === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'details' && (
                  <div className="p-3.5 pt-0 text-[#2B1A16]/80 space-y-2 border-t border-[#DDD2C0]/40">
                    <p className="leading-relaxed">{product.description}</p>
                    <ul className="list-disc pl-4 space-y-1 pt-1">
                      {product.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Fabric & Care */}
              <div className="border border-[#DDD2C0] rounded-[4px] bg-[#FBF7F0] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                  className="w-full p-3.5 flex items-center justify-between text-left font-serif font-semibold text-sm text-[#2B1A16]"
                >
                  <span>Noble Fabric & Garment Care</span>
                  {openAccordion === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'care' && (
                  <div className="p-3.5 pt-0 text-[#2B1A16]/80 space-y-2 border-t border-[#DDD2C0]/40">
                    <div>
                      <strong>Composition:</strong> {product.fabric}
                    </div>
                    <div>
                      <strong>Tailored Fit:</strong> {product.fit}
                    </div>
                    <div>
                      <strong>Care Instructions:</strong>
                      <ul className="list-disc pl-4 space-y-1 mt-1">
                        {product.care.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Returns */}
              <div className="border border-[#DDD2C0] rounded-[4px] bg-[#FBF7F0] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'returns' ? null : 'returns')}
                  className="w-full p-3.5 flex items-center justify-between text-left font-serif font-semibold text-sm text-[#2B1A16]"
                >
                  <span>Doorstep Pickup, Returns & Exchanges</span>
                  {openAccordion === 'returns' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'returns' && (
                  <div className="p-3.5 pt-0 text-[#2B1A16]/80 space-y-2 border-t border-[#DDD2C0]/40">
                    <p>{product.returns}</p>
                    <p>
                      Complimentary door-to-door courier service across India. Items must remain unwashed with intact atelier seals.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Look Section */}
        {completeTheLook.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#DDD2C0]">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-1 font-sans">
                STYLIST RECOMMENDATION
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#2B1A16]">
                Complete The Look
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {completeTheLook.map((compProd) => (
                <ProductCard key={compProd.id} product={compProd} />
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews & Star Breakdown */}
        <div className="mt-20 pt-12 border-t border-[#DDD2C0]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews Summary & Form */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-1 font-sans">
                  PATRON REFLECTIONS
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#2B1A16]">
                  Verified Reviews
                </h3>
              </div>

              {/* Overall Score */}
              <div className="flex items-center gap-4 bg-[#FBF7F0] border border-[#DDD2C0] p-5 rounded-[4px]">
                <div className="font-serif text-5xl font-bold text-[#2B1A16]">
                  {product.rating}
                </div>
                <div>
                  <div className="flex text-[#9A8029] mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-[#2B1A16]/70 font-sans">
                    Based on {reviewsList.length} verified patron evaluations
                  </span>
                </div>
              </div>

              {/* Interactive Write Review Form */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-[4px]">
                <h4 className="font-serif text-base font-semibold text-[#2B1A16] mb-3">
                  Write a Patron Review
                </h4>
                <form onSubmit={handleAddReview} className="space-y-3 font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B1A16]/70 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      placeholder="e.g. Radhika Sethi"
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2B1A16]/70 mb-1">
                      Rating
                    </label>
                    <div className="flex gap-1 text-[#9A8029]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newReviewRating ? 'fill-current' : 'text-[#DDD2C0]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2B1A16]/70 mb-1">
                      Your Review
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Comment on the fabric drape, sizing, and stitching quality..."
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider py-2.5 rounded-[3px] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Review
                  </button>
                </form>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviewsList.length === 0 ? (
                <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-8 text-center text-xs text-[#2B1A16]/60 rounded-[4px]">
                  Be the first patron to review this archival piece.
                </div>
              ) : (
                reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#FBF7F0] border border-[#DDD2C0] p-5 rounded-[4px] space-y-2 font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#2B1A16]">
                          {rev.userName}
                        </span>
                        {rev.verified && (
                          <span className="text-[10px] text-[#4C7A34] font-semibold bg-[#4C7A34]/10 px-1.5 py-0.5 rounded-[2px]">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#2B1A16]/50">{rev.date}</span>
                    </div>

                    <div className="flex text-[#9A8029]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    {rev.title && (
                      <h5 className="font-serif font-medium text-xs text-[#2B1A16]">
                        {rev.title}
                      </h5>
                    )}

                    <p className="text-xs text-[#2B1A16]/80 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recently Viewed Carousel */}
        {recentlyViewed.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#DDD2C0]">
            <h3 className="font-serif text-2xl text-[#2B1A16] mb-8">
              Recently Viewed Pieces
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewed.map((rv) => (
                <ProductCard key={rv.id} product={rv} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Add To Cart Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#FBF7F0]/95 backdrop-blur-md border-t border-[#DDD2C0] p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="font-serif font-bold text-base text-[#2B1A16]">
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#2B1A16]/70 truncate max-w-[130px]">
            {selectedColor} • Size: {selectedSize || 'Choose size'}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="bg-[#9A8029] hover:bg-[#7F6A1F] text-white py-2.5 px-6 rounded-[3px] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Bag
        </button>
      </div>
    </div>
  );
}
