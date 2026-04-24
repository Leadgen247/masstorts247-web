import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  appInfo: {
    name: 'MassTorts247',
    version: '1.0.0',
    url: 'https://masstorts247.com',
  },
});

export const STRIPE_PRICE_IDS = {
  t2_monthly: process.env.STRIPE_PRICE_T2_MONTHLY!,
  t2_yearly: process.env.STRIPE_PRICE_T2_YEARLY!,
  t3_monthly: process.env.STRIPE_PRICE_T3_MONTHLY!,
  t3_yearly: process.env.STRIPE_PRICE_T3_YEARLY!,
} as const;

export type PriceKey = keyof typeof STRIPE_PRICE_IDS;

export function getTierFromPriceId(priceId: string): 't2' | 't3' | null {
  if (priceId === STRIPE_PRICE_IDS.t2_monthly || priceId === STRIPE_PRICE_IDS.t2_yearly) return 't2';
  if (priceId === STRIPE_PRICE_IDS.t3_monthly || priceId === STRIPE_PRICE_IDS.t3_yearly) return 't3';
  return null;
}
