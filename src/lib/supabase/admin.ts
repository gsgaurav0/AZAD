import { createClient } from '@supabase/supabase-js';

// Server-side administrative client with full bypass of RLS for trusted operations
// (e.g. razorpay payment webhooks, transactional stock deduction, review moderation)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plkrmovgjllfyfopqmin.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
