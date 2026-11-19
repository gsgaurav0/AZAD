import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteBaseUrl } from '@/lib/siteUrl';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getSiteBaseUrl(request);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate+user`);
}
