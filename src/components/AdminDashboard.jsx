import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  Lock,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  Stethoscope,
  Trash2,
  X
} from 'lucide-react';
import { caseStorage } from '../services/caseStorage';
import { downloadCaseReportPDF } from '../services/pdfReportGenerator';

const ADMIN_PASSWORD = '0987';
const AUTH_KEY = 'dermascan_admin_auth_v3';

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch { /* ignore strict storage restrictions */ }
}

function safeStorageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch { /* ignore */ }
}

const STATUS_CONFIG = {
  received: { label: 'Received (New)', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  under_review: { label: 'Under Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  dispatched: { label: 'Dispatched / In Care', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  resolved: { label: 'Resolved', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
};

export default function AdminDashboard({ setActiveTab }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return safeStorageGet(AUTH_KEY) === 'true';
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Cases / Reports State from Permanent Storage
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [animalFilter, setAnimalFilter] = useState('all');

  // Detail Modal / Lightbox State
  const [inspectingReport, setInspectingReport] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Load all reports from IndexedDB + localStorage permanent storage
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await caseStorage.getAllReports();
      setReports(all);
    } catch (err) {
      console.warn('[AdminDashboard] Error loading reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      caseStorage.getAllReports().then(all => {
        if (active) {
          setReports(all);
          setIsLoading(false);
        }
      }).catch(err => {
        if (active) {
          console.warn('[AdminDashboard] Error loading reports:', err);
          setIsLoading(false);
        }
      });
    }
    return () => { active = false; };
  }, [isAuthenticated]);

  // Close inspection modal on Escape
  useEffect(() => {
    if (!inspectingReport) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setInspectingReport(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [inspectingReport]);

  // Handle Login with password 0987
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const passTrim = loginPassword.trim();

    if (passTrim === ADMIN_PASSWORD) {
      safeStorageSet(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setIsLoggingIn(false);
    } else {
      setIsLoggingIn(false);
      setLoginError('Invalid password. Access restricted to administrator.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    safeStorageRemove(AUTH_KEY);
    setIsAuthenticated(false);
  };

  // Clear all reports completely
  const handleClearAllReports = async () => {
    if (window.confirm('Are you sure you want to remove all reported cases from the admin dashboard? This will completely clear stored records.')) {
      await caseStorage.clearAllReports();
      setReports([]);
      setInspectingReport(null);
      showNotice('All reported data has been removed from the admin dashboard.');
    }
  };

  // Update Status
  const handleStatusChange = async (id, newStatus) => {
    await caseStorage.updateReport(id, { status: newStatus });
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (inspectingReport && inspectingReport.id === id) {
      setInspectingReport(prev => ({ ...prev, status: newStatus }));
    }
    showNotice(`Report #${id} status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}.`);
  };

  // Save Admin Notes
  const handleSaveAdminNote = async () => {
    if (!inspectingReport) return;
    await caseStorage.updateReport(inspectingReport.id, { adminNotes: adminNoteInput });
    setReports(prev => prev.map(r => r.id === inspectingReport.id ? { ...r, adminNotes: adminNoteInput } : r));
    setInspectingReport(prev => ({ ...prev, adminNotes: adminNoteInput }));
    showNotice('Administrative notes saved to permanent storage.');
  };

  // Delete Report
  const handleDeleteReport = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete report #${id}? This action cannot be undone.`)) {
      await caseStorage.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      if (inspectingReport && inspectingReport.id === id) {
        setInspectingReport(null);
      }
      showNotice(`Report #${id} was permanently removed from storage.`);
    }
  };

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && (r.status || 'received') !== statusFilter) return false;
    if (animalFilter !== 'all' && (r.animal || r.animalType || '').toLowerCase() !== animalFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (r.id || '').toLowerCase().includes(q);
      const matchLoc = (r.location || r.locationName || '').toLowerCase().includes(q);
      const matchObs = (r.observations || r.notes || '').toLowerCase().includes(q);
      const matchAnimal = (r.animal || r.animalType || '').toLowerCase().includes(q);
      const matchAi = (r.aiDiagnosis?.prediction || '').toLowerCase().includes(q);
      if (!matchId && !matchLoc && !matchObs && !matchAnimal && !matchAi) return false;
    }
    return true;
  });

  // Overview metrics
  const totalReportsCount = reports.length;
  const newReportsCount = reports.filter(r => !r.status || r.status === 'received').length;
  const underReviewCount = reports.filter(r => r.status === 'under_review' || r.status === 'dispatched').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  // VIEW 1: ADMIN LOGIN GATE
  if (!isAuthenticated) {
    return (
      <section className="page-wrap content-page admin-login-shell">
        <div className="panel admin-login-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: 'var(--brand-soft)',
              color: 'var(--brand)',
              display: 'inline-grid',
              placeItems: 'center',
              marginBottom: '12px'
            }}>
              <Shield size={28} />
            </span>
            <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>DERMASCAN CLINICAL OPS</span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px', color: '#0f172a' }}>
              Administrator Portal
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Sign in to review reported cases, inspect submitted photos, and manage triage dispatch.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label htmlFor="admin-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                Admin Email / Identity <span style={{ fontWeight: 400, color: '#64748b' }}>(Optional)</span>
              </label>
              <input
                id="admin-email"
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@dermascan.org"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  fontSize: '14px',
                  color: '#0f172a'
                }}
              />
            </div>

            <div>
              <label htmlFor="admin-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                Administrator Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  fontSize: '14px',
                  color: '#0f172a'
                }}
              />
            </div>

            {loginError && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="button button-primary"
              style={{
                width: '100%',
                minHeight: '46px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <Lock size={16} />
              {isLoggingIn ? 'Verifying…' : 'Sign in to Admin Dashboard'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  // VIEW 2: FULL AUTHENTICATED ADMIN DASHBOARD
  return (
    <section className="page-wrap content-page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0'
            }}>
              <CheckCircle2 size={13} /> Permanent Storage Connected (IndexedDB)
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              &bull; Logged in as <strong>{loginEmail}</strong>
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Animal Intake & Report Registry
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Review field submissions, examine attached photos, monitor AI screening findings, and update case triage.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className="button button-secondary"
            onClick={loadReports}
            title="Refresh reports from storage"
            style={{ padding: '8px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} /> Refresh
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => caseStorage.exportToCSV(reports)}
            disabled={reports.length === 0}
            title="Export all reports to CSV for Excel / Sheets"
            style={{ padding: '8px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FileSpreadsheet size={14} /> Export CSV
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => caseStorage.exportToJSON(reports)}
            disabled={reports.length === 0}
            title="Download complete JSON backup"
            style={{ padding: '8px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Backup JSON
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={handleClearAllReports}
            disabled={reports.length === 0}
            title="Remove all reported data from dashboard"
            style={{ padding: '8px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#b91c1c' }}
          >
            <Trash2 size={14} /> Clear all data
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={handleLogout}
            style={{ padding: '8px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>

      {actionNotice && (
        <div style={{
          padding: '10px 14px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          {actionNotice}
        </div>
      )}

      {/* Metrics Overview Cards */}
      <div className="admin-metrics-grid">
        <div className="panel" style={{ padding: '16px', borderRadius: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Reports</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>{totalReportsCount}</div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Persisted in permanent storage</span>
        </div>

        <div className="panel" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>New / Received</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', margin: '4px 0 2px' }}>{newReportsCount}</div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Awaiting initial review</span>
        </div>

        <div className="panel" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #d97706' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>In Progress / Review</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', margin: '4px 0 2px' }}>{underReviewCount}</div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Assigned to care / rescue</span>
        </div>

        <div className="panel" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #059669' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Resolved</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', margin: '4px 0 2px' }}>{resolvedCount}</div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Treatment / rescue completed</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="panel" style={{ padding: '16px', borderRadius: '10px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 240px', minWidth: 0, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference ID, location, observations, or animal…"
              style={{
                width: '100%',
                minHeight: '40px',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="#64748b" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                minHeight: '40px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="received">Received (New)</option>
              <option value="under_review">Under Review</option>
              <option value="dispatched">Dispatched / In Care</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Animal Filter */}
          <div>
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              style={{
                minHeight: '40px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="all">All Animals</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="other">Other / Unknown</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
        {filteredReports.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <span style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', display: 'inline-grid', placeItems: 'center', marginBottom: '12px' }}>
              <Clock size={24} />
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: '#1e293b' }}>
              No Reported Cases Found
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '480px', margin: '0 auto 16px' }}>
              {searchQuery || statusFilter !== 'all' || animalFilter !== 'all'
                ? 'No reports match your active search filters. Try clearing filters to see all submissions.'
                : 'When users submit reports via the "Report an animal" form or attach AI screening results, they will stay permanently in this dashboard.'}
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setActiveTab && setActiveTab('report')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              Submit an Animal Report
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ref & Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Photo</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Animal</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Observations & AI Findings</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.received;
                  const dateStr = report.observedAt || report.reportedAt;
                  const formattedDate = dateStr ? new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown';
                  const googleMapsUrl = report.coordinates
                    ? `https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.location || report.locationName || '')}`;

                  return (
                    <tr
                      key={report.id}
                      style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Ref & Date */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <strong style={{ display: 'block', color: '#0f172a', fontSize: '13.5px' }}>{report.id}</strong>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>{formattedDate}</span>
                      </td>

                      {/* Photo Thumbnail */}
                      <td style={{ padding: '14px 16px' }}>
                        {report.photoUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setInspectingReport(report);
                              setAdminNoteInput(report.adminNotes || '');
                            }}
                            title="Click to inspect photo"
                            style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <img
                              src={report.photoUrl}
                              alt={`Report ${report.id}`}
                              style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                          </button>
                        ) : (
                          <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: '#f1f5f9', display: 'grid', placeItems: 'center', color: '#94a3b8', fontSize: '10px' }}>
                            No photo
                          </div>
                        )}
                      </td>

                      {/* Animal Type */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: '#f1f5f9',
                          color: '#334155'
                        }}>
                          {report.animal || report.animalType || 'Dog'}
                        </span>
                      </td>

                      {/* Location & Landmark */}
                      <td style={{ padding: '14px 16px', minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                          <MapPin size={14} color="var(--brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>
                              {report.location || report.locationName || 'Location not specified'}
                            </span>
                            {report.landmark && (
                              <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>
                                Near {report.landmark}
                              </span>
                            )}
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '11px', color: 'var(--brand-dark)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                            >
                              Google Maps <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Observations & AI Findings */}
                      <td style={{ padding: '14px 16px', minWidth: '240px', maxWidth: '360px' }}>
                        <p style={{ margin: 0, color: '#334155', fontSize: '12.5px', lineHeight: 1.5 }}>
                          {report.observations || report.notes || 'No description provided.'}
                        </p>

                        {/* AI Detection Findings Badge if attached */}
                        {report.aiDiagnosis && (
                          <div style={{
                            marginTop: '6px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: report.aiDiagnosis.isHealthy ? '#ecfdf5' : '#fff7ed',
                            border: `1px solid ${report.aiDiagnosis.isHealthy ? '#a7f3d0' : '#fed7aa'}`,
                            fontSize: '11.5px'
                          }}>
                            <span style={{ fontWeight: 700, color: report.aiDiagnosis.isHealthy ? '#065f46' : '#9a3412', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Stethoscope size={13} /> {report.aiDiagnosis.prediction} ({report.aiDiagnosis.confidence}% confidence)
                            </span>
                          </div>
                        )}

                        {report.adminNotes && (
                          <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#64748b', fontStyle: 'italic' }}>
                            Note: {report.adminNotes}
                          </div>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <select
                          value={report.status || 'received'}
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: statusInfo.color,
                            background: statusInfo.bg,
                            border: `1px solid ${statusInfo.border}`,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="received">Received (New)</option>
                          <option value="under_review">Under Review</option>
                          <option value="dispatched">Dispatched / In Care</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => downloadCaseReportPDF(report)}
                            title="Download official case PDF report"
                            style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Download size={13} /> PDF
                          </button>

                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => {
                              setInspectingReport(report);
                              setAdminNoteInput(report.adminNotes || '');
                            }}
                            title="Inspect full details"
                            style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={13} /> Details
                          </button>

                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => handleDeleteReport(report.id)}
                            title="Delete this report permanently"
                            style={{ padding: '6px 8px', fontSize: '12px', color: '#dc2626' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {inspectingReport && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setInspectingReport(null); }}
        >
          <div className="panel admin-modal-panel" role="dialog" aria-modal="true" aria-label={`Report Reference ${inspectingReport.id}`}>
            <button
              type="button"
              aria-label="Close case details"
              onClick={() => setInspectingReport(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                border: 'none',
                background: '#f1f5f9',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: '16px' }}>
              <span className="eyebrow">CASE DETAILS & VERIFICATION</span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 4px', color: '#0f172a' }}>
                Report Reference #{inspectingReport.id}
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Submitted: {inspectingReport.observedAt ? new Date(inspectingReport.observedAt).toLocaleString() : 'N/A'}
              </span>
            </div>

            {/* Photo Preview */}
            {inspectingReport.photoUrl && (
              <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden', background: '#000', textAlign: 'center' }}>
                <img
                  src={inspectingReport.photoUrl}
                  alt={`Report ${inspectingReport.id}`}
                  style={{ maxHeight: '380px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px', fontSize: '13px' }}>
              <div>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Animal</strong>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{inspectingReport.animal || inspectingReport.animalType || 'Dog'}</span>
              </div>

              <div>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Status</strong>
                <span style={{ fontWeight: 700, color: STATUS_CONFIG[inspectingReport.status]?.color || '#0284c7' }}>
                  {STATUS_CONFIG[inspectingReport.status]?.label || inspectingReport.status}
                </span>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Location & Landmark</strong>
                <span style={{ color: '#0f172a' }}>{inspectingReport.location || inspectingReport.locationName || 'N/A'}</span>
                {inspectingReport.landmark && <span style={{ color: '#64748b' }}> (Near {inspectingReport.landmark})</span>}
                {inspectingReport.coordinates && (
                  <div style={{ marginTop: '4px' }}>
                    <a
                      href={`https://www.google.com/maps?q=${inspectingReport.coordinates.lat},${inspectingReport.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-secondary"
                      style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <MapPin size={12} /> View Location on Google Maps <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Reporter Observations</strong>
                <p style={{ margin: '4px 0 0', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                  {inspectingReport.observations || inspectingReport.notes || 'No description provided.'}
                </p>
              </div>

              {/* AI Detection Findings */}
              {inspectingReport.aiDiagnosis && (
                <div style={{ gridColumn: '1 / -1', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ color: '#065f46', display: 'block', fontSize: '12px', textTransform: 'uppercase' }}>AI Dermatology Findings</strong>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#0f172a' }}>
                    <strong>{inspectingReport.aiDiagnosis.prediction}</strong> — {inspectingReport.aiDiagnosis.confidence}% confidence ({inspectingReport.aiDiagnosis.severity})
                  </div>
                  {inspectingReport.aiDiagnosis.description && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
                      {inspectingReport.aiDiagnosis.description}
                    </p>
                  )}
                  {inspectingReport.aiDiagnosis.recommendedProtocol && (
                    <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#065f46' }}>
                      Protocol: {inspectingReport.aiDiagnosis.recommendedProtocol}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Notes Section */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <label htmlFor="admin-notes-textarea" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Administrative Triage & Rescue Dispatch Notes:
              </label>
              <textarea
                id="admin-notes-textarea"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Log internal triage updates, assigned NGO ambulance details, or veterinary treatment notes…"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  marginBottom: '10px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleSaveAdminNote}
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    Save Internal Note
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => downloadCaseReportPDF(inspectingReport)}
                    style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={13} /> Download Case PDF
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Change Status:</span>
                  <select
                    value={inspectingReport.status || 'received'}
                    onChange={(e) => handleStatusChange(inspectingReport.id, e.target.value)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1px solid var(--border)'
                    }}
                  >
                    <option value="received">Received (New)</option>
                    <option value="under_review">Under Review</option>
                    <option value="dispatched">Dispatched / In Care</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
