import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const admin = createAdminClient();

    // 1. Query profiles from Supabase
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
    }

    // 2. Fetch auth.users to check confirmation status directly from Supabase Auth service
    const authConfirmedById: Record<string, boolean> = {};
    const authConfirmedByEmail: Record<string, boolean> = {};
    try {
      const { data: authData } = await admin.auth.admin.listUsers();
      if (authData?.users) {
        for (const u of authData.users) {
          const isConfirmed = Boolean(u.email_confirmed_at || (u as any).confirmed_at);
          if (u.id) authConfirmedById[u.id] = isConfirmed;
          if (u.email) authConfirmedByEmail[u.email.toLowerCase()] = isConfirmed;
        }
      }
    } catch (authErr) {
      console.warn('Admin auth users fetch notice:', authErr);
    }

    // 3. Map profiles into full UserProfile format (supporting both camelCase and snake_case properties)
    const mappedUsers = (profiles || []).map((p: any) => {
      const emailLower = (p.email || '').toLowerCase().trim();
      const isEmailVerified = Boolean(
        p.is_email_verified === true ||
        authConfirmedById[p.id] === true ||
        authConfirmedByEmail[emailLower] === true
      );

      const isPhoneVerified = Boolean(p.is_phone_verified === true);

      // Auto-heal synchronization if out of sync
      if (isEmailVerified && !p.is_email_verified) {
        Promise.resolve(admin.from('profiles').update({ is_email_verified: true }).eq('id', p.id)).catch(() => {});
      }
      if (isEmailVerified && !authConfirmedById[p.id] && p.id) {
        admin.auth.admin.updateUserById(p.id, { email_confirm: true }).catch(() => {});
      }

      return {
        id: p.id,
        name: p.name || 'Anonymous Patron',
        email: p.email || '',
        phone: p.phone || '',
        alternatePhone: p.alternate_phone,
        alternate_phone: p.alternate_phone,
        dateOfBirth: p.date_of_birth,
        date_of_birth: p.date_of_birth,
        gender: p.gender || 'Prefer not to say',
        memberTier: p.member_tier || 'Gold Patron Member',
        member_tier: p.member_tier || 'Gold Patron Member',
        role: p.role || 'customer',
        avatarUrl: p.avatar_url,
        avatar_url: p.avatar_url,
        headline: p.headline,
        company: p.company,
        industry: p.industry,
        bio: p.bio,
        gstNumber: p.gst_number,
        gst_number: p.gst_number,
        isEmailVerified,
        is_email_verified: isEmailVerified,
        isPhoneVerified,
        is_phone_verified: isPhoneVerified,
        joinedDate: p.created_at
          ? new Date(p.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recently Joined',
        createdAt: p.created_at,
        created_at: p.created_at,
        updatedAt: p.updated_at,
        updated_at: p.updated_at,
      };
    });

    return NextResponse.json(
      {
        success: true,
        users: mappedUsers,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ success: true, users: [] });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, role, memberTier, isEmailVerified } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates: any = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (memberTier) updates.member_tier = memberTier;
    if (typeof isEmailVerified === 'boolean') {
      updates.is_email_verified = isEmailVerified;
      try {
        await admin.auth.admin.updateUserById(userId, { email_confirm: isEmailVerified });
      } catch {}
    }

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
