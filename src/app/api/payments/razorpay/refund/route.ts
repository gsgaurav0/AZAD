import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { orderId, amount, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch order details
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If order was paid via Razorpay and credentials are set
    if (order.payment_id && keyId && keySecret && !keyId.includes('placeholder')) {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const refundAmount = amount ? Math.round(Number(amount) * 100) : undefined;

      const res = await fetch(`https://api.razorpay.com/v1/payments/${order.payment_id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: refundAmount,
          notes: {
            reason: reason || 'Customer Return Approved',
          },
        }),
      });

      const refundData = await res.json();
      if (!res.ok) {
        return NextResponse.json({ success: false, error: refundData.error?.description || 'Refund API failed.' }, { status: 500 });
      }
    }

    // Update order status in Supabase
    await admin.from('orders').update({
      status: 'Refunded',
      payment_status: 'refunded',
      updated_at: new Date().toISOString(),
    }).eq('id', orderId);

    // Also update associated return record if any
    await admin.from('returns').update({
      status: 'refunded',
      refund_amount: amount || order.total,
      updated_at: new Date().toISOString(),
    }).eq('order_id', orderId);

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${amount || order.total} processed successfully for Order #${orderId}.`,
    });
  } catch (err: any) {
    console.error('Refund processing error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Refund initiation failed.' }, { status: 500 });
  }
}
