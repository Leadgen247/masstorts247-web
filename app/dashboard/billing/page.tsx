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
        <div style
