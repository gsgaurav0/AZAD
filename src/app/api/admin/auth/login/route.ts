import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required for admin authentication.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. Authenticate credentials against Supabase Auth
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid administrator email or password.' },
        { status: 401 }
      );
    }

    // 2. Verify admin role directly from public.profiles and auth metadata
    const admin = createAdminClient();
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('id, name, email, phone, role, member_tier, avatar_url')
      .eq('id', authData.user.id)
      .maybeSingle();

    const role = profile?.role || authData.user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. This account does not possess Superadmin privileges.',
        },
        { status: 403 }
      );
    }

    // Ensure profile row exists and role is set to admin
    if (!profile) {
      await admin.from('profiles').upsert({
        id: authData.user.id,
        name: authData.user.user_metadata?.name || 'Administrator',
        email: cleanEmail,
        role: 'admin',
        member_tier: 'Diamond VIP Patron',
        is_email_verified: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    return NextResponse.json({
      success: true,
      message: 'Superadmin authenticated successfully.',
      user: {
        id: authData.user.id,
        email: cleanEmail,
        name: profile?.name || authData.user.user_metadata?.name || 'Administrator',
        role: 'admin',
        avatarUrl: profile?.avatar_url,
      },
    });
  } catch (err: any) {
    console.error('Admin login API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error authenticating admin.' },
      { status: 500 }
    );
  }
}
