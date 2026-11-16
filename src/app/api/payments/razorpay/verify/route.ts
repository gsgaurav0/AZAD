import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { buildCleanMilestoneHistory } from '@/lib/orderMilestones';

export async function POST(request: Request) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment verification credentials.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify HMAC SHA-256 signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.error('Razorpay signature verification failed:', { razorpay_order_id, razorpay_payment_id });
      await admin.from('orders').update({ payment_status: 'failed', status: 'Cancelled' }).eq('id', orderId);
      return NextResponse.json({ success: false, error: 'Payment signature verification failed.' }, { status: 400 });
    }

    // Fetch existing order to generate proper active tracking history
    const { data: existingOrder } = await admin
      .from('orders')
      .select('address')
      .eq('id', orderId)
      .single();

    const placedHistory = buildCleanMilestoneHistory('Placed', existingOrder?.address || {});

    // Update order status in Supabase to confirmed Placed with active courier tracking
    const { error: updateErr } = await admin.from('orders').update({
      payment_status: 'paid',
      status: 'Placed',
      current_location: 'Mewak Central Fulfillment Hub, New Delhi',
      status_history: placedHistory,
      payment_id: razorpay_payment_id,
      razorpay_payment_id,
      razorpay_signature,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId);

    if (updateErr) {
      console.error('Failed to update order payment status in Supabase:', updateErr);
      return NextResponse.json({ success: false, error: 'Database update failed after payment.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      orderId,
    });
  } catch (err: any) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Payment verification failed.' }, { status: 500 });
  }
}
