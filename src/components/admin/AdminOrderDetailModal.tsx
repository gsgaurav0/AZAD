'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Send,
  Edit2,
  Save,
  Package,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface AdminOrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

export default function AdminOrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateOrder,
}: AdminOrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status || 'Placed');
  const [statusNote, setStatusNote] = useState('');
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');

  if (!isOpen || !order) return null;

  const handleApplyStatus = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(order.id, selectedStatus, statusNote.trim() || undefined);
    setStatusNote('');
  };

  const handleSaveTracking = () => {
    onUpdateOrder(order.id, { trackingNumber: trackingNumber.trim() });
    setIsEditingTracking(false);
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Packed':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Out for Delivery':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-[#E5E0D8] w-full max-w-4xl rounded-2xl shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <span className="font-mono text-xs uppercase tracking-wider text-[#9A8029] font-bold">
                ORDER #{order.id}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              <span className="text-[#DDD2C0]">•</span>
              <span className="text-xs text-[#2B1A16]/60">{order.date}</span>
            </div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#2B1A16] mt-1">
              Fulfillment & Dispatch Inspection
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#2B1A16]/50 hover:text-[#2B1A16] rounded-xl hover:bg-[#EFE8DD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Changer & Quick Actions Bar */}
          <div className="bg-[#FAF8F5] border border-[#DDD2C0] p-5 rounded-2xl">
            <h3 className="font-semibold text-[#2B1A16] mb-3 flex items-center justify-between">
              <span>Update Fulfillment State</span>
              <span className="text-[11px] text-[#2B1A16]/50 font-normal">
                Changes propagate immediately to patron account timeline
              </span>
            </h3>

            <form onSubmit={handleApplyStatus} className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  'Placed',
                  'Packed',
                  'Shipped',
                  'Out for Delivery',
                  'Delivered',
                  'Cancelled',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s as OrderStatus)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selectedStatus === s
                        ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16] shadow-sm'
                        : 'bg-white text-[#2B1A16]/70 border-[#DDD2C0] hover:border-[#9A8029]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder={`Optional audit note (e.g. "Scanned at Delhi logistics hub", "Handed to courier")`}
                  className="flex-1 bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2.5 text-xs text-[#2B1A16] outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs px-5 py-2.5 rounded-xl font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Status
                </button>
              </div>
            </form>
          </div>

          {/* Grid: Customer Details & Tracking Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer & Delivery Address */}
            <div className="bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2B1A16]/70 border-b border-[#E5E0D8] pb-2">
                <User className="w-3.5 h-3.5 text-[#9A8029]" />
                <span>Recipient & Shipping Address</span>
              </div>

              <div className="space-y-1.5">
                <p className="font-serif text-base font-bold text-[#2B1A16]">
                  {order.address?.name || 'Valued Patron'}
                </p>
                <p className="text-[#2B1A16]/70 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#2B1A16]/40" />
                  <span>{order.address?.phone || '+91 98765 43210'}</span>
                </p>
                <div className="flex items-start gap-2 pt-1 text-[#2B1A16]/80">
                  <MapPin className="w-3.5 h-3.5 text-[#9A8029] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {order.address?.street}, {order.address?.locality}
                    <br />
                    {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                    <span className="ml-2 inline-block bg-[#FAF8F5] border border-[#DDD2C0] text-[10px] text-[#2B1A16] px-1.5 py-0.5 rounded font-mono">
                      {order.address?.type || 'Home'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Logistics & Tracking */}
            <div className="bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2B1A16]/70 border-b border-[#E5E0D8] pb-2">
                <Truck className="w-3.5 h-3.5 text-[#9A8029]" />
                <span>Express Logistics & Tracking</span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-[#2B1A16]/50 block">Logistics Partner</span>
                  <span className="font-semibold text-[#2B1A16]">BlueDart Express Air / Delhivery</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#2B1A16]/50 block">Tracking / AWB Number</span>
                  {isEditingTracking ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-1 bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1 text-xs text-[#2B1A16] font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSaveTracking}
                        className="bg-[#2B1A16] text-white text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-[#9A8029] font-bold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#DDD2C0]">
                        {order.trackingNumber || 'UNASSIGNED'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingTracking(true)}
                        className="p-1 text-[#2B1A16]/50 hover:text-[#2B1A16] rounded hover:bg-[#FAF8F5]"
                        title="Edit tracking number"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-[#2B1A16]/50 block">Payment Method</span>
                  <div className="flex items-center gap-2 text-[#2B1A16]/80">
                    <CreditCard className="w-3.5 h-3.5 text-[#9A8029]" />
                    <span className="font-semibold">{order.paymentMethod}</span>
                    {order.paymentId && (
                      <span className="font-mono text-[10px] text-[#2B1A16]/50">({order.paymentId})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B1A16] flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-[#9A8029]" />
                <span>Ordered Line Items ({order.items.length})</span>
              </h4>
            </div>

            <div className="divide-y divide-[#E5E0D8]">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#DDD2C0] overflow-hidden shrink-0">
                      <Image
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'}
                        alt={item.product?.name || 'Product'}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-serif text-sm font-bold text-[#2B1A16]">
                        {item.product?.name || 'Mewak Hardware Product'}
                      </p>
                      <div className="text-xs text-[#2B1A16]/60 flex items-center gap-2 mt-0.5">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#DDD2C0] text-[10px]">
                          Color: {item.selectedColor}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#DDD2C0] text-[10px]">
                          Edition: {item.selectedSize}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-[#2B1A16]">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-[#2B1A16]/50">
                      ₹{(item.product?.price || 0).toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="bg-[#FAF8F5] p-4 border-t border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 text-[#2B1A16]/70">
                <div>Subtotal: ₹{order.subtotal.toLocaleString('en-IN')}</div>
                {order.discount > 0 && (
                  <div className="text-[#B3402F]">
                    Discount: -₹{order.discount.toLocaleString('en-IN')}{' '}
                    {order.couponCode && `(${order.couponCode})`}
                  </div>
                )}
                <div>Shipping Fee: {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#2B1A16]/50 block">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-[#2B1A16]">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B1A16]/70 border-b border-[#E5E0D8] pb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#9A8029]" />
              <span>Diagnostic & Fulfillment Journey Audit</span>
            </h4>

            <div className="space-y-3 pt-2">
              {order.statusHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      step.completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#FAF8F5] text-zinc-400 border border-[#DDD2C0]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold ${
                          step.completed ? 'text-[#2B1A16]' : 'text-zinc-400'
                        }`}
                      >
                        {step.status}
                      </span>
                      <span className="text-[11px] text-[#2B1A16]/50 font-mono">
                        {step.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#2B1A16]/70 mt-0.5">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] bg-[#FAF8F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
