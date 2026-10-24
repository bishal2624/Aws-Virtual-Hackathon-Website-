import React from 'react';
import { Shield, Users, Terminal } from 'lucide-react';
import { ORGANIZER_LINE } from '../data/hackathonData';

export default function GateSection() {
  return (
    <section
      id="gate"
      style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 0',
        zIndex: 10
      }}
    >
      <div className="container">
        <div
          style={{
            maxWidth: '780px',
            backgroundColor: 'rgba(5, 5, 5, 0.82)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(200, 205, 216, 0.12)',
            padding: 'clamp(28px, 5vw, 64px)'
          }}
        >
          {/* Section Chapter Tag */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--accent-orange)',
              letterSpacing: '0.14em',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>ACT I</span>
            <span>/</span>
            <span>THE GATES OF THE CITADEL</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
              lineHeight: 1.05,
              fontWeight: 800,
              color: '#F4F1EB',
              marginBottom: '24px'
            }}
          >
            ENTER THE UNKNOWN
          </h2>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
              lineHeight: 1.7,
              color: '#C8CDD8',
              marginBottom: '28px'
            }}
          >
            Hack - To - ween brings student builders together in an online arena dedicated to software craftsmanship. Participants form teams, formulate architectures, and build practical cloud-powered applications on AWS infrastructure.
          </p>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
              lineHeight: 1.7,
              color: '#C8CDD8',
              marginBottom: '36px'
            }}
          >
            The objective is straightforward: experiment with distributed components, collaborate remotely, and showcase working software evaluated on an open, transparent rubric.
          </p>

          {/* Core Tenets */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              borderTop: '1px solid rgba(200, 205, 216, 0.1)',
              paddingTop: '28px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--accent-orange)' }}><Terminal size={20} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#F4F1EB', marginBottom: '4px' }}>
                  Working Software
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Live deployment required. Functional systems take priority over slide decks.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--accent-green)' }}><Users size={20} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#F4F1EB', marginBottom: '4px' }}>
                  Student Community
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {ORGANIZER_LINE}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--accent-purple)' }}><Shield size={20} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#F4F1EB', marginBottom: '4px' }}>
                  Open Rubric
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Every project is evaluated across six published criteria totaling 60 points.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
