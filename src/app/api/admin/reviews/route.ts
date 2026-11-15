import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('reviews')
      .select('*, product:products(id, name, slug, images)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin reviews:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (err: any) {
    console.error('Admin reviews GET exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, rating, title, comment, verified, helpfulCount } = body;

    if (!productId || !userName || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const admin = createAdminClient();
    const newReview = {
      product_id: productId,
      user_name: userName,
      rating: Number(rating),
      title,
      comment,
      verified: Boolean(verified),
      helpful_count: Number(helpfulCount) || 0,
      status: 'approved',
    };

    const { data, error } = await admin
      .from('reviews')
      .insert(newReview)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting review in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ review: data });
  } catch (err: any) {
    console.error('Admin review POST exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to insert review' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, verified, helpfulCount } = body;

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const dbUpdates: any = {};

    if (status) dbUpdates.status = status;
    if (verified !== undefined) dbUpdates.verified = Boolean(verified);
    if (helpfulCount !== undefined) dbUpdates.helpful_count = Number(helpfulCount);

    const { data, error } = await admin
      .from('reviews')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating review in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    console.error('Admin review PUT exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from('reviews').delete().eq('id', id);

    if (error) {
      console.error('Error deleting review from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Admin review DELETE exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete review' }, { status: 500 });
  }
}
