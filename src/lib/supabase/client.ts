import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plkrmovgjllfyfopqmin.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton browser instance
let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    return createClient();
  }
  if (!browserClientInstance) {
    browserClientInstance = createClient();
  }
  return browserClientInstance;
}
