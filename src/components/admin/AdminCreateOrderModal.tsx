'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag } from 'lucide-react';
import { Product, Order, CartItem, Address } from '@/types';

interface AdminCreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onCreateOrder: (order: Order) => void;
}

export default function AdminCreateOrderModal({
  isOpen,
  onClose,
  products,
  onCreateOrder,
}: AdminCreateOrderModalProps) {
  const initialProduct = products[0];

  // Selected Product & variant
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>(
    initialProduct?.colors[0]?.name || 'Standard'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    initialProduct?.sizes[0]?.size || 'Standard'
  );

  // Customer Details
  const [customerName, setCustomerName] = useState('Devendra Chauhan');
  const [customerPhone, setCustomerPhone] = useState('+91 98112 34567');
  const [street, setStreet] = useState('Villa 14, The Magnolias, Golf Course Road');
  const [locality, setLocality] = useState('Sector 42');
  const [city, setCity] = useState('Gurugram');
  const [state, setState] = useState('Haryana');
  const [pincode, setPincode] = useState('122002');
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash on Delivery'
  >('Credit/Debit Card');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || initialProduct;

  if (!isOpen || !selectedProduct) return null;

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setSelectedColor(prod.colors[0]?.name || 'Standard');
      setSelectedSize(prod.sizes[0]?.size || 'Standard');
    }
  };

  const subtotal = (selectedProduct.price || 0) * quantity;
  const shipping = subtotal > 999 ? 0 : 150;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    const orderId = `MWK-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `BLUEDART-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const deliveryAddress: Address = {
      id: `addr-${Date.now()}`,
      name: customerName.trim(),
      phone: customerPhone.trim(),
      street: street.trim(),
      locality: locality.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      type: 'Home',
      isDefault: false,
    };

    const cartItem: CartItem = {
      product: selectedProduct,
      selectedColor: selectedColor || selectedProduct.colors[0]?.name || 'Standard',
      selectedSize: selectedSize || selectedProduct.sizes[0]?.size || 'Standard',
      quantity,
    };

    const newOrder: Order = {
      id: orderId,
      date: dateStr,
      items: [cartItem],
      subtotal,
      discount: 0,
      shipping,
      total,
      address: deliveryAddress,
      paymentMethod,
      paymentId: `PAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'Placed',
      trackingNumber,
      statusHistory: [
        {
          status: 'Placed',
          timestamp: `${dateStr}, ${timeStr}`,
          note: 'VIP Concierge order provisioned by Superadmin',
          completed: true,
        },
        {
          status: 'Packed',
          timestamp: 'Pending',
          note: 'Hardware diagnostic test & packaging',
          completed: false,
        },
        {
          status: 'Shipped',
          timestamp: 'Pending',
          note: 'BlueDart express airway dispatch',
          completed: false,
        },
        {
          status: 'Out for Delivery',
          timestamp: 'Pending',
          note: 'Local courier dispatch',
          completed: false,
        },
        {
          status: 'Delivered',
          timestamp: 'Pending',
          note: 'Doorstep handoff',
          completed: false,
        },
      ],
    };

    onCreateOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-[#E5E0D8] w-full max-w-2xl rounded-2xl shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-0.5 rounded font-bold">
              MANUAL PROVISIONING
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#2B1A16] mt-1">
              Create New Patron Order
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#2B1A16]/50 hover:text-[#2B1A16] rounded-xl hover:bg-[#EFE8DD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Item Selection */}
          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-[#2B1A16]/70 border-b border-[#E5E0D8] pb-2 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-[#9A8029]" />
              <span>Select Hardware Item & Quantity</span>
            </h3>

            <div>
              <label className="block font-semibold text-[#2B1A16] mb-1.5">
                Product from Catalog
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.price.toLocaleString('en-IN')} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Snapshot Card */}
            <div className="bg-[#FAF8F5] border border-[#DDD2C0] p-4 rounded-xl flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl bg-white border border-[#DDD2C0] overflow-hidden shrink-0">
                <Image
                  src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'}
                  alt={selectedProduct.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm font-bold text-[#2B1A16] truncate">
                  {selectedProduct.name}
                </p>
                <p className="text-[11px] text-[#2B1A16]/60 truncate">{selectedProduct.subtitle}</p>
                <p className="font-mono text-sm font-bold text-[#9A8029] mt-1">
                  ₹{selectedProduct.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Variants Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1.5">Color Finish</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3 py-2 text-[#2B1A16] outline-none text-xs"
                >
                  {selectedProduct.colors.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1.5">Edition / Storage</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3 py-2 text-[#2B1A16] outline-none text-xs"
                >
                  {selectedProduct.sizes.map((s) => (
                    <option key={s.size} value={s.size}>
                      {s.size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3 py-2 text-[#2B1A16] outline-none text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Patron Details */}
          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-[#2B1A16]/70 border-b border-[#E5E0D8] pb-2">
              Patron & Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-[#2B1A16] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">
                  Customer Mobile *
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-[#2B1A16] outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#2B1A16] mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-[#2B1A16] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">Locality</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-[#2B1A16] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-[#2B1A16] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-[#2B1A16] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-[#2B1A16] outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2B1A16] mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash on Delivery'
                  )
                }
                className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3 py-2 text-[#2B1A16] outline-none text-xs"
              >
                <option value="Credit/Debit Card">Credit/Debit Card (Prepaid)</option>
                <option value="UPI">UPI Instant Payment</option>
                <option value="Net Banking">Corporate Net Banking</option>
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
              </select>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DDD2C0] flex items-center justify-between">
            <div className="text-xs text-[#2B1A16]/70 space-y-0.5">
              <p>Items Subtotal: ₹{subtotal.toLocaleString('en-IN')}</p>
              <p>Shipping: {shipping === 0 ? 'FREE' : `₹${shipping}`}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#2B1A16]/50 uppercase block">Grand Total</span>
              <span className="font-serif text-xl font-bold text-[#2B1A16]">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold hover:bg-[#FAF8F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-[0.99]"
            >
              Create & Dispatch Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
