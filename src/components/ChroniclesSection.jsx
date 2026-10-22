import React from 'react';
import { CheckCircle2, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { EVENT_SCHEDULE, getPhaseStatus } from '../data/hackathonData';

export default function ChroniclesSection() {
  const now = new Date();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 size={14} />,
          text: 'COMPLETED',
          bg: 'rgba(200, 205, 216, 0.1)',
          border: 'rgba(200, 205, 216, 0.3)',
          color: '#C8CDD8'
        };
      case 'ACTIVE':
        return {
          icon: <Clock size={14} />,
          text: 'ACTIVE NOW',
          bg: 'rgba(163, 255, 18, 0.15)',
          border: 'rgba(163, 255, 18, 0.5)',
          color: 'var(--accent-green)'
        };
      case 'UPCOMING':
      default:
        return {
          icon: <Calendar size={14} />,
          text: 'UPCOMING',
          bg: 'rgba(255, 117, 24, 0.12)',
          border: 'rgba(255, 117, 24, 0.4)',
          color: 'var(--accent-orange)'
        };
    }
  };

  return (
    <section
      id="chronicles"
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
            <span>SECTION 06</span>
            <span>/</span>
            <span>SCHEDULE & MILESTONES</span>
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
            THE EVENT CHRONICLES
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#C8CDD8'
            }}
          >
            A six-phase operational roadmap spanning technical preparation through project evaluation and results declaration. Final submission deadline: November 5, 2026.
          </p>
        </div>

        {/* Vertical Timeline Path */}
        <div
          style={{
            position: 'relative',
            maxWidth: '920px',
            margin: '0 auto'
          }}
        >
          {/* Central Vertical Spine Line */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              bottom: '20px',
              left: '28px',
              width: '2px',
              backgroundColor: 'rgba(200, 205, 216, 0.15)'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {EVENT_SCHEDULE.map((item) => {
              const status = getPhaseStatus(item, now);
              const badge = getStatusBadge(status);

              return (
                <div
                  key={item.phase}
                  style={{
                    position: 'relative',
                    paddingLeft: '72px'
                  }}
                >
                  {/* Timeline Node Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '16px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: status === 'ACTIVE' ? '#A3FF12' : '#171717',
                      border: `2px solid ${badge.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: status === 'ACTIVE' ? '#050505' : '#F4F1EB',
                      zIndex: 2
                    }}
                  >
                    {item.phase}
                  </div>

                  {/* Milestone Card */}
                  <div
                    style={{
                      backgroundColor: 'rgba(5, 5, 5, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${status === 'ACTIVE' ? 'var(--accent-green)' : 'rgba(200, 205, 216, 0.12)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '24px 28px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-orange)', fontWeight: 700 }}>
                        {item.dateLabel}
                      </div>

                      {/* Status Tag with text AND icon */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          letterSpacing: '0.08em',
                          padding: '4px 10px',
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          borderRadius: 'var(--radius-sm)',
                          color: badge.color
                        }}
                      >
                        {badge.icon}
                        <span>{badge.text}</span>
                      </div>
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                        fontWeight: 700,
                        color: '#F4F1EB',
                        marginBottom: '8px'
                      }}
                    >
                      {item.name}
                    </h3>

                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#C8CDD8', margin: 0 }}>
                      {item.description}
                    </p>

                    {item.phase === 4 && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '10px 14px',
                          backgroundColor: 'rgba(255, 117, 24, 0.1)',
                          border: '1px solid rgba(255, 117, 24, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          color: '#F4F1EB',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <AlertTriangle size={15} color="var(--accent-orange)" />
                        <span>Deadline Notice: Submissions close November 5, 2026 at 23:59 IST. Never described as a 48-hour event.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
