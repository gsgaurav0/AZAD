import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRODUCTS } from '@/data/products';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('products')
      .select('*, reviews(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-seed if products table is empty
    if (!data || data.length === 0) {
      const seedRows = PRODUCTS.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle || '',
        category: p.category,
        subcategory: p.subcategory || 'Hardware',
        price: p.price,
        original_price: p.originalPrice || p.price,
        discount_percent: p.discountPercent || 0,
        is_new: Boolean(p.isNew),
        is_trending: Boolean(p.isTrending),
        is_featured: Boolean(p.isFeatured),
        occasion: p.occasion || 'Work',
        rating: p.rating || 5.0,
        review_count: p.reviewCount || (p.reviews ? p.reviews.length : 0),
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

      const { data: inserted, error: insertError } = await admin
        .from('products')
        .upsert(seedRows, { onConflict: 'id' })
        .select('*, reviews(*)');

      if (!insertError && inserted) {
        return NextResponse.json({ products: inserted, seeded: true });
      }
    }

    return NextResponse.json({ products: data || [] });
  } catch (err: any) {
    console.error('Admin products GET exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();

    const id = body.id || `mewak-${Date.now()}`;
    const rawSlug = body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = rawSlug || `product-${Date.now()}`;

    const newRow = {
      id,
      slug,
      name: body.name || 'Untitled Hardware',
      subtitle: body.subtitle || '',
      category: body.category || 'headphones',
      subcategory: body.subcategory || 'Hardware',
      price: Number(body.price) || 9999,
      original_price: Number(body.originalPrice) || Number(body.price) || 9999,
      discount_percent: Number(body.discountPercent) || 0,
      is_new: Boolean(body.isNew),
      is_trending: Boolean(body.isTrending),
      is_featured: Boolean(body.isFeatured),
      occasion: body.occasion || 'Work',
      rating: Number(body.rating) || 5.0,
      review_count: Number(body.reviewCount) || 0,
      colors: body.colors || [],
      sizes: body.sizes || [],
      images: body.images || [],
      fabric: body.fabric || 'Aero-grade Aluminum & Ceramic',
      fit: body.fit || 'Ergonomic Acoustic Seal',
      care: body.care || ['2-Year Official Brand Replacement Warranty'],
      description: body.description || '',
      details: body.details || ['Precision CNC Machined Chassis'],
      returns: body.returns || '15-day risk-free home trial with complimentary doorstep replacement',
      in_stock: body.inStock !== undefined ? Boolean(body.inStock) : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from('products')
      .upsert(newRow, { onConflict: 'id' })
      .select('*, reviews(*)')
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error('Admin product POST exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const dbUpdates: any = { updated_at: new Date().toISOString() };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) dbUpdates.original_price = Number(updates.originalPrice);
    if (updates.discountPercent !== undefined) dbUpdates.discount_percent = Number(updates.discountPercent);
    if (updates.isNew !== undefined) dbUpdates.is_new = Boolean(updates.isNew);
    if (updates.isTrending !== undefined) dbUpdates.is_trending = Boolean(updates.isTrending);
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = Boolean(updates.isFeatured);
    if (updates.occasion !== undefined) dbUpdates.occasion = updates.occasion;
    if (updates.rating !== undefined) dbUpdates.rating = Number(updates.rating);
    if (updates.reviewCount !== undefined) dbUpdates.review_count = Number(updates.reviewCount);
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.fabric !== undefined) dbUpdates.fabric = updates.fabric;
    if (updates.fit !== undefined) dbUpdates.fit = updates.fit;
    if (updates.care !== undefined) dbUpdates.care = updates.care;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.details !== undefined) dbUpdates.details = updates.details;
    if (updates.returns !== undefined) dbUpdates.returns = updates.returns;
    if (updates.inStock !== undefined) dbUpdates.in_stock = Boolean(updates.inStock);

    const { data, error } = await admin
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select('*, reviews(*)')
      .single();

    if (error) {
      console.error('Error updating product in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error('Admin product PUT exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Admin product DELETE exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
