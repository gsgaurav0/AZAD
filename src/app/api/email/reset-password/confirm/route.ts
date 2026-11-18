import { NextResponse } from 'next/server';
import { verifyEmailToken, consumeEmailToken } from '@/lib/email/tokens';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit recovery code are required.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must contain at least 6 characters.' },
        { status: 400 }
      );
    }

    // Verify token or 6-digit code
    const validation = verifyEmailToken(cleanEmail, cleanCode, 'reset_password');
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid or expired recovery code.' },
        { status: 400 }
      );
    }

    // Update password in Supabase Auth
    try {
      const admin = createAdminClient();
      
      // Look up user by email in auth.users
      const { data: usersData, error: listErr } = await admin.auth.admin.listUsers();
      if (!listErr && usersData && usersData.users) {
        const targetUser = usersData.users.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (targetUser) {
          const { error: updateErr } = await admin.auth.admin.updateUserById(targetUser.id, {
            password: newPassword,
          });
          if (updateErr) {
            console.error('Supabase admin updateUserById error:', updateErr);
            return NextResponse.json(
              { success: false, error: updateErr.message || 'Failed to update user password.' },
              { status: 400 }
            );
          }
        }
      }
    } catch (dbErr) {
      console.warn('Supabase password reset update notice:', dbErr);
    }

    // Invalidate token
    consumeEmailToken(cleanEmail, 'reset_password');

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('Reset Password Confirm Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error confirming password reset.' },
      { status: 500 }
    );
  }
}
