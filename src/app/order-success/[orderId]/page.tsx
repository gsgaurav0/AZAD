'use client';

import React, { useEffect, use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Package,
  ArrowRight,
  Truck,
  MapPin,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useIsMounted } from '@/hooks/useIsMounted';

interface OrderSuccessProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { orderId } = use(params);
  const isMounted = useIsMounted();
  const orders = useAuthStore((state) => state.orders);
  const addToast = useUIStore((state) => state.addToast);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const storeOrder = orders.find((o) => o.id === orderId);
  const [liveOrder, setLiveOrder] = useState<any>(storeOrder || null);

  useEffect(() => {
    if (!storeOrder && orderId) {
      fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.order) {
            setLiveOrder(data.order);
            useAuthStore.getState().addOrderToStore(data.order);
          }
        })
        .catch((err) => console.warn('Order fetch error:', err));
    } else if (storeOrder) {
      setLiveOrder(storeOrder);
    }
  }, [storeOrder, orderId]);

  const order = liveOrder || storeOrder;

  useEffect(() => {
    if (!order) return;
    // Fire festive celebration confetti!
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9A8029', '#2B1A16', '#DDD2C0', '#4C7A34'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9A8029', '#2B1A16', '#DDD2C0', '#4C7A34'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleCopyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopiedTracking(true);
      addToast(`Courier tracking number ${order.trackingNumber} copied!`, 'info');
      setTimeout(() => setCopiedTracking(false), 2500);
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#9A8029] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-24 flex items-center justify-center">
        <div className="text-center p-8 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] max-w-md mx-auto space-y-4 shadow-sm">
          <Clock className="w-10 h-10 text-[#9A8029] mx-auto animate-pulse" />
          <h2 className="font-serif text-2xl text-[#2B1A16]">Verifying Order Record...</h2>
          <p className="text-xs text-[#2B1A16]/70 leading-relaxed">
            If payment was completed, your order will appear shortly in your Patron Account. Unpaid checkout attempts are not inscribed.
          </p>
          <div className="pt-2">
            <Link
              href="/account"
              className="inline-block bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold uppercase px-6 py-2.5 rounded-[3px] hover:bg-[#9A8029] transition-colors"
            >
              Go to My Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-12 md:py-20 border-b border-[#DDD2C0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top Header Card */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#4C7A34]/15 border-2 border-[#4C7A34] rounded-full flex items-center justify-center text-[#4C7A34] mx-auto mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold block mb-2 font-sans">
            TRANSACTION INSCRIBED & VERIFIED
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B1A16] font-normal mb-3">
            Thank you for your Patronage
          </h1>
          <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans max-w-lg mx-auto leading-relaxed">
            Your hardware has been allocated from central reserve and queued for QC verification and express dispatch. A dispatch notice has been recorded in your patron account.
          </p>
        </div>

        {/* Comprehensive Order Confirmation Card */}
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] shadow-sm divide-y divide-[#DDD2C0]/50 font-sans mb-8">
          {/* Header Row */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EFE8DD]/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#2B1A16]/60 block mb-0.5">
                ORDER NUMBER
              </span>
              <strong className="font-serif text-xl sm:text-2xl text-[#2B1A16]">
                #{order?.id || orderId}
              </strong>
              <span className="text-xs text-[#2B1A16]/60 block mt-0.5">
                Placed on {order?.date || new Date().toLocaleDateString('en-GB')}
              </span>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span className="inline-flex items-center gap-1 text-xs bg-[#4C7A34]/15 text-[#4C7A34] font-bold px-3 py-1 rounded-[2px] uppercase">
                <Check className="w-3.5 h-3.5" /> Placed & Verified
              </span>
              <span className="text-xs text-[#2B1A16]/70">
                Total Paid:{' '}
                <strong className="text-[#2B1A16] font-serif text-sm">
                  ₹{order?.total?.toLocaleString('en-IN') || '0'}
                </strong>
              </span>
            </div>
          </div>

          {/* Courier & Tracking Row */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1A16]">
                <Truck className="w-4 h-4 text-[#9A8029]" />
                <span>Express Courier Partner</span>
              </div>
              <p className="text-xs text-[#2B1A16]/80">
                {order?.courierPartner || 'BlueDart Express Air'}
              </p>
              {order?.trackingNumber && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-[#2B1A16]/60">AWB:</span>
                  <code className="text-xs font-mono font-bold text-[#2B1A16] bg-[#EFE8DD] px-2 py-0.5 rounded-[2px]">
                    {order.trackingNumber}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    className="p-1 hover:text-[#9A8029] text-[#2B1A16]/70 transition-colors"
                    title="Copy Tracking ID"
                  >
                    {copiedTracking ? (
                      <Check className="w-3.5 h-3.5 text-[#4C7A34]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1A16]">
                <Clock className="w-4 h-4 text-[#9A8029]" />
                <span>Estimated Arrival</span>
              </div>
              <p className="text-xs text-[#2B1A16]/80">
                {order?.estimatedDelivery || 'Within 3-4 Business Days'}
              </p>
              <span className="text-[11px] text-[#4C7A34] font-medium block">
                • Signature required upon doorstep handover
              </span>
            </div>
          </div>

          {/* Recipient & Payment Row */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1A16]">
                <MapPin className="w-4 h-4 text-[#9A8029]" />
                <span>Delivery Address</span>
              </div>
              {order?.address ? (
                <div className="text-xs text-[#2B1A16]/80 leading-relaxed">
                  <strong className="text-[#2B1A16] block">{order.address.name}</strong>
                  <span>+91 {order.address.phone}</span>
                  <p className="mt-0.5">
                    {order.address.street}, {order.address.locality && `${order.address.locality}, `}
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#2B1A16]/80">Registered Patron Address</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1A16]">
                <CreditCard className="w-4 h-4 text-[#9A8029]" />
                <span>Payment Mode</span>
              </div>
              <p className="text-xs text-[#2B1A16]/80 font-medium">
                {order?.paymentMethod || 'Instant UPI'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#4C7A34] pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted Verification</span>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          {order?.items && order.items.length > 0 && (
            <div className="p-6 space-y-4">
              <span className="text-xs uppercase font-bold text-[#2B1A16]/60 tracking-wider block">
                Ordered Hardware & Silks ({order.items.length})
              </span>

              <div className="divide-y divide-[#DDD2C0]/40">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-[2px] overflow-hidden bg-[#DDD2C0]/30 shrink-0">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-[#9A8029] m-auto" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif font-medium text-sm text-[#2B1A16]">
                          {item.product?.name || 'Mewak Hardware Item'}
                        </h4>
                        <span className="text-[#2B1A16]/70">
                          {item.selectedColor} • Edition: {item.selectedSize} • Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm text-[#2B1A16]">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="pt-3 border-t border-[#DDD2C0]/60 space-y-1.5 text-xs text-[#2B1A16]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString('en-IN') || '0'}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#4C7A34]">
                    <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                    <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'COMPLIMENTARY' : `₹${order.shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#2B1A16] pt-2 border-t border-[#DDD2C0]">
                  <span>Total Amount Inscribed</span>
                  <span className="font-serif text-lg">
                    ₹{order.total?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account"
            className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-[4px] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Package className="w-4 h-4 text-[#9A8029]" />
            <span>Track Order in Patron Account</span>
          </Link>
          <Link
            href="/shop"
            className="border border-[#DDD2C0] bg-white hover:bg-[#EFE8DD] text-[#2B1A16] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-[4px] transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
