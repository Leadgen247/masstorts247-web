import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardNav from '../DashboardNav';

export default async function WatchlistPage() {
  const user = await currentUser();
  if (!user) redirect('/signin');

  return (
    <>
      <DashboardNav email={user.emailAddresses[0]?.emailAddress || ''} />
      <div className="dash-wrap">
        <main className="dash-main">
          <h1 style={{ margin: 0 }}>My Watchlist</h1>
          <p className="dash-sub">Torts you&apos;re tracking — alerts when MDL filings spike or SOL windows close.</p>

          <div className="dash-card" style={{ marginTop: 24 }}>
            <h3>Your watchlist is empty.</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Add torts from the Tort Library to start receiving live MDL alerts, SOL countdown reminders, and bellwether updates straight to your inbox.
            </p>
            <Link href="/torts" className="btn btn-primary">
              Browse the Tort Library →
            </Link>
          </div>

          <div className="dash-card">
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
