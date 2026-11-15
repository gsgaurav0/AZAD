import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const webhookSignature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      if (!webhookSignature) {
        return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const admin = createAdminClient();

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.notes?.internal_order_id || payment.description;

      if (orderId) {
        await admin.from('orders').update({
          payment_status: 'paid',
          status: 'Confirmed',
          payment_id: payment.id,
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.notes?.internal_order_id;
      if (orderId) {
        await admin.from('orders').update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Razorpay webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
