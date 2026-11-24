import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

// ==============================================================================
// GET: List all users (harmonizing public.profiles + auth.users)
// ==============================================================================
export async function GET() {
  try {
    const admin = createAdminClient();

    // 1. Fetch profiles from database
    const { data: profiles, error: profileErr } = await admin
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

    if (profileErr) {
      console.warn('Admin users fetch profiles notice:', profileErr.message);
    }

    // 2. Fetch all registered auth users from Supabase Auth service
    let authUsers: any[] = [];
    const authConfirmedById: Record<string, boolean> = {};
    const authConfirmedByEmail: Record<string, boolean> = {};
    const authUserMap: Record<string, any> = {};

    try {
      const { data: authData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (authData?.users) {
        authUsers = authData.users;
        for (const u of authUsers) {
          const isConfirmed = Boolean(u.email_confirmed_at || (u as any).confirmed_at);
          if (u.id) {
            authConfirmedById[u.id] = isConfirmed;
            authUserMap[u.id] = u;
          }
          if (u.email) {
            const emailLower = u.email.toLowerCase().trim();
            authConfirmedByEmail[emailLower] = isConfirmed;
            authUserMap[emailLower] = u;
          }
        }
      }
    } catch (authErr) {
      console.warn('Admin auth users fetch notice:', authErr);
    }

    const seenUserIds = new Set<string>();
    const seenEmails = new Set<string>();
    const mappedUsers: any[] = [];

    // 3. Map profiles
    for (const p of profiles || []) {
      const emailLower = (p.email || '').toLowerCase().trim();
      seenUserIds.add(p.id);
      if (emailLower) seenEmails.add(emailLower);

      const isEmailVerified = Boolean(
        p.is_email_verified === true ||
        authConfirmedById[p.id] === true ||
        authConfirmedByEmail[emailLower] === true
      );

      const isPhoneVerified = Boolean(p.is_phone_verified === true);

      // Auto-heal synchronization if out of sync
      if (isEmailVerified && !p.is_email_verified && isUuid(p.id)) {
        admin.from('profiles').update({ is_email_verified: true }).eq('id', p.id).then(() => {}, () => {});
      }
      if (isEmailVerified && !authConfirmedById[p.id] && isUuid(p.id)) {
        admin.auth.admin.updateUserById(p.id, { email_confirm: true }).then(() => {}, () => {});
      }

      mappedUsers.push({
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
      });
    }

    // 4. Also include any auth.users that don't have a profile row yet
    for (const au of authUsers) {
      const emailLower = (au.email || '').toLowerCase().trim();
      if (!seenUserIds.has(au.id) && !seenEmails.has(emailLower)) {
        seenUserIds.add(au.id);
        if (emailLower) seenEmails.add(emailLower);

        const patronName = au.user_metadata?.name || 'Patron';
        const isEmailVerified = Boolean(au.email_confirmed_at || (au as any).confirmed_at);

        // Auto-create missing profile row in database
        admin.from('profiles').upsert({
          id: au.id,
          name: patronName,
          email: au.email,
          phone: au.phone || '',
          role: au.user_metadata?.role || 'customer',
          member_tier: 'Gold Patron Member',
          is_email_verified: isEmailVerified,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' }).then(() => {}, () => {});

        mappedUsers.push({
          id: au.id,
          name: patronName,
          email: au.email || '',
          phone: au.phone || '',
          role: au.user_metadata?.role || 'customer',
          memberTier: 'Gold Patron Member',
          member_tier: 'Gold Patron Member',
          isEmailVerified,
          is_email_verified: isEmailVerified,
          isPhoneVerified: Boolean(au.phone_confirmed_at),
          joinedDate: au.created_at
            ? new Date(au.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recently Joined',
          createdAt: au.created_at,
          created_at: au.created_at,
        });
      }
    }

    return NextResponse.json(
      { success: true, users: mappedUsers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ success: true, users: [] });
  }
}

// ==============================================================================
// POST: Create a new user (Patron or Admin)
// ==============================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, password, memberTier, isEmailVerified } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanName = (name || '').trim() || 'Patron';
    const userRole = role === 'admin' ? 'admin' : 'customer';
    const tier = memberTier || 'Gold Patron Member';
    const verified = isEmailVerified ?? true;
    const userPass = password || 'MewakPatron2026!';

    const admin = createAdminClient();

    // 1. Create or get Auth user
    let userId: string | null = null;
    const { data: createData, error: createErr } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: userPass,
      email_confirm: verified,
      user_metadata: { name: cleanName, role: userRole },
    });

    if (createErr) {
      // If already registered, fetch existing
      const { data: userList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        userId = existing.id;
        await admin.auth.admin.updateUserById(userId, {
          email_confirm: verified,
          user_metadata: { name: cleanName, role: userRole },
        }).catch(() => {});
      } else {
        return NextResponse.json(
          { success: false, error: createErr.message || 'Failed to create auth user.' },
          { status: 400 }
        );
      }
    } else if (createData?.user) {
      userId = createData.user.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Could not resolve user ID.' },
        { status: 500 }
      );
    }

    // 2. Upsert profile in public.profiles
    const profilePayload = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      phone: phone || '',
      role: userRole,
      member_tier: tier,
      is_email_verified: verified,
      updated_at: new Date().toISOString(),
    };

    const { data: profileData, error: profileErr } = await admin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('*')
      .single();

    if (profileErr) {
      console.warn('Admin user create profile error:', profileErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `User "${cleanName}" created successfully.`,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: phone || '',
        role: userRole,
        memberTier: tier,
        isEmailVerified: verified,
      },
    });
  } catch (err: any) {
    console.error('Admin create user error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error creating user.' },
      { status: 500 }
    );
  }
}

