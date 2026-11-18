import { NextResponse } from 'next/server';
import { createEmailToken } from '@/lib/email/tokens';
import { sendEmail, renderVerificationEmailTemplate } from '@/lib/email/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid, complete email address.' },
        { status: 400 }
      );
    }

    // Create verification token (enforces 30s resend cooldown)
    const tokenResult = createEmailToken(cleanEmail, 'verify_email');
    if (!tokenResult.success || !tokenResult.code || !tokenResult.token) {
      return NextResponse.json(
        {
          success: false,
          error: tokenResult.error || 'Please wait before requesting another verification email.',
          waitSeconds: tokenResult.waitSeconds || 30,
        },
        { status: 429 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    const verifyUrl = `${origin}/auth/verify-email?email=${encodeURIComponent(
      cleanEmail
    )}&token=${encodeURIComponent(tokenResult.token)}`;

    // Render luxury template & dispatch through Resend
    const html = renderVerificationEmailTemplate({
      name: name || 'Patron',
      code: tokenResult.code,
      verifyUrl,
    });

    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: `Verify Your Patron Email: ${tokenResult.code} • Mewak Luxury`,
      html,
      text: `Your Mewak email verification code is: ${tokenResult.code}. Direct verification link: ${verifyUrl}`,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Failed to dispatch verification email via Resend.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code dispatched to ${cleanEmail}.`,
      waitSeconds: 30,
      devMode: emailResult.devMode,
    });
  } catch (err: any) {
    console.error('Verify Email Send Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing email verification.' },
      { status: 500 }
    );
  }
}
