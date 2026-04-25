'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WatchlistRemoveBtn({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (loading) return;
    if (!confirm('Remove this tort from your watchlist?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Could not remove. Try again.');
        setLoading(false);
      }
    } catch {
      alert('Network error. Try again.');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      style={{
        background: 'transparent',
        border: '1px solid #E4E6F0',
        color: '#6B7280',
        fontSize: 12,
        fontWeight: 600,
        padding: '6px 10px',
        borderRadius: 6,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
      }}
      aria-label="Remove from watchlist"
    >
      {loading ? '…' : 'Remove'}
    </button>
  );
}
