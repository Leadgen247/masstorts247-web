import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/signin');

  const firstName = user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'there';

  return (
    <>
      <nav className="app-nav">
        <div className="app-nav-inner">
          <Link href="/" className="app-brand">
            <svg className="app-brand-logo" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="45" height="45" fill="#FFFFFF" stroke="#000000" strokeWidth="1"/>
              <text x="23" y="22" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="16" fill="#0F1C4F">MT</text>
              <text x="23" y="38" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#C4A240">24/7</text>
            </svg>
            <span className="app-brand-name">Mass Torts<span className="accent">&nbsp;24/7</span></span>
          </Link>
          <div className="app-nav-user">
            <span className="app-nav-email">
              {user.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div> 
        </div>
      </nav>

      <div className="dash-wrap">
        <aside className="dash-sidebar">
          <h5>Intelligence</h5>
          <ul>
            <li><Link href="/dashboard" className="active">Overview</Link></li>
            <li><Link href="/dashboard/daily-docket">Daily Docket</Link></li>
            <li><Link href="/dashboard/watchlist">My Watchlist</Link></li>
            <li><Link href="/dashboard/torts">Tort Library</Link></li>
          </ul>

          <h5>Tools</h5>
          <ul>
            <li><Link href="/dashboard/ask">Ask MT247</Link></li>
            <li><Link href="/dashboard/estimator">Case Value Estimator</Link></li>
            <li><Link href="/dashboard/sol">SOL Tracker</Link></li>
          </ul>

          <h5>Account</h5>
          <ul>
            <li><Link href="/dashboard/billing">Billing</Link></li>
            <li><Link href="/dashboard/settings">Settings</Link></li>
          </ul>
        </aside>

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
