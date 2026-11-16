import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const trackingNumber = searchParams.get('trackingNumber');
    const queryUserId = searchParams.get('userId');

    const admin = createAdminClient();

    // 1. Query single order by orderId
    if (orderId) {
      const { data: order, error } = await admin
        .from('orders')
        .select('*')
        .eq('id', orderId.trim())
        .single();

      if (error || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Guard: Do not display unpaid online checkout records
      if (order.payment_method !== 'Cash on Delivery' && order.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Order payment is pending or incomplete.' }, { status: 404 });
      }

      return NextResponse.json({
        order: {
          id: order.id,
          userId: order.user_id,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          date: new Date(order.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          items: order.items || [],
          subtotal: Number(order.subtotal || 0),
          discount: Number(order.discount || 0),
          shipping: Number(order.shipping || 0),
          tax: Number(order.tax || 0),
          total: Number(order.total || 0),
          couponCode: order.coupon_code,
          address: order.address || {},
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          status: order.status,
          statusHistory: order.status_history || [],
          trackingNumber: order.tracking_number,
          courierPartner: order.courier_partner || 'BlueDart Express Air',
          estimatedDelivery: order.estimated_delivery,
          currentLocation: order.current_location,
        },
      });
    }

    // 2. Query single order by trackingNumber
    if (trackingNumber) {
      const { data: order, error } = await admin
        .from('orders')
        .select('*')
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (error || !order) {
        return NextResponse.json({ error: 'Tracking record not found' }, { status: 404 });
      }

      // Guard: Do not display tracking for unpaid online checkout records
      if (order.payment_method !== 'Cash on Delivery' && order.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Tracking unavailable for unconfirmed payment.' }, { status: 404 });
      }

      return NextResponse.json({
        order: {
          id: order.id,
          userId: order.user_id,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          date: new Date(order.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          items: order.items || [],
          subtotal: Number(order.subtotal || 0),
          discount: Number(order.discount || 0),
          shipping: Number(order.shipping || 0),
          total: Number(order.total || 0),
          status: order.status,
          statusHistory: order.status_history || [],
          trackingNumber: order.tracking_number,
          courierPartner: order.courier_partner || 'BlueDart Express Air',
          estimatedDelivery: order.estimated_delivery,
          currentLocation: order.current_location,
        },
      });
    }

    // 3. Query all orders for the current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const targetUserId = queryUserId || user?.id;

    if (!targetUserId) {
      return NextResponse.json({ orders: [] });
    }

    const { data: orders, error } = await admin
      .from('orders')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out unpaid online checkout attempts: only return COD or confirmed paid orders
    const confirmedOrders = (orders || []).filter((o: any) => {
      const isCod = o.payment_method === 'Cash on Delivery';
      const isPaid = o.payment_status === 'paid';
      return isCod || isPaid;
    });

    const mapped = confirmedOrders.map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      date: new Date(o.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      items: o.items || [],
      subtotal: Number(o.subtotal || 0),
      discount: Number(o.discount || 0),
      shipping: Number(o.shipping || 0),
      total: Number(o.total || 0),
      couponCode: o.coupon_code,
      address: o.address || {},
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      status: o.status,
      statusHistory: o.status_history || [],
      trackingNumber: o.tracking_number,
      courierPartner: o.courier_partner || 'BlueDart Express Air',
      estimatedDelivery: o.estimated_delivery,
      currentLocation: o.current_location,
    }));

    return NextResponse.json({ orders: mapped });
  } catch (err: any) {
    console.error('Public orders API exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
