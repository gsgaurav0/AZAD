import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_COUPONS } from '@/store/couponStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin coupons:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map((c: any) => ({
      id: c.id,
      code: c.code,
      description: c.description || '',
      discountType: c.discount_type || c.discountType || 'percentage',
      discountValue: Number(c.discount_value ?? c.discountValue ?? 0),
      minOrderValue: Number(c.min_order_value ?? c.minOrderValue ?? 0),
      maxDiscount: c.max_discount ? Number(c.max_discount) : (c.maxDiscount ? Number(c.maxDiscount) : undefined),
      usageLimit: c.usage_limit ?? c.usageLimit ?? undefined,
      usageCount: Number(c.usage_count ?? c.usageCount ?? 0),
      isActive: c.is_active !== undefined ? Boolean(c.is_active) : (c.isActive !== undefined ? Boolean(c.isActive) : true),
      expiresAt: c.expires_at ? c.expires_at.split('T')[0] : (c.expiresAt ? c.expiresAt.split('T')[0] : undefined),
      createdAt: c.created_at ? c.created_at.split('T')[0] : (c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    }));

    return NextResponse.json(
      { coupons: mapped },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: any) {
    console.error('Admin coupons GET exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json().catch(() => ({}));
    const admin = createAdminClient();

    // Explicit seed action
    if (action === 'seed' || body.action === 'seed') {
      const seedCoupons = DEFAULT_COUPONS.map((c) => ({
        code: c.code.toUpperCase(),
        description: c.description,
        discount_type: c.discountType,
        discount_value: c.discountValue,
        min_order_value: c.minOrderValue || 0,
        max_discount: c.maxDiscount || null,
        usage_limit: c.usageLimit || null,
        usage_count: c.usageCount || 0,
        is_active: c.isActive,
        expires_at: c.expiresAt ? `${c.expiresAt}T23:59:59Z` : null,
      }));

      const { data: inserted, error: insertError } = await admin
        .from('coupons')
        .upsert(seedCoupons, { onConflict: 'code' })
        .select('*');

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, seeded: true, count: inserted?.length || 0 });
    }

    const code = (body.code || '').trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const newRow = {
      code,
      description: body.description || '',
      discount_type: body.discountType || 'percentage',
      discount_value: Number(body.discountValue) || 10,
      min_order_value: body.minOrderValue ? Number(body.minOrderValue) : 0,
      max_discount: body.maxDiscount ? Number(body.maxDiscount) : null,
      usage_limit: body.usageLimit ? Number(body.usageLimit) : null,
      usage_count: 0,
      is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
      expires_at: body.expiresAt ? `${body.expiresAt}T23:59:59Z` : null,
    };

    const { data, error } = await admin
      .from('coupons')
      .upsert(newRow, { onConflict: 'code' })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating coupon in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const mapped = {
      id: data.id,
      code: data.code,
      description: data.description || '',
      discountType: data.discount_type,
      discountValue: Number(data.discount_value),
      minOrderValue: data.min_order_value ? Number(data.min_order_value) : 0,
      maxDiscount: data.max_discount ? Number(data.max_discount) : undefined,
      usageLimit: data.usage_limit || undefined,
      usageCount: data.usage_count || 0,
      isActive: data.is_active,
      expiresAt: data.expires_at ? data.expires_at.split('T')[0] : undefined,
      createdAt: data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({ coupon: mapped });
  } catch (err: any) {
    console.error('Admin coupon POST exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const dbUpdates: any = {};

    if (updates.code) dbUpdates.code = updates.code.trim().toUpperCase();
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.discountType) dbUpdates.discount_type = updates.discountType;
    if (updates.discountValue !== undefined) dbUpdates.discount_value = Number(updates.discountValue);
    if (updates.minOrderValue !== undefined) dbUpdates.min_order_value = Number(updates.minOrderValue);
    if (updates.maxDiscount !== undefined) dbUpdates.max_discount = updates.maxDiscount ? Number(updates.maxDiscount) : null;
    if (updates.usageLimit !== undefined) dbUpdates.usage_limit = updates.usageLimit ? Number(updates.usageLimit) : null;
    if (updates.isActive !== undefined) dbUpdates.is_active = Boolean(updates.isActive);
    if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt ? `${updates.expiresAt}T23:59:59Z` : null;

    const { data, error } = await admin
      .from('coupons')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating coupon in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const mapped = {
      id: data.id,
      code: data.code,
      description: data.description || '',
      discountType: data.discount_type,
      discountValue: Number(data.discount_value),
      minOrderValue: data.min_order_value ? Number(data.min_order_value) : 0,
      maxDiscount: data.max_discount ? Number(data.max_discount) : undefined,
      usageLimit: data.usage_limit || undefined,
      usageCount: data.usage_count || 0,
      isActive: data.is_active,
      expiresAt: data.expires_at ? data.expires_at.split('T')[0] : undefined,
      createdAt: data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({ coupon: mapped });
  } catch (err: any) {
    console.error('Admin coupon PUT exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    const admin = createAdminClient();

    // Bulk delete: delete all coupons
    if (all || id === 'all') {
      const { error } = await admin.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.error('Error deleting all coupons from Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'All coupons deleted successfully.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const { error } = await admin.from('coupons').delete().eq('id', id);

    if (error) {
      console.error('Error deleting coupon from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Admin coupon DELETE exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
