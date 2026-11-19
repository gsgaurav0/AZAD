import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createEmailToken, PendingUserData } from '@/lib/email/tokens';
import { sendEmail, renderVerificationEmailTemplate } from '@/lib/email/resend';
import { getSiteBaseUrl } from '@/lib/siteUrl';

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

    // 2. Pre-check: Ensure account does not already exist in Supabase profiles or auth
    try {
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        }, { status: 400 });
      }

      const { data: authUsers } = await admin.auth.admin.listUsers();
      const existingAuth = authUsers?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );
      if (existingAuth) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        }, { status: 400 });
      }
    } catch (checkErr) {
      console.warn('Pre-signup existence check notice:', checkErr);
    }

    // 3. Prepare pending registration data (Do NOT create user or profile until email is verified!)
    const pendingUserData: PendingUserData = {
      name: name.trim(),
      email: cleanEmail,
      phone: `+91 ${cleanPhone}`,
      password: password,
      dateOfBirth: dateOfBirth || '',
      gender: gender || 'Prefer not to say',
      address: address || null,
    };

    // 4. Generate email verification token & 6-digit OTP code (enforces 30s resend cooldown)
    const tokenResult = createEmailToken(cleanEmail, 'verify_email', pendingUserData);
    if (!tokenResult.success || !tokenResult.code || !tokenResult.token) {
      return NextResponse.json({
        success: false,
        error: tokenResult.error || 'A verification code was recently dispatched. Please wait before requesting another.',
        waitSeconds: tokenResult.waitSeconds || 30,
      }, { status: tokenResult.waitSeconds ? 429 : 500 });
    }

    const origin = getSiteBaseUrl(request);

    const verifyUrl = `${origin}/auth/verify-email?email=${encodeURIComponent(
      cleanEmail
    )}&token=${encodeURIComponent(tokenResult.token)}`;

    const html = renderVerificationEmailTemplate({
      name: name.trim(),
      code: tokenResult.code,
      verifyUrl,
    });

    // 5. Dispatch verification email via Resend
    const sendResult = await sendEmail({
      to: cleanEmail,
      subject: `Verify Your Email: ${tokenResult.code} • Mewak Luxury`,
      html,
      text: `Welcome to Mewak! Your 6-digit verification code is ${tokenResult.code}. Visit ${verifyUrl} or enter the code to confirm your email and create your patron profile.`,
    });

    if (!sendResult.success) {
      console.warn('Resend email dispatch notice:', sendResult.error);
    }

    return NextResponse.json({
      success: true,
      pendingVerification: true,
      email: cleanEmail,
      name: name.trim(),
      waitSeconds: 30,
      message: `Verification code dispatched to ${cleanEmail}. Please enter the 6-digit code to complete profile creation.`,
    });
  } catch (err: any) {
    console.error('Signup endpoint error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal error processing account registration.',
    }, { status: 500 });
  }
}
