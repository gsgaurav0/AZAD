import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message, type, deviceModel, serialNumber } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email and message are required.' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin.from('inquiries').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject?.trim() || 'General Customer Inquiry',
      message: message.trim(),
      type: type || 'general',
      device_model: deviceModel || null,
      serial_number: serialNumber || null,
      status: 'new',
      priority: 'normal',
    }).select().single();

    if (error) {
      console.error('Supabase inquiry insert error:', error);
      return NextResponse.json({ success: false, error: 'Failed to record customer message.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been inscribed. Our concierge team will reach out within 24 hours.',
      inquiryId: data.id,
    });
  } catch (err: any) {
    console.error('Contact API error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error processing inquiry.' }, { status: 500 });
  }
}
