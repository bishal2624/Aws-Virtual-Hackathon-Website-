import React from 'react';
import { Trophy, Award, Sparkles, HelpCircle } from 'lucide-react';
import { EVENT_CONFIG } from '../data/hackathonData';

export default function VaultSection() {
  const getIcon = (idx) => {
    switch (idx) {
      case 0: return <Trophy size={28} color="var(--accent-orange)" />;
      case 1: return <Award size={28} color="var(--accent-green)" />;
      case 2: return <Sparkles size={28} color="var(--accent-purple)" />;
      default: return <Award size={28} color="var(--accent-moonlight)" />;
    }
  };

  return (
    <section
      id="vault"
      style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px 0',
        zIndex: 10
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '56px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--accent-amber)',
              letterSpacing: '0.14em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>SECTION 08</span>
            <span>/</span>
            <span>HONORS & RECOGNITION</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
              lineHeight: 1.05,
              fontWeight: 800,
              color: '#F4F1EB',
              marginBottom: '18px'
            }}
          >
            THE PRIZE VAULT
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#C8CDD8'
            }}
          >
            Recognition categories dedicated to exceptional technical design, novelty, and cloud architecture. Specific award details will be announced through official community channels prior to kickoff.
          </p>
        </div>

        {/* Four Pedestal Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {EVENT_CONFIG.prizes.map((prize, idx) => (
            <div
              key={prize.title}
              style={{
                backgroundColor: 'rgba(5, 5, 5, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(200, 205, 216, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      backgroundColor: '#171717',
                      border: '1px solid rgba(200, 205, 216, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getIcon(idx)}
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      backgroundColor: 'rgba(200, 205, 216, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {prize.badge}
                  </span>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-orange)', marginBottom: '6px' }}>
                  {prize.category}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#F4F1EB',
                    marginBottom: '14px'
                  }}
                >
                  {prize.title}
                </h3>
              </div>

              {/* Honest unannounced placeholder notice */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#121520',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(200, 205, 216, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}
              >
                <HelpCircle size={14} color="var(--accent-amber)" />
                <span>{prize.statusText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
