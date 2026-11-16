import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCleanMilestoneHistory } from '@/lib/orderMilestones';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support both canonical Razorpay keys and standard payload conventions
    const orderId = body.order_id || body.razorpay_order_id;
    const paymentId = body.payment_id || body.razorpay_payment_id;
    const signature = body.signature || body.razorpay_signature;
    const internalOrderId = body.orderId || body.receipt;

    // Validate missing fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required verification fields (order_id, payment_id, signature are required).',
        },
        { status: 400 }
      );
    }

    // Verify HMAC-SHA256 signature
    let isValid = false;
    try {
      isValid = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature,
      });
    } catch (sigErr: any) {
      console.error('Signature verification calculation error:', sigErr);
      return NextResponse.json(
        { success: false, error: 'Server error during signature verification.' },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.error('Razorpay signature mismatch for order:', orderId);

      // If internal order is known, record failed status
      if (internalOrderId) {
        try {
          const admin = createAdminClient();
          await admin.from('orders').update({ payment_status: 'failed' }).eq('id', internalOrderId);
        } catch {}
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Payment signature verification failed. The payment could not be authenticated.',
        },
        { status: 400 }
      );
    }

    // Signature matches! Update internal order in database if linked
    if (internalOrderId) {
      try {
        const admin = createAdminClient();
        const { data: existingOrder } = await admin
          .from('orders')
          .select('address')
          .eq('id', internalOrderId)
          .single();

        const placedHistory = buildCleanMilestoneHistory('Placed', existingOrder?.address || {});

        await admin.from('orders').update({
          payment_status: 'paid',
          status: 'Placed',
          current_location: 'Mewak Central Fulfillment Hub, New Delhi',
          status_history: placedHistory,
          payment_id: paymentId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          updated_at: new Date().toISOString(),
        }).eq('id', internalOrderId);
      } catch (dbErr) {
        console.warn('Optional Supabase order confirmation notice:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully.',
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (err: any) {
    console.error('Unexpected error in verify-payment endpoint:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error verifying payment.' },
      { status: 500 }
    );
  }
}
