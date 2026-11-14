'use client';

import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Copy,
  Check,
  AlertCircle,
  Percent,
  DollarSign,
  TrendingUp,
  Sparkles,
  RotateCcw,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { useCouponStore } from '@/store/couponStore';
import { useUIStore } from '@/store/uiStore';
import { Coupon, CouponDiscountType } from '@/types/coupon';

export default function AdminCouponsTab() {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
    resetToDefaults,
  } = useCouponStore();
  const addToast = useUIStore((state) => state.addToast);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | CouponDiscountType>('all');

  // Modals & Confirmation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number>(200);
  const [expiresAt, setExpiresAt] = useState<string>('2026-12-31');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Metrics
  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const percentageCount = coupons.filter((c) => c.discountType === 'percentage').length;

  // Filtered List
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      if (typeFilter !== 'all' && c.discountType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        if (!matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [coupons, statusFilter, typeFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setMinOrderValue(1999);
    setMaxDiscount(3000);
    setUsageLimit(250);
    setExpiresAt('2026-12-31');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderValue(c.minOrderValue || 0);
    setMaxDiscount(c.maxDiscount || 0);
    setUsageLimit(c.usageLimit || 500);
    setExpiresAt(c.expiresAt || '');
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      addToast('Please enter a coupon code', 'error');
      return;
    }

    if (discountValue <= 0) {
      addToast('Discount value must be greater than zero', 'error');
      return;
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: discountType === 'percentage' && Number(maxDiscount) > 0 ? Number(maxDiscount) : undefined,
        usageLimit: Number(usageLimit) || undefined,
        expiresAt: expiresAt.trim() || undefined,
        isActive,
      });
      addToast(`Updated promo code "${code.trim().toUpperCase()}"`, 'success');
    } else {
      const created = addCoupon({
        code: code.trim().toUpperCase(),
        description: description.trim() || `${discountValue}${discountType === 'percentage' ? '%' : '₹'} discount code`,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: discountType === 'percentage' && Number(maxDiscount) > 0 ? Number(maxDiscount) : undefined,
        usageLimit: Number(usageLimit) || undefined,
        expiresAt: expiresAt.trim() || undefined,
        isActive,
      });
      addToast(`Created promo code "${created.code}"`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = (c: Coupon) => {
    const copyCode = `${c.code}_COPY`;
    addCoupon({
      ...c,
      code: copyCode,
      description: `${c.description} (Duplicate)`,
      isActive: true,
    });
    addToast(`Duplicated promo code into "${copyCode}"`, 'success');
  };

  const copyToClipboard = (codeStr: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(codeStr);
      setCopiedCode(codeStr);
      addToast(`Copied "${codeStr}" to clipboard`, 'success');
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 4 Metric Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Codes */}
        <div className="bg-white border border-[#E5E0D8] p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold font-mono">
              Total Coupons
            </span>
            <div className="p-2 rounded-xl bg-[#9A8029]/10 text-[#9A8029]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1A16]">
            {coupons.length}
          </div>
          <div className="text-[11px] text-[#2B1A16]/60 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">{activeCount} active</span>
            <span>•</span>
            <span>{coupons.length - activeCount} paused</span>
          </div>
        </div>

        {/* Card 2: Active Codes */}
        <div className="bg-white border border-[#E5E0D8] p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold font-mono">
              Active Promotions
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
            {activeCount}
          </div>
          <div className="text-[11px] text-[#2B1A16]/60 mt-1">
            Redeemable in Cart & Checkout
          </div>
        </div>

        {/* Card 3: Total Redemptions */}
        <div className="bg-white border border-[#E5E0D8] p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold font-mono">
              Total Redemptions
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1A16]">
            {totalRedemptions}
          </div>
          <div className="text-[11px] text-[#2B1A16]/60 mt-1">
            Patron purchases discounted
          </div>
        </div>

        {/* Card 4: Discount Structures */}
        <div className="bg-white border border-[#E5E0D8] p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold font-mono">
              Ratio (% / Flat)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1A16]">
            {percentageCount} <span className="text-base text-[#2B1A16]/40 font-normal">/ {coupons.length - percentageCount}</span>
          </div>
          <div className="text-[11px] text-[#2B1A16]/60 mt-1">
            Percentage vs Flat voucher codes
          </div>
        </div>
      </div>

      {/* Action Header & Filter Bar */}
      <div className="bg-white border border-[#E5E0D8] p-4 sm:p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#2B1A16]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by promo code or description (e.g. MEWAK10, WELCOME50)..."
              className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#2B1A16] outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16]/70 hover:text-[#2B1A16] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Reset to default store coupons"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-[0.99] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F5F2EB] flex-wrap">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-[11px] text-[#2B1A16]/50 uppercase tracking-wider font-mono mr-1">Status:</span>
            {[
              { id: 'all', label: `All (${coupons.length})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'inactive', label: `Paused (${coupons.length - activeCount})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl border transition-colors ${
                  statusFilter === st.id
                    ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                    : 'bg-white border-[#DDD2C0] text-[#2B1A16]/70 hover:bg-[#FAF8F5]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-[11px] text-[#2B1A16]/50 uppercase tracking-wider font-mono mr-1">Type:</span>
            {[
              { id: 'all', label: 'All Types' },
              { id: 'percentage', label: 'Percentage (%)' },
              { id: 'flat', label: 'Flat Cash (₹)' },
            ].map((tp) => (
              <button
                key={tp.id}
                type="button"
                onClick={() => setTypeFilter(tp.id as any)}
                className={`px-3 py-1.5 rounded-xl border transition-colors ${
                  typeFilter === tp.id
                    ? 'bg-[#9A8029] text-white border-[#9A8029]'
                    : 'bg-white border-[#DDD2C0] text-[#2B1A16]/70 hover:bg-[#FAF8F5]'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Table & Cards Container */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-[#2B1A16]/60 space-y-2">
            <Tag className="w-10 h-10 text-[#9A8029]/50 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-[#2B1A16]">No Coupons Found</h4>
            <p className="text-xs">Try adjusting your filters or click &ldquo;Create Promo Code&rdquo; above.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table Layout (hidden on mobile) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[#2B1A16]/70 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="p-4">Promo Code & Description</th>
                    <th className="p-4">Discount Value</th>
                    <th className="p-4">Eligibility / Min Order</th>
                    <th className="p-4">Redemptions</th>
                    <th className="p-4">Valid Until</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filteredCoupons.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors group">
                      {/* Code & Description */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#2B1A16] bg-[#FAF8F5] border border-[#DDD2C0] px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-[#9A8029]" />
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(c.code)}
                            title="Copy code"
                            className="p-1 text-[#2B1A16]/40 hover:text-[#9A8029] rounded transition-colors"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-[#2B1A16]/70 mt-1 max-w-xs leading-relaxed">
                          {c.description}
                        </p>
                      </td>

                      {/* Discount Value */}
                      <td className="p-4">
                        <div className="font-mono text-sm font-bold text-[#9A8029]">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue.toLocaleString('en-IN')} OFF`}
                        </div>
                        {c.discountType === 'percentage' && c.maxDiscount && (
                          <span className="text-[10px] text-[#2B1A16]/50 block">
                            Capped at ₹{c.maxDiscount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="p-4">
                        {c.minOrderValue && c.minOrderValue > 0 ? (
                          <div>
                            <span className="font-mono text-[11px] font-semibold text-[#2B1A16]">
                              ₹{c.minOrderValue.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-[#2B1A16]/50 block">Minimum Subtotal</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#2B1A16]/60 font-medium">
                            No Minimum
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="p-4">
                        <div className="flex items-baseline gap-1 font-mono text-xs">
                          <span className="font-bold text-[#2B1A16]">{c.usageCount}</span>
                          <span className="text-[#2B1A16]/40">/ {c.usageLimit || '∞'}</span>
                        </div>
                        {c.usageLimit && (
                          <div className="w-24 h-1.5 bg-[#FAF8F5] border border-[#DDD2C0] rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full bg-[#9A8029] rounded-full transition-all"
                              style={{ width: `${Math.min(100, (c.usageCount / c.usageLimit) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#2B1A16]/70">
                          <Calendar className="w-3.5 h-3.5 text-[#2B1A16]/40" />
                          <span>{c.expiresAt ? c.expiresAt : 'No Expiry'}</span>
                        </div>
                      </td>

                      {/* Toggle Active Status */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            toggleCouponActive(c.id);
                            addToast(
                              `Coupon "${c.code}" is now ${!c.isActive ? 'Active' : 'Paused'}`,
                              !c.isActive ? 'success' : 'info'
                            );
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border transition-colors ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                            }`}
                          />
                          <span>{c.isActive ? 'Active' : 'Paused'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(c)}
                            title="Duplicate"
                            className="p-1.5 text-[#2B1A16]/60 hover:text-[#2B1A16] rounded-lg border border-[#DDD2C0] hover:bg-[#FAF8F5] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit"
                            className="p-1.5 text-[#2B1A16]/60 hover:text-[#9A8029] rounded-lg border border-[#DDD2C0] hover:bg-[#FAF8F5] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCouponToDelete(c)}
                            title="Delete"
                            className="p-1.5 text-rose-600 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch-Friendly Card View (visible on small screens) */}
            <div className="lg:hidden divide-y divide-[#E5E0D8]">
              {filteredCoupons.map((c) => (
                <div key={`mobile-coupon-${c.id}`} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#2B1A16] bg-[#FAF8F5] border border-[#DDD2C0] px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-[#9A8029]" />
                      {c.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        toggleCouponActive(c.id);
                        addToast(
                          `Coupon "${c.code}" is now ${!c.isActive ? 'Active' : 'Paused'}`,
                          !c.isActive ? 'success' : 'info'
                        );
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border transition-colors ${
                        c.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                      />
                      <span>{c.isActive ? 'Active' : 'Paused'}</span>
                    </button>
                  </div>

                  <div>
                    <div className="font-mono text-base font-bold text-[#9A8029]">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue.toLocaleString('en-IN')} FLAT OFF`}
                    </div>
                    <p className="text-xs text-[#2B1A16]/75 mt-0.5 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#2B1A16]/70 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E5E0D8]/60">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#2B1A16]/40 block">Min Subtotal</span>
                      <span className="font-mono font-bold text-[#2B1A16]">
                        {c.minOrderValue ? `₹${c.minOrderValue.toLocaleString('en-IN')}` : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#2B1A16]/40 block">Redemptions</span>
                      <span className="font-mono font-bold text-[#2B1A16]">
                        {c.usageCount} / {c.usageLimit || '∞'}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB]">
                    <span className="text-[10px] text-[#2B1A16]/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {c.expiresAt ? `Exp: ${c.expiresAt}` : 'Never'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.code)}
                        className="p-1.5 rounded-lg border border-[#DDD2C0] bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#DDD2C0] bg-white text-xs font-semibold text-[#2B1A16] flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#9A8029]" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponToDelete(c)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#E5E0D8] w-full max-w-xl rounded-2xl shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 bg-[#FAF8F5] border-b border-[#E5E0D8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2 py-0.5 rounded font-bold">
                  {editingCoupon ? 'EDIT PROMO CODE' : 'CREATE PROMO CODE'}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2B1A16] mt-1">
                  {editingCoupon ? `Edit: ${editingCoupon.code}` : 'New Discount Code'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#2B1A16]/50 hover:text-[#2B1A16] rounded-xl hover:bg-[#EFE8DD] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCoupon} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Promo Code & Discount Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                    Promo Code (e.g. FLASH20) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="MEWAK20"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono uppercase font-bold text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                    Discount Structure *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        discountType === 'percentage'
                          ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                          : 'bg-white border-[#DDD2C0] text-[#2B1A16]/70'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percentage %</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        discountType === 'flat'
                          ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                          : 'bg-white border-[#DDD2C0] text-[#2B1A16]/70'
                      }`}
                    >
                      <span>₹ Flat Cash</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                  Public Description & Terms *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% off all planar headphones and wireless chargers"
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              {/* Discount Value & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                    {discountType === 'percentage' ? 'Discount Percentage (%) *' : 'Flat Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'percentage' ? 95 : 100000}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2B1A16] outline-none"
                  />
                </div>

                {discountType === 'percentage' ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                      Max Discount Cap (₹) <span className="text-[#2B1A16]/50 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxDiscount || ''}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      placeholder="e.g. 3000 (0 for no cap)"
                      className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-[#2B1A16] outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                      Minimum Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minOrderValue || ''}
                      onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      placeholder="e.g. 1999 (0 for none)"
                      className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-[#2B1A16] outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Min Order Value (if percentage) & Redemptions Quota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {discountType === 'percentage' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                      Minimum Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minOrderValue || ''}
                      onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      placeholder="e.g. 2499 (0 for none)"
                      className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-[#2B1A16] outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                    Usage Redemption Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit || ''}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded-xl border border-[#DDD2C0]">
                <div>
                  <span className="font-semibold text-xs text-[#2B1A16] block">
                    Enable Coupon on Storefront
                  </span>
                  <span className="text-[11px] text-[#2B1A16]/60">
                    When enabled, shoppers can apply this code during checkout and bag review.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isActive ? 'bg-[#9A8029] justify-end' : 'bg-zinc-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD2C0] hover:bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (NO window.confirm) */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#2B1A16]">
                  Delete Promo Code?
                </h4>
                <span className="font-mono text-xs text-[#9A8029] font-bold">
                  {couponToDelete.code}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#2B1A16]/80 leading-relaxed mb-4">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#2B1A16] font-mono">{couponToDelete.code}</strong> (
              {couponToDelete.description})? Customers will no longer be able to apply this coupon.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#DDD2C0] hover:bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCoupon(couponToDelete.id);
                  addToast(`Deleted promo code "${couponToDelete.code}"`, 'info');
                  setCouponToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Defaults Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#9A8029] mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#2B1A16]">
                Reset Coupons to Defaults?
              </h4>
            </div>
            <p className="text-xs text-[#2B1A16]/80 leading-relaxed mb-4">
              This will restore the 5 default promo codes (MEWAK10, WELCOME50, STUDIO20, VIP5000, AUDIO25) and reset redemptions.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#DDD2C0] hover:bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaults();
                  addToast('Restored default promo codes', 'info');
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

