import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyEmailToken, consumeEmailToken } from '@/lib/email/tokens';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    // Verify token or code
    const validation = verifyEmailToken(cleanEmail, cleanCode, 'verify_email');
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    const pending = validation.pendingUserData;
    const admin = createAdminClient();
    let userId: string | null = null;

    if (pending) {
      // 1. New registration verified: Create user in Supabase Auth now!
      const userPassword = pending.password || crypto.randomBytes(16).toString('hex');
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: cleanEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          name: pending.name,
          phone: pending.phone,
          date_of_birth: pending.dateOfBirth || '',
          gender: pending.gender || 'Prefer not to say',
          member_tier: 'Gold Patron Member',
        },
      });

      if (authError) {
        console.warn('Auth user creation during verification notice:', authError.message);
        // If user already exists in auth, find user ID and ensure email is confirmed
        const { data: userList } = await admin.auth.admin.listUsers();
        const existing = userList?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );
        if (existing) {
          userId = existing.id;
          try {
            await admin.auth.admin.updateUserById(userId, { email_confirm: true });
          } catch (e) {
            console.warn('Update user confirm notice:', e);
          }
        }
      } else if (authData?.user) {
        userId = authData.user.id;
      }

      // 2. Insert verified profile into public.profiles
      if (userId) {
        const profilePayload = {
          id: userId,
          name: pending.name,
          email: cleanEmail,
          phone: pending.phone,
          date_of_birth: pending.dateOfBirth || null,
          gender: pending.gender || 'Prefer not to say',
          member_tier: 'Gold Patron Member',
          role: 'customer',
          is_email_verified: true, // VERIFIED!
          is_phone_verified: false,
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await admin
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' });

        if (profileError) {
          console.error('Profile creation error after verification:', profileError);
        }

        // 3. Insert address if provided
        if (
          pending.address &&
          pending.address.street &&
          pending.address.city &&
          pending.address.pincode
        ) {
          const cleanDigitsPhone = pending.phone.replace(/\D/g, '').slice(-10);
          try {
            await admin.from('addresses').insert({
              user_id: userId,
              name: pending.name,
              phone: cleanDigitsPhone,
              street: pending.address.street.trim(),
              locality: pending.address.locality?.trim() || '',
              city: pending.address.city.trim(),
              state: pending.address.state?.trim() || 'Delhi',
              pincode: pending.address.pincode.trim(),
              type: pending.address.type || 'Home',
              is_default: true,
            });
          } catch (addrErr) {
            console.warn('Address insertion after verification notice:', addrErr);
          }
        }
      }
    } else {
      // Existing profile verifying email: update public.profiles & Supabase Auth
      try {
        await admin
          .from('profiles')
          .update({
            is_email_verified: true,
            email: cleanEmail,
            updated_at: new Date().toISOString(),
          })
          .ilike('email', cleanEmail);

        const { data: userList } = await admin.auth.admin.listUsers();
        const existingAuthUser = userList?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );
        if (existingAuthUser) {
          userId = existingAuthUser.id;
          try {
            await admin.auth.admin.updateUserById(existingAuthUser.id, {
              email_confirm: true,
            });
          } catch (e) {
            console.warn('Update user confirm notice:', e);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase profile verification update notice:', dbErr);
      }
    }

    // Invalidate token so it cannot be used again
    consumeEmailToken(cleanEmail, 'verify_email');

    // Retrieve fresh profile record
    const { data: finalProfile } = await admin
      .from('profiles')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      message: 'Your email address has been verified successfully! Profile created.',
      user: finalProfile
        ? {
            id: finalProfile.id,
            name: finalProfile.name,
            email: finalProfile.email,
            phone: finalProfile.phone,
            alternatePhone: finalProfile.alternate_phone,
            dateOfBirth: finalProfile.date_of_birth,
            gender: finalProfile.gender,
            memberTier: finalProfile.member_tier || 'Gold Patron Member',
            role: finalProfile.role || 'customer',
            avatarUrl: finalProfile.avatar_url,
            headline: finalProfile.headline,
            company: finalProfile.company,
            industry: finalProfile.industry,
            bio: finalProfile.bio,
            gstNumber: finalProfile.gst_number,
            isEmailVerified: true,
            is_email_verified: true,
            isPhoneVerified: Boolean(finalProfile.is_phone_verified),
            joinedDate: new Date(finalProfile.created_at || Date.now()).toLocaleDateString(
              'en-US',
              { month: 'long', year: 'numeric' }
            ),
          }
        : null,
      password: pending?.password,
    });
  } catch (err: any) {
    console.error('Verify Confirm Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error confirming email verification.' },
      { status: 500 }
    );
  }
}
