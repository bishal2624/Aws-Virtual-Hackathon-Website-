import React from 'react';
import { CheckCircle2, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { EVENT_SCHEDULE, getPhaseStatus } from '../data/hackathonData';
import './ChroniclesSection.css';

export default function ChroniclesSection() {
  const now = new Date();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 size={14} />,
          text: 'COMPLETED',
          statusClass: 'status-completed',
          bg: 'rgba(200, 205, 216, 0.1)',
          border: 'rgba(200, 205, 216, 0.3)',
          color: '#C8CDD8'
        };
      case 'ACTIVE':
        return {
          icon: <Clock size={14} />,
          text: 'ACTIVE NOW',
          statusClass: 'status-active',
          bg: 'rgba(163, 255, 18, 0.15)',
          border: 'rgba(163, 255, 18, 0.5)',
          color: 'var(--accent-green)'
        };
      case 'UPCOMING':
      default:
        return {
          icon: <Calendar size={14} />,
          text: 'UPCOMING',
          statusClass: 'status-upcoming',
          bg: 'rgba(255, 117, 24, 0.12)',
          border: 'rgba(255, 117, 24, 0.4)',
          color: 'var(--accent-orange)'
        };
    }
  };

  return (
    <section id="chronicles" className="chronicles-section">
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '56px' }}>
          <div className="chronicles-kicker">
            <span>SECTION 06</span>
            <span>/</span>
            <span>SCHEDULE & MILESTONES</span>
          </div>

          <h2 className="chronicles-title">
            THE EVENT CHRONICLES
          </h2>

          <p className="chronicles-subtitle">
            A six-phase operational roadmap spanning technical preparation through project evaluation and results declaration. Final submission deadline: November 5, 2026.
          </p>
        </div>

        {/* Vertical Timeline Path */}
        <div className="timeline-container">
          {/* Central Vertical Spine Line */}
          <div className="timeline-spine" />

          <div className="timeline-list">
            {EVENT_SCHEDULE.map((item) => {
              const status = getPhaseStatus(item, now);
              const badge = getStatusBadge(status);

              return (
                <div key={item.phase} className="timeline-item">
                  {/* Timeline Node Marker */}
                  <div
                    className={`timeline-node ${badge.statusClass}`}
                    style={{
                      border: `2px solid ${badge.color}`
                    }}
                  >
                    {item.phase}
                  </div>

                  {/* Milestone Card */}
                  <div className={`timeline-card ${status === 'ACTIVE' ? 'active-phase' : 'standard-phase'}`}>
                    <div className="timeline-card-header">
                      <div className="timeline-date">
                        {item.dateLabel}
                      </div>

                      {/* Status Tag with text AND icon */}
                      <div
                        className="timeline-status-badge"
                        style={{
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color
                        }}
                      >
                        {badge.icon}
                        <span>{badge.text}</span>
                      </div>
                    </div>

                    <h3 className="timeline-milestone-title">
                      {item.name}
                    </h3>

                    <p className="timeline-description">
                      {item.description}
                    </p>

                    {item.phase === 4 && (
                      <div className="timeline-deadline-notice">
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
