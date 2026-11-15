import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRODUCTS } from '@/data/products';

const DEFAULT_CATEGORIES = [
  {
    id: 'headphones',
    name: 'Headphones & Audio',
    description: 'Studio planar open-backs, true wireless ANC earbuds & spatial gaming headsets',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'phones',
    name: 'Smartphones',
    description: 'Snapdragon 8 Gen 3 flagships, dual-screen foldables & periscope cameras',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'smartwatches',
    name: 'Smartwatches',
    description: 'Aerospace Grade 5 titanium, sapphire glass & precision biometric sensors',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'accessories',
    name: 'Accessories & Power',
    description: '140W GaN desktop power hubs, magnetic wireless chargers & cables',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
  },
];

async function ensureCategories(admin: ReturnType<typeof createAdminClient>, customCategory?: string) {
  try {
    await admin.from('categories').upsert(DEFAULT_CATEGORIES, { onConflict: 'id' });
    if (customCategory && !DEFAULT_CATEGORIES.some((c) => c.id === customCategory)) {
      await admin.from('categories').upsert({
        id: customCategory,
        name: customCategory.charAt(0).toUpperCase() + customCategory.slice(1).replace(/-/g, ' '),
        description: `Catalog collection for ${customCategory}`,
      }, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('ensureCategories notice:', err);
  }
}

export async function GET() {
  try {
    const admin = createAdminClient();
    await ensureCategories(admin);

    const { data: productsData, error: prodErr } = await admin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (prodErr) {
      console.error('Error fetching admin products:', prodErr);
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    // Auto-seed default catalog if empty
    if (!productsData || productsData.length === 0) {
      const seedRows = PRODUCTS.map((p) => ({
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
        review_count: Number(p.reviewCount) || (p.reviews ? p.reviews.length : 0),
        colors: Array.isArray(p.colors) ? p.colors : [],
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        images: Array.isArray(p.images) ? p.images : [],
        fabric: p.fabric || 'Aero-grade Aluminum & Ceramic',
        fit: p.fit || 'Ergonomic Acoustic Seal',
        care: Array.isArray(p.care) ? p.care : ['2-Year Official Brand Replacement Warranty'],
        description: p.description || '',
        details: Array.isArray(p.details) ? p.details : ['Precision CNC Machined Chassis'],
        returns: p.returns || '15-day risk-free home trial with complimentary doorstep replacement',
        in_stock: true,
      }));

      const { data: inserted, error: insertError } = await admin
        .from('products')
        .upsert(seedRows, { onConflict: 'id' })
        .select('*');

      if (!insertError && inserted) {
        return NextResponse.json({ products: inserted, seeded: true });
      }
    }

    // Query reviews to attach to products
    const { data: reviewsData } = await admin.from('reviews').select('*');
    const reviewsByProd: Record<string, any[]> = {};
    (reviewsData || []).forEach((r: any) => {
      if (!reviewsByProd[r.product_id]) reviewsByProd[r.product_id] = [];
      reviewsByProd[r.product_id].push({
        id: r.id,
        userName: r.user_name,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        helpfulCount: r.helpful_count || 0,
        date: new Date(r.created_at).toLocaleDateString('en-GB'),
      });
    });

    const mapped = (productsData || []).map((p: any) => ({
      ...p,
      reviews: reviewsByProd[p.id] || [],
    }));

    return NextResponse.json({ products: mapped });
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
    const rawCategory = (body.category || 'headphones').toLowerCase().trim();
    await ensureCategories(admin, rawCategory);

    // Compute unique slug
    const baseSlug = (body.slug || body.name || `product-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: slugCheck } = await admin
      .from('products')
      .select('id')
      .eq('slug', baseSlug)
      .neq('id', id)
      .maybeSingle();

    const finalSlug = slugCheck ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    // Normalizing array fields
    const safeImages = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'];

    const safeColors = Array.isArray(body.colors) && body.colors.length > 0
      ? body.colors
      : [{ name: 'Space Black', hex: '#111827', image: safeImages[0] }];

    const safeSizes = Array.isArray(body.sizes) && body.sizes.length > 0
      ? body.sizes
      : [{ size: 'Standard Edition', inStock: true, stockCount: 20 }];

    const safeCare = Array.isArray(body.care)
      ? body.care
      : typeof body.care === 'string'
      ? body.care.split('\n').filter(Boolean)
      : ['2-Year Official Brand Replacement Warranty'];

    const safeDetails = Array.isArray(body.details)
      ? body.details
      : typeof body.details === 'string'
      ? body.details.split('\n').filter(Boolean)
      : ['Precision CNC Machined Chassis'];

    const price = Math.max(0, Number(body.price) || 9999);
    const originalPrice = Math.max(price, Number(body.originalPrice) || price);
    const discountPercent = Math.min(100, Math.max(0, Math.round(Number(body.discountPercent) || 0)));

    const newRow = {
      id,
      slug: finalSlug,
      name: (body.name || 'Untitled Hardware').trim(),
      subtitle: (body.subtitle || '').trim(),
      category: rawCategory,
      subcategory: (body.subcategory || 'Hardware').trim(),
      price,
      original_price: originalPrice,
      discount_percent: discountPercent,
      is_new: Boolean(body.isNew),
      is_trending: Boolean(body.isTrending),
      is_featured: Boolean(body.isFeatured),
      occasion: body.occasion || 'Work',
      rating: Math.min(5, Math.max(0, Number(body.rating) || 5.0)),
      review_count: Math.max(0, Number(body.reviewCount) || 0),
      colors: safeColors,
      sizes: safeSizes,
      images: safeImages,
      fabric: (body.fabric || 'Aero-grade Aluminum & Ceramic').trim(),
      fit: (body.fit || 'Ergonomic Acoustic Seal').trim(),
      care: safeCare,
      description: (body.description || '').trim(),
      details: safeDetails,
      returns: (body.returns || '15-day risk-free home trial with complimentary doorstep replacement').trim(),
      in_stock: body.inStock !== undefined ? Boolean(body.inStock) : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from('products')
      .upsert(newRow, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: { ...data, reviews: [] } }, { status: 201 });
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

    if (updates.category) {
      await ensureCategories(admin, updates.category.toLowerCase().trim());
    }

    const dbUpdates: any = { updated_at: new Date().toISOString() };

    if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug.trim();
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle.trim();
    if (updates.category !== undefined) dbUpdates.category = updates.category.toLowerCase().trim();
    if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory.trim();
    if (updates.price !== undefined) dbUpdates.price = Math.max(0, Number(updates.price));
    if (updates.originalPrice !== undefined) dbUpdates.original_price = Math.max(0, Number(updates.originalPrice));
    if (updates.discountPercent !== undefined) {
      dbUpdates.discount_percent = Math.min(100, Math.max(0, Math.round(Number(updates.discountPercent) || 0)));
    }
    if (updates.isNew !== undefined) dbUpdates.is_new = Boolean(updates.isNew);
    if (updates.isTrending !== undefined) dbUpdates.is_trending = Boolean(updates.isTrending);
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = Boolean(updates.isFeatured);
    if (updates.occasion !== undefined) dbUpdates.occasion = updates.occasion;
    if (updates.rating !== undefined) dbUpdates.rating = Math.min(5, Math.max(0, Number(updates.rating) || 5.0));
    if (updates.reviewCount !== undefined) dbUpdates.review_count = Math.max(0, Number(updates.reviewCount) || 0);
    if (updates.colors !== undefined) dbUpdates.colors = Array.isArray(updates.colors) ? updates.colors : [];
    if (updates.sizes !== undefined) dbUpdates.sizes = Array.isArray(updates.sizes) ? updates.sizes : [];
    if (updates.images !== undefined) dbUpdates.images = Array.isArray(updates.images) ? updates.images : [];
    if (updates.fabric !== undefined) dbUpdates.fabric = updates.fabric;
    if (updates.fit !== undefined) dbUpdates.fit = updates.fit;
    if (updates.care !== undefined) dbUpdates.care = Array.isArray(updates.care) ? updates.care : [updates.care];
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.details !== undefined) dbUpdates.details = Array.isArray(updates.details) ? updates.details : [updates.details];
    if (updates.returns !== undefined) dbUpdates.returns = updates.returns;
    if (updates.inStock !== undefined) dbUpdates.in_stock = Boolean(updates.inStock);

    const { data, error } = await admin
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating product in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data });
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
