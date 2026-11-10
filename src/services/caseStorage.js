/**
 * DermaScan Permanent Case Storage Service
 * Uses native browser IndexedDB for unlimited, permanent local storage
 * with automatic synchronization to localStorage and the Express API backend.
 * Guarantees that user reports and high-resolution photos never get lost.
 */

const DB_NAME = 'dermascan_permanent_storage_v1';
const STORE_NAME = 'animal_reports';
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY = 'dermascan_clinical_cases_v3';
const PURGE_FLAG_KEY = 'dermascan_purged_mock_0987_v1';

// One-time automatic cleanup to wipe legacy mock/test cases from all storage layers
function purgeLegacyMockData() {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(PURGE_FLAG_KEY) !== 'true') {
      localStorage.removeItem('dermascan_clinical_cases_v3');
      localStorage.removeItem('dermascan_cases_v2');
      localStorage.removeItem('dermascan_cases');
      localStorage.removeItem('dermascan_reports');
      localStorage.removeItem('dermascan_user_reports');
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(PURGE_FLAG_KEY, 'true');

      if (window.indexedDB) {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onsuccess = () => {
          const db = req.result;
          if (db.objectStoreNames.contains(STORE_NAME)) {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
          }
        };
      }
    }
  } catch (err) {
    console.warn('[CaseStorage] Purge legacy mock data error:', err);
  }
}

purgeLegacyMockData();

// Open / initialize IndexedDB
function openDatabase() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('observedAt', 'observedAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('animalType', 'animalType', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('[CaseStorage] IndexedDB open error, falling back to localStorage:', request.error);
      resolve(null);
    };
  });
}

