import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardNav from './DashboardNav';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/signin');

  const firstName = user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'there';

  return (
    <>
      <DashboardNav email={user.emailAddresses[0]?.emailAddress || ''} />

      <div className="dash-wrap">
        <main className="dash-main">
      <h1>Welcome back, {firstName}.</h1>
          <p className="dash-sub">Here's what's moving in mass torts right now.</p>

          <div className="dash-kpi">
            <div className="kpi-box">
              <div className="kpi-lbl">New Filings 7d</div>
              <div className="kpi-val">347</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-lbl">Active MDLs</div>
              <div className="kpi-val">28</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-lbl">SOL Closing 30d</div>
              <div className="kpi-val">4</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-lbl">Your Watchlist</div>
              <div className="kpi-val">0</div>
            </div>
          </div>

          <div className="dash-card">
            <h3>You're in. What's next.</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Your Live Access account is active. The full dashboard is being built out — features roll in over the coming weeks.
              To get the most out of the platform today:
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li><strong>Add torts to your Watchlist</strong> — you'll get email alerts when SOL windows close or new MDL filings spike</li>
              <li><strong>Check the Daily Docket</strong> — every PACER filing across 28 active MDLs, updated continuously</li>
              <li><strong>Browse the Tort Library</strong> — 29-section intelligence template for all 40+ tracked torts</li>
            </ul>
          </div>

          <div className="dash-card">
            <h3>Upgrade to T2 Daily Reports</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Get the full daily intelligence email Mon–Fri, unlimited Watchlist, Ask MT247 AI, Case Value Estimator, and the jury verdict tracker.
            </p>
            <Link href="/dashboard/billing" className="btn btn-primary">
              Upgrade — $100/mo
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
