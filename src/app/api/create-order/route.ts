import { NextResponse } from 'next/server';
import { getRazorpayClient } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount)) {
      return NextResponse.json(
        { success: false, error: 'Amount is required and must be a valid number.' },
        { status: 400 }
      );
    }

    // Minimum amount is 100 paise (₹1.00)
    if (parsedAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least 100 paise (₹1.00).' },
        { status: 400 }
      );
    }

    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch (authErr: any) {
      console.error('Razorpay authentication configuration error:', authErr);
      return NextResponse.json(
        { success: false, error: 'Razorpay credentials not properly configured on server.' },
        { status: 401 }
      );
    }

    const receiptId = receipt || `rcpt_${Date.now()}`;

    // Call Razorpay orders.create API
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(parsedAmount),
        currency: currency.toUpperCase(),
        receipt: receiptId,
        notes: notes || { receipt: receiptId },
      });
    } catch (apiErr: any) {
      console.error('Razorpay API error creating order:', apiErr);
      const statusCode = apiErr.statusCode || 500;
      const errorMsg = apiErr.error?.description || apiErr.message || 'Razorpay order creation failed.';
      return NextResponse.json({ success: false, error: errorMsg }, { status: statusCode });
    }

    // If receipt matches an internal order in Supabase, update its razorpay_order_id
    if (receipt) {
      try {
        const admin = createAdminClient();
        await admin
          .from('orders')
          .update({ razorpay_order_id: razorpayOrder.id })
          .eq('id', receipt);
      } catch (dbErr) {
        console.warn('Optional Supabase order linking notice:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('Unexpected error in create-order endpoint:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error creating Razorpay order.' },
      { status: 500 }
    );
  }
}
