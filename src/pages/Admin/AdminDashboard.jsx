import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  Download,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Users,
  Clock,
  Compass,
  FileCode,
  Eye,
  ExternalLink,
  X,
  Layers,
  CheckCircle2,
  Calendar,
  Mail,
  User,
  Globe,
  Video,
  Hash,
  Trash2
} from 'lucide-react';
import { EVENT_CONFIG } from '../../data/hackathonData';
import './AdminDashboard.css';

export default function AdminDashboard({ onNavigate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  // Active Navigation Tab: 'submissions' | 'registrations'
  const [activeTab, setActiveTab] = useState('submissions');

  // Login credentials state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registrations state
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
  const [metrics, setMetrics] = useState({ total: 0, byTrack: {}, recentCount: 0 });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Registrations filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [copiedCode, setCopiedCode] = useState(null);

  // Registrations selection state
  const [selectedRegIds, setSelectedRegIds] = useState([]);

  // Project Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [subPagination, setSubPagination] = useState({ page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
  const [subMetrics, setSubMetrics] = useState({ total: 0, byTrack: {}, byStatus: {}, recentCount: 0 });
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [subDataError, setSubDataError] = useState('');

  // Submissions search & filters
  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [subSelectedTrack, setSubSelectedTrack] = useState('');
  const [subSelectedStatus, setSubSelectedStatus] = useState('');
  const [subSortOrder, setSubSortOrder] = useState('DESC');

  // Submissions selection state
  const [selectedSubIds, setSelectedSubIds] = useState([]);

  // Selected Submission Details Modal state
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Deletion Confirmation Dialog State
  // { type: 'registrations' | 'submissions', ids: string[], count: number } | null
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Check existing session on mount
  useEffect(() => {
    async function checkAuth() {
      setIsLoadingAuth(true);
      try {
        const res = await fetch('/api/admin/me', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            setAdminUser(data.user);
          }
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch registrations from database
  const fetchRegistrations = useCallback(async (page = 1) => {
    setIsLoadingData(true);
    setDataError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: searchQuery.trim(),
        trackId: selectedTrack,
        sortBy: 'created_at',
        sortOrder
      });

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to retrieve registrations');
      }

      const data = await res.json();
      setRegistrations(data.registrations || []);
      setPagination(data.pagination || { page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      setDataError(err.message || 'Error communicating with database');
    } finally {
      setIsLoadingData(false);
    }
  }, [searchQuery, selectedTrack, sortOrder]);

  // Fetch project submissions from database
  const fetchSubmissions = useCallback(async (page = 1) => {
    setIsLoadingSubmissions(true);
    setSubDataError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: subSearchQuery.trim(),
        track: subSelectedTrack,
        status: subSelectedStatus,
        sortBy: 'submitted_at',
        sortOrder: subSortOrder
      });

      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to retrieve project submissions');
      }

      const data = await res.json();
      setSubmissions(data.submissions || []);
      setSubPagination(data.pagination || { page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
      if (data.metrics) {
        setSubMetrics(data.metrics);
      }
    } catch (err) {
      setSubDataError(err.message || 'Error communicating with submissions database');
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [subSearchQuery, subSelectedTrack, subSelectedStatus, subSortOrder]);

  // Load active tab data when authenticated or filters change
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'submissions') {
        fetchSubmissions(1);
      } else {
        fetchRegistrations(1);
      }
    }
  }, [
    isAuthenticated,
    activeTab,
    selectedTrack,
    sortOrder,
    subSelectedTrack,
    subSelectedStatus,
    subSortOrder,
    fetchRegistrations,
    fetchSubmissions
  ]);

  // ESC key listener to close modal or confirm dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (confirmDelete) {
          setConfirmDelete(null);
        } else if (selectedSubmission) {
          setSelectedSubmission(null);
        }
      }
    };
    if (selectedSubmission || confirmDelete) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedSubmission, confirmDelete]);

  // Handle organizer login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both username and password');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Organizer authentication failed');
      }
    } catch {
      setLoginError('Network error reaching authentication service');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle organizer logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
    setAdminUser(null);
    setRegistrations([]);
    setSubmissions([]);
    setSelectedRegIds([]);
    setSelectedSubIds([]);
    setSelectedSubmission(null);
    setConfirmDelete(null);
    setFeedbackMessage(null);
  };

  // Trigger authenticated CSV export
  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/admin/registrations/export.csv');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hack-to-ween-registrations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Could not download CSV export: ' + err.message);
    }
  };

  // Copy reference code or ID to clipboard
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch(() => {});
  };

  const getTrackName = (trackId) => {
    const track = EVENT_CONFIG.tracks.find(t => t.id === trackId);
    if (!track) return trackId || 'Unknown Track';
    return `Track ${track.chamberNumber}: ${track.name}`;
  };

  const formatSubmissionDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch {
      return dateString;
    }
  };

  // Selection helpers for Registrations
  const isAllRegsSelected = registrations.length > 0 && registrations.every(r => selectedRegIds.includes(r.id));
  const handleToggleSelectAllRegs = () => {
    if (isAllRegsSelected) {
      setSelectedRegIds(prev => prev.filter(id => !registrations.some(r => r.id === id)));
    } else {
      setSelectedRegIds(prev => Array.from(new Set([...prev, ...registrations.map(r => r.id)])));
    }
  };
  const handleToggleSelectReg = (id) => {
    setSelectedRegIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Selection helpers for Submissions
  const isAllSubsSelected = submissions.length > 0 && submissions.every(s => selectedSubIds.includes(s.id));
  const handleToggleSelectAllSubs = () => {
    if (isAllSubsSelected) {
      setSelectedSubIds(prev => prev.filter(id => !submissions.some(s => s.id === id)));
    } else {
      setSelectedSubIds(prev => Array.from(new Set([...prev, ...submissions.map(s => s.id)])));
    }
  };
  const handleToggleSelectSub = (id) => {
    setSelectedSubIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Prompts for Deletion
  const promptDeleteSelectedRegs = () => {
    if (selectedRegIds.length === 0) return;
    setConfirmDelete({
      type: 'registrations',
      ids: [...selectedRegIds],
      count: selectedRegIds.length
    });
  };

  const promptDeleteSingleReg = (id) => {
    setConfirmDelete({
      type: 'registrations',
      ids: [id],
      count: 1
    });
  };

  const promptDeleteSelectedSubs = () => {
    if (selectedSubIds.length === 0) return;
    setConfirmDelete({
      type: 'submissions',
      ids: [...selectedSubIds],
      count: selectedSubIds.length
    });
  };

  const promptDeleteSingleSub = (id) => {
    setConfirmDelete({
      type: 'submissions',
      ids: [id],
      count: 1
    });
  };

  // Execute Deletion via authenticated backend API
  const executeDelete = async () => {
    if (!confirmDelete || !confirmDelete.ids.length) return;
    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      const isSingle = confirmDelete.ids.length === 1;
      const endpoint = confirmDelete.type === 'registrations'
        ? (isSingle ? `/api/admin/registrations/${confirmDelete.ids[0]}` : '/api/admin/registrations/bulk')
        : (isSingle ? `/api/admin/submissions/${confirmDelete.ids[0]}` : '/api/admin/submissions/bulk');

      const options = isSingle
        ? { method: 'DELETE' }
        : {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: confirmDelete.ids })
          };

      const res = await fetch(endpoint, options);
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete selected records');
      }

      const deletedCount = data.deletedCount !== undefined ? data.deletedCount : confirmDelete.ids.length;
      setFeedbackMessage({
        type: 'success',
        text: data.message || `Successfully deleted ${deletedCount} record(s).`
      });

      // Clear deleted IDs from selection state and refresh records & metrics
      if (confirmDelete.type === 'registrations') {
        setSelectedRegIds(prev => prev.filter(id => !confirmDelete.ids.includes(id)));
        fetchRegistrations(pagination.page);
      } else {
        setSelectedSubIds(prev => prev.filter(id => !confirmDelete.ids.includes(id)));
        fetchSubmissions(subPagination.page);
      }

      setConfirmDelete(null);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Error occurred while communicating with deletion service'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#C8CDD8', fontSize: '14px' }}>
          Verifying organizer chamber credentials...
        </div>
      </div>
    );
  }

  // Login view for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="admin-root">
        <div className="admin-login-wrapper">
          <div className="admin-login-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 117, 24, 0.15)',
                border: '1px solid var(--accent-orange, #FF7518)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-orange, #FF7518)'
              }}>
                <Shield size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: 'var(--accent-orange, #FF7518)', letterSpacing: '0.1em' }}>
                ORGANIZER ACCESS
              </div>
            </div>

            <h1 className="admin-login-title">The Organizer Chamber</h1>
            <p className="admin-login-subtitle">
              Authorized portal for Hack - To - ween event administrators. Enter your security credentials to inspect participant registrations and project submissions.
            </p>

            {loginError && (
              <div className="admin-error-box">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="admin-form-group">
                <label className="admin-form-label">Organizer Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. organizer"
                  className="admin-form-input"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Password Key</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="admin-form-input"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', minHeight: '46px', marginTop: '10px', fontSize: '14px' }}
              >
                <Lock size={16} />
                {isLoggingIn ? 'Verifying Chamber Access...' : 'Unlock Organizer Chamber'}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('/') : (window.location.href = '/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8E96A6',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Return to Public Website
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard View
  return (
    <div className="admin-root">
      {/* Top Bar */}
      <header className="admin-navbar">
        <div className="admin-brand">
          <Shield size={22} color="var(--accent-orange, #FF7518)" />
          <span className="admin-brand-title">Hack - To - ween</span>
          <span className="admin-brand-tag">ORGANIZER CHAMBER</span>
        </div>

        <div className="admin-nav-actions">
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: '#C8CDD8' }}>
            Logged in as <strong>{adminUser?.username || 'Organizer'}</strong>
          </span>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: '#121520',
              border: '1px solid rgba(200, 205, 216, 0.2)',
              borderRadius: 'var(--radius-sm, 4px)',
              color: '#F4F1EB',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="admin-content">
        {/* Navigation Tabs */}
        <div className="admin-tabs-nav" role="tablist" aria-label="Organizer Chamber Views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'submissions'}
            className={`admin-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <FileCode size={16} />
            <span>Project Submissions</span>
            <span className="admin-tab-count">{subMetrics.total || 0}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'registrations'}
            className={`admin-tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <Users size={16} />
            <span>Registrations</span>
            <span className="admin-tab-count">{metrics.total || 0}</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`admin-feedback-banner ${feedbackMessage.type === 'error' ? 'admin-feedback-error' : 'admin-feedback-success'}`}
            role="status"
          >
            {feedbackMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            <span style={{ flex: 1 }}>{feedbackMessage.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="admin-feedback-close"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ====================================================================
            VIEW: PROJECT SUBMISSIONS
            ==================================================================== */}
        {activeTab === 'submissions' && (
          <section aria-labelledby="submissions-section-heading">
            <h2 id="submissions-section-heading" className="sr-only">Project Submissions List</h2>

            {/* Metrics Grid */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCode size={16} color="var(--accent-orange, #FF7518)" />
                  <span className="admin-metric-label">Total Submissions</span>
                </div>
                <div className="admin-metric-value highlight-orange">{subMetrics.total}</div>
              </div>

              <div className="admin-metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--accent-green, #A3FF12)" />
                  <span className="admin-metric-label">Recent Submissions (24h)</span>
                </div>
                <div className="admin-metric-value highlight-green">{subMetrics.recentCount}</div>
              </div>

              {EVENT_CONFIG.tracks.map((t) => (
                <div key={t.id} className="admin-metric-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={16} color="#8E96A6" />
                    <span className="admin-metric-label">Track {t.chamberNumber}: {t.name}</span>
                  </div>
                  <div className="admin-metric-value">{subMetrics.byTrack?.[t.id] || 0}</div>
                </div>
              ))}
            </div>

            {/* Controls Bar: Search, Track, Status, Sort, Bulk Delete, Refresh */}
            <div className="admin-controls-bar">
              <form
                onSubmit={(e) => { e.preventDefault(); fetchSubmissions(1); }}
                className="admin-filters-group"
              >
                <input
                  type="text"
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  placeholder="Search project name, team, leader, or email..."
                  className="admin-search-input"
                  aria-label="Search submissions"
                />

                <select
                  value={subSelectedTrack}
                  onChange={(e) => setSubSelectedTrack(e.target.value)}
                  className="admin-select-input"
                  aria-label="Filter by challenge track"
                >
                  <option value="">All Challenge Tracks</option>
                  {EVENT_CONFIG.tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      Track {t.chamberNumber}: {t.name}
                    </option>
                  ))}
                </select>

                <select
                  value={subSelectedStatus}
                  onChange={(e) => setSubSelectedStatus(e.target.value)}
                  className="admin-select-input"
                  aria-label="Filter by submission status"
                >
                  <option value="">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                <select
                  value={subSortOrder}
                  onChange={(e) => setSubSortOrder(e.target.value)}
                  className="admin-select-input"
                  aria-label="Sort submissions by date"
                >
                  <option value="DESC">Newest Submissions First</option>
                  <option value="ASC">Oldest Submissions First</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ minHeight: '38px', padding: '0 14px', fontSize: '13px' }}
                >
                  <Search size={14} />
                  <span>Search</span>
                </button>
              </form>

              <div className="admin-actions-group">
                {/* Selective Bulk Deletion Button */}
                <button
                  type="button"
                  disabled={selectedSubIds.length === 0 || isDeleting}
                  onClick={promptDeleteSelectedSubs}
                  className="btn btn-danger"
                  style={{ minHeight: '38px', padding: '0 14px', fontSize: '13px' }}
                  title={selectedSubIds.length === 0 ? "Select submissions to delete" : `Delete ${selectedSubIds.length} selected submission(s)`}
                >
                  <Trash2 size={14} />
                  <span>Delete Selected {selectedSubIds.length > 0 ? `(${selectedSubIds.length})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchSubmissions(subPagination.page)}
                  className="btn btn-secondary"
                  style={{ minHeight: '38px', padding: '0 14px', fontSize: '13px' }}
                  title="Refresh Submissions"
                >
                  <RefreshCw size={14} className={isLoadingSubmissions ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {subDataError && (
              <div className="admin-error-box">
                <AlertCircle size={16} />
                <span>{subDataError}</span>
              </div>
            )}

            {/* Submissions Table with Selection Checkboxes */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllSubsSelected}
                        onChange={handleToggleSelectAllSubs}
                        aria-label="Select all submissions on current page"
                        className="admin-checkbox"
                      />
                    </th>
                    <th>Project Name</th>
                    <th>Team Name</th>
                    <th>Team Leader</th>
                    <th>Challenge Track</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingSubmissions ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8E96A6' }}>
                        Loading project submissions from database...
                      </td>
                    </tr>
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8E96A6' }}>
                        No project submissions matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const isSelected = selectedSubIds.includes(sub.id);
                      return (
                        <tr key={sub.id} className={isSelected ? 'admin-row-selected' : ''}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectSub(sub.id)}
                              aria-label={`Select submission ${sub.projectName}`}
                              className="admin-checkbox"
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#F4F1EB', fontSize: '14px' }}>
                              {sub.projectName}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#8E96A6', marginTop: '2px' }}>
                              {sub.id}
                            </div>
                          </td>
                          <td style={{ color: '#C8CDD8' }}>{sub.teamName}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{sub.leaderName}</div>
                            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#8E96A6' }}>
                              {sub.email}
                            </div>
                          </td>
                          <td>
                            <span className="admin-track-pill">
                              {EVENT_CONFIG.tracks.find(t => t.id === sub.trackId)?.name || sub.trackId}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11.5px', color: '#C8CDD8' }}>
                            {formatSubmissionDate(sub.submittedAt)}
                          </td>
                          <td>
                            <span className={`admin-status-pill status-${(sub.status || 'SUBMITTED').toLowerCase()}`}>
                              {sub.status || 'SUBMITTED'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedSubmission(sub)}
                                className="btn btn-secondary admin-view-details-btn"
                                title="View Complete Project Details"
                              >
                                <Eye size={13} />
                                <span>View Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteSingleSub(sub.id)}
                                className="admin-row-delete-btn"
                                title="Delete this submission"
                                aria-label={`Delete submission ${sub.projectName}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="admin-pagination">
              <div>
                Showing {submissions.length} of {subPagination.totalRecords} total submissions
                {selectedSubIds.length > 0 && (
                  <span style={{ marginLeft: '12px', color: 'var(--accent-orange, #FF7518)' }}>
                    ({selectedSubIds.length} selected across page)
                  </span>
                )}
              </div>

              <div className="admin-pagination-btns">
                <button
                  type="button"
                  disabled={subPagination.page <= 1 || isLoadingSubmissions}
                  onClick={() => fetchSubmissions(subPagination.page - 1)}
                  className="admin-page-btn"
                >
                  Previous
                </button>
                <span>
                  Page {subPagination.page} of {subPagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={subPagination.page >= subPagination.totalPages || isLoadingSubmissions}
                  onClick={() => fetchSubmissions(subPagination.page + 1)}
                  className="admin-page-btn"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            VIEW: REGISTRATIONS
            ==================================================================== */}
        {activeTab === 'registrations' && (
          <section aria-labelledby="registrations-section-heading">
            <h2 id="registrations-section-heading" className="sr-only">Participant Registrations List</h2>

            {/* Metrics Grid */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="var(--accent-green, #A3FF12)" />
                  <span className="admin-metric-label">Total Registrations</span>
                </div>
                <div className="admin-metric-value highlight-green">{metrics.total}</div>
              </div>

              <div className="admin-metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--accent-orange, #FF7518)" />
                  <span className="admin-metric-label">Recent Activity (24h)</span>
                </div>
                <div className="admin-metric-value highlight-orange">{metrics.recentCount}</div>
              </div>

              {EVENT_CONFIG.tracks.map((t) => (
                <div key={t.id} className="admin-metric-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={16} color="#8E96A6" />
                    <span className="admin-metric-label">Track {t.chamberNumber}: {t.name}</span>
                  </div>
                  <div className="admin-metric-value">{metrics.byTrack?.[t.id] || 0}</div>
                </div>
              ))}
            </div>

            {/* Controls Bar: Search, Filter, Sort, Delete, Export */}
            <div className="admin-controls-bar">
              <form
                onSubmit={(e) => { e.preventDefault(); fetchRegistrations(1); }}
                className="admin-filters-group"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, or reference code..."
                  className="admin-search-input"
                  aria-label="Search registrations"
                />

                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="admin-select-input"
                  aria-label="Filter registrations by track"
                >
                  <option value="">All Challenge Tracks</option>
                  {EVENT_CONFIG.tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      Track {t.chamberNumber}: {t.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="admin-select-input"
                  aria-label="Sort registrations by date"
                >
                  <option value="DESC">Newest Registrations First</option>
                  <option value="ASC">Oldest Registrations First</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ minHeight: '38px', padding: '0 14px', fontSize: '13px' }}
                >
                  <Search size={14} />
                  <span>Search</span>
                </button>
              </form>

              <div className="admin-actions-group">
                {/* Selective Bulk Deletion Button for Registrations */}
                <button
                  type="button"
                  disabled={selectedRegIds.length === 0 || isDeleting}
                  onClick={promptDeleteSelectedRegs}
                  className="btn btn-danger"
                  style={{ minHeight: '38px', padding: '0 14px', fontSize: '13px' }}
                  title={selectedRegIds.length === 0 ? "Select registrations to delete" : `Delete ${selectedRegIds.length} selected registration(s)`}
                >
                  <Trash2 size={14} />
                  <span>Delete Selected {selectedRegIds.length > 0 ? `(${selectedRegIds.length})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchRegistrations(pagination.page)}
                  className="btn btn-secondary"
                  style={{ minHeight: '38px', padding: '0 12px', fontSize: '13px' }}
                  title="Refresh Records"
                >
                  <RefreshCw size={14} className={isLoadingData ? 'animate-spin' : ''} />
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="btn btn-primary"
                  style={{ minHeight: '38px', padding: '0 16px', fontSize: '13px' }}
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {dataError && (
              <div className="admin-error-box">
                <AlertCircle size={16} />
                <span>{dataError}</span>
              </div>
            )}

            {/* Registrations Table with Selection Checkboxes */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllRegsSelected}
                        onChange={handleToggleSelectAllRegs}
                        aria-label="Select all registrations on current page"
                        className="admin-checkbox"
                      />
                    </th>
                    <th>Reference Code</th>
                    <th>Participant</th>
                    <th>Email</th>
                    <th>Institution</th>
                    <th>Team</th>
                    <th>Size</th>
                    <th>Challenge Track</th>
                    <th>Registered At</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingData ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#8E96A6' }}>
                        Loading participant records from database...
                      </td>
                    </tr>
                  ) : registrations.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#8E96A6' }}>
                        No participant registrations matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => {
                      const isSelected = selectedRegIds.includes(reg.id);
                      return (
                        <tr key={reg.id} className={isSelected ? 'admin-row-selected' : ''}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectReg(reg.id)}
                              aria-label={`Select registration ${reg.fullName}`}
                              className="admin-checkbox"
                            />
                          </td>
                          <td>
                            <span className="admin-ref-code">
                              <span>{reg.id}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(reg.id)}
                                className="admin-copy-btn"
                                title="Copy Reference Code"
                              >
                                {copiedCode === reg.id ? <Check size={13} color="var(--accent-green, #A3FF12)" /> : <Copy size={13} />}
                              </button>
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{reg.fullName}</td>
                          <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>{reg.email}</td>
                          <td>{reg.institution}</td>
                          <td>{reg.teamName || 'Individual'}</td>
                          <td style={{ fontFamily: 'var(--font-mono, monospace)' }}>{reg.teamSize}</td>
                          <td>
                            <span className="admin-track-pill">
                              {EVENT_CONFIG.tracks.find(t => t.id === reg.trackId)?.name || reg.trackId}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11.5px', color: '#C8CDD8' }}>
                            {new Date(reg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => promptDeleteSingleReg(reg.id)}
                              className="admin-row-delete-btn"
                              title="Delete this registration"
                              aria-label={`Delete registration for ${reg.fullName}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="admin-pagination">
              <div>
                Showing {registrations.length} of {pagination.totalRecords} total registrations
                {selectedRegIds.length > 0 && (
                  <span style={{ marginLeft: '12px', color: 'var(--accent-orange, #FF7518)' }}>
                    ({selectedRegIds.length} selected across page)
                  </span>
                )}
              </div>

              <div className="admin-pagination-btns">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || isLoadingData}
                  onClick={() => fetchRegistrations(pagination.page - 1)}
                  className="admin-page-btn"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || isLoadingData}
                  onClick={() => fetchRegistrations(pagination.page + 1)}
                  className="admin-page-btn"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ====================================================================
          CONFIRMATION DIALOG MODAL (DESTRUCTIVE ACTION)
          ==================================================================== */}
      {confirmDelete && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isDeleting && setConfirmDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div
            className="admin-confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-confirm-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 71, 87, 0.15)',
                  border: '1px solid #FF4757',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF4757'
                }}>
                  <AlertTriangle size={18} />
                </div>
                <h3 id="confirm-delete-title" style={{ margin: 0, fontSize: '17px', color: '#F4F1EB', fontFamily: 'var(--font-heading)' }}>
                  Confirm Permanent Deletion
                </h3>
              </div>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(null)}
                className="admin-modal-close-btn"
                aria-label="Cancel deletion"
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-confirm-body">
              <p style={{ margin: 0, fontWeight: 500, color: '#F4F1EB' }}>
                Are you sure you want to permanently delete {confirmDelete.count} selected record{confirmDelete.count > 1 ? 's' : ''}? This action cannot be undone.
              </p>
              <div style={{ fontSize: '12px', color: '#8E96A6', fontFamily: 'var(--font-mono, monospace)', backgroundColor: '#050505', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(200, 205, 216, 0.1)' }}>
                Target type: <strong>{confirmDelete.type === 'registrations' ? 'Participant Registrations' : 'Project Submissions'}</strong>
                <br />
                Selected IDs: {confirmDelete.ids.slice(0, 3).join(', ')}{confirmDelete.ids.length > 3 ? ` ...and ${confirmDelete.ids.length - 3} more` : ''}
              </div>
            </div>

            <div className="admin-confirm-footer">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(null)}
                className="btn btn-secondary"
                style={{ minHeight: '38px', padding: '0 16px', fontSize: '13px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className="btn btn-danger"
                style={{ minHeight: '38px', padding: '0 18px', fontSize: '13px' }}
              >
                <Trash2 size={14} className={isDeleting ? 'animate-spin' : ''} />
                <span>{isDeleting ? 'Deleting Records...' : 'Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          COMPLETE PROJECT DETAILS MODAL
          ==================================================================== */}
      {selectedSubmission && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedSubmission(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="submission-modal-title"
        >
          <div
            className="admin-details-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className={`admin-status-pill status-${(selectedSubmission.status || 'SUBMITTED').toLowerCase()}`}>
                    {selectedSubmission.status || 'SUBMITTED'}
                  </span>
                  <span className="admin-track-pill">
                    {getTrackName(selectedSubmission.trackId)}
                  </span>
                </div>
                <h2 id="submission-modal-title" className="admin-modal-title">
                  {selectedSubmission.projectName}
                </h2>
                <div className="admin-modal-team">
                  Team: <strong>{selectedSubmission.teamName}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="admin-modal-close-btn"
                title="Close modal (Esc)"
                aria-label="Close project details"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              {/* Reference IDs & Meta Grid */}
              <div className="admin-details-meta-grid">
                {/* 11. Submission Reference ID */}
                <div className="admin-meta-item">
                  <div className="admin-meta-item-label">
                    <Hash size={13} />
                    <span>Submission Reference ID</span>
                  </div>
                  <div className="admin-meta-item-value">
                    <span className="admin-id-code">{selectedSubmission.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(selectedSubmission.id)}
                      className="admin-copy-btn"
                      title="Copy Submission ID"
                    >
                      {copiedCode === selectedSubmission.id ? (
                        <Check size={13} color="var(--accent-green, #A3FF12)" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 14. Registration Reference ID */}
                <div className="admin-meta-item">
                  <div className="admin-meta-item-label">
                    <CheckCircle2 size={13} />
                    <span>Registration Reference ID</span>
                  </div>
                  <div className="admin-meta-item-value">
                    {selectedSubmission.registrationId ? (
                      <>
                        <span className="admin-id-code">{selectedSubmission.registrationId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(selectedSubmission.registrationId)}
                          className="admin-copy-btn"
                          title="Copy Registration ID"
                        >
                          {copiedCode === selectedSubmission.registrationId ? (
                            <Check size={13} color="var(--accent-green, #A3FF12)" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="admin-text-muted">Not provided</span>
                    )}
                  </div>
                </div>

                {/* 3 & 4. Team Leader & Email */}
                <div className="admin-meta-item">
                  <div className="admin-meta-item-label">
                    <User size={13} />
                    <span>Team Leader</span>
                  </div>
                  <div className="admin-meta-item-value" style={{ fontWeight: 600 }}>
                    {selectedSubmission.leaderName || <span className="admin-text-muted">Not provided</span>}
                  </div>
                </div>

                <div className="admin-meta-item">
                  <div className="admin-meta-item-label">
                    <Mail size={13} />
                    <span>Leader Email Address</span>
                  </div>
                  <div className="admin-meta-item-value font-mono">
                    {selectedSubmission.email || <span className="admin-text-muted">Not provided</span>}
                  </div>
                </div>

                {/* 12. Submission Date and Time */}
                <div className="admin-meta-item" style={{ gridColumn: 'span 2' }}>
                  <div className="admin-meta-item-label">
                    <Calendar size={13} />
                    <span>Submission Date and Time</span>
                  </div>
                  <div className="admin-meta-item-value font-mono">
                    {formatSubmissionDate(selectedSubmission.submittedAt)}
                  </div>
                </div>
              </div>

              {/* Deliverable URLs Section */}
              <div className="admin-details-section">
                <h3 className="admin-section-heading">Project Deliverables & Repository Links</h3>
                <div className="admin-links-list">
                  {/* 9. Public Repository URL */}
                  <div className="admin-link-card">
                    <div className="admin-link-card-meta">
                      <span className="admin-link-card-title">Public Repository URL</span>
                      <span className="admin-link-card-subtitle">Source code on GitHub, GitLab, or Bitbucket</span>
                    </div>
                    {selectedSubmission.repoUrl ? (
                      <a
                        href={selectedSubmission.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-external-link"
                      >
                        <span>{selectedSubmission.repoUrl}</span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="admin-text-muted">Not provided</span>
                    )}
                  </div>

                  {/* 10. Live Deployed HTTPS Demo URL */}
                  <div className="admin-link-card">
                    <div className="admin-link-card-meta">
                      <span className="admin-link-card-title">Live Deployed HTTPS Demo URL</span>
                      <span className="admin-link-card-subtitle">Operational deployment on AWS or public host</span>
                    </div>
                    {selectedSubmission.liveDemoUrl ? (
                      <a
                        href={selectedSubmission.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-external-link"
                      >
                        <span>{selectedSubmission.liveDemoUrl}</span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="admin-text-muted">Not provided</span>
                    )}
                  </div>

                  {/* 15. Optional Video URL */}
                  <div className="admin-link-card">
                    <div className="admin-link-card-meta">
                      <span className="admin-link-card-title">Demonstration Video URL</span>
                      <span className="admin-link-card-subtitle">Recorded walkthrough presentation</span>
                    </div>
                    {selectedSubmission.videoUrl ? (
                      <a
                        href={selectedSubmission.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-external-link"
                      >
                        <span>{selectedSubmission.videoUrl}</span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="admin-text-muted">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 8. AWS Services Used */}
              <div className="admin-details-section">
                <h3 className="admin-section-heading">AWS Services Utilized</h3>
                <div className="admin-aws-services-wrapper">
                  {Array.isArray(selectedSubmission.awsServicesUsed) && selectedSubmission.awsServicesUsed.length > 0 ? (
                    selectedSubmission.awsServicesUsed.map((svc, idx) => (
                      <span key={idx} className="admin-aws-tag">
                        <Layers size={12} color="var(--accent-orange, #FF7518)" />
                        <span>{svc}</span>
                      </span>
                    ))
                  ) : (
                    <span className="admin-text-muted">Not provided</span>
                  )}
                </div>
              </div>

              {/* 6. Problem Statement */}
              <div className="admin-details-section">
                <h3 className="admin-section-heading">Problem Statement</h3>
                <div className="admin-longtext-box">
                  {selectedSubmission.problemStatement || <span className="admin-text-muted">Not provided</span>}
                </div>
              </div>

              {/* 7. Project Description */}
              <div className="admin-details-section">
                <h3 className="admin-section-heading">Project Description</h3>
                <div className="admin-longtext-box">
                  {selectedSubmission.description || <span className="admin-text-muted">Not provided</span>}
                </div>
              </div>

              {/* 8. Architecture & AWS Services */}
              <div className="admin-details-section">
                <h3 className="admin-section-heading">Architecture & AWS Services Description</h3>
                <div className="admin-longtext-box">
                  {selectedSubmission.architectureDescription || <span className="admin-text-muted">Not provided</span>}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="btn btn-secondary"
                style={{ minHeight: '40px', padding: '0 20px', fontSize: '13px' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
