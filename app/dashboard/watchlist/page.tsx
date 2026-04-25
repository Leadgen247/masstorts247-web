import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardNav from '../DashboardNav';
import WatchlistRemoveBtn from './WatchlistRemoveBtn';

interface WatchlistItem {
  slug: string;
  name: string;
  mdl: string;
  addedAt: string;
}

export default async function WatchlistPage() {
  const user = await currentUser();
  if (!user) redirect('/signin');

  const watchlist = (user.publicMetadata?.watchlist as WatchlistItem[] | undefined) ?? [];

  return (
    <>
      <DashboardNav email={user.emailAddresses[0]?.emailAddress || ''} />
      <div className="dash-wrap">
        <main className="dash-main">
          <h1 style={{ margin: 0 }}>My Watchlist</h1>
          <p className="dash-sub">
            {watchlist.length === 0
              ? "You're not watching any torts yet."
              : `${watchlist.length} ${watchlist.length === 1 ? 'tort' : 'torts'} watched.`}
          </p>

          {watchlist.length === 0 ? (
            <div className="dash-card" style={{ marginTop: 24 }}>
              <h3>Your watchlist is empty.</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Add torts from the Tort Library to start receiving live MDL alerts, SOL countdown reminders, and bellwether updates straight to your inbox.
              </p>
              <Link href="/torts" className="btn btn-primary">
                Browse the Tort Library →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
              {watchlist.map((w) => (
                <div
                  key={w.slug}
                  style={{
                    background: '#fff',
                    border: '1px solid #E4E6F0',
                    borderRadius: 12,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Link
                      href={`/torts/${w.slug}.html`}
                      style={{
                        fontFamily: 'Lora, Georgia, serif',
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#0F1C4F',
                        textDecoration: 'none',
                      }}
                    >
                      {w.name}
                    </Link>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#C4A240',
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                        marginTop: 4,
                      }}
                    >
                      {w.mdl}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                      Added {new Date(w.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Link
                      href={`/torts/${w.slug}.html`}
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#C4A240',
                        textDecoration: 'none',
                      }}
                    >
                      View →
                    </Link>
                    <WatchlistRemoveBtn slug={w.slug} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="dash-card" style={{ marginTop: 24 }}>
            <h3>What watching does</h3>
            <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li><strong>MDL filing alerts</strong> — email when a watched MDL crosses a plaintiff threshold or a major CMO drops</li>
              <li><strong>SOL countdowns</strong> — 90/60/30/7-day warnings on revival windows for watched torts</li>
              <li><strong>Bellwether updates</strong> — verdicts, settlements, and Daubert rulings as they happen</li>
              <li><strong>FDA &amp; PubMed signal</strong> — new label changes, recalls, and peer-reviewed studies on watched products</li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
