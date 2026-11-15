import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = createAdminClient();

    // Query profiles from Supabase
    const { data: profiles, error } = await admin
      .from('profiles')
      .select(`
        id,
        name,
        email,
        phone,
        alternate_phone,
        date_of_birth,
        gender,
        member_tier,
        role,
        avatar_url,
        headline,
        company,
        industry,
        bio,
        gst_number,
        is_email_verified,
        is_phone_verified,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Admin users fetch notice:', error.message);
      return NextResponse.json({ success: true, users: [] });
    }

    return NextResponse.json({
      success: true,
      users: profiles || [],
    });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ success: true, users: [] });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, role, memberTier } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates: any = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (memberTier) updates.member_tier = memberTier;

    const { data, error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Delete from profiles (cascades to addresses, orders, etc.)
    await admin.from('profiles').delete().eq('id', userId);

    // Delete from auth.users if supported by service role
    try {
      await admin.auth.admin.deleteUser(userId);
    } catch {}

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
