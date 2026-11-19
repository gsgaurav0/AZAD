import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { buildCleanMilestoneHistory } from '@/lib/orderMilestones';
import { sendEmail, renderOrderConfirmationEmailTemplate } from '@/lib/email/resend';
import { getSiteBaseUrl } from '@/lib/siteUrl';

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
      await admin.from('orders').update({ payment_status: 'failed', status: 'Payment Failed' }).eq('id', orderId);
      return NextResponse.json({ success: false, error: 'Payment signature verification failed.' }, { status: 400 });
    }

    // Fetch existing order to generate proper active tracking history
    const { data: existingOrder } = await admin
      .from('orders')
      .select('*')
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

    // Post-payment actions:
    // 1. Clear cart in Supabase
    if (existingOrder?.user_id) {
      try {
        await admin.from('cart_items').delete().eq('user_id', existingOrder.user_id);
      } catch (cartErr) {
        console.warn('Post-payment cart cleanup notice:', cartErr);
      }
    }

    // 2. Increment coupon usage
    if (existingOrder?.coupon_code) {
      try {
        await admin.rpc('increment_coupon_usage', { p_code: existingOrder.coupon_code });
      } catch {
        try {
          await admin.from('coupons').update({ usage_count: 1 }).eq('code', existingOrder.coupon_code);
        } catch {}
      }
    }

    // 3. Dispatch order confirmation email via Resend
    if (existingOrder?.customer_email && existingOrder.customer_email.includes('@')) {
      const origin = getSiteBaseUrl(request);
      const trackingUrl = `${origin}/account?tab=orders&order=${orderId}`;
      sendEmail({
        to: existingOrder.customer_email,
        subject: `Order Confirmed: #${orderId} • Mewak Luxury`,
        html: renderOrderConfirmationEmailTemplate({
          name: existingOrder.customer_name || 'Patron',
          orderId,
          items: (existingOrder.items || []).map((i: any) => ({
            name: i.product?.name || i.name || 'Hardware Edition',
            quantity: i.quantity,
            price: i.unitPrice || i.price,
            color: i.selectedColor || i.color,
            size: i.selectedSize || i.size,
          })),
          total: existingOrder.total,
          paymentMethod: existingOrder.payment_method || 'Online Payment',
          address: existingOrder.address,
          trackingUrl,
        }),
      }).catch((emailErr) => {
        console.warn('Post-payment order confirmation email notice:', emailErr);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      orderId,
      order: {
        ...existingOrder,
        payment_status: 'paid',
        paymentStatus: 'paid',
        status: 'Placed',
      },
    });
  } catch (err: any) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Payment verification failed.' }, { status: 500 });
  }
}
