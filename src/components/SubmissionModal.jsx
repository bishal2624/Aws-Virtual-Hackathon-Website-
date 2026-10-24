import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';
import { EVENT_CONFIG } from '../data/hackathonData';

export default function SubmissionModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    projectName: '',
    teamName: '',
    leaderName: '',
    email: '',
    trackId: 'track-1',
    repoUrl: '',
    liveDemoUrl: '',
    videoUrl: '',
    awsServicesText: '',
    problemStatement: '',
    description: '',
    architectureDescription: '',
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

  // AWS Credential Detection: Reject AKIA/ASIA patterns
  const containsAwsCredentials = (text) => {
    const akiaPattern = /\b(AKIA|ASIA)[0-9A-Z]{16}\b/;
    const privateKeyPattern = /-----BEGIN[ A-Z0-9_-]+KEY-----/;
    return akiaPattern.test(text) || privateKeyPattern.test(text);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required.';
    if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required.';
    if (!formData.leaderName.trim()) newErrors.leaderName = 'Team leader name is required.';

    if (!formData.email.trim()) {
      newErrors.email = 'Leader email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.description.trim() || formData.description.trim().length < 20) {
      newErrors.description = 'Project description must be at least 20 characters.';
    }

    if (!formData.problemStatement.trim()) {
      newErrors.problemStatement = 'Problem statement is required.';
    }

    if (!formData.architectureDescription.trim() || formData.architectureDescription.trim().length < 20) {
      newErrors.architectureDescription = 'Architecture description must be at least 20 characters.';
    }

    // Repository URL Validation (GitHub, GitLab, Bitbucket only)
    const validRepoRegex = /^https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/;
    if (!formData.repoUrl.trim()) {
      newErrors.repoUrl = 'Repository URL is required.';
    } else if (!validRepoRegex.test(formData.repoUrl.trim())) {
      newErrors.repoUrl = 'Repository must be hosted on GitHub, GitLab, or Bitbucket (https://).';
    }

    // Live Demo URL
    if (!formData.liveDemoUrl.trim()) {
      newErrors.liveDemoUrl = 'Live demo URL is required.';
    } else if (!/^https:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/.test(formData.liveDemoUrl.trim())) {
      newErrors.liveDemoUrl = 'Live demo must be a valid public HTTPS URL.';
    }

    // AWS Credential Security Check
    const combinedText = `${formData.projectName} ${formData.architectureDescription} ${formData.description} ${formData.awsServicesText}`;
    if (containsAwsCredentials(combinedText)) {
      newErrors.security = 'Security Alert: AWS access key or private key detected in form fields. Do not submit cloud credentials.';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must confirm that this is original work.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);

    const servicesList = formData.awsServicesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      projectName: formData.projectName,
      teamName: formData.teamName,
      leaderName: formData.leaderName,
      email: formData.email,
      trackId: formData.trackId,
      description: formData.description,
      problemStatement: formData.problemStatement,
      architectureDescription: formData.architectureDescription,
      repoUrl: formData.repoUrl,
      liveDemoUrl: formData.liveDemoUrl,
      videoUrl: formData.videoUrl ? formData.videoUrl : undefined,
      awsServicesUsed: servicesList.length > 0 ? servicesList : ['AWS Lambda']
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response (e.g. gateway 502/504 or HTML error page)
      }

      if (res.ok && data?.success) {
        setSuccessData({
          referenceCode: data.submissionId,
          projectName: formData.projectName,
          teamName: formData.teamName,
          repoUrl: formData.repoUrl,
          demoUrl: formData.liveDemoUrl
        });
      } else {
        setServerError(data?.error || `Submission failed (HTTP ${res.status}). Please verify your fields.`);
      }
    } catch (err) {
      setServerError('Unable to reach the submission server. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSuccessData(null);
    setServerError('');
    setFormData({
      projectName: '',
      teamName: '',
      leaderName: '',
      email: '',
      trackId: 'track-1',
      repoUrl: '',
      liveDemoUrl: '',
      videoUrl: '',
      awsServicesText: '',
      problemStatement: '',
      description: '',
      architectureDescription: '',
      consent: false
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Project Submission Portal"
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
          maxWidth: '640px',
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
          aria-label="Close submission modal"
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
              Submission Recorded
            </h3>

            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#C8CDD8', marginBottom: '24px' }}>
              Your project submission has been logged into the review database. Evaluation commences according to the official schedule.
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
                SUBMISSION IDENTIFIER
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)' }}>
                {successData.referenceCode}
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '13px', color: '#C8CDD8', lineHeight: 1.7, marginBottom: '24px' }}>
              <div><strong>Project:</strong> {successData.projectName}</div>
              <div><strong>Team:</strong> {successData.teamName}</div>
              <div><strong>Repository:</strong> {successData.repoUrl}</div>
              <div><strong>Live Demo:</strong> {successData.demoUrl}</div>
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
              PROJECT SUBMISSION PORTAL
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#F4F1EB', marginBottom: '8px' }}>
              Hack - To - ween
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#C8CDD8', marginBottom: '20px' }}>
              Final submission deadline is November 5, 2026 at 23:59 IST. Submissions require a public repository link and live deployed HTTPS demo.
            </p>

            {errors.security && (
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
                <ShieldAlert size={20} />
                <span>{errors.security}</span>
              </div>
            )}

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
                <AlertTriangle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g. Serverless Mesh"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: '#050505',
                      border: `1px solid ${errors.projectName ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: '#F4F1EB',
                      fontSize: '14px'
                    }}
                  />
                  {errors.projectName && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.projectName}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    placeholder="e.g. Cloud Architects"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: '#050505',
                      border: `1px solid ${errors.teamName ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: '#F4F1EB',
                      fontSize: '14px'
                    }}
                  />
                  {errors.teamName && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.teamName}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                    Team Leader Name *
                  </label>
                  <input
                    type="text"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                    placeholder="Primary contact name"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: '#050505',
                      border: `1px solid ${errors.leaderName ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: '#F4F1EB',
                      fontSize: '14px'
                    }}
                  />
                  {errors.leaderName && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.leaderName}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                    Leader Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="leader@domain.com"
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Challenge Track
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
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Problem Statement *
                </label>
                <input
                  type="text"
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  placeholder="What specific technical or real-world problem does this project solve?"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.problemStatement ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px'
                  }}
                />
                {errors.problemStatement && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.problemStatement}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Project Description (min 20 characters) *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of the solution, user experience, and implementation."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.description ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                {errors.description && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.description}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Architecture & AWS Services (min 20 characters) *
                </label>
                <textarea
                  rows={3}
                  value={formData.architectureDescription}
                  onChange={(e) => setFormData({ ...formData, architectureDescription: e.target.value })}
                  placeholder="Detail AWS components used (e.g. Lambda, DynamoDB, API Gateway) and system data flow."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.architectureDescription ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                {errors.architectureDescription && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.architectureDescription}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Public Repository URL (GitHub, GitLab, Bitbucket) *
                </label>
                <input
                  type="url"
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                  placeholder="https://github.com/organization/project"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.repoUrl ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px'
                  }}
                />
                {errors.repoUrl && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.repoUrl}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#C8CDD8', marginBottom: '6px' }}>
                  Live Deployed Demo URL (Public HTTPS) *
                </label>
                <input
                  type="url"
                  value={formData.liveDemoUrl}
                  onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                  placeholder="https://project-demo.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.liveDemoUrl ? '#FF6B6B' : 'rgba(200, 205, 216, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: '#F4F1EB',
                    fontSize: '14px'
                  }}
                />
                {errors.liveDemoUrl && <div style={{ color: '#FF6B6B', fontSize: '11px', marginTop: '4px' }}>{errors.liveDemoUrl}</div>}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '12px', color: '#C8CDD8', lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    style={{ marginTop: '2px', accentColor: '#FF7518' }}
                  />
                  <span>I certify that this submission represents original work created for Hack - To - ween, without hardcoded cloud credentials, and adheres to the published 60-point rubric. *</span>
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
                {isSubmitting ? 'Recording Submission...' : 'Submit Project for Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
