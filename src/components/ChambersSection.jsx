import React, { useState, useRef, useEffect } from 'react';
import { Bot, Server, GitBranch, Globe2, Sparkles, Terminal, ChevronRight, Check } from 'lucide-react';
import { EVENT_CONFIG } from '../data/hackathonData';

export default function ChambersSection({ activeTrackIdx = 0, onSelectTrack }) {
  const [selectedIdx, setSelectedIdx] = useState(activeTrackIdx);
  const tabListRef = useRef(null);

  const tracks = EVENT_CONFIG.tracks;
  const currentTrack = tracks[selectedIdx] || tracks[0];

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    if (onSelectTrack) onSelectTrack(idx);
  };

  // Keyboard navigation across tab buttons (ArrowLeft / ArrowRight / Home / End)
  const handleKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tracks.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tracks.length) % tracks.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tracks.length - 1;
    }

    if (nextIndex !== index) {
      e.preventDefault();
      handleSelect(nextIndex);
      // Focus corresponding tab button
      const buttons = tabListRef.current?.querySelectorAll('button[role="tab"]');
      if (buttons && buttons[nextIndex]) {
        buttons[nextIndex].focus();
      }
    }
  };

  const getIcon = (num) => {
    switch (num) {
      case '01': return <Bot size={22} />;
      case '02': return <Server size={22} />;
      case '03': return <GitBranch size={22} />;
      case '04': return <Globe2 size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  return (
    <section
      id="chambers"
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
        <div style={{ maxWidth: '820px', marginBottom: '48px' }}>
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
            <span>SECTION 05</span>
            <span>/</span>
            <span>CHALLENGE DOMAINS</span>
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
            THE FOUR CHALLENGE CHAMBERS
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#C8CDD8'
            }}
          >
            Four dedicated tracks designed to evaluate software architecture, technical depth, and cloud innovation. Every challenge track is marked as proposed until formal opening ceremony ratification.
          </p>
        </div>

        {/* Chamber Selection Tabs (Accessible tablist) */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Challenge Chambers"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '32px'
          }}
        >
          {tracks.map((track, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={track.id}
                role="tab"
                id={`chamber-tab-${idx}`}
                aria-selected={isSelected}
                aria-controls={`chamber-panel-${idx}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleSelect(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  backgroundColor: isSelected ? '#171717' : 'rgba(10, 13, 20, 0.75)',
                  border: `1px solid ${isSelected ? track.color : 'rgba(200, 205, 216, 0.12)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: isSelected ? '#F4F1EB' : '#C8CDD8',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  minHeight: '44px'
                }}
              >
                <div
                  style={{
                    color: track.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getIcon(track.chamberNumber)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: track.color, letterSpacing: '0.08em' }}>
                      CHAMBER {track.chamberNumber}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        backgroundColor: 'rgba(255, 176, 0, 0.15)',
                        border: '1px solid rgba(255, 176, 0, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-amber)'
                      }}
                    >
                      PROPOSED
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, marginTop: '4px', lineHeight: 1.3 }}>
                    {track.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Chamber Details Glass Panel */}
        <div
          role="tabpanel"
          id={`chamber-panel-${selectedIdx}`}
          aria-labelledby={`chamber-tab-${selectedIdx}`}
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.85)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${currentTrack.color}`,
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(24px, 4vw, 48px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '36px'
          }}
        >
          {/* Left Column: Description and Example Problem Areas */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: currentTrack.color,
                  letterSpacing: '0.1em'
                }}
              >
                CHAMBER {currentTrack.chamberNumber} SPECIFICATION
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  backgroundColor: 'rgba(255, 176, 0, 0.18)',
                  color: 'var(--accent-amber)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700
                }}
              >
                PROPOSED
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 800,
                color: '#F4F1EB',
                lineHeight: 1.15,
                marginBottom: '16px'
              }}
            >
              {currentTrack.name}
            </h3>

            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#C8CDD8', marginBottom: '24px' }}>
              {currentTrack.description}
            </p>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: currentTrack.color, letterSpacing: '0.08em', marginBottom: '12px' }}>
              Example Problem Spaces
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentTrack.exampleProblems.map((prob, pIdx) => (
                <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#F4F1EB', lineHeight: 1.5 }}>
                  <ChevronRight size={16} color={currentTrack.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{prob}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Suggested AWS Technologies & Disclaimer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#121520',
              padding: '28px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(200, 205, 216, 0.08)'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: '#F4F1EB', letterSpacing: '0.08em', marginBottom: '14px' }}>
                Suggested Technologies
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {currentTrack.awsTechnologies.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      padding: '6px 12px',
                      backgroundColor: '#050505',
                      border: '1px solid rgba(200, 205, 216, 0.15)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#F4F1EB'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                Note: {currentTrack.techNotice}. Any suitable AWS services relevant to your project architecture may be incorporated.
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(200, 205, 216, 0.1)',
                paddingTop: '16px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              CHAMBER ACCENT: {currentTrack.accentName.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
