import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardNav from './DashboardNav';
import { getCurrentTier } from '@/lib/subscription';

const TIER_LABEL: Record<'T1' | 'T2' | 'T3', string> = {
  T1: 'Free',
  T2: 'Professional',
  T3: 'Enterprise',
};

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/signin');

  const tier = await getCurrentTier();
  const firstName = user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'there';

  return (
    <>
      <DashboardNav email={user.emailAddresses[0]?.emailAddress || ''} />
      <div className="dash-wrap">
        <main className="dash-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
            <h1 style={{ margin: 0 }}>Welcome back, {firstName}.</h1>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: 999,
              background: tier === 'T1' ? '#D6D8E7' : '#C4A240',
              color: tier === 'T1' ? '#0F1C4F' : '#fff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              {TIER_LABEL[tier]}
            </span>
          </div>
          <p className="dash-sub">Here&apos;s what&apos;s moving in mass torts right now.</p>

          <div className="dash-kpi">
            <div className="kpi-box">
              <div className="kpi-lbl">Tracked Matters</div>
              <div className="kpi-val">47</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-lbl">Active MDLs</div>
              <div className="kpi-val">28</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-lbl">On Monitor List</div>
              <div className="kpi-val">10</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-lbl">Your Watchlist</div>
              <div className="kpi-val">0</div>
            </div>
          </div>

          <div className="dash-card">
            <h3>You&apos;re in. What&apos;s next.</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Your {TIER_LABEL[tier]} account is active. The full dashboard is being built out — features roll in over the coming weeks.
              To get the most out of the platform today:
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>
                <strong>
                  <Link href="/dashboard/torts" style={{ color: 'var(--navy, #0F1C4F)', textDecoration: 'underline' }}>
                    Add torts to your Watchlist
                  </Link>
                </strong>
                {' '}— you&apos;ll get email alerts when SOL windows close or new MDL filings spike
              </li>
              <li>
                <strong>
                  <Link href="/dashboard" style={{ color: 'var(--navy, #0F1C4F)', textDecoration: 'underline' }}>
                    Check the Daily Docket
                  </Link>
                </strong>
                {' '}— every PACER filing across 28 active MDLs, updated continuously
              </li>
              <li>
                <strong>
                  <a href="/torts" style={{ color: 'var(--navy, #0F1C4F)', textDecoration: 'underline' }}>
                    Browse the Tort Library
                  </a>
                </strong>
                {' '}— 29-section intelligence template across all 47 tracked matters
              </li>
            </ul>
          </div>

          {tier === 'T1' && (
            <div className="dash-card">
              <h3>Upgrade to Professional</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Get the full daily intelligence email Mon–Fri, unlimited Watchlist, Ask MT247 AI, Case Value Estimator, and the jury verdict tracker.
              </p>
              <Link href="/dashboard/billing" className="btn btn-primary">
                Upgrade — $100/mo
              </Link>
            </div>
          )}

          {tier === 'T2' && (
            <div className="dash-card">
              <h3>You&apos;re on Professional.</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Need unlimited seats, sponsored AdSpy placement, or custom MDL deep-dive reports? Enterprise is $500/mo.
              </p>
              <Link href="/dashboard/billing" className="btn btn-primary">
                Manage billing
              </Link>
            </div>
          )}

          {tier === 'T3' && (
            <div className="dash-card">
              <h3>You&apos;re on Enterprise.</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Every feature is unlocked. Manage billing, seats, and integrations from your billing portal.
              </p>
              <Link href="/dashboard/billing" className="btn btn-primary">
                Manage billing
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
