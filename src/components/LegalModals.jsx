import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { COLLABORATION_BANNER } from '../data/hackathonData';

export function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 5, 5, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#121520',
          border: '1px solid rgba(200, 205, 216, 0.16)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(200, 205, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="var(--accent-orange)" />
            <h3 id="privacy-modal-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', margin: 0, color: '#F4F1EB' }}>
              Privacy Policy
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close privacy modal"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#171717',
              border: '1px solid rgba(200, 205, 216, 0.15)',
              borderRadius: 'var(--radius-sm)',
              color: '#F4F1EB',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', fontSize: '14px', lineHeight: 1.7, color: '#C8CDD8' }}>
          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>1. Data Collection</h4>
          <p style={{ marginBottom: '16px' }}>
            We collect information provided directly through the registration and submission forms: full name, email address, institution or organization, team name, repository URLs, live demo URLs, and architecture descriptions.
          </p>

          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>2. Purpose of Processing</h4>
          <p style={{ marginBottom: '16px' }}>
            Collected data is strictly used for event administration, identity verification, team communications, and project evaluation per the official 60-point rubric.
          </p>

          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>3. Access and Confidentiality</h4>
          <p style={{ marginBottom: '16px' }}>
            Access is restricted to authorized student builder group administrators and assigned evaluation judges. Reviewer scoring notes and individual evaluation matrices remain confidential. We do not sell or transfer participant data to third parties.
          </p>

          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>4. Data Retention and Correction</h4>
          <p style={{ marginBottom: '16px' }}>
            Records are retained for the duration of the hackathon and post-event verification. Participants may request review, correction, or deletion of their submitted records prior to the final evaluation deadline.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 5, 5, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#121520',
          border: '1px solid rgba(200, 205, 216, 0.16)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(200, 205, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--accent-purple)" />
            <h3 id="terms-modal-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', margin: 0, color: '#F4F1EB' }}>
              Terms of Participation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms modal"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#171717',
              border: '1px solid rgba(200, 205, 216, 0.15)',
              borderRadius: 'var(--radius-sm)',
              color: '#F4F1EB',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', fontSize: '14px', lineHeight: 1.7, color: '#C8CDD8' }}>
          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>1. Originality of Work</h4>
          <p style={{ marginBottom: '16px' }}>
            All submitted projects must be original builds developed during the active hackathon period (October 31 to November 5, 2026). Public repositories must display original commit histories. Pre-built commercial systems are prohibited.
          </p>

          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>2. Cloud Security and Credentials</h4>
          <p style={{ marginBottom: '16px' }}>
            Participants must never commit AWS access keys, secret keys, or cloud credentials to repositories or submission fields. Teams are solely responsible for securing their deployments.
          </p>

          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>3. Submission Deadline and Server Authority</h4>
          <p style={{ marginBottom: '16px' }}>
            All submissions must be logged before November 5, 2026 at 23:59 IST. The server timestamp is authoritative. Late entries will not be processed.
          </p>

          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>4. Intellectual Property</h4>
          <p style={{ marginBottom: '16px' }}>
            Participants retain full ownership and intellectual property rights to the applications and code they build during the hackathon.
          </p>

          <h4 style={{ color: '#F4F1EB', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>5. Trademark Disclaimer</h4>
          <p>
            AWS and Amazon Web Services are trademarks of Amazon.com, Inc. or its affiliates. This hackathon is an academic community initiative organized by {COLLABORATION_BANNER}.
          </p>
        </div>
      </div>
    </div>
  );
}
