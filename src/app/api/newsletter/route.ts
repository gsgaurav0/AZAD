import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = createAdminClient();

    // Check duplicate
    const { data: existing } = await admin
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', cleanEmail)
      .single();

    if (existing) {
      if (!existing.is_active) {
        await admin.from('newsletter_subscribers').update({ is_active: true }).eq('id', existing.id);
        return NextResponse.json({ success: true, message: 'Your patron subscription has been reactivated.' });
      }
      return NextResponse.json({ success: true, message: 'You are already subscribed to the Mewak Gazette.' });
    }

    const { error: insertErr } = await admin.from('newsletter_subscribers').insert({
      email: cleanEmail,
      is_active: true,
    });

    if (insertErr) {
      console.error('Newsletter insert error:', insertErr);
      return NextResponse.json({ success: false, error: 'Could not record subscription.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome to the Mewak Gazette. Private invitations and release notes will be dispatched to your inbox.',
    });
  } catch (err: any) {
    console.error('Newsletter API error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error processing subscription.' }, { status: 500 });
  }
}
