import { NextResponse } from 'next/server';
import { createEmailToken } from '@/lib/email/tokens';
import { sendEmail, renderPasswordResetEmailTemplate } from '@/lib/email/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteBaseUrl } from '@/lib/siteUrl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Check if account exists in Supabase Auth or Profiles
    const admin = createAdminClient();
    const { data: usersData, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const targetUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'No patron account found with this email address. Please create a profile first.' },
        { status: 404 }
      );
    }

    let patronName = targetUser.user_metadata?.name || 'Patron';
    try {
      const { data: profile } = await admin
        .from('profiles')
        .select('name')
        .eq('id', targetUser.id)
        .maybeSingle();

      if (profile && profile.name) {
        patronName = profile.name;
      }
    } catch {
      // Continue gracefully
    }

    // Generate reset token (enforces 30s resend cooldown)
    const tokenResult = createEmailToken(cleanEmail, 'reset_password');
    if (!tokenResult.success || !tokenResult.code || !tokenResult.token) {
      return NextResponse.json(
        {
          success: false,
          error: tokenResult.error || 'Please wait before requesting another recovery email.',
          waitSeconds: tokenResult.waitSeconds || 30,
        },
        { status: 429 }
      );
    }

    const origin = getSiteBaseUrl(request);

    const resetUrl = `${origin}/auth/reset-password?email=${encodeURIComponent(
      cleanEmail
    )}&token=${encodeURIComponent(tokenResult.token)}`;

    // Render luxury template & dispatch through Resend
    const html = renderPasswordResetEmailTemplate({
      name: patronName,
      code: tokenResult.code,
      resetUrl,
    });

    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: `Reset Your Mewak Password: ${tokenResult.code}`,
      html,
      text: `Your Mewak password recovery code is: ${tokenResult.code}. Reset URL: ${resetUrl}`,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Failed to dispatch recovery email via Resend.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset instructions dispatched to ${cleanEmail}.`,
      waitSeconds: 30,
      devMode: emailResult.devMode,
    });
  } catch (err: any) {
    console.error('Reset Password Send Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing password reset.' },
      { status: 500 }
    );
  }
}
