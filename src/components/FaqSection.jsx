import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EVENT_CONFIG } from '../data/hackathonData';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section
      id="faq"
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
              color: 'var(--accent-green)',
              letterSpacing: '0.14em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>SECTION 10</span>
            <span>/</span>
            <span>OPERATIONAL CLARITY</span>
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
            QUESTIONS BEFORE THE NIGHT
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#C8CDD8'
            }}
          >
            Common operational inquiries regarding eligibility, cloud architecture rules, repository expectations, and rubric scoring.
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div
          style={{
            maxWidth: '920px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {EVENT_CONFIG.faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(5, 5, 5, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isOpen ? 'var(--accent-orange)' : 'rgba(200, 205, 216, 0.12)'}`,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <button
                  type="button"
                  id={`faq-btn-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: '#F4F1EB',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, lineHeight: 1.4 }}>
                    {faq.question}
                  </span>
                  <div
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-standard)',
                      color: isOpen ? 'var(--accent-orange)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    style={{
                      padding: '0 24px 20px 24px',
                      color: '#C8CDD8',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      borderTop: '1px solid rgba(200, 205, 216, 0.08)',
                      paddingTop: '16px'
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
