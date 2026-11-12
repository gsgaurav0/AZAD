'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  Filter,
  Check,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useUIStore } from '@/store/uiStore';
import { Review, Product } from '@/types';

interface FlattenedReview {
  review: Review;
  product: Product;
}

export default function AdminReviewsTab() {
  const { products, deleteReview, addReview, toggleReviewVerified } = useProductStore();
  const addToast = useUIStore((state) => state.addToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New review form
  const [targetProduct, setTargetProduct] = useState<string>(products[0]?.id || '');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newVerified, setNewVerified] = useState(true);

  // Extract all reviews across all products
  const allReviews: FlattenedReview[] = useMemo(() => {
    const list: FlattenedReview[] = [];
    products.forEach((p) => {
      (p.reviews || []).forEach((r) => {
        list.push({ review: r, product: p });
      });
    });
    return list;
  }, [products]);

  // Statistics
  const totalCount = allReviews.length;
  const avgRating =
    totalCount > 0
      ? (allReviews.reduce((sum, item) => sum + item.review.rating, 0) / totalCount).toFixed(1)
      : '5.0';
  const fiveStarCount = allReviews.filter((item) => item.review.rating === 5).length;
  const fourStarCount = allReviews.filter((item) => item.review.rating === 4).length;
  const verifiedCount = allReviews.filter((item) => item.review.verified).length;

  // Filtered reviews
  const filtered = useMemo(() => {
    return allReviews.filter(({ review, product }) => {
      if (selectedProductId !== 'all' && product.id !== selectedProductId) return false;
      if (ratingFilter !== 'all' && review.rating !== ratingFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          review.userName.toLowerCase().includes(q) ||
          review.title.toLowerCase().includes(q) ||
          review.comment.toLowerCase().includes(q) ||
          product.name.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allReviews, selectedProductId, ratingFilter, searchQuery]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct || !newAuthor.trim() || !newComment.trim()) return;

    const created: Review = {
      id: `rev-${Date.now()}`,
      userName: newAuthor.trim(),
      rating: newRating,
      title: newTitle.trim() || 'Verified Purchase Feedback',
      comment: newComment.trim(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      verified: newVerified,
      helpfulCount: 1,
    };

    addReview(targetProduct, created);
    const prod = products.find((p) => p.id === targetProduct);
    addToast(`Published verified review for "${prod?.name || 'Product'}"`, 'success');

    setIsAddModalOpen(false);
    setNewAuthor('');
    setNewTitle('');
    setNewComment('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Statistics */}
      <div className="bg-white border border-[#E5E0D8] p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-0.5 rounded font-bold">
                PATRON REVIEWS & RATINGS ENGINE
              </span>
              <span className="text-xs text-[#2B1A16]/60">Catalog Sentiment Moderation</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2B1A16]">
              All Product Reviews ({totalCount})
            </h2>
            <p className="text-xs text-[#2B1A16]/70 mt-1 max-w-2xl leading-relaxed">
              Inspect, moderate, and publish verified customer reviews across every hardware piece in your store. Ratings sync directly to product cards and Google search rich snippets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Verified Review</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E5E0D8]">
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0]">
            <span className="text-[10px] uppercase font-semibold text-[#2B1A16]/60 block mb-1">
              Storewide Rating
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif text-[#2B1A16]">{avgRating}</span>
              <span className="text-xs text-[#9A8029] font-bold">★ / 5.0</span>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0]">
            <span className="text-[10px] uppercase font-semibold text-[#2B1A16]/60 block mb-1">
              Total Reviews
            </span>
            <span className="text-2xl font-bold font-serif text-[#2B1A16]">{totalCount}</span>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0]">
            <span className="text-[10px] uppercase font-semibold text-[#2B1A16]/60 block mb-1">
              5-Star Raves
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-serif text-emerald-800">{fiveStarCount}</span>
              <span className="text-[11px] text-[#2B1A16]/60">
                ({totalCount > 0 ? Math.round((fiveStarCount / totalCount) * 100) : 100}%)
              </span>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0]">
            <span className="text-[10px] uppercase font-semibold text-[#2B1A16]/60 block mb-1">
              Verified Patrons
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-serif text-[#9A8029]">{verifiedCount}</span>
              <span className="text-[11px] text-[#2B1A16]/60">owners</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E0D8] p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#2B1A16]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patron name, title, comment keywords, or product name..."
              className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#2B1A16] outline-none"
            />
          </div>

          {/* Product Filter Dropdown */}
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="bg-[#FAF8F5] border border-[#DDD2C0] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
          >
            <option value="all">All Hardware Products ({products.length})</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({(p.reviews || []).length} reviews)
              </option>
            ))}
          </select>

          {/* Star Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0 text-xs font-semibold">
            {(['all', 5, 4, 3] as const).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingFilter(star)}
                className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1 ${
                  ratingFilter === star
                    ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                    : 'bg-white border-[#DDD2C0] text-[#2B1A16]/70 hover:bg-[#FAF8F5]'
                }`}
              >
                {star === 'all' ? (
                  <span>All Stars</span>
                ) : (
                  <>
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-current text-[#9A8029]" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Stream (Desktop + Mobile Cards) */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#2B1A16]/60 space-y-2">
            <MessageSquare className="w-10 h-10 text-[#9A8029]/50 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-[#2B1A16]">No Product Reviews Found</h4>
            <p className="text-xs">Try selecting another product or clearing your search filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E0D8]">
            {filtered.map(({ review, product }) => (
              <div
                key={`${product.id}-${review.id}`}
                className="p-5 sm:p-6 space-y-3 hover:bg-[#FAF8F5]/60 transition-colors"
              >
                {/* Header: Product link, Rating stars, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="font-bold text-xs sm:text-sm text-[#2B1A16] hover:text-[#9A8029] transition-colors flex items-center gap-1.5"
                      >
                        <span>{product.name}</span>
                        <ExternalLink className="w-3 h-3 text-[#2B1A16]/50" />
                      </Link>
                      <span className="text-[11px] text-[#2B1A16]/60 font-mono">
                        {product.subcategory} • ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-0.5 text-[#9A8029]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-[#2B1A16]/50 font-mono">{review.date}</span>
                  </div>
                </div>

                {/* Review Body */}
                <div className="pl-0 sm:pl-13 space-y-1.5">
                  <h4 className="font-bold text-sm text-[#2B1A16] flex items-center gap-2">
                    <span>{review.title}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-[#2B1A16]/80 leading-relaxed font-sans">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Footer Controls: Patron info, Verified badge toggle, Delete */}
                <div className="pl-0 sm:pl-13 pt-2 border-t border-[#E5E0D8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-[#2B1A16]">{review.userName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        toggleReviewVerified(product.id, review.id);
                        addToast(`Toggled verified status for ${review.userName}`, 'info');
                      }}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase transition-colors flex items-center gap-1 ${
                        review.verified
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                      title="Click to toggle Verified Patron badge"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{review.verified ? 'Verified Patron' : 'Unverified'}</span>
                    </button>
                    {review.helpfulCount > 0 && (
                      <span className="text-[11px] text-[#2B1A16]/60 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {review.helpfulCount} found helpful
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete review from "${review.userName}"?`)) {
                          deleteReview(product.id, review.id);
                          addToast(`Removed review from ${product.name}`, 'info');
                        }
                      }}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Review</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Verified Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#E5E0D8] w-full max-w-lg rounded-2xl shadow-2xl my-6 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5E0D8] flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#2B1A16]">
                Publish Verified Product Review
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#2B1A16]/60 hover:text-[#2B1A16]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">
                  Target Hardware Product *
                </label>
                <select
                  value={targetProduct}
                  onChange={(e) => setTargetProduct(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Reviewer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Vikramaditya Sen"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-xl px-3 py-2 text-xs font-bold outline-none text-[#9A8029]"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">
                  Review Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Acoustic perfection in a studio setting"
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-xl px-3 py-2 text-xs outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">
                  Review Narrative & Comment *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Describe acoustic dynamics, titanium chassis feel, battery endurance..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-xl p-3 text-xs outline-none"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD2C0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newVerified}
                  onChange={(e) => setNewVerified(e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
                <div>
                  <span className="font-semibold text-[#2B1A16] block">Verified Buyer Badge</span>
                  <span className="text-[10px] text-[#2B1A16]/60">Confirms official store purchase</span>
                </div>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD2C0] text-[#2B1A16] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-white font-semibold text-xs shadow-sm"
                >
                  Publish to Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

