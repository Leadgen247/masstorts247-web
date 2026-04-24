'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type PriceKey = 't2_monthly' | 't2_yearly' | 't3_monthly' | 't3_yearly';

const PLANS: Array<{
  key: PriceKey;
  tier: 'Professional' | 'Enterprise';
  price: string;
  period: string;
  tagline: string;
}> = [
  { key: 't2_monthly', tier: 'Professional', price: '$100', period: '/month', tagline: 'Introductory pricing' },
  { key: 't2_yearly', tier: 'Professional', price: '$1,000', period: '/year', tagline: 'Save $200/year' },
  { key: 't3_monthly', tier: 'Enterprise', price: '$500', period: '/month', tagline: 'Introductory pricing' },
  { key: 't3_yearly', tier: 'Enterprise', price: '$5,000', period: '/year', tagline: 'Save $1,000/year' },
];

function CheckoutStatusBanner() {
  const params = useSearchParams();
  const checkoutStatus = params.get('checkout');
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (checkoutStatus === 'success') {
      setBanner('Payment received. Your subscription is being activated — refresh in a few seconds if the tier badge has not updated.');
    } else if (checkoutStatus === 'cancelled') {
      setBanner('Checkout cancelled. You have not been charged.');
    }
  }, [checkoutStatus]);

  if (!banner) return null;
  return (
    <div style={{ background: '#f0f4ff', border: '1px solid #0F1C4F', color: '#0F1C4F', padding: 14, borderRadius: 8, marginBottom: 24 }}>
      {banner}
    </div>
  );
}

function BillingContent() {
  const [loadingKey, setLoadingKey] = useState<PriceKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(priceKey: PriceKey) {
    setLoadingKey(priceKey);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_key: priceKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLoadingKey(null);
    }
  }

  return (
    <>
      <Suspense fallback={null}>
        <CheckoutStatusBanner />
      </Suspense>

      {error && (
        <div style={{ background: '#fff4f4', border: '1px solid #c0392b', color: '#c0392b', padding: 14, borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {PLANS.map((plan) => (
          <div key={plan.key} style={{ border: '1px solid #D6D8E7', borderRadius: 10, padding: 20, background: '#fff' }}>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: '#C4A240', fontWeight: 600 }}>
              {plan.tier}
            </div>
            <div style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 28, marginTop: 8 }}>
              {plan.price}
              <span style={{ fontSize: 14, color: '#4a5578' }}>{plan.period}</span>
            </div>
            <div style={{ fontSize: 13, color: '#4a5578', marginTop: 4, marginBottom: 16 }}>{plan.tagline}</div>
            <button
              onClick={() => startCheckout(plan.key)}
              disabled={loadingKey !== null}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#0F1C4F',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: loadingKey !== null ? 'wait' : 'pointer',
                opacity: loadingKey === plan.key ? 0.6 : 1,
              }}
            >
              {loadingKey === plan.key ? 'Redirecting…' : `Subscribe — ${plan.price}${plan.period}`}
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#6b7394', marginTop: 32 }}>
        Payments are processed securely by Stripe. You can cancel anytime from your billing portal.
      </p>
    </>
  );
}

export default function BillingPage() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px', fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#0F1C4F' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard" style={{ color: '#0F1C4F', textDecoration: 'none', fontSize: 14 }}>← Back to dashboard</Link>
      </div>

      <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 36, margin: '0 0 8px' }}>Billing</h1>
      <p style={{ color: '#4a5578', marginTop: 0, marginBottom: 32 }}>
        Choose a plan to unlock the full MassTorts247 intelligence platform.
      </p>

      <BillingContent />
    </div>
  );
}
