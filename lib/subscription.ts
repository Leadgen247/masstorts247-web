import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from './supabase';

export type Tier = 'T1' | 'T2' | 'T3';

const TIER_RANK: Record<Tier, number> = { T1: 1, T2: 2, T3: 3 };

export function hasTierAccess(userTier: Tier, required: Tier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

/**
 * Read the current user's effective tier from Supabase.
 * Returns 'T1' if not signed in or no paid subscription.
 *
 * Uses the admin client because we need reliable reads during server rendering
 * regardless of the user's RLS state.
 */
export async function getCurrentTier(): Promise<Tier> {
  const { userId } = await auth();
  if (!userId) return 'T1';

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from('users')
    .select('tier')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  const tier = (data?.tier as Tier | undefined) || 'T1';
  return tier;
}

/**
 * Guard a server component. Returns the user's tier if they meet the
 * required level; returns null if they do not (caller should redirect/render upsell).
 */
export async function requireTier(required: Tier): Promise<Tier | null> {
  const tier = await getCurrentTier();
  return hasTierAccess(tier, required) ? tier : null;
}
