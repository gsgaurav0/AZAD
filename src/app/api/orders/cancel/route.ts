import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCleanMilestoneHistory, getLocationForStatus } from '@/lib/orderMilestones';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Fetch current order
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId.trim())
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found in database' }, { status: 404 });
    }

    if (order.status === 'Delivered') {
      return NextResponse.json(
        { success: false, error: 'Delivered orders cannot be cancelled. You may request a doorstep return or exchange instead.' },
        { status: 400 }
      );
    }

    if (order.status === 'Cancelled') {
      return NextResponse.json({ success: true, message: 'Order is already cancelled', order });
    }

    const cancellationNote = reason?.trim() || 'Order cancelled by customer. Refund process initiated.';
    const cancellationLocation = 'Customer Care & Logistics Resolution Desk';

    const currentHistory = Array.isArray(order.status_history) ? order.status_history : [];
    const updatedHistory = buildCleanMilestoneHistory(
      'Cancelled',
      order.address,
      cancellationNote,
      cancellationLocation,
      currentHistory
    );

    const { data: updatedOrder, error: updateErr } = await admin
      .from('orders')
      .update({
        status: 'Cancelled',
        current_location: cancellationLocation,
        status_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId.trim())
      .select('*')
      .single();

    if (updateErr) {
      console.error('Cancellation update error in Supabase:', updateErr);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} has been successfully cancelled.`,
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Order cancellation exception:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error cancelling order' }, { status: 500 });
  }
}
