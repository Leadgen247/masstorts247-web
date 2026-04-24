import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICE_IDS, type PriceKey } from '@/lib/stripe';
import { getSupabaseForUser } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'No email on file' }, { status: 400 });
    }

    const body = await req.json();
    const priceKey = body.price_key as PriceKey | undefined;

    if (!priceKey || !(priceKey in STRIPE_PRICE_IDS)) {
      return NextResponse.json({ error: 'Invalid price_key' }, { status: 400 });
    }

    const priceId = STRIPE_PRICE_IDS[priceKey];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://masstorts247.com';

    // Reuse Stripe customer from any prior subscription row (avoids duplicates)
    const supabase = await getSupabaseForUser();
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .maybeSingle();

    let stripeCustomerId = (existing?.stripe_customer_id as string | null | undefined) || undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { clerk_user_id: userId },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      success_url: `${appUrl}/dashboard/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
      subscription_data: {
        metadata: { clerk_user_id: userId },
      },
      metadata: { clerk_user_id: userId, price_key: priceKey },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe/checkout] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
