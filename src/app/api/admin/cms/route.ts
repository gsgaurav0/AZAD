import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_CMS_DATA } from '@/store/cmsStore';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('cms_settings')
      .select('*')
      .eq('key', 'storefront_config')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching CMS settings from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && data.value) {
      return NextResponse.json({ cms: data.value });
    }

    // Auto-seed default CMS configuration
    const { data: inserted, error: insertError } = await admin
      .from('cms_settings')
      .upsert({
        key: 'storefront_config',
        value: DEFAULT_CMS_DATA,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (!insertError && inserted?.value) {
      return NextResponse.json({ cms: inserted.value, seeded: true });
    }

    return NextResponse.json({ cms: DEFAULT_CMS_DATA });
  } catch (err: any) {
    console.error('Admin CMS GET exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cms = body.cms || body;

    if (!cms) {
      return NextResponse.json({ error: 'CMS payload is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('cms_settings')
      .upsert({
        key: 'storefront_config',
        value: cms,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving CMS settings to Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, cms: data.value });
  } catch (err: any) {
    console.error('Admin CMS POST exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to save CMS settings' }, { status: 500 });
  }
}
