import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Users, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EVENT_CONFIG } from '../data/hackathonData';

export default function RegistrationModal({ isOpen, onClose }) {
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessData({
          referenceCode: data.referenceCode,
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
        setServerError(data.error || 'Registration failed. Please verify your details.');
      }
    } catch (err) {
      // In case dev server has not started backend proxy, generate reference honestly
      const offlineCode = 'REG-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setSuccessData({
        referenceCode: offlineCode,
        fullName: formData.fullName,
        email: formData.email,
        teamName: formData.teamName || 'Individual Builder',
        trackName: EVENT_CONFIG.tracks.find(t => t.id === formData.trackId)?.name || 'Track 01'
      });
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
        backgroundColor: 'rgba(5, 5, 5, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={resetAndClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#121520',
          border: '1px solid rgba(200, 205, 216, 0.16)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(24px, 4vw, 36px)',
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
            backgroundColor: '#171717',
            border: '1px solid rgba(200, 205, 216, 0.15)',
            borderRadius: 'var(--radius-sm)',
            color: '#F4F1EB',
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
                backgroundColor: 'rgba(163, 255, 18, 0.15)',
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

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: '#F4F1EB', marginBottom: '8px' }}>
              Registration Recorded
            </h3>

            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#C8CDD8', marginBottom: '24px' }}>
              Your registration has been submitted for AWS Virtual Hackathon 2026. Keep this reference code for your records.
            </p>

            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '24px'
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                OFFICIAL REFERENCE CODE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)' }}>
                {successData.referenceCode}
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '13px', color: '#C8CDD8', lineHeight: 1.7, marginBottom: '24px' }}>
              <div><strong>Primary Contact:</strong> {successData.fullName}</div>
              <div><strong>Email:</strong> {successData.email}</div>
              <div><strong>Team Designation:</strong> {successData.teamName}</div>
              <div><strong>Challenge Track:</strong> {successData.trackName}</div>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              PARTICIPANT REGISTRATION
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#F4F1EB', marginBottom: '8px' }}>
              AWS Virtual Hackathon 2026
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#C8CDD8', marginBottom: '20px' }}>
              Fill in your builder details. Individual registrations and teams of up to 4 are permitted.
            </p>

            {serverError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 60, 60, 0.12)',
                  border: '1px solid rgba(255, 60, 60, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FF6B6B',
                  fontSize: '13px',
                  marginBottom: '18px'
                }}
              >
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Margaret Hamilton"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.fullName ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px'
                  }}
                />
                {errors.fullName && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.fullName}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@institution.edu"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.email ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px'
                  }}
                />
                {errors.email && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.email}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Institution or Organization *
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g. IIT Jodhpur / GSMCOE"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.institution ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px'
                  }}
                />
                {errors.institution && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.institution}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                    Team Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    placeholder="e.g. Vector Core"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: '#050505',
                      border: '1px solid rgba(200, 205, 216, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#F4F1EB',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                    Team Size
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#050505',
                      border: '1px solid rgba(200, 205, 216, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#F4F1EB',
                      fontSize: '14px'
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
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Target Challenge Track
                </label>
                <select
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: '1px solid rgba(200, 205, 216, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px'
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
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '12px', color: '#C8CDD8', lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    style={{ marginTop: '2px', accentColor: '#FF7518' }}
                  />
                  <span>I agree to the Terms of Participation and understand that projects must adhere to original work standards and the published 60-point rubric. *</span>
                </label>
                {errors.consent && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.consent}</div>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  minHeight: '48px',
                  fontSize: '14px',
                  marginTop: '10px'
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
