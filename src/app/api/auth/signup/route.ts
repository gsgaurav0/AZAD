import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, dateOfBirth, gender, address } = body;

    // 1. Validations
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Full legal name is required.' }, { status: 400 });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'Please provide a valid, complete email address.' }, { status: 400 });
    }

    // Gmail username length check (Gmail requires at least 6 characters before @gmail.com)
    if (cleanEmail.endsWith('@gmail.com')) {
      const username = cleanEmail.split('@gmail.com')[0];
      if (username.length < 6) {
        return NextResponse.json({
          success: false,
          error: `Gmail usernames must be between 6 and 30 characters. "${username}" is too short.`,
        }, { status: 400 });
      }
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must contain at least 6 characters.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 2. Create user in Supabase Auth (with email auto-confirmed for seamless luxury experience)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        phone: `+91 ${cleanPhone}`,
        date_of_birth: dateOfBirth || '',
        gender: gender || 'Prefer not to say',
        member_tier: 'Gold Patron Member',
      },
    });

    if (authError) {
      console.error('Supabase admin createUser error:', authError);
      if (authError.message.toLowerCase().includes('already registered') || authError.message.toLowerCase().includes('already been registered')) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        }, { status: 400 });
      }
      return NextResponse.json({
        success: false,
        error: authError.message || 'Failed to create customer account.',
      }, { status: 400 });
    }

    const user = authData.user;
    if (!user) {
      return NextResponse.json({ success: false, error: 'Could not provision user record.' }, { status: 500 });
    }

    // 3. Save profile directly into public.profiles
    const profilePayload = {
      id: user.id,
      name: name.trim(),
      email: cleanEmail,
      phone: `+91 ${cleanPhone}`,
      date_of_birth: dateOfBirth || null,
      gender: gender || 'Prefer not to say',
      member_tier: 'Gold Patron Member',
      role: 'customer',
      is_email_verified: true,
      is_phone_verified: false,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await admin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
    }

    // 4. If address provided, save to public.addresses
    if (address && address.street && address.city && address.pincode) {
      await admin.from('addresses').insert({
        user_id: user.id,
        name: name.trim(),
        phone: cleanPhone,
        street: address.street.trim(),
        locality: address.locality?.trim() || '',
        city: address.city.trim(),
        state: address.state?.trim() || 'Delhi',
        pincode: address.pincode.trim(),
        type: address.type || 'Home',
        is_default: true,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: name.trim(),
        email: cleanEmail,
        phone: `+91 ${cleanPhone}`,
        dateOfBirth: dateOfBirth || '',
        gender: gender || 'Prefer not to say',
        memberTier: 'Gold Patron Member',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isEmailVerified: true,
        role: 'customer',
      },
    });
  } catch (err: any) {
    console.error('Signup endpoint error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal error creating patron account.',
    }, { status: 500 });
  }
}
