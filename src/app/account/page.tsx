'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Package,
  RotateCcw,
  MapPin,
  LogOut,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { OrderStatus } from '@/types';

export default function AccountPage() {
  const {
    isLoggedIn,
    user,
    orders,
    savedAddresses,
    logout,
    deleteAddress,
    setDefaultAddress,
    addAddress,
    requestReturn,
  } = useAuthStore();
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'returns' | 'addresses'>('orders');

  // Return Request Form State
  const [returnOrderId, setReturnOrderId] = useState(orders[0]?.id || '');
  const [returnReason, setReturnReason] = useState('Size was too large / loose');
  const [returnRefundMode, setReturnRefundMode] = useState('Original Payment Method');
  const [returnSuccess, setReturnSuccess] = useState(false);

  // New Address modal/form in Account
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || 'Siddharth Kashyap',
    phone: '9876543210',
    street: '',
    locality: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    type: 'Home' as 'Home' | 'Work' | 'Other',
    isDefault: false,
  });

  if (!isLoggedIn) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-24 text-center px-4">
        <div className="max-w-md mx-auto bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#2B1A16] mb-2">
            Patron Access Required
          </h2>
          <p className="text-xs text-[#2B1A16]/70 mb-6 font-sans">
            Please authenticate to view your curated order timeline, addresses, and VIP concierge privileges.
          </p>
          <button
            type="button"
            onClick={openLoginModal}
            className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest py-3 rounded-[3px] transition-colors"
          >
            Sign In with Mobile OTP
          </button>
        </div>
      </div>
    );
  }

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId) return;
    requestReturn(returnOrderId, returnReason);
    setReturnSuccess(true);
    addToast(`Return request initiated for Order #${returnOrderId}`, 'success');
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) return;
    addAddress(newAddr);
    setShowAddressForm(false);
    addToast('Address added to saved destinations.', 'success');
  };

  const statusSteps: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStepProgress = (status: OrderStatus) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 md:py-16 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Account Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-8 border-b border-[#DDD2C0]">
          <div>
            <div className="flex items-center gap-2 mb-2 font-sans">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold">
                PATRON DASHBOARD
              </span>
              <span className="text-[10px] bg-[#9A8029]/15 text-[#9A8029] font-bold px-2 py-0.5 rounded-[2px] uppercase">
                {user?.memberTier || 'Gold Connoisseur'}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1A16] font-normal">
              Salutations, {user?.name || 'Valued Patron'}
            </h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs text-[#B3402F] hover:underline font-semibold mt-4 sm:mt-0 font-sans"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#FBF7F0] p-1 mb-8 max-w-2xl overflow-x-auto text-xs font-semibold uppercase tracking-wider font-sans">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'returns'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Returns & Exchanges</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Addresses ({savedAddresses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* TAB 1: MY ORDERS WITH VISUAL TIMELINE TRACKER */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-12 text-center rounded-[4px]">
                <Package className="w-12 h-12 text-[#9A8029]/50 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-medium text-[#2B1A16] mb-1">
                  No orders placed yet
                </h3>
                <p className="text-xs text-[#2B1A16]/60 mb-6 font-sans">
                  Begin your sartorial journey with our latest seasonal release.
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold uppercase px-6 py-3 rounded-[3px]"
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const currentStepIdx = getStepProgress(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-6 shadow-xs font-sans"
                  >
                    {/* Order Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDD2C0]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-base text-[#2B1A16]">
                            Order #{order.id}
                          </span>
                          <span className="text-[10px] bg-[#9A8029]/15 text-[#9A8029] font-bold px-2 py-0.5 rounded-[2px] uppercase">
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs text-[#2B1A16]/60 mt-0.5 block">
                          Placed on {order.date} • Paid via {order.paymentMethod}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#2B1A16]/60 block">Total Amount</span>
                        <strong className="font-serif text-lg text-[#2B1A16]">
                          ₹{order.total.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* Visual Tracking Timeline Stepper */}
                    <div className="bg-[#EFE8DD]/70 p-4 rounded-[4px]">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-3">
                        <span className="flex items-center gap-1.5 text-[#2B1A16]">
                          <Truck className="w-4 h-4 text-[#9A8029]" />
                          Tracking ID: <code className="text-[#9A8029]">{order.trackingNumber}</code>
                        </span>
                        <span className="text-[#4C7A34] text-[11px]">
                          Doorstep Delivery
                        </span>
                      </div>

                      {/* 5-Step Visual Timeline */}
                      <div className="grid grid-cols-5 gap-2 text-center relative py-2">
                        {statusSteps.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          return (
                            <div key={step} className="flex flex-col items-center relative">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                  isDone
                                    ? 'bg-[#2B1A16] text-[#EFE8DD]'
                                    : 'bg-[#DDD2C0] text-[#2B1A16]/50'
                                } ${isCurrent ? 'ring-2 ring-[#9A8029]' : ''}`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4 text-[#9A8029]" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-bold mt-1.5 leading-tight ${
                                  isDone ? 'text-[#2B1A16]' : 'text-[#2B1A16]/40'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-[#DDD2C0]/40">
                      {order.items.map((item, i) => (
                        <div key={i} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-16 rounded-[2px] overflow-hidden bg-[#DDD2C0]/30 shrink-0">
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="font-serif font-medium text-sm text-[#2B1A16] hover:text-[#9A8029] line-clamp-1"
                              >
                                {item.product.name}
                              </Link>
                              <span className="text-[#2B1A16]/70 mt-0.5 block">
                                {item.selectedColor} • Size: {item.selectedSize} • Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-serif font-bold text-sm text-[#2B1A16]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="pt-2 border-t border-[#DDD2C0] flex items-center justify-between text-xs text-[#2B1A16]/70">
                      <span>
                        Destination: {order.address.street}, {order.address.city} - {order.address.pincode}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReturnOrderId(order.id);
                          setActiveTab('returns');
                        }}
                        className="text-[#9A8029] hover:underline font-semibold"
                      >
                        Request Return / Exchange
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: RETURN / EXCHANGE FORM */}
        {activeTab === 'returns' && (
          <div className="max-w-2xl bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 font-sans">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16] mb-2">
              Complimentary 15-Day Return & Exchange
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-6 leading-relaxed">
              Our courier agent will arrive at your doorstep for a hassle-free pickup and inspect the atelier tag. Full refunds are dispatched directly within 48 hours of verification.
            </p>

            {returnSuccess ? (
              <div className="bg-[#4C7A34]/15 border border-[#4C7A34] text-[#2B1A16] p-6 rounded-[4px] text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#4C7A34] mx-auto" />
                <h4 className="font-serif text-lg font-bold text-[#2B1A16]">
                  Return Request Initiated
                </h4>
                <p className="text-xs text-[#2B1A16]/80 max-w-md mx-auto">
                  Doorstep pickup scheduled for Order <strong>#{returnOrderId}</strong>. A reverse courier tracking SMS has been transmitted.
                </p>
                <button
                  type="button"
                  onClick={() => setReturnSuccess(false)}
                  className="bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold uppercase px-4 py-2 rounded-[2px]"
                >
                  Create Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                    Select Order Identifier *
                  </label>
                  <select
                    value={returnOrderId}
                    onChange={(e) => setReturnOrderId(e.target.value)}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id} ({o.date}) - ₹{o.total.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                    Reason for Return / Exchange *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option>Size was too large / loose</option>
                    <option>Size was too tight / small</option>
                    <option>Fabric feel did not meet expectations</option>
                    <option>Exchange for a different shade</option>
                    <option>Defective seam or button</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                    Refund / Resolution Preference
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="refundMode"
                        checked={returnRefundMode === 'Original Payment Method'}
                        onChange={() => setReturnRefundMode('Original Payment Method')}
                        className="accent-[#9A8029]"
                      />
                      <span>Refund to original bank account / card / UPI (3-5 days)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="refundMode"
                        checked={returnRefundMode === 'MewaK Store Credit'}
                        onChange={() => setReturnRefundMode('MewaK Store Credit')}
                        className="accent-[#9A8029]"
                      />
                      <span>Instant MewaK Store Credit + 5% bonus privilege coupon</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest py-3 rounded-[3px] transition-colors"
                  >
                    Schedule Doorstep Pickup
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 max-w-4xl font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                Saved Delivery Addresses
              </h3>
              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-[3px] flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form
                onSubmit={handleAddAddressSubmit}
                className="bg-[#FBF7F0] border border-[#DDD2C0] p-6 rounded-[4px] space-y-4 text-xs"
              >
                <div className="font-serif font-semibold text-base text-[#2B1A16]">
                  Add New Delivery Destination
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2B1A16]/80 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px]"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <strong className="font-serif text-sm text-[#2B1A16]">
                          {addr.name}
                        </strong>
                        <span className="text-[10px] bg-[#2B1A16]/10 text-[#2B1A16] px-1.5 py-0.5 rounded-[2px] uppercase font-bold">
                          {addr.type}
                        </span>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-[#9A8029]/15 text-[#9A8029] font-bold px-2 py-0.5 rounded-[2px] uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2B1A16]/80 leading-relaxed mb-3">
                      {addr.street}, {addr.locality && `${addr.locality}, `}
                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </p>
                    <span className="text-xs text-[#2B1A16]/60">Phone: +91 {addr.phone}</span>
                  </div>

                  <div className="pt-4 border-t border-[#DDD2C0]/50 mt-4 flex items-center justify-between text-xs">
                    {!addr.isDefault ? (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[#9A8029] hover:underline font-semibold"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[#4C7A34] text-[11px] font-semibold">Primary Address</span>
                    )}
                    {savedAddresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        className="text-[#B3402F] hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PATRON PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-xl bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 font-sans space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16] mb-4">
              Patron Profile & Privilege Tier
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60">Full Name</span>
                <strong className="text-[#2B1A16]">{user?.name}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60">Mobile Number</span>
                <strong className="text-[#2B1A16]">{user?.phone}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60">Registered Email</span>
                <strong className="text-[#2B1A16]">{user?.email}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60">Membership Status</span>
                <strong className="text-[#9A8029]">{user?.memberTier}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60">Patron Since</span>
                <strong className="text-[#2B1A16]">{user?.joinedDate}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
