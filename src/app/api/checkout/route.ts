import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface CheckoutRequestBody {
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
    let { data: dbProducts, error: prodErr } = await adminSupabase
      .from('products')
      .select('*')
      .in('id', productIds);

    // Auto-heal missing products from static fallback if newly initialized database
    const missingIds = productIds.filter((id) => !dbProducts?.some((p) => p.id === id));
    if (missingIds.length > 0) {
      const { PRODUCTS } = await import('@/data/products');
      const fallbackItems = PRODUCTS.filter((p) => missingIds.includes(p.id));
      if (fallbackItems.length > 0) {
        await adminSupabase.from('categories').upsert([
          { id: 'headphones', name: 'Headphones & Audio' },
          { id: 'phones', name: 'Smartphones' },
          { id: 'smartwatches', name: 'Smartwatches' },
          { id: 'accessories', name: 'Accessories & Power' },
        ], { onConflict: 'id' });

        const seedRows = fallbackItems.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          subtitle: p.subtitle || '',
          category: p.category,
          subcategory: p.subcategory || 'Hardware',
          price: Number(p.price) || 9999,
          original_price: Number(p.originalPrice) || Number(p.price) || 9999,
          discount_percent: Math.min(100, Math.max(0, Math.round(Number(p.discountPercent) || 0))),
          is_new: Boolean(p.isNew),
          is_trending: Boolean(p.isTrending),
          is_featured: Boolean(p.isFeatured),
          occasion: p.occasion || 'Work',
          rating: Math.min(5, Math.max(0, Number(p.rating) || 5.0)),
          review_count: Number(p.reviewCount) || 0,
          colors: p.colors || [],
          sizes: p.sizes || [],
          images: p.images || [],
          fabric: p.fabric || 'Aero-grade Aluminum & Ceramic',
          fit: p.fit || 'Ergonomic Acoustic Seal',
          care: p.care || ['2-Year Official Brand Replacement Warranty'],
          description: p.description || '',
          details: p.details || ['Precision CNC Machined Chassis'],
          returns: p.returns || '15-day risk-free home trial with complimentary doorstep replacement',
          in_stock: true,
        }));
        await adminSupabase.from('products').upsert(seedRows, { onConflict: 'id' });

        const { data: refetched } = await adminSupabase.from('products').select('*').in('id', productIds);
        if (refetched && refetched.length > 0) {
          dbProducts = refetched;
        }
      }
    }

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ success: false, error: 'Could not retrieve catalog products for verification.' }, { status: 500 });
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
    const nowIso = new Date().toISOString();

    const statusHistory = [
      {
        status: 'Placed',
        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: 'Mewak Central Fulfillment Hub, New Delhi',
        note: 'Order confirmed and allocated for diagnostic quality checks.',
        completed: true,
      },
      {
        status: 'Packed',
        timestamp: 'Pending verification',
        location: 'Central Distribution Center, New Delhi',
        note: 'Hardware serialized, sealed with tamper-proof band, and invoiced.',
        completed: false,
      },
      {
        status: 'Shipped',
        timestamp: 'Pending dispatch',
        location: 'BlueDart Express Air Gateway',
        note: 'Handed over to BlueDart express cargo team.',
        completed: false,
      },
      {
        status: 'Out for Delivery',
        timestamp: 'Pending transit',
        location: `${body.address.city} Delivery Hub`,
        note: 'Out with delivery marshal for doorstep handover.',
        completed: false,
      },
      {
        status: 'Delivered',
        timestamp: 'Estimated 3-4 days',
        location: `${body.address.street}, ${body.address.city}`,
        note: 'Delivered securely to patron.',
        completed: false,
      },
    ];

    // 6. Customer Identification
    const customerName = body.customer?.name || body.address.name;
    const customerEmail = body.customer?.email || user?.email || '';
    const customerPhone = body.customer?.phone || body.address.phone;

    // 7. Atomic Order Creation
    const { error: insertErr } = await adminSupabase.from('orders').insert({
      id: orderId,
      user_id: user?.id || null,
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
      payment_status: body.paymentMethod === 'Cash on Delivery' ? 'pending' : 'pending',
      status: 'Placed',
      tracking_number: trackingNumber,
      courier_partner: 'BlueDart Express Air',
      estimated_delivery: 'Within 3-4 Business Days',
      current_location: 'Mewak Central Fulfillment Hub, New Delhi',
      status_history: statusHistory,
    });

    if (insertErr) {
      console.error('Supabase order insertion error:', insertErr);
      return NextResponse.json({ success: false, error: 'Failed to record order in database.' }, { status: 500 });
    }

    // Increment coupon usage if used
    if (validatedCouponCode) {
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

    // Clear server cart if user logged in
    if (user?.id) {
      await adminSupabase.from('cart_items').delete().eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      orderId,
      order: {
        id: orderId,
        total,
        subtotal,
        discount,
        shipping,
        trackingNumber,
        items: verifiedOrderItems,
        address: body.address,
        paymentMethod: body.paymentMethod,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error processing checkout.' }, { status: 500 });
  }
}
