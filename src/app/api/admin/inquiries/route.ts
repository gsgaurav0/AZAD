import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_INQUIRIES } from '@/store/inquiryStore';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin inquiries:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-seed if empty
    if (!data || data.length === 0) {
      const seedInquiries = DEFAULT_INQUIRIES.map((inq) => ({
        type: inq.type,
        name: inq.name,
        email: inq.email,
        phone: inq.phone || null,
        subject: inq.subject,
        device_model: inq.deviceModel || null,
        serial_number: inq.serialNumber || null,
        message: inq.message,
        status: inq.status,
        priority: inq.priority,
      }));

      const { data: inserted, error: insertError } = await admin
        .from('inquiries')
        .insert(seedInquiries)
        .select('*');

      if (!insertError && inserted) {
        return NextResponse.json({ inquiries: inserted, seeded: true });
      }
    }

    const mapped = (data || []).map((d: any) => ({
      id: d.id,
      type: d.type,
      name: d.name,
      email: d.email,
      phone: d.phone || undefined,
      subject: d.subject,
      deviceModel: d.device_model || undefined,
      serialNumber: d.serial_number || undefined,
      message: d.message,
      status: d.status,
      priority: d.priority,
      createdAt: d.created_at,
      adminNotes: d.admin_notes || undefined,
      replySent: d.reply_sent || undefined,
    }));

    return NextResponse.json({ inquiries: mapped });
  } catch (err: any) {
    console.error('Admin inquiries GET exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const dbUpdates: any = { updated_at: new Date().toISOString() };

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.adminNotes !== undefined) dbUpdates.admin_notes = updates.adminNotes;
    if (updates.replySent !== undefined) dbUpdates.reply_sent = updates.replySent;

    const { data, error } = await admin
      .from('inquiries')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating inquiry in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, inquiry: data });
  } catch (err: any) {
    console.error('Admin inquiry PUT exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from('inquiries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting inquiry from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Admin inquiry DELETE exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete inquiry' }, { status: 500 });
  }
}
