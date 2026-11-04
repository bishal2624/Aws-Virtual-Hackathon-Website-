import React, { useState, useEffect } from 'react';
import { ArrowDown, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { EVENT_CONFIG } from '../data/hackathonData';

export default function HeroSection({ onOpenRegister }) {
  // Countdown state computed from real kickoff: 2026-10-31T00:00:00+05:30
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    statusText: 'Calculating schedule...',
    isLive: false
  });

  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    const kickoffMs = new Date(EVENT_CONFIG.dates.kickoffIso).getTime();
    const deadlineMs = new Date(EVENT_CONFIG.dates.submissionDeadlineIso).getTime();
    const evalEndMs = new Date('2026-11-19T23:59:59+05:30').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();

      if (now < kickoffMs) {
        // Before kickoff
        const diff = Math.max(0, kickoffMs - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Refresh the screen-reader announcement once per minute from live values
        if (new Date(now).getSeconds() === 0) {
          setLiveAnnouncement(`Hackathon countdown: ${days} days, ${hours} hours remaining until kickoff.`);
        }

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          statusText: 'Starts in',
          isLive: false
        });
      } else if (now <= deadlineMs) {
        // Active building
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          statusText: 'Building is open. Submissions close November 5, 2026.',
          isLive: true
        });
      } else if (now <= evalEndMs) {
        // Evaluation
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          statusText: 'Submissions closed. Evaluation in progress.',
          isLive: false
        });
      } else {
        // Results window
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          statusText: 'Results window: November 20 to November 25, 2026.',
          isLive: false
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '100px',
        paddingBottom: '60px',
        zIndex: 10
      }}
    >
      {/* Accessible visually hidden live announcer */}
      <div className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>

      <div className="container">
        {/* Editorial Text Scrim Panel */}
        <div
          style={{
            maxWidth: '880px',
            backgroundColor: 'var(--bg-light)',
            backdropFilter: 'var(--backdrop-blur, blur(10px))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-large)',
            marginBottom: 'var(--space-xlarge)'
          }}
        >
          {/* Eyebrow Label */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-tiny)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--accent-orange)',
              marginBottom: 'var(--space-small)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-tiny)'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-orange)' }} />
            VIRTUAL HACKATHON
          </div>

          {/* Title (Single H1 on the page) */}
          <h1
            className="font-horror-gothic"
            style={{
              fontFamily: 'var(--font-horror-gothic)',
              fontSize: 'clamp(2.4rem, 6.5vw, 5.4rem)',
              lineHeight: 1.05,
              fontWeight: 400,
              color: 'var(--bone-text)',
              letterSpacing: '0.03em',
              marginBottom: 'var(--space-md)',
              wordBreak: 'break-word'
            }}
          >
            Hack - To - ween
          </h1>

          {/* Supporting Horror Decorative Headline */}
          <div
            className="font-horror-drip"
            style={{
              fontFamily: 'var(--font-horror-drip)',
              fontSize: 'clamp(1.4rem, 3.2vw, 2.5rem)',
              fontWeight: 400,
              color: 'var(--accent-orange)',
              letterSpacing: '0.04em',
              lineHeight: 1.25,
              marginBottom: '18px'
            }}
          >
            BUILD BEYOND THE ORDINARY.
          </div>

          {/* Concrete Line */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
              lineHeight: 1.6,
              color: '#C8CDD8',
              marginBottom: '24px',
              maxWidth: '720px'
            }}
          >
            {EVENT_CONFIG.concreteLine}
          </p>

          {/* Headline Dates */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#F4F1EB',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <Calendar size={18} color="var(--accent-orange)" />
            <span>{EVENT_CONFIG.dates.headlineDate}</span>
          </div>

          {/* Collaboration Banner (Major Visual Highlight) */}
          <div
            className="hero-collaboration-highlight"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: 'var(--space-small) var(--space-medium)',
              marginBottom: 'var(--space-xlarge)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'var(--backdrop-blur, blur(8px))',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-small)',
                fontWeight: 700,
                color: 'var(--muted-text)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-xxs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-tiny)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-orange)',
                  boxShadow: '0 0 8px var(--accent-orange)'
                }}
              />
              IN COLLABORATION WITH
            </span>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(18px, 2.4vw, 25px)',
                fontWeight: 800,
                color: 'var(--accent-orange)',
                letterSpacing: '0.03em',
                lineHeight: 1.25,
                textShadow: '0 0 20px rgba(255, 117, 24, 0.45), 0 0 38px rgba(255, 117, 24, 0.22)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              <span>{EVENT_CONFIG.collaborationBanner}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-small)' }}>
            <a
              href="#gate"
              className="btn btn-primary"
              style={{
                textDecoration: 'none',
                minHeight: '48px',
                padding: 'var(--space-small) var(--space-large)',
                fontSize: 'var(--font-small)',
                color: 'var(--bg-darkest)',
                backgroundColor: 'var(--accent-orange)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-ember)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-orange)'}
            >
              ENTER THE HAUNTED WORLD
              <ArrowDown size={16} />
            </a>

            <a
              href="#laboratory"
              className="btn btn-secondary"
              style={{
                textDecoration: 'none',
                minHeight: '48px',
                padding: 'var(--space-small) var(--space-large)',
                fontSize: 'var(--font-small)',
                color: 'var(--accent-orange)',
                backgroundColor: 'transparent',
                border: '2px solid var(--accent-orange)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,117,24,0.08)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
            >
              EXPLORE THE HACKATHON
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Live Countdown Timer Panel */}
        <div
          style={{
            maxWidth: '680px',
            backgroundColor: 'rgba(23, 23, 23, 0.85)',
            border: '1px solid rgba(200, 205, 216, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 28px',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              borderBottom: '1px solid rgba(200, 205, 216, 0.1)',
              paddingBottom: '12px'
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-orange)', letterSpacing: '0.1em' }}>
              {timeLeft.statusText}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {EVENT_CONFIG.dates.timezone}
            </div>
          </div>

          {!timeLeft.isLive && timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                textAlign: 'center'
              }}
            >
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINUTES', val: timeLeft.minutes },
                { label: 'SECONDS', val: timeLeft.seconds }
              ].map((item) => (
                <div key={item.label} style={{ padding: '10px 4px', backgroundColor: '#050505', borderRadius: '4px', border: '1px solid rgba(200, 205, 216, 0.08)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', color: '#F4F1EB', lineHeight: 1 }}>
                    {String(item.val).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              <ShieldCheck size={18} />
              <span>{timeLeft.statusText}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
