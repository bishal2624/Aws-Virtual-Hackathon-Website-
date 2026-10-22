import React from 'react';
import { GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { COLLABORATION_BANNER, ORGANIZER_LINE, EVENT_CONFIG } from '../data/hackathonData';

export default function AllianceSection() {
  return (
    <section
      id="alliance"
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
              color: 'var(--accent-purple)',
              letterSpacing: '0.14em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>SECTION 09</span>
            <span>/</span>
            <span>COLLABORATING CHAPTERS</span>
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
            THE ALLIANCE HALL
          </h2>

          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.4rem, 2.6vw, 2.0rem)',
              fontWeight: 700,
              color: 'var(--accent-orange)',
              marginBottom: '14px'
            }}
          >
            {COLLABORATION_BANNER}
          </div>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#C8CDD8'
            }}
          >
            {ORGANIZER_LINE} Two recognized student builder communities united to deliver a rigorous, community-driven online hackathon experience.
          </p>
        </div>

        {/* Two Distinct Text Identity Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            marginBottom: '40px'
          }}
        >
          {EVENT_CONFIG.organizers.map((org, idx) => {
            const isFirst = idx === 0;
            const accentColor = isFirst ? 'var(--accent-purple)' : 'var(--accent-orange)';

            return (
              <div
                key={org.id}
                style={{
                  backgroundColor: 'rgba(5, 5, 5, 0.85)',
                  backdropFilter: 'blur(14px)',
                  border: `1px solid ${accentColor}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '36px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '28px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '6px',
                        backgroundColor: '#171717',
                        border: '1px solid rgba(200, 205, 216, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: accentColor
                      }}
                    >
                      {isFirst ? <GraduationCap size={22} /> : <Building2 size={22} />}
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        padding: '4px 10px',
                        backgroundColor: '#121520',
                        border: `1px solid ${accentColor}`,
                        borderRadius: 'var(--radius-sm)',
                        color: accentColor,
                        fontWeight: 700
                      }}
                    >
                      {org.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#F4F1EB',
                      marginBottom: '6px'
                    }}
                  >
                    {org.name}
                  </h3>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: accentColor, marginBottom: '16px' }}>
                    {org.fullName}
                  </div>

                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#C8CDD8', margin: 0 }}>
                    {org.description}
                  </p>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#171717',
                    border: '1px solid rgba(200, 205, 216, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>COMMUNITY ROLE:</span>
                  <span style={{ color: accentColor, fontWeight: 700 }}>{org.role}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice line */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#121520',
            border: '1px solid rgba(200, 205, 216, 0.1)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          Organizing community status: Academic student communities only. No unauthorized corporate logos or additional institutions.
        </div>
      </div>
    </section>
  );
}
