'use client';

import React, { useEffect, use } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { CheckCircle, Package, ArrowRight, Truck, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface OrderSuccessProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { orderId } = use(params);
  const orders = useAuthStore((state) => state.orders);
  const order = orders.find((o) => o.id === orderId) || orders[0];

  useEffect(() => {
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

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-16 md:py-24 border-b border-[#DDD2C0]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-[#4C7A34]/15 border-2 border-[#4C7A34] rounded-full flex items-center justify-center text-[#4C7A34] mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-semibold block mb-2 font-sans">
          ORDER CONFIRMED & INSCRIBED
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B1A16] font-normal mb-3">
          Thank you for your Patronage
        </h1>
        <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans max-w-md mx-auto mb-8 leading-relaxed">
          Your order has been registered at the Maison atelier. A confirmation dispatch note has been sent to your registered contact.
        </p>

        {/* Order Card Summary */}
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 text-left shadow-sm space-y-4 mb-8 font-sans">
          <div className="flex items-center justify-between pb-4 border-b border-[#DDD2C0]">
            <div>
              <span className="text-[10px] uppercase text-[#2B1A16]/60 font-bold block">
                ORDER IDENTIFIER
              </span>
              <strong className="font-serif text-lg text-[#2B1A16]">
                {orderId}
              </strong>
            </div>
            <span className="text-xs bg-[#4C7A34]/15 text-[#4C7A34] font-bold px-3 py-1 rounded-[2px] uppercase">
              Placed & Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-[#2B1A16] mb-1">
                <Truck className="w-4 h-4 text-[#9A8029]" />
                Estimated Delivery
              </div>
              <p className="text-[#2B1A16]/80">
                Within 3-4 business days via Express Courier
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-[#2B1A16] mb-1">
                <MapPin className="w-4 h-4 text-[#9A8029]" />
                Delivery Destination
              </div>
              <p className="text-[#2B1A16]/80">
                {order?.address ? `${order.address.city}, ${order.address.pincode}` : 'Registered Address'}
              </p>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account"
            className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4 text-[#9A8029]" />
            <span>Track Order in Account</span>
          </Link>
          <Link
            href="/shop"
            className="border border-[#DDD2C0] bg-white hover:bg-[#EFE8DD] text-[#2B1A16] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
