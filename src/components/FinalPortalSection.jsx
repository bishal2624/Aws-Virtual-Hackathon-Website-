import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { EVENT_CONFIG, COLLABORATION_BANNER } from '../data/hackathonData';

export default function FinalPortalSection({
  onOpenRegister,
  onOpenSubmit,
  onOpenPrivacy,
  onOpenTerms
}) {
  const currentYear = new Date().getFullYear();
  const regConfig = EVENT_CONFIG.registration;

  const renderRegisterButton = () => {
    if (regConfig.externalUrl && regConfig.externalUrl.startsWith('https://')) {
      return (
        <a
          href={regConfig.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            fontSize: '14px',
            padding: '16px 36px',
            minHeight: '48px',
            textDecoration: 'none'
          }}
        >
          Register for Hackathon
          <ArrowRight size={16} />
        </a>
      );
    } else if (regConfig.status === 'OPEN') {
      return (
        <button
          type="button"
          onClick={onOpenRegister}
          className="btn btn-primary"
          style={{
            fontSize: '14px',
            padding: '16px 36px',
            minHeight: '48px'
          }}
        >
          Register for Hackathon
          <ArrowRight size={16} />
        </button>
      );
    } else {
      return (
        <div
          style={{
            padding: '14px 28px',
            backgroundColor: '#171717',
            border: '1px solid rgba(200, 205, 216, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--accent-orange)'
          }}
        >
          Registration Opening Soon
        </div>
      );
    }
  };

  return (
    <section
      id="portal"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: '140px',
        zIndex: 10
      }}
    >
      <div className="container" style={{ width: '100%' }}>
        {/* Final CTA Center Block */}
        <div
          style={{
            maxWidth: '820px',
            margin: '0 auto 100px auto',
            textAlign: 'center',
            backgroundColor: 'rgba(5, 5, 5, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(200, 205, 216, 0.14)',
            padding: 'clamp(32px, 5vw, 64px)'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--accent-orange)',
              letterSpacing: '0.14em',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>SECTION 11</span>
            <span>/</span>
            <span>THE GATEWAY</span>
          </div>

          <h2
            className="font-horror-gothic"
            style={{
              fontFamily: 'var(--font-horror-gothic)',
              fontSize: 'clamp(2.4rem, 6.2vw, 5.0rem)',
              lineHeight: 1.05,
              fontWeight: 400,
              color: '#F4F1EB',
              letterSpacing: '0.03em',
              marginBottom: '16px'
            }}
          >
            YOUR NEXT BUILD<br />
            STARTS HERE
          </h2>

          {/* Horror Decorative Dripping Accent */}
          <div
            className="font-horror-drip"
            style={{
              fontFamily: 'var(--font-horror-drip)',
              fontSize: 'clamp(1.2rem, 2.6vw, 2.0rem)',
              fontWeight: 400,
              color: 'var(--accent-orange)',
              letterSpacing: '0.05em',
              marginBottom: '16px'
            }}
          >
            THE CITADEL AWAITS YOUR CREATION
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#F4F1EB',
              letterSpacing: '0.08em',
              marginBottom: '20px'
            }}
          >
            {EVENT_CONFIG.dates.headlineDate}
          </div>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
              lineHeight: 1.65,
              color: '#C8CDD8',
              maxWidth: '680px',
              margin: '0 auto 36px auto'
            }}
          >
            Form your team, prepare your architecture blueprints, and join student engineers across the country in building cloud solutions that withstand reality.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '28px' }}>
            {renderRegisterButton()}
            <button
              type="button"
              onClick={onOpenSubmit}
              className="btn btn-secondary"
              style={{
                fontSize: '14px',
                padding: '16px 32px',
                minHeight: '48px'
              }}
            >
              Submit Project
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-green)', letterSpacing: '0.08em' }}>
            IN COLLABORATION WITH {COLLABORATION_BANNER}
          </div>
        </div>
      </div>

      {/* Integrated Environmental Footer */}
      <footer
        style={{
          backgroundColor: '#050505',
          borderTop: '1px solid rgba(200, 205, 216, 0.12)',
          padding: '60px 0 32px 0'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '40px',
              marginBottom: '48px'
            }}
          >
            {/* Identity Col */}
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#F4F1EB', marginBottom: '8px' }}>
                Hack - To - ween
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-orange)', marginBottom: '14px' }}>
                {EVENT_CONFIG.dates.headlineDate}
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
                {EVENT_CONFIG.organizerLine}
              </p>
            </div>

            {/* Navigation Sitemap */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                Event Directory
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'The Gate', href: '#gate' },
                  { label: 'The Laboratory', href: '#laboratory' },
                  { label: 'Challenge Chambers', href: '#chambers' },
                  { label: 'Event Chronicles', href: '#chronicles' },
                  { label: 'Judges Chamber', href: '#judges' },
                  { label: 'Prize Vault', href: '#vault' },
                  { label: 'The Alliance', href: '#alliance' },
                  { label: 'Questions & FAQ', href: '#faq' }
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#C8CDD8',
                        textDecoration: 'none',
                        transition: 'color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#F4F1EB')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#C8CDD8')}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal and Policies */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                Governance & Terms
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    color: '#C8CDD8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    color: '#C8CDD8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Terms and Conditions
                </button>
              </div>

              <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Submissions evaluated on published 60-point rubric. Live demo required.
              </div>
            </div>
          </div>

          {/* Trademark and Copyright Bar */}
          <div
            style={{
              borderTop: '1px solid rgba(200, 205, 216, 0.08)',
              paddingTop: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <div>
              &copy; {currentYear} Hack - To - ween Organizing Committee.
            </div>
            <div>
              AWS and Amazon Web Services are trademarks of Amazon.com, Inc. or its affiliates.
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
