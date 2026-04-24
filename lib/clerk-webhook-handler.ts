import { getSupabaseAdmin } from './supabase';

type ClerkUserData = {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: number;
};

export async function upsertUserFromClerk(userData: ClerkUserData) {
  const supabase = getSupabaseAdmin();

  const primaryEmail = userData.email_addresses.find(
    (e) => e.id === userData.primary_email_address_id
  )?.email_address || userData.email_addresses[0]?.email_address;

  if (!primaryEmail) {
    throw new Error('No email address found on Clerk user');
  }

  const { error } = await supabase.from('users').upsert(
    {
      clerk_user_id: userData.id,
      email: primaryEmail,
      first_name: userData.first_name,
      last_name: userData.last_name,
      tier: 'T1',
      created_at: new Date(userData.created_at).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_user_id' }
  );

  if (error) throw error;
}

export async function deleteUserFromClerk(clerkUserId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_user_id', clerkUserId);

  if (error) throw error;
}
