import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRazorpayClient } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: 'Order ID and amount are required.' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Razorpay operates in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (amountInPaise < 100) {
      return NextResponse.json({ success: false, error: 'Amount must be at least 100 paise (₹1.00).' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      notes: {
        internal_order_id: orderId,
      },
    });

    // Record razorpay_order_id in Supabase
    try {
      const admin = createAdminClient();
      await admin.from('orders').update({ razorpay_order_id: rzpOrder.id }).eq('id', orderId);
    } catch (dbErr) {
      console.warn('Optional Supabase order linking notice:', dbErr);
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
    });
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    return NextResponse.json(
      { success: false, error: err.error?.description || err.message || 'Error creating Razorpay order.' },
      { status: 500 }
    );
  }
}
