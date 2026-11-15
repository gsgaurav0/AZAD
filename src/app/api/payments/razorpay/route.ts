import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: 'Order ID and amount are required.' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Razorpay operates in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // If real Razorpay credentials are provided, call official Razorpay API
    if (keyId && keySecret && !keyId.includes('placeholder')) {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            internal_order_id: orderId,
          },
        }),
      });

      const rzpData = await response.json();
      if (!response.ok) {
        return NextResponse.json({ success: false, error: rzpData.error?.description || 'Razorpay order creation failed.' }, { status: 500 });
      }

      // Record razorpay_order_id in Supabase
      const admin = createAdminClient();
      await admin.from('orders').update({ razorpay_order_id: rzpData.id }).eq('id', orderId);

      return NextResponse.json({
        success: true,
        razorpayOrderId: rzpData.id,
        amount: rzpData.amount,
        currency: rzpData.currency,
        keyId,
      });
    }

    // Seamless Sandbox/Dev Mode fallback
    const mockRzpOrderId = `order_sim_${Date.now()}`;
    const admin = createAdminClient();
    await admin.from('orders').update({ razorpay_order_id: mockRzpOrderId }).eq('id', orderId);

    return NextResponse.json({
      success: true,
      razorpayOrderId: mockRzpOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: keyId || 'rzp_test_placeholder',
      isSandbox: true,
    });
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error creating Razorpay order.' }, { status: 500 });
  }
}
