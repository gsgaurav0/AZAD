import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCleanMilestoneHistory, getLocationForStatus } from '@/lib/orderMilestones';
import { sendEmail, renderOrderConfirmationEmailTemplate } from '@/lib/email/resend';

interface CheckoutRequestBody {
  userId?: string;
  items: Array<{
    productId: string;
    selectedColor: string;
    selectedSize: string;
    quantity: number;
  }>;
  address: {
    name: string;
    phone: string;
    street: string;
    locality?: string;
    city: string;
    state: string;
    pincode: string;
    type?: 'Home' | 'Work' | 'Other';
  };
  couponCode?: string;
  paymentMethod: 'Cash on Delivery' | 'Razorpay' | 'UPI' | 'Credit/Debit Card' | 'Net Banking';
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequestBody = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty.' }, { status: 400 });
    }

    if (!body.address || !body.address.name || !body.address.phone || !body.address.street || !body.address.city || !body.address.pincode) {
      return NextResponse.json({ success: false, error: 'Complete delivery address is required.' }, { status: 400 });
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch real products from Supabase to prevent price tampering
    const productIds = body.items.map((i) => i.productId);
    const { data: dbProducts, error: prodErr } = await adminSupabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ success: false, error: 'Could not retrieve catalog products for verification.' }, { status: 500 });
    }

    const missingIds = productIds.filter((id) => !dbProducts.some((p) => p.id === id));
    if (missingIds.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'One or more items in your cart are no longer available in the boutique catalog. Please update your bag to proceed.',
      }, { status: 400 });
    }

    // 2. Validate items & calculate authoritative server-side subtotal
    let subtotal = 0;
    const verifiedOrderItems: Array<{
      product: any;
      selectedColor: string;
      selectedSize: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    for (const reqItem of body.items) {
      const match = dbProducts.find((p) => p.id === reqItem.productId);
      if (!match) {
        return NextResponse.json({ success: false, error: `Product with ID ${reqItem.productId} is not available.` }, { status: 400 });
      }

      // Check variant stock
      const sizes = Array.isArray(match.sizes) ? match.sizes : [];
      const matchedSize = sizes.find((s: any) => s.size === reqItem.selectedSize);
      if (matchedSize && matchedSize.inStock === false) {
        return NextResponse.json({
          success: false,
          error: `The selected edition/size "${reqItem.selectedSize}" for "${match.name}" is currently sold out.`,
        }, { status: 400 });
      }

      const unitPrice = Number(match.price);
      const lineTotal = unitPrice * reqItem.quantity;
      subtotal += lineTotal;

      verifiedOrderItems.push({
        product: {
          id: match.id,
          name: match.name,
          slug: match.slug,
          images: match.images,
          price: unitPrice,
          originalPrice: match.original_price,
          category: match.category,
        },
        selectedColor: reqItem.selectedColor,
        selectedSize: reqItem.selectedSize,
        quantity: reqItem.quantity,
        unitPrice,
        lineTotal,
      });
    }

    // 3. Validate coupon if provided
    let discount = 0;
    let validatedCouponCode: string | null = null;

    if (body.couponCode && body.couponCode.trim()) {
      const cleanCode = body.couponCode.trim().toUpperCase();
      const { data: coupon, error: couponErr } = await adminSupabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (!couponErr && coupon) {
        const now = new Date();
        const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < now : false;
        const limitReached = coupon.usage_limit ? coupon.usage_count >= coupon.usage_limit : false;
        const minMet = coupon.min_order_value ? subtotal >= Number(coupon.min_order_value) : true;

        if (!isExpired && !limitReached && minMet) {
          validatedCouponCode = cleanCode;
          if (coupon.discount_type === 'percentage') {
            const rawDiscount = (subtotal * Number(coupon.discount_value)) / 100;
            discount = coupon.max_discount ? Math.min(rawDiscount, Number(coupon.max_discount)) : rawDiscount;
          } else {
            discount = Number(coupon.discount_value);
          }
        }
      }
    }

    // 4. Shipping Calculation (Complimentary for >= ₹999)
    const shipping = subtotal >= 999 ? 0 : 150;
    const total = Math.max(0, subtotal - discount + shipping);

    // 5. Generate Tracking and Identification
    const orderId = `MWK-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `BLD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const isCod = body.paymentMethod === 'Cash on Delivery';
    const initialStatus = isCod ? 'Placed' : 'Pending Payment';
    const statusHistory = isCod ? buildCleanMilestoneHistory('Placed', body.address) : [];
    const initialLocation = isCod ? getLocationForStatus('Placed', body.address) : 'Order Draft Created';

    // 6. Customer & User Identification (resilient session fallback)
    const customerName = body.customer?.name || body.address.name;
    const customerEmail = body.customer?.email || user?.email || '';
    const customerPhone = body.customer?.phone || body.address.phone;

    let effectiveUserId: string | null = user?.id || body.userId || null;
    if (!effectiveUserId && customerEmail) {
      try {
        const { data: matchedProfile } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();
        if (matchedProfile?.id) {
          effectiveUserId = matchedProfile.id;
        }
      } catch {}
    }

    // 7. Atomic Order Creation
    const { error: insertErr } = await adminSupabase.from('orders').insert({
      id: orderId,
      user_id: effectiveUserId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      address: body.address,
      items: verifiedOrderItems,
      subtotal,
      discount,
      shipping,
      tax: Math.round(total * 0.18),
      total,
      coupon_code: validatedCouponCode,
      payment_method: body.paymentMethod,
      payment_status: isCod ? 'pending' : 'pending',
      status: initialStatus,
      tracking_number: trackingNumber,
      courier_partner: 'BlueDart Express Air',
      estimated_delivery: 'Within 3-4 Business Days',
      current_location: initialLocation,
      status_history: statusHistory,
    });

    if (insertErr) {
      console.error('Supabase order insertion error:', insertErr);
      return NextResponse.json({ success: false, error: insertErr.message || 'Failed to record order in database.' }, { status: 500 });
    }

    // Increment coupon usage if used (only for COD; for online payment, incremented after payment verification)
    if (isCod && validatedCouponCode) {
      try {
        await adminSupabase.rpc('increment_coupon_usage', { p_code: validatedCouponCode });
      } catch {
        // Fallback standard update
        await adminSupabase
          .from('coupons')
          .update({ usage_count: 1 })
          .eq('code', validatedCouponCode);
      }
    }

    // Clear server cart if COD (for online payment, cleared upon payment verification)
    if (isCod && user?.id) {
      await adminSupabase.from('cart_items').delete().eq('user_id', user.id);
    }

    // Dispatch asynchronous order confirmation email via Resend (only for COD)
    if (isCod && customerEmail && customerEmail.includes('@')) {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const trackingUrl = `${origin}/account?tab=orders&order=${orderId}`;
      sendEmail({
        to: customerEmail,
        subject: `Order Confirmed: #${orderId} • Mewak Luxury`,
        html: renderOrderConfirmationEmailTemplate({
          name: customerName || 'Patron',
          orderId,
          items: verifiedOrderItems.map((i) => ({
            name: i.product?.name || 'Hardware Edition',
            quantity: i.quantity,
            price: i.unitPrice,
            color: i.selectedColor,
            size: i.selectedSize,
          })),
          total,
          paymentMethod: body.paymentMethod,
          address: body.address,
          trackingUrl,
        }),
      }).catch((emailErr) => {
        console.warn('Order confirmation email notice:', emailErr);
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      order: {
        id: orderId,
        userId: effectiveUserId,
        total,
        subtotal,
        discount,
        shipping,
        tax: Math.round(total * 0.18),
        status: initialStatus,
        paymentStatus: isCod ? 'pending' : 'pending',
        statusHistory,
        trackingNumber,
        courierPartner: 'BlueDart Express Air',
        estimatedDelivery: 'Within 3-4 Business Days',
        currentLocation: initialLocation,
        paymentMethod: body.paymentMethod,
        address: body.address,
        items: verifiedOrderItems,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error processing checkout.' }, { status: 500 });
  }
}
