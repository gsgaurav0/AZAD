'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  CreditCard,
  Calendar,
  AlertCircle,
  Download,
  Package,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface AdminOrdersTabProps {
  orders: Order[];
  onOpenCreateOrderModal: () => void;
  onOpenOrderDetailModal: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onResetOrders: () => void;
}

export default function AdminOrdersTab({
  orders,
  onOpenCreateOrderModal,
  onOpenOrderDetailModal,
  onUpdateStatus,
  onDeleteOrder,
  onResetOrders,
}: AdminOrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          o.id.toLowerCase().includes(q) ||
          (o.address?.name && o.address.name.toLowerCase().includes(q)) ||
          (o.address?.phone && o.address.phone.toLowerCase().includes(q)) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
          (o.address?.city && o.address.city.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'all' && o.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const statusTabs: { label: string; value: OrderStatus | 'all'; count: number }[] = [
    { label: 'All Orders', value: 'all', count: orders.length },
    {
      label: 'Placed',
      value: 'Placed',
      count: orders.filter((o) => o.status === 'Placed').length,
    },
    {
      label: 'Packed',
      value: 'Packed',
      count: orders.filter((o) => o.status === 'Packed').length,
    },
    {
      label: 'Shipped',
      value: 'Shipped',
      count: orders.filter((o) => o.status === 'Shipped').length,
    },
    {
      label: 'Out for Delivery',
      value: 'Out for Delivery',
      count: orders.filter((o) => o.status === 'Out for Delivery').length,
    },
    {
      label: 'Delivered',
      value: 'Delivered',
      count: orders.filter((o) => o.status === 'Delivered').length,
    },
    {
      label: 'Cancelled',
      value: 'Cancelled',
      count: orders.filter((o) => o.status === 'Cancelled').length,
    },
  ];

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

  const exportOrdersJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mewak_orders_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
            placeholder="Search by Order ID (MWK-...), customer name, phone, city or tracking number..."
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

        {/* Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={exportOrdersJSON}
            title="Download orders JSON audit file"
            className="p-2.5 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] hover:bg-[#EFE8DD] text-[#2B1A16]/80 hover:text-[#2B1A16] text-xs transition-colors flex items-center gap-1.5 font-medium"
          >
            <Download className="w-3.5 h-3.5 text-[#9A8029]" />
            <span className="hidden sm:inline">Export Audit</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset orders stream back to default sample orders?')) {
                onResetOrders();
              }
            }}
            title="Reset orders to sample state"
            className="p-2.5 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] hover:bg-[#EFE8DD] text-[#2B1A16]/60 hover:text-[#2B1A16] text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCreateOrderModal}
            className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-[0.99] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Manual Order
          </button>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatusFilter(t.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
              statusFilter === t.value
                ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16] shadow-sm'
                : 'bg-white text-[#2B1A16]/70 border-[#E5E0D8] hover:border-[#9A8029] hover:text-[#2B1A16]'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === t.value
                  ? 'bg-white/20 text-[#EFE8DD]'
                  : 'bg-[#FAF8F5] text-[#2B1A16]/60'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between text-xs text-[#2B1A16]/60 bg-[#FAF8F5]">
          <div>
            Showing <span className="font-semibold text-[#2B1A16]">{filteredOrders.length}</span> of{' '}
            <span className="font-semibold text-[#2B1A16]">{orders.length}</span> recorded orders
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-[#DDD2C0] mx-auto mb-3" />
            <h3 className="font-serif text-lg text-[#2B1A16] font-bold">No Orders Found</h3>
            <p className="text-xs text-[#2B1A16]/60 max-w-sm mx-auto mt-1 mb-4">
              No orders matched your selected status or search term.
            </p>
            <button
              onClick={onOpenCreateOrderModal}
              className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs px-4 py-2 rounded-xl font-semibold uppercase tracking-wider"
            >
              Provision New Order
            </button>
          </div>
        ) : (
          <>
            {/* Mobile / Phone Card Layout */}
            <div className="block lg:hidden divide-y divide-[#E5E0D8]">
              {filteredOrders.map((o) => (
                <div key={`mobile-order-${o.id}`} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#9A8029]">{o.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#2B1A16]">
                        {o.address?.name || 'Valued Patron'}
                      </h4>
                      <p className="text-[11px] text-[#2B1A16]/60 mt-0.5">
                        {o.address?.phone || '+91 98765 43210'} • {o.address?.city || 'India'}
                      </p>
                      <p className="text-[10px] text-[#2B1A16]/40 flex items-center gap-1 mt-0.5 font-mono">
                        <Calendar className="w-3 h-3 text-[#2B1A16]/40" />
                        <span>{o.date}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-serif text-sm font-bold text-[#2B1A16]">
                        ₹{o.total.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#2B1A16]/60 mt-0.5">
                        {o.items.reduce((acc, i) => acc + i.quantity, 0)} items • {o.paymentMethod}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown & Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB] gap-2">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        onUpdateStatus(
                          o.id,
                          e.target.value as OrderStatus,
                          `Status updated to ${e.target.value}`
                        )
                      }
                      className="bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16] text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-medium flex-1 max-w-[160px]"
                    >
                      <option value="Placed">Placed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenOrderDetailModal(o)}
                        className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-[11px] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => setOrderToDelete(o)}
                        className="p-1.5 text-rose-600 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#2B1A16]/60 font-mono">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status & Action</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8] text-[#2B1A16]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF8F5]/80 transition-colors group">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-[#9A8029]">{o.id}</div>
                      <div className="text-[11px] text-[#2B1A16]/60 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#2B1A16]/40" />
                        <span>{o.date}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#2B1A16]/40 mt-0.5">
                        {o.trackingNumber || 'Pending AWB'}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-serif text-sm font-bold text-[#2B1A16]">
                        {o.address?.name || 'Valued Patron'}
                      </div>
                      <div className="text-[11px] text-[#2B1A16]/60 mt-0.5">
                        {o.address?.phone || '+91 98765 43210'}
                      </div>
                      <div className="text-[10px] text-[#2B1A16]/40 truncate max-w-[180px]">
                        {o.address?.city}, {o.address?.state}
                      </div>
                    </td>

                    {/* Items Thumbnails */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {o.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            title={`${item.product?.name} (${item.quantity}x)`}
                            className="relative w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#DDD2C0] overflow-hidden shrink-0"
                          >
                            <Image
                              src={
                                item.product?.images?.[0] ||
                                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
                              }
                              alt="Item"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {o.items.length > 3 && (
                          <span className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#DDD2C0] text-[10px] text-[#2B1A16] font-mono font-bold flex items-center justify-center">
                            +{o.items.length - 3}
                          </span>
                        )}
                        <span className="text-[11px] text-[#2B1A16]/60 ml-1">
                          {o.items.reduce((acc, i) => acc + i.quantity, 0)} items
                        </span>
                      </div>
                    </td>

                    {/* Total Amount & Payment Method */}
                    <td className="py-3.5 px-4">
                      <div className="font-serif text-sm font-bold text-[#2B1A16]">
                        ₹{o.total.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#2B1A16]/60 flex items-center gap-1 mt-0.5">
                        <CreditCard className="w-3 h-3 text-[#2B1A16]/40" />
                        <span>{o.paymentMethod}</span>
                      </div>
                    </td>

                    {/* Status & Quick Advance */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>

                        {/* Quick Status Dropdown */}
                        <select
                          value={o.status}
                          onChange={(e) =>
                            onUpdateStatus(
                              o.id,
                              e.target.value as OrderStatus,
                              `Status updated to ${e.target.value}`
                            )
                          }
                          className="bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16] text-[10px] rounded-lg px-2 py-0.5 outline-none hover:border-[#9A8029] font-medium"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenOrderDetailModal(o)}
                          className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-[11px] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => setOrderToDelete(o)}
                          title="Delete Order Record"
                          className="p-1.5 text-[#2B1A16]/40 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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
        </>
      )}
      </div>

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-serif text-lg font-bold text-[#2B1A16]">
                Delete Order Record #{orderToDelete.id}?
              </h4>
            </div>
            <p className="text-xs text-[#2B1A16]/80 leading-relaxed mb-4">
              Are you sure you want to permanently delete Order #{orderToDelete.id} for{' '}
              <strong className="text-[#2B1A16]">{orderToDelete.address?.name}</strong> (₹
              {orderToDelete.total.toLocaleString('en-IN')})? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#DDD2C0] hover:bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
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
