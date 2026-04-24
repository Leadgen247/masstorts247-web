import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Tier = 'T2' | 'T3';
type BillingPeriod = 'monthly' | 'annual';
type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

function mapPriceToTier(priceId: string): { tier: Tier; billing_period: BillingPeriod } | null {
  if (priceId === STRIPE_PRICE_IDS.t2_monthly) return { tier: 'T2', billing_period: 'monthly' };
  if (priceId === STRIPE_PRICE_IDS.t2_yearly) return { tier: 'T2', billing_period: 'annual' };
  if (priceId === STRIPE_PRICE_IDS.t3_monthly) return { tier: 'T3', billing_period: 'monthly' };
  if (priceId === STRIPE_PRICE_IDS.t3_yearly) return { tier: 'T3', billing_period: 'annual' };
  return null;
}

function mapStripeStatus(s: Stripe.Subscription.Status): SubStatus {
  switch (s) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'past_due';
    case 'canceled': return 'canceled';
    default: return 'incomplete';
  }
}

async function resolveUserId(
  admin: ReturnType<typeof getSupabaseAdmin>,
  clerkUserId: string | null,
  stripeCustomerId: string | null
): Promise<string | null> {
  if (clerkUserId) {
    const { data } = await admin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();
    if (data?.id) {
      if (stripeCustomerId) {
        await admin
          .from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', data.id);
      }
      return data.id as string;
    }
  }
  if (stripeCustomerId) {
    const { data } = await admin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }
  return null;
}

async function upsertSubscription(sub: Stripe.Subscription) {
  const admin = getSupabaseAdmin();

  const clerkUserId = (sub.metadata?.clerk_user_id as string | undefined) || null;
  const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const userId = await resolveUserId(admin, clerkUserId, stripeCustomerId);
  if (!userId) {
    console.error('[stripe webhook] no user match for subscription', sub.id);
    return;
  }

  const item = sub.items.data[0];
  const priceId = item?.price?.id;
  if (!priceId) {
    console.error('[stripe webhook] subscription has no price', sub.id);
    return;
  }

  const mapped = mapPriceToTier(priceId);
  if (!mapped) {
    console.error('[stripe webhook] unknown price_id', priceId);
    return;
  }

  const status = mapStripeStatus(sub.status);
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  // Upsert subscriptions row (keyed by stripe_subscription_id)
  const { data: existing } = await admin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', sub.id)
    .maybeSingle();

  const row = {
    user_id: userId,
    stripe_subscription_id: sub.id,
    tier: mapped.tier,
    status,
    billing_period: mapped.billing_period,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
  };

  if (existing?.id) {
    await admin.from('subscriptions').update(row).eq('id', existing.id);
  } else {
    await admin.from('subscriptions').insert(row);
  }

  // Update users.tier: active/trialing → mapped tier; otherwise T1
  const effectiveTier: 'T1' | Tier =
    status === 'active' || status === 'trialing' ? mapped.tier : 'T1';

  await admin.from('users').update({ tier: effectiveTier }).eq('id', userId);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const admin = getSupabaseAdmin();
  const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const clerkUserId = (sub.metadata?.clerk_user_id as string | undefined) || null;

  await admin
    .from('subscriptions')
    .update({ status: 'canceled', cancel_at_period_end: false })
    .eq('stripe_subscription_id', sub.id);

  const userId = await resolveUserId(admin, clerkUserId, stripeCustomerId);
  if (userId) {
    await admin.from('users').update({ tier: 'T1' }).eq('id', userId);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('[stripe webhook] signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await upsertSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe webhook] handler error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
