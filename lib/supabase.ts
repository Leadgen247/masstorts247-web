import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Server-side Supabase client with the user's Clerk JWT.
 * Use this in server components and API routes for per-user reads/writes.
 */
export async function getSupabaseForUser() {
  const { getToken } = await auth();
  const token = await getToken();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  );
}

/**
 * Admin client — uses the service role key. ONLY use server-side for
 * admin tasks (e.g., creating user records, webhooks). Never expose to client.
 */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
