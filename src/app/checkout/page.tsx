'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronRight,
  ShieldCheck,
  MapPin,
  CreditCard,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Address } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();

  // Stores
  const { items, getSubtotal, getShippingFee, getCouponDiscount, getTotal, appliedCoupon, clearCart } =
    useCartStore();
  const { savedAddresses, addAddress, placeOrder } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  // Stepper State (1: Address, 2: Payment, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Selected Address & New Address Form
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses[0]?.id || ''
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(savedAddresses.length === 0);
  const [addressForm, setAddressForm] = useState({
    name: 'Siddharth Kashyap',
    phone: '9876543210',
    street: '',
    locality: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    type: 'Home' as 'Home' | 'Work' | 'Other',
  });
  const [addressError, setAddressError] = useState('');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash on Delivery'
  >('UPI');
  const [upiId, setUpiId] = useState('patron@okhdfcbank');
  const [cardForm, setCardForm] = useState({
    number: '•••• •••• •••• 4242',
    name: 'SIDDHARTH KASHYAP',
    expiry: '12/28',
    cvv: '829',
  });
  const [netBank, setNetBank] = useState('HDFC Bank');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const discount = getCouponDiscount();
  const total = getTotal();

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.street || !addressForm.city || !addressForm.pincode) {
      setAddressError('Please fill out all required address fields.');
      return;
    }
    const created = addAddress({
      ...addressForm,
      isDefault: false,
    });
    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
    setAddressError('');
    addToast('Delivery address saved successfully.', 'success');
  };

  const handleStep1Continue = () => {
    if (!selectedAddress && !isAddingNewAddress) {
      setAddressError('Please select or add a delivery address.');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    setCurrentStep(3);
  };

  const handleFinalPlaceOrder = () => {
    if (!selectedAddress) {
      addToast('Please select a valid delivery address.', 'error');
      setCurrentStep(1);
      return;
    }

    setIsPlacingOrder(true);

    setTimeout(() => {
      const order = placeOrder({
        items,
        subtotal,
        discount,
        shipping,
        total,
        couponCode: appliedCoupon || undefined,
        address: selectedAddress,
        paymentMethod,
      });

      clearCart();
      setIsPlacingOrder(false);
      router.push(`/order-success/${order.id}`);
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-20 text-center">
        <h2 className="font-serif text-2xl text-[#2B1A16] mb-4">Your bag is empty</h2>
        <Link
          href="/shop"
          className="inline-block bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold uppercase px-6 py-3 rounded-[4px]"
        >
          Return to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 md:py-16 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Stepper Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-[#DDD2C0] -z-0" />
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-[#9A8029] transition-all duration-500 -z-0"
              style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
            />

            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex flex-col items-center gap-1.5 relative z-10"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep >= 1
                    ? 'bg-[#2B1A16] text-[#EFE8DD] ring-4 ring-[#EFE8DD]'
                    : 'bg-[#DDD2C0] text-[#2B1A16]'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4 text-[#9A8029]" /> : '1'}
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2B1A16]">
                Address
              </span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => currentStep > 1 && setCurrentStep(2)}
              className="flex flex-col items-center gap-1.5 relative z-10"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep >= 2
                    ? 'bg-[#2B1A16] text-[#EFE8DD] ring-4 ring-[#EFE8DD]'
                    : 'bg-[#DDD2C0] text-[#2B1A16]'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4 text-[#9A8029]" /> : '2'}
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2B1A16]">
                Payment
              </span>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => currentStep === 3 && setCurrentStep(3)}
              className="flex flex-col items-center gap-1.5 relative z-10"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep === 3
                    ? 'bg-[#2B1A16] text-[#EFE8DD] ring-4 ring-[#EFE8DD]'
                    : 'bg-[#DDD2C0] text-[#2B1A16]'
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2B1A16]">
                Review
              </span>
            </button>
          </div>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Stepper Form Column */}
          <div className="lg:col-span-8 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8">
            {/* STEP 1: ADDRESS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#DDD2C0]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#9A8029]" />
                    <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                      Delivery Address
                    </h2>
                  </div>
                  {!isAddingNewAddress && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-xs font-semibold uppercase tracking-wider text-[#9A8029] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New
                    </button>
                  )}
                </div>

                {addressError && (
                  <p className="text-xs text-[#B3402F] bg-[#B3402F]/10 p-2.5 rounded-[3px]">
                    {addressError}
                  </p>
                )}

                {/* Saved Addresses List */}
                {!isAddingNewAddress && savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-4 border rounded-[4px] cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-[#9A8029] bg-[#EFE8DD]/60 ring-1 ring-[#9A8029]'
                            : 'border-[#DDD2C0] bg-white hover:border-[#9A8029]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="accent-[#9A8029]"
                            />
                            <strong className="text-xs font-bold text-[#2B1A16] font-sans">
                              {addr.name}
                            </strong>
                            <span className="text-[10px] bg-[#2B1A16]/10 text-[#2B1A16] px-1.5 py-0.5 rounded-[2px] uppercase font-bold">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] text-[#9A8029] font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#2B1A16]/70 font-sans">
                            +91 {addr.phone}
                          </span>
                        </div>
                        <p className="text-xs text-[#2B1A16]/80 mt-2 pl-5 font-sans leading-relaxed">
                          {addr.street}, {addr.locality && `${addr.locality}, `}
                          {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>
                      </label>
                    ))}
                  </div>
                )}

                {/* Add New Address Form */}
                {isAddingNewAddress && (
                  <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-2 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                          10-Digit Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                        Street Address / Apartment / Suite *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="House/Flat No., Building Name, Street"
                        className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                          Locality / Sector
                        </label>
                        <input
                          type="text"
                          value={addressForm.locality}
                          onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px] transition-colors"
                      >
                        Save Address
                      </button>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(false)}
                          className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* Continue to Payment button */}
                {!isAddingNewAddress && (
                  <div className="pt-4 border-t border-[#DDD2C0] flex justify-end">
                    <button
                      type="button"
                      onClick={handleStep1Continue}
                      className="bg-[#9A8029] hover:bg-[#7F6A1F] text-white text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PAYMENT */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#DDD2C0]">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#9A8029]" />
                    <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                      Select Payment Mode
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-[#9A8029] hover:underline"
                  >
                    Change Address
                  </button>
                </div>

                {/* Payment Option Tabs */}
                <div className="space-y-3 font-sans">
                  {/* Option 1: UPI */}
                  <label
                    className={`block p-4 border rounded-[4px] cursor-pointer transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-[#9A8029] bg-[#EFE8DD]/50 ring-1 ring-[#9A8029]'
                        : 'border-[#DDD2C0] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'UPI'}
                          onChange={() => setPaymentMethod('UPI')}
                          className="accent-[#9A8029]"
                        />
                        <span className="font-bold text-xs text-[#2B1A16]">
                          Instant UPI (GPay, PhonePe, Paytm, QR)
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#4C7A34]/15 text-[#4C7A34] px-2 py-0.5 rounded-[2px] font-bold">
                        FASTEST
                      </span>
                    </div>

                    {paymentMethod === 'UPI' && (
                      <div className="mt-3 pl-6 pt-2 border-t border-[#DDD2C0]/50 space-y-2">
                        <label className="block text-[11px] text-[#2B1A16]/70">
                          Enter your UPI VPA ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi"
                          className="w-full max-w-sm bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                        />
                      </div>
                    )}
                  </label>

                  {/* Option 2: Cards */}
                  <label
                    className={`block p-4 border rounded-[4px] cursor-pointer transition-all ${
                      paymentMethod === 'Credit/Debit Card'
                        ? 'border-[#9A8029] bg-[#EFE8DD]/50 ring-1 ring-[#9A8029]'
                        : 'border-[#DDD2C0] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Credit/Debit Card'}
                        onChange={() => setPaymentMethod('Credit/Debit Card')}
                        className="accent-[#9A8029]"
                      />
                      <span className="font-bold text-xs text-[#2B1A16]">
                        Credit / Debit Card (Visa, Mastercard, RuPay, Amex)
                      </span>
                    </div>

                    {paymentMethod === 'Credit/Debit Card' && (
                      <div className="mt-3 pl-6 pt-2 border-t border-[#DDD2C0]/50 space-y-3 max-w-md">
                        <div>
                          <label className="block text-[11px] text-[#2B1A16]/70 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardForm.number}
                            onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                            className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#2B1A16]/70 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#2B1A16]/70 mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardForm.cvv}
                              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Option 3: Net Banking */}
                  <label
                    className={`block p-4 border rounded-[4px] cursor-pointer transition-all ${
                      paymentMethod === 'Net Banking'
                        ? 'border-[#9A8029] bg-[#EFE8DD]/50 ring-1 ring-[#9A8029]'
                        : 'border-[#DDD2C0] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Net Banking'}
                        onChange={() => setPaymentMethod('Net Banking')}
                        className="accent-[#9A8029]"
                      />
                      <span className="font-bold text-xs text-[#2B1A16]">
                        Net Banking (All Indian Major Banks)
                      </span>
                    </div>

                    {paymentMethod === 'Net Banking' && (
                      <div className="mt-3 pl-6 pt-2 border-t border-[#DDD2C0]/50 max-w-sm">
                        <select
                          value={netBank}
                          onChange={(e) => setNetBank(e.target.value)}
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs text-[#2B1A16] outline-none"
                        >
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>State Bank of India (SBI)</option>
                          <option>Axis Bank</option>
                          <option>Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    )}
                  </label>

                  {/* Option 4: Cash on Delivery */}
                  <label
                    className={`block p-4 border rounded-[4px] cursor-pointer transition-all ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-[#9A8029] bg-[#EFE8DD]/50 ring-1 ring-[#9A8029]'
                        : 'border-[#DDD2C0] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                        className="accent-[#9A8029]"
                      />
                      <span className="font-bold text-xs text-[#2B1A16]">
                        Cash on Delivery (Doorstep Verification)
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#DDD2C0] flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-[#2B1A16]/70 hover:text-[#2B1A16] uppercase font-semibold"
                  >
                    ← Back to Address
                  </button>
                  <button
                    type="button"
                    onClick={handleStep2Continue}
                    className="bg-[#9A8029] hover:bg-[#7F6A1F] text-white text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <span>Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#DDD2C0]">
                  <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                    Review Your Order
                  </h2>
                  <p className="text-xs text-[#2B1A16]/70 mt-1 font-sans">
                    Please double-check your delivery coordinates and selected garments before placing order.
                  </p>
                </div>

                {/* Delivery Snapshot */}
                <div className="bg-[#EFE8DD]/60 border border-[#DDD2C0] p-4 rounded-[4px] flex justify-between items-start text-xs font-sans">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9A8029] block mb-1">
                      DELIVERING TO
                    </span>
                    <strong className="text-sm font-serif text-[#2B1A16] block">
                      {selectedAddress.name} (+91 {selectedAddress.phone})
                    </strong>
                    <p className="text-[#2B1A16]/80 mt-1">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[#9A8029] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Payment Snapshot */}
                <div className="bg-[#EFE8DD]/60 border border-[#DDD2C0] p-4 rounded-[4px] flex justify-between items-center text-xs font-sans">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9A8029] block mb-0.5">
                      PAYMENT METHOD
                    </span>
                    <strong className="text-sm font-serif text-[#2B1A16]">
                      {paymentMethod}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[#9A8029] font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Garments Preview */}
                <div className="space-y-3">
                  <span className="text-xs uppercase font-semibold text-[#2B1A16]/70 block font-sans">
                    Order Items ({items.length})
                  </span>
                  <div className="divide-y divide-[#DDD2C0]/40">
                    {items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs font-sans">
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
                            <h4 className="font-serif font-medium text-sm text-[#2B1A16]">
                              {item.product.name}
                            </h4>
                            <span className="text-[#2B1A16]/70">
                              {item.selectedColor} • Size: {item.selectedSize} • Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-[#2B1A16]">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Place Order Button */}
                <div className="pt-4 border-t border-[#DDD2C0] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-[#2B1A16]/70 hover:text-[#2B1A16] uppercase font-semibold"
                  >
                    ← Back to Payment
                  </button>
                  <button
                    type="button"
                    disabled={isPlacingOrder}
                    onClick={handleFinalPlaceOrder}
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-10 py-4 rounded-[4px] transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-[#9A8029]" />
                    <span>{isPlacingOrder ? 'Confirming Order...' : `Place Order (₹${total.toLocaleString('en-IN')})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-4 sticky top-24">
            <h3 className="font-serif text-lg font-semibold text-[#2B1A16] pb-3 border-b border-[#DDD2C0]">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs font-sans text-[#2B1A16]/80">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#4C7A34]">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-[#4C7A34] uppercase font-semibold">FREE</span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#2B1A16] pt-3 border-t border-[#DDD2C0]">
                <span>Total Payable</span>
                <span className="font-serif text-xl">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#2B1A16]/70 space-y-1.5 border-t border-[#DDD2C0]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4C7A34]" />
                <span>15-Day Doorstep Complimentary Returns</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4C7A34]" />
                <span>256-Bit Encrypted Indian Banking Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
