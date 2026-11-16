import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCleanMilestoneHistory, getLocationForStatus } from '@/lib/orderMilestones';
import { OrderStatus } from '@/types';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out abandoned / unpaid online checkout drafts
    const validOrders = (data || []).filter((o: any) => {
      const isCod = o.payment_method === 'Cash on Delivery';
      const isPaid = o.payment_status === 'paid';
      return isCod || isPaid;
    });

    const mapped = validOrders.map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      date: o.created_at,
      items: o.items || [],
      subtotal: Number(o.subtotal || 0),
      discount: Number(o.discount || 0),
      shipping: Number(o.shipping || 0),
      total: Number(o.total || 0),
      couponCode: o.coupon_code || undefined,
      address: o.address || {},
      paymentMethod: o.payment_method,
      paymentId: o.payment_id || undefined,
      status: o.status,
      statusHistory: o.status_history || [],
      trackingNumber: o.tracking_number || '',
      courierPartner: o.courier_partner || 'BlueDart Express Air',
      estimatedDelivery: o.estimated_delivery || undefined,
      currentLocation: o.current_location || undefined,
    }));

    return NextResponse.json({ orders: mapped });
  } catch (err: any) {
    console.error('Admin orders GET exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, note, location, trackingNumber, courierPartner } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Fetch current order
    const { data: currentOrder, error: fetchErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchErr || !currentOrder) {
      return NextResponse.json({ error: 'Order not found in database' }, { status: 404 });
    }

    const currentHistory = Array.isArray(currentOrder.status_history) ? currentOrder.status_history : [];
    const newStatus: OrderStatus = (status || currentOrder.status) as OrderStatus;
    const address = currentOrder.address || {};

    // Rebuild clean, deduplicated milestone history
    const updatedHistory = buildCleanMilestoneHistory(
      newStatus,
      address,
      note,
      location,
      currentHistory
    );

    const newLocation = location || getLocationForStatus(newStatus, address);

    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
      status: newStatus,
      current_location: newLocation,
      status_history: updatedHistory,
    };

    if (trackingNumber !== undefined) dbUpdates.tracking_number = trackingNumber;
    if (courierPartner !== undefined) dbUpdates.courier_partner = courierPartner;

    const { data: updatedOrder, error: updateErr } = await admin
      .from('orders')
      .update(dbUpdates)
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateErr) {
      console.error('Error updating order in Supabase:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    console.error('Admin order PUT exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from('orders').delete().eq('id', id);

    if (error) {
      console.error('Error deleting order from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Admin order DELETE exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete order' }, { status: 500 });
  }
}
