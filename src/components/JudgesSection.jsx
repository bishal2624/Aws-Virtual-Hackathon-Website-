import React from 'react';
import { ShieldCheck, CheckSquare, Award, ExternalLink } from 'lucide-react';
import { RUBRIC_CRITERIA, RUBRIC_TOTAL_POINTS, JUDGE_GUIDELINES } from '../data/rubric';
import { EVENT_CONFIG } from '../data/hackathonData';

export default function JudgesSection() {
  return (
    <section
      id="judges"
      style={{
        position: 'relative',
        minHeight: '100vh',
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
              color: 'var(--accent-orange)',
              letterSpacing: '0.14em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>SECTION 07</span>
            <span>/</span>
            <span>EVALUATION STANDARDS</span>
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
            THE JUDGES' CHAMBER
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#C8CDD8'
            }}
          >
            All submitted projects are evaluated against an official 60-point rubric. Points are distributed across six transparent criteria to recognize both architecture and execution quality.
          </p>
        </div>

        {/* Main Rubric Layout (Desktop Table, Mobile Stacked Cards) */}
        <div
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(200, 205, 216, 0.14)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(20px, 4vw, 40px)',
            marginBottom: '40px'
          }}
        >
          {/* Table Header (Hidden on Mobile via CSS) */}
          <div className="desktop-rubric-table">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 240px 100px 1fr',
                gap: '20px',
                padding: '14px 18px',
                backgroundColor: '#171717',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--accent-orange)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              <div>#</div>
              <div>CRITERION</div>
              <div>MAX POINTS</div>
              <div>EVALUATION FOCUS</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {RUBRIC_CRITERIA.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 240px 100px 1fr',
                    gap: '20px',
                    alignItems: 'center',
                    padding: '16px 18px',
                    backgroundColor: 'rgba(10, 13, 20, 0.65)',
                    border: '1px solid rgba(200, 205, 216, 0.08)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
                    0{item.number}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#F4F1EB' }}>
                    {item.criterion}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--accent-orange)' }}>
                    {item.maxPoints} pts
                  </div>
                  <div style={{ fontSize: '13px', color: '#C8CDD8', lineHeight: 1.5 }}>
                    {item.focus}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Rubric Cards */}
          <div className="mobile-rubric-cards" style={{ display: 'none', flexDirection: 'column', gap: '14px' }}>
            {RUBRIC_CRITERIA.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#121520',
                  border: '1px solid rgba(200, 205, 216, 0.1)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    CRITERION 0{item.number}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800, color: 'var(--accent-orange)' }}>
                    {item.maxPoints} pts
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: '#F4F1EB', marginBottom: '6px' }}>
                  {item.criterion}
                </div>
                <div style={{ fontSize: '13px', color: '#C8CDD8', lineHeight: 1.5 }}>
                  {item.focus}
                </div>
              </div>
            ))}
          </div>

          {/* Total Points Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginTop: '24px',
              padding: '18px 24px',
              backgroundColor: '#171717',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(163, 255, 18, 0.3)'
            }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#F4F1EB' }}>
              Maximum Total Assessment
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-green)', letterSpacing: '0.08em' }}>
                SUM OF 6 CRITERIA
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)' }}>
                {RUBRIC_TOTAL_POINTS} POINTS
              </span>
            </div>
          </div>
        </div>

        {/* Official Judges Panel */}
        {EVENT_CONFIG.judges && EVENT_CONFIG.judges.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                textTransform: 'uppercase',
                color: 'var(--accent-orange)',
                letterSpacing: '0.14em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>PANEL MEMBERS</span>
              <span>/</span>
              <span>EVALUATION JUDGES</span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                lineHeight: 1.15,
                fontWeight: 800,
                color: '#F4F1EB',
                marginBottom: '24px'
              }}
            >
              THE JUDGES
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 360px))',
                gap: '24px'
              }}
            >
              {EVENT_CONFIG.judges.map((judge) => (
                <div
                  key={judge.id}
                  className="judge-profile-card"
                  style={{
                    backgroundColor: 'rgba(5, 5, 5, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 117, 24, 0.35)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '24px',
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 117, 24, 0.05)',
                    transition: 'border-color var(--transition-standard), transform var(--transition-standard), box-shadow var(--transition-standard)'
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255, 117, 24, 0.12)',
                        border: '1px solid rgba(255, 117, 24, 0.4)',
                        color: 'var(--accent-orange)',
                        marginBottom: '16px'
                      }}
                    >
                      JUDGE
                    </div>

                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(1.3rem, 2.2vw, 1.6rem)',
                        fontWeight: 700,
                        color: '#F4F1EB',
                        margin: 0,
                        lineHeight: 1.3
                      }}
                    >
                      {judge.name}
                    </h4>
                  </div>

                  <div>
                    <a
                      href={judge.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary judge-linkedin-link"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        width: '100%',
                        minHeight: '44px',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        style={{ flexShrink: 0, color: 'var(--accent-orange)' }}
                      >
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24" />
                      </svg>
                      <span>View LinkedIn Profile</span>
                      <ExternalLink size={14} style={{ opacity: 0.8 }} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Judge Guidelines Box */}
        <div
          style={{
            maxWidth: '920px',
            backgroundColor: 'rgba(23, 23, 23, 0.85)',
            border: '1px solid rgba(200, 205, 216, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 28px'
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-orange)', letterSpacing: '0.1em', marginBottom: '14px' }}>
            Official Judge Guidelines
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {JUDGE_GUIDELINES.map((guide, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckSquare size={18} color="var(--accent-orange)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', lineHeight: 1.6, color: '#C8CDD8' }}>
                  {guide}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
