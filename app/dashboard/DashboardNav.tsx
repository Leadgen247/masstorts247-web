'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function DashboardNav({ email }: { email: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="app-nav">
        <div className="app-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            <button
              type="button"
              className="dash-menu-toggle"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
            <Link href="/" className="app-brand">
              <svg className="app-brand-logo" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="45" height="45" fill="#FFFFFF" stroke="#000000" strokeWidth="1"/>
                <text x="23" y="22" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="16" fill="#0F1C4F">MT</text>
                <text x="23" y="38" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#C4A240">24/7</text>
              </svg>
              <span className="app-brand-name">Mass Torts<span className="accent">&nbsp;24/7</span></span>
            </Link>
          </div>
          <div className="app-nav-user">
            <span className="app-nav-email">{email}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className={`dash-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      <aside className={`dash-sidebar${menuOpen ? ' open' : ''}`}>
        <h5>Intelligence</h5>
        <ul>
          <li><Link href="/dashboard" className="active" onClick={() => setMenuOpen(false)}>Overview</Link></li>
          <li><Link href="/dashboard/daily-docket" onClick={() => setMenuOpen(false)}>Daily Docket</Link></li>
          <li><Link href="/dashboard/watchlist" onClick={() => setMenuOpen(false)}>My Watchlist</Link></li>
          <li><Link href="/dashboard/torts" onClick={() => setMenuOpen(false)}>Tort Library</Link></li>
        </ul>

        <h5>Tools</h5>
        <ul>
          <li><Link href="/dashboard/ask" onClick={() => setMenuOpen(false)}>Ask MT247</Link></li>
          <li><Link href="/dashboard/estimator" onClick={() => setMenuOpen(false)}>Case Value Estimator</Link></li>
          <li><Link href="/dashboard/sol" onClick={() => setMenuOpen(false)}>SOL Tracker</Link></li>
        </ul>

        <h5>Account</h5>
        <ul>
          <li><Link href="/dashboard/billing" onClick={() => setMenuOpen(false)}>Billing</Link></li>
          <li><Link href="/dashboard/settings" onClick={() => setMenuOpen(false)}>Settings</Link></li>
        </ul>
      </aside>
    </>
  );
}