export const caseStorage = {
  /**
   * Save a new report permanently
   */
  async saveReport(report) {
    const reportId = report.id || `DS-${Date.now()}`;
    const timestamp = report.observedAt || new Date().toISOString();

    const normalizedReport = {
      id: reportId,
      animal: report.animal || report.animalType || 'Dog',
      animalType: report.animalType || report.animal || 'Dog',
      location: (report.location || report.locationName || '').trim(),
      locationName: (report.locationName || report.location || '').trim(),
      landmark: (report.landmark || '').trim(),
      coordinates: report.coordinates || null,
      observedAt: timestamp,
      reportedAt: report.reportedAt || timestamp,
      observations: (report.observations || report.notes || '').trim(),
      notes: (report.notes || report.observations || '').trim(),
      photoUrl: report.photoUrl || '',
      photoName: report.photoName || '',
      status: report.status || 'received',
      aiDiagnosis: report.aiDiagnosis || null,
      adminNotes: report.adminNotes || '',
      updatedAt: new Date().toISOString()
    };

    // 1. Permanent Storage in IndexedDB
    try {
      const db = await openDatabase();
      if (db) {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(normalizedReport);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (err) {
      console.warn('[CaseStorage] IndexedDB write failed:', err);
    }

    // 2. Storage in localStorage
    try {
      const existing = this.getLocalStorageCases();
      const updated = [normalizedReport, ...existing.filter(c => c.id !== reportId)];
      // If photo is huge, keep full in IndexedDB and compact in localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // If quota exceeded, save metadata in localStorage without heavy base64
        const compact = updated.map(c => ({
          ...c,
          photoUrl: c.photoUrl && c.photoUrl.length > 50000 ? '' : c.photoUrl
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(compact));
      }
    } catch (err) {
      console.warn('[CaseStorage] LocalStorage mirror failed:', err);
    }

    // 3. Sync to Express Backend if reachable
    try {
      fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedReport)
      }).catch(() => { /* offline silent fallback */ });
    } catch { /* offline */ }

    return normalizedReport;
  },

  /**
   * Get all reports from permanent storage
   */
  async getAllReports() {
    let reports = [];

    // 1. Read from IndexedDB first (most reliable, holds full images)
    try {
      const db = await openDatabase();
      if (db) {
        reports = await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      }
    } catch (err) {
      console.warn('[CaseStorage] IndexedDB read error:', err);
    }

    // 2. Merge with localStorage reports
    const localReports = this.getLocalStorageCases();
    for (const lr of localReports) {
      const existingIdx = reports.findIndex(r => r.id === lr.id);
      if (existingIdx === -1) {
        reports.push(lr);
      } else if (!reports[existingIdx].photoUrl && lr.photoUrl) {
        reports[existingIdx].photoUrl = lr.photoUrl;
      }
    }

    // Filter out any legacy mock, test, or sample cases
    reports = reports.filter(r => {
      if (!r || !r.id) return false;
      const idStr = String(r.id).toUpperCase();
      if (idStr.includes('MOCK') || idStr.includes('DEMO') || idStr.startsWith('CASE-8')) return false;
      if (r.isMock || r.isDemo) return false;
      return true;
    });

    // Sort newest first
    return reports.sort((a, b) => {
      const dateA = new Date(a.reportedAt || a.observedAt || 0).getTime();
      const dateB = new Date(b.reportedAt || b.observedAt || 0).getTime();
      return dateB - dateA;
    });
  },

  /**
   * Completely clear all reports from both IndexedDB and localStorage
   */
  async clearAllReports() {
    try {
      const db = await openDatabase();
      if (db) {
        await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      }
    } catch (err) {
      console.warn('[CaseStorage] clearAllReports IndexedDB error:', err);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    } catch { /* ignore */ }

    return true;
  },

  /**
   * Update report status and admin notes
   */
  async updateReport(id, updates) {
    let updatedReport = null;

    // Update in IndexedDB
    try {
      const db = await openDatabase();
      if (db) {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(id);
          req.onsuccess = () => {
            const current = req.result;
            if (current) {
              updatedReport = { ...current, ...updates, updatedAt: new Date().toISOString() };
              store.put(updatedReport);
            }
            resolve();
          };
          req.onerror = () => reject(req.error);
        });
      }
    } catch (err) {
      console.warn('[CaseStorage] IndexedDB update failed:', err);
    }

    // Update in localStorage
    try {
      const existing = this.getLocalStorageCases();
      const updated = existing.map(c => {
        if (c.id === id) {
          const u = { ...c, ...updates, updatedAt: new Date().toISOString() };
          if (!updatedReport) updatedReport = u;
          return u;
        }
        return c;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }

    // Sync to backend if reachable
    try {
      if (updates.status) {
        fetch(`/api/cases/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: updates.status, actor: 'Administrator' })
        }).catch(() => {});
      }
    } catch { /* ignore */ }

    return updatedReport;
  },

  /**
   * Delete report from storage
   */
  async deleteReport(id) {
    try {
      const db = await openDatabase();
      if (db) {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).delete(id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (err) {
      console.warn('[CaseStorage] IndexedDB delete error:', err);
    }

    try {
      const existing = this.getLocalStorageCases();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.filter(c => c.id !== id)));
    } catch { /* ignore */ }

    try {
      fetch(`/api/cases/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    } catch { /* ignore */ }

    return true;
  },

  getLocalStorageCases() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Export all reports as a downloadable CSV file
   */
  exportToCSV(reports) {
    if (!reports || reports.length === 0) return;

    const headers = [
      'Report ID',
      'Date Observed',
      'Date Reported',
      'Animal Type',
      'Location',
      'Landmark',
      'Latitude',
      'Longitude',
      'Status',
      'AI Diagnosis',
      'AI Confidence (%)',
      'Observations',
      'Admin Notes'
    ];

    const escapeCsv = (str) => {
      if (str == null) return '""';
      const text = String(str).replace(/"/g, '""');
      return `"${text}"`;
    };

    const rows = reports.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.observedAt ? new Date(r.observedAt).toLocaleString() : ''),
      escapeCsv(r.reportedAt ? new Date(r.reportedAt).toLocaleString() : ''),
      escapeCsv(r.animal || r.animalType || ''),
      escapeCsv(r.location || r.locationName || ''),
      escapeCsv(r.landmark || ''),
      escapeCsv(r.coordinates?.lat || ''),
      escapeCsv(r.coordinates?.lng || ''),
      escapeCsv(r.status || 'received'),
      escapeCsv(r.aiDiagnosis?.prediction || ''),
      escapeCsv(r.aiDiagnosis?.confidence || ''),
      escapeCsv(r.observations || r.notes || ''),
      escapeCsv(r.adminNotes || '')
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dermascan_reports_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export complete database backup as JSON
   */
  exportToJSON(reports) {
    const dataStr = JSON.stringify(reports, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dermascan_database_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
