import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
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
          <Link href="/" className="app-nav-link">← Back to Home</Link>
        </div>
      </nav>

      <div className="auth-wrap">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <SignIn
            routing="path"
            path="/signin"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: '#0F1C4F',
                colorBackground: '#FFFFFF',
                colorText: '#1A1A1A',
                colorTextSecondary: '#4A4D60',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                borderRadius: '4px',
              },
              elements: {
                card: {
                  boxShadow: '0 4px 12px rgba(15,28,79,0.08), 0 12px 32px rgba(15,28,79,0.08)',
                  border: '1px solid #E0E2EC',
                },
                headerTitle: {
                  fontFamily: 'Lora, Georgia, serif',
                  fontSize: '26px',
                  color: '#0F1C4F',
                },
                socialButtonsBlockButton: {
                  borderColor: '#C8CAD8',
                  fontWeight: 600,
                },
                socialButtonsBlockButton__google: { order: 1 },
                socialButtonsBlockButton__microsoft: { order: 2 },
                formButtonPrimary: {
                  background: '#C4A240',
                  color: '#0F1C4F',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '13px',
                },
                footerActionLink: { color: '#0F1C4F' },
              },
            }}
          />
          <p className="auth-note" style={{ textAlign: 'center', marginTop: 20 }}>
            By signing in, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
            <br/>
            Corporate email required. Consumer email addresses are not accepted.
          </p>
        </div>
      </div>
    </>
  );
}
