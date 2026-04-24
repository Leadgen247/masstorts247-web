import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseForUser } from '@/lib/supabase';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await getSupabaseForUser();
    const { data: userRow } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    const stripeCustomerId = userRow?.stripe_customer_id as string | undefined;
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Subscribe first to manage billing.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://masstorts247.com';

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe/portal] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