// ==============================================================================
// PUT: Update patron profile credentials, verification, role, or tier
// ==============================================================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      name,
      phone,
      role,
      memberTier,
      isEmailVerified,
      dateOfBirth,
      gender,
      company,
      gstNumber,
      headline,
      bio,
    } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or Email is required for updating.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const cleanEmail = (email || '').trim().toLowerCase();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;
    if (memberTier !== undefined) updates.member_tier = memberTier;
    if (dateOfBirth !== undefined) updates.date_of_birth = dateOfBirth;
    if (gender !== undefined) updates.gender = gender;
    if (company !== undefined) updates.company = company;
    if (gstNumber !== undefined) updates.gst_number = gstNumber;
    if (headline !== undefined) updates.headline = headline;
    if (bio !== undefined) updates.bio = bio;
    if (typeof isEmailVerified === 'boolean') {
      updates.is_email_verified = isEmailVerified;
    }

    // Resolve UUID if possible
    let targetId = isUuid(userId) ? userId : null;

    if (!targetId && cleanEmail) {
      const { data: userList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (found) targetId = found.id;
    }

    // Sync Auth service (email confirmation, metadata)
    if (targetId) {
      const authUpdates: any = {};
      if (typeof isEmailVerified === 'boolean') {
        authUpdates.email_confirm = isEmailVerified;
      }
      if (name || role) {
        authUpdates.user_metadata = {
          ...(name ? { name } : {}),
          ...(role ? { role } : {}),
        };
      }
      if (Object.keys(authUpdates).length > 0) {
        await admin.auth.admin.updateUserById(targetId, authUpdates).catch(() => {});
      }
    }

    // Update public.profiles
    let updatedProfile = null;
    if (targetId) {
      const { data } = await admin
        .from('profiles')
        .update(updates)
        .eq('id', targetId)
        .select('*')
        .maybeSingle();
      updatedProfile = data;
    } else if (cleanEmail) {
      const { data } = await admin
        .from('profiles')
        .update(updates)
        .ilike('email', cleanEmail)
        .select('*')
        .maybeSingle();
      updatedProfile = data;
    }

    return NextResponse.json({
      success: true,
      message: 'Patron profile updated successfully.',
      user: updatedProfile || { id: targetId || userId, ...updates },
    });
  } catch (err: any) {
    console.error('Admin user update error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating user profile.' },
      { status: 500 }
    );
  }
}

// ==============================================================================
// DELETE: Delete user account (database profiles, auth.users, and cascading data)
// ==============================================================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or email is required for deletion.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const cleanEmail = (email || '').trim().toLowerCase();
    let targetId = isUuid(userId) ? userId : null;

    // Look up auth user by email if targetId is not a valid UUID
    if (!targetId && cleanEmail) {
      try {
        const { data: userList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const found = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (found) targetId = found.id;
      } catch (authLookErr) {
        console.warn('Auth lookup notice on delete:', authLookErr);
      }
    }

    // 1. If valid UUID targetId, safely clean up dependent tables
    if (targetId) {
      // Detach user_id from orders so order history is preserved without violating FK
      try {
        await admin.from('orders').update({ user_id: null }).eq('user_id', targetId);
      } catch {}

      // Delete addresses, cart, wishlist
      try {
        await admin.from('addresses').delete().eq('user_id', targetId);
        await admin.from('cart_items').delete().eq('user_id', targetId);
        await admin.from('wishlist_items').delete().eq('user_id', targetId);
      } catch {}

      // Delete from public.profiles
      try {
        await admin.from('profiles').delete().eq('id', targetId);
      } catch (profErr) {
        console.warn('Profile delete notice:', profErr);
      }

      // Delete from Supabase Auth
      try {
        await admin.auth.admin.deleteUser(targetId);
      } catch (authDelErr) {
        console.warn('Auth deleteUser notice:', authDelErr);
      }
    }

    // 2. Also clean by email from profiles if email was provided
    if (cleanEmail) {
      try {
        await admin.from('profiles').delete().ilike('email', cleanEmail);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Patron profile deleted successfully from all registries.',
    });
  } catch (err: any) {
    console.error('Admin user delete error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deleting user.' },
      { status: 500 }
    );
  }
}
