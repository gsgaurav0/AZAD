import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, current password, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must contain at least 6 characters.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. Verify current password
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: currentPassword,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect. Please re-enter.' },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 2. Verify admin role
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle();

    const role = profile?.role || authData.user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User is not an administrator.' },
        { status: 403 }
      );
    }

    // 3. Update password in Supabase Auth
    const { error: updateErr } = await admin.auth.admin.updateUserById(authData.user.id, {
      password: newPassword,
    });

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message || 'Failed to update admin password.' },
        { status: 500 }
      );
    }

    // Update timestamp in profiles
    await admin
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    return NextResponse.json({
      success: true,
      message: 'Administrator password has been successfully updated in Supabase database.',
    });
  } catch (err: any) {
    console.error('Admin change password API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating password.' },
      { status: 500 }
    );
  }
}
