import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Users, ArrowRight, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EVENT_CONFIG } from '../data/hackathonData';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';

export default function RegistrationModal({ isOpen, onClose }) {
  const dialogRef = useDialogFocusTrap(isOpen, { onEscape: onClose });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    teamName: '',
    teamSize: 1,
    trackId: 'track-1',
    consent: false
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (!formData.institution.trim()) newErrors.institution = 'Institution or organization is required.';
    if (!formData.consent) newErrors.consent = 'You must accept the terms of participation.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response (e.g. gateway 502/504 or HTML error page)
      }

      if (res.ok && data?.success) {
        setSuccessData({
          referenceCode: data.referenceCode,
          emailSent: Boolean(data.emailSent),
          emailQueued: Boolean(data.emailQueued),
          fullName: formData.fullName,
          email: formData.email,
          teamName: formData.teamName || 'Individual Builder',
          trackName: EVENT_CONFIG.tracks.find(t => t.id === formData.trackId)?.name || 'Track 01'
        });

        try {
          confetti({
            particleCount: 60,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#FF7518', '#8B5CF6', '#A3FF12']
          });
        } catch (err) {}
      } else {
        setServerError(data?.error || `Registration failed (HTTP ${res.status}). Please verify your details or try again.`);
      }
    } catch (err) {
      setServerError('Unable to reach the registration server. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSuccessData(null);
    setServerError('');
    setFormData({
      fullName: '',
      email: '',
      institution: '',
      teamName: '',
      teamSize: 1,
      trackId: 'track-1',
      consent: false
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hackathon Registration"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-dark)',
        backdropFilter: 'var(--backdrop-blur, blur(10px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-large)'
      }}
      onClick={resetAndClose}
    >
      <div
        ref={dialogRef}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-light)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xlarge)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close registration modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--bone-text)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {successData ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(163, 255, 18, 0.06)',
                border: '1px solid var(--accent-green)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              <CheckCircle size={30} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--bone-text)', marginBottom: '8px' }}>
              🎃 Registration Successful!
            </h3>

            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--muted-text)', marginBottom: '20px' }}>
              Your registration has been recorded successfully.
            </p>

            {/* Email delivery confirmation status */}
            <div
              style={{
                backgroundColor: 'rgba(163, 255, 18, 0.06)',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-small) var(--space-medium)',
                marginBottom: '24px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {data?.emailSent ? (
                <>
                  <CheckCircle size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#E2E8F0' }}>
                    A confirmation email has been sent to <strong>{successData.email}</strong>. Please check your inbox and spam folder.
                  </p>
                </>
              ) : data?.emailQueued ? (
                <>
                  <CheckCircle size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#E2E8F0' }}>
                    A confirmation email is being delivered to <strong>{successData.email}</strong>. It may take a minute to arrive; please check your inbox and spam folder.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle size={18} color="#FF7518" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#E2E8F0' }}>
                    Your registration is successful, but we couldn't send the confirmation email right now. Please save your reference ID.
                  </p>
                </>
              )}
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-small) var(--space-medium)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-tiny)', color: 'var(--muted-text)', marginBottom: '4px' }}>
                  YOUR REFERENCE ID:
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)' }}>
                  {successData.referenceCode}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(successData.referenceCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="btn btn-secondary"
                style={{
                  minHeight: '36px',
                  padding: '0 var(--space-small)',
                  fontSize: 'var(--font-small)',
                  fontFamily: 'var(--font-mono)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-tiny)'
                }}
                title="Copy reference code to clipboard"
              >
                {copiedCode ? (
                  <>
                    <Check size={14} color="var(--accent-green)" />
                    <span style={{ color: 'var(--accent-green)' }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ textAlign: 'left', fontSize: 'var(--font-small)', color: 'var(--muted-text)', lineHeight: 1.7, marginBottom: '24px' }}>
              <div><strong>Participant Name:</strong> {successData.fullName}</div>
              <div><strong>Registered Email:</strong> {successData.email}</div>
              <div><strong>Team Designation:</strong> {successData.teamName}</div>
              <div><strong>Challenge Track:</strong> {successData.trackName}</div>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              style={{
                width: '100%',
                justifyContent: 'center',
                minHeight: '44px',
                backgroundColor: 'var(--accent-orange)',
                color: 'var(--bg-darkest)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontWeight: 600
              }}
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-tiny)', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-xxs)' }}>
              PARTICIPANT REGISTRATION
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: 'var(--bone-text)', marginBottom: '8px' }}>
              Hack - To - ween
            </h3>
            <p style={{ fontSize: 'var(--font-body)', lineHeight: 1.6, color: 'var(--muted-text)', marginBottom: '20px' }}>
              Fill in your builder details. Individual registrations and teams of up to 4 are permitted.
            </p>

            {serverError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-tiny)',
                  padding: 'var(--space-small) var(--space-medium)',
                  backgroundColor: 'rgba(255, 60, 60, 0.06)',
                  border: '1px solid rgba(255, 60, 60, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FF6B6B',
                  fontSize: 'var(--font-small)',
                  marginBottom: 'var(--space-small)'
                }}
              >
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-small)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginBottom: 'var(--space-xxs' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Margaret Hamilton"
                  style={{
                    width: '100%',
                    padding: 'var(--space-small) var(--space-medium)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: `1px solid ${errors.fullName ? '#FF6B6B' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--bone-text)',
                    fontSize: 'var(--font-body)'
                  }}
                />
                {errors.fullName && <div style={{ color: '#FF6B6B', fontSize: 'var(--font-tiny)', marginTop: 'var(--space-xxs)' }}>{errors.fullName}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginBottom: 'var(--space-xxs' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@institution.edu"
                  style={{
                    width: '100%',
                    padding: 'var(--space-small) var(--space-medium)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: `1px solid ${errors.email ? '#FF6B6B' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--bone-text)',
                    fontSize: 'var(--font-body)'
                  }}
                />
                {errors.email && <div style={{ color: '#FF6B6B', fontSize: 'var(--font-tiny)', marginTop: 'var(--space-xxs)' }}>{errors.email}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginBottom: 'var(--space-xxs' }}>
                  Institution or Organization *
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g. IIT Jodhpur / GSMCOE"
                  style={{
                    width: '100%',
                    padding: 'var(--space-small) var(--space-medium)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: `1px solid ${errors.institution ? '#FF6B6B' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--bone-text)',
                    fontSize: 'var(--font-body)'
                  }}
                />
                {errors.institution && <div style={{ color: '#FF6B6B', fontSize: 'var(--font-tiny)', marginTop: 'var(--space-xxs)' }}>{errors.institution}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-small)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginBottom: 'var(--space-xxs' }}>
                    Team Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    placeholder="e.g. Vector Core"
                    style={{
                      width: '100%',
                      padding: 'var(--space-small) var(--space-medium)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--bone-text)',
                      fontSize: 'var(--font-body)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginBottom: 'var(--space-xxs' }}>
                    Team Size
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-small) var(--space-medium)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--bone-text)',
                      fontSize: 'var(--font-body)'
                    }}
                  >
                    <option value={1}>1 (Individual)</option>
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginBottom: 'var(--space-xxs' }}>
                  Target Challenge Track
                </label>
                <select
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--space-small) var(--space-medium)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--bone-text)',
                    fontSize: 'var(--font-body)'
                  }}
                >
                  {EVENT_CONFIG.tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      Track {t.chamberNumber}: {t.name} (Proposed)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-tiny)', cursor: 'pointer', fontSize: 'var(--font-tiny)', color: 'var(--muted-text)', lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    style={{ marginTop: '2px', accentColor: 'var(--accent-orange)' }}
                  />
                  <span>I agree to the Terms of Participation and understand that projects must adhere to original work standards and the published 60-point rubric. *</span>
                  {errors.consent && <div style={{ color: '#FF6B6B', fontSize: 'var(--font-tiny)', marginTop: 'var(--space-xxs)' }}>{errors.consent}</div>}
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  minHeight: '48px',
                  fontSize: 'var(--font-small)',
                  marginTop: 'var(--space-small)',
                  backgroundColor: 'var(--accent-orange)',
                  color: 'var(--bg-darkest)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 600,
                  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {isSubmitting ? 'Submitting Registration...' : 'Confirm Registration'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}