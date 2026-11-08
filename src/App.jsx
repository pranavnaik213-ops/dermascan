import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, Camera, Check, CheckCircle2, ChevronRight, FileImage,
  FileText, HeartHandshake, LogOut, MapPin, Menu, PawPrint, Plus, RotateCcw, Search,
  ShieldCheck, Stethoscope, Trash2, Upload, UserRound, X
} from 'lucide-react';
import { getAuthConfig, privateApiFetch, readSession, signIn, signOut, signUp } from './auth.js';
import './App.css';

const REPORTS_KEY = 'dermascan_reports_v1';
const DRAFT_KEY = 'dermascan_report_draft_v1';
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function isDateTimeValue(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
}

async function imageToDataUrl(file, maxBytes = 2 * 1024 * 1024) {
  if (typeof createImageBitmap !== 'function') throw new Error('IMAGE_DECODE_FAILED');
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error('IMAGE_DECODE_FAILED'); });
  const canvas = document.createElement('canvas');
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('IMAGE_ENCODE_FAILED');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  } finally { bitmap.close(); }

  const toBlob = (quality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('IMAGE_ENCODE_FAILED')), 'image/jpeg', quality);
  });
  let blob;
  for (const quality of [0.82, 0.68, 0.54, 0.42, 0.32]) {
    blob = await toBlob(quality);
    if (blob.size <= maxBytes) break;
  }
  if (!blob || blob.size > maxBytes) throw new Error('IMAGE_TOO_LARGE');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'));
    reader.readAsDataURL(blob);
  });
}

function IconMark({ children }) {
  return <span className="icon-mark" aria-hidden="true">{children}</span>;
}

function App() {
  const [page, setPage] = useState('home');
  const [currentYear] = useState(() => new Date().getFullYear());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reports, setReports] = useState(() => {
    const saved = readStored(REPORTS_KEY, []);
    return Array.isArray(saved) ? saved : [];
  });
  const draftValue = readStored(DRAFT_KEY, {});
  const savedDraft = draftValue && typeof draftValue === 'object' ? draftValue : {};
  const [animal, setAnimal] = useState(typeof savedDraft.animal === 'string' ? savedDraft.animal : 'Dog');
  const [location, setLocation] = useState(typeof savedDraft.location === 'string' ? savedDraft.location : '');
  const [landmark, setLandmark] = useState(typeof savedDraft.landmark === 'string' ? savedDraft.landmark : '');
  const [observations, setObservations] = useState(typeof savedDraft.observations === 'string' ? savedDraft.observations : '');
  const [reportPhotos, setReportPhotos] = useState([]);
  const reportPhoto = reportPhotos[0] || null;
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [photoAnimal, setPhotoAnimal] = useState('Dog');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [draftPersistenceEnabled, setDraftPersistenceEnabled] = useState(true);
  const [session, setSession] = useState(() => readSession());
  const [authMode, setAuthMode] = useState('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [serverReports, setServerReports] = useState([]);
  const [serverAnalyses, setServerAnalyses] = useState([]);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [dashboardStatus, setDashboardStatus] = useState('all');
  const [dashboardError, setDashboardError] = useState('');
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(() => Boolean(readSession()));
  const [observedAt, setObservedAt] = useState(isDateTimeValue(savedDraft.observedAt) ? savedDraft.observedAt : localDateTimeValue());
  const fileInput = useRef(null);
  const reportInput = useRef(null);
  const mainContent = useRef(null);
  const cameraVideo = useRef(null);
  const cameraCanvas = useRef(null);
  const cameraDialog = useRef(null);
  const lastCameraTrigger = useRef(null);
  const objectUrls = useRef(new Set());

  const closeCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
    setCameraError('');
  };

  useEffect(() => {
    document.title = 'DermaScan | Animal care, made clearer';
  }, []);

  useEffect(() => {
    if (!session || page !== 'dashboard') return;
    let isCurrent = true;
    privateApiFetch('/api/my-reports')
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not load your records.');
        if (isCurrent) {
          setServerReports(result.reports || []);
          setServerAnalyses(result.analyses || []);
        }
      })
      .catch((error) => { if (isCurrent) setDashboardError(error.message); })
      .finally(() => { if (isCurrent) setIsLoadingDashboard(false); });
    return () => { isCurrent = false; };
  }, [page, session]);

  useEffect(() => {
    if (draftPersistenceEnabled) saveStored(DRAFT_KEY, { animal, location, landmark, observations, observedAt });
  }, [animal, location, landmark, observations, observedAt, draftPersistenceEnabled]);

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!cameraOpen || !cameraStream || !cameraVideo.current) return undefined;
    cameraVideo.current.srcObject = cameraStream;
    cameraVideo.current.play().catch(() => setCameraError('Camera preview could not start. Try closing and reopening the camera.'));
    return () => cameraStream.getTracks().forEach((track) => track.stop());
  }, [cameraOpen, cameraStream]);

  useEffect(() => {
    if (!cameraOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cameraDialog.current?.querySelector('button')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setCameraError('');
        setCameraOpen(false);
      } else if (event.key === 'Tab' && cameraDialog.current) {
        const elements = [...cameraDialog.current.querySelectorAll('button:not(:disabled), video[tabindex], input:not(:disabled)')];
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      lastCameraTrigger.current?.focus();
    };
  }, [cameraOpen]);

  const submitAuth = async (event) => {
    event.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    setAuthMessage('');
    try {
      const result = authMode === 'signup'
        ? await signUp(authEmail.trim(), authPassword)
        : await signIn(authEmail.trim(), authPassword);
      if (result) {
        setSession(result);
        setIsLoadingDashboard(true);
        setAuthMessage(authMode === 'signup' ? 'Account created and signed in.' : 'You are signed in.');
        setAuthPassword('');
      } else {
        setAuthMessage('Check your inbox for the confirmation link, then sign in here.');
        setAuthMode('signin');
        setAuthPassword('');
      }
    } catch (error) {
      setAuthError(error.message || 'Could not access your account. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSession(null);
    setServerReports([]);
    setServerAnalyses([]);
    setAuthMessage('You are signed out. Device drafts remain on this browser.');
  };

  const updateReportStatus = async (reportId, status) => {
    setDashboardError('');
    try {
      const response = await privateApiFetch('/api/my-reports', {
        method: 'PATCH',
        body: JSON.stringify({ reportId, status })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not update report status.');
      setServerReports((current) => current.map((report) => report.id === reportId ? { ...report, status } : report));
    } catch (error) { setDashboardError(error.message); }
  };

  const deletePrivateRecord = async (kind, id) => {
    const prompt = kind === 'report' ? 'Delete this report and its stored photo?' : 'Delete this photo review and its stored photo?';
    if (!window.confirm(`${prompt} This cannot be undone.`)) return;
    setDashboardError('');
    try {
      const query = kind === 'report' ? `id=${encodeURIComponent(id)}` : `analysisId=${encodeURIComponent(id)}`;
      const response = await privateApiFetch(`/api/my-reports?${query}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not delete this record.');
      if (kind === 'report') {
        setServerReports((current) => current.filter((report) => report.id !== id));
        setReports((current) => {
          const remaining = current.filter((report) => report.serverRecordId !== id);
          saveStored(REPORTS_KEY, remaining);
          return remaining;
        });
      } else setServerAnalyses((current) => current.filter((analysisItem) => analysisItem.id !== id));
      setAuthMessage(result.photoRetained
        ? 'The photo review was deleted. Its photo remains attached to a saved report; delete that report to remove the photo too.'
        : result.photoCleanupComplete === false
        ? 'The record was deleted, but its private photo could not be removed. Ask the project administrator to check Supabase Storage.'
        : 'The selected record was deleted from your account.');
    } catch (error) { setDashboardError(error.message); }
  };

  const deleteAllPrivateRecords = async () => {
    if (!window.confirm('Delete all reports, photo reviews, and stored photos in this account? This cannot be undone.')) return;
    setDashboardError('');
    try {
      const response = await privateApiFetch('/api/my-reports?all=1', { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not delete account records.');
      setServerReports([]);
      setServerAnalyses([]);
      setReports((current) => {
        const remaining = current.filter((report) => report.localOwnerId !== session.user?.id);
        saveStored(REPORTS_KEY, remaining);
        return remaining;
      });
      setAuthMessage(result.photoCleanupComplete === false
        ? 'All account records were deleted, but one or more private photos could not be removed. Ask the project administrator to check Supabase Storage.'
        : 'All reports, photo reviews, and stored photos were deleted from this account.');
    } catch (error) { setDashboardError(error.message); }
  };

  const clearThisDevice = () => {
    if (!window.confirm('Clear saved report receipts and the report draft from this browser? Server records are not affected.')) return;
    try {
      localStorage.removeItem(REPORTS_KEY);
      localStorage.removeItem(DRAFT_KEY);
      setStorageAvailable(true);
    } catch { setStorageAvailable(false); }
    setReports([]);
    setDraftPersistenceEnabled(false);
    setAnimal('Dog');
    setLocation('');
    setLandmark('');
    setObservations('');
    setObservedAt(localDateTimeValue());
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
    setReportPhotos([]);
    setPhoto(null);
    setAnalysis(null);
    setAnalysisId(null);
    setAnalysisError('');
    setPhotoError('');
    setFormError('');
    setNotice('This browser’s saved receipts and draft were cleared. Server records are unchanged.');
  };

  const openCamera = async () => {
    lastCameraTrigger.current = document.activeElement;
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera is not available here. Open this page over HTTPS or choose a photo instead.');
      setCameraOpen(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      setCameraStream(stream);
      setCameraOpen(true);
    } catch (error) {
      setCameraError(error.name === 'NotAllowedError'
        ? 'Camera permission was not granted. Allow camera access in your browser or choose a photo instead.'
        : 'Could not access a camera on this device. Choose a photo instead.');
      setCameraOpen(true);
    }
  };

  const captureCameraPhoto = () => {
    const video = cameraVideo.current;
    const canvas = cameraCanvas.current;
    if (!video || !canvas || !video.videoWidth) {
      setCameraError('Camera is still starting. Wait a moment and try again.');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Could not capture this photo. Please try again.');
        return;
      }
      const file = new File([blob], `dermascan-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleImage(file, 'photo');
      closeCamera();
    }, 'image/jpeg', 0.9);
  };

  const navigate = (destination) => {
    setPage(destination);
    if (destination === 'dashboard') {
      setDashboardError('');
      setIsLoadingDashboard(Boolean(session));
    }
    setMobileNavOpen(false);
    setFormError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.requestAnimationFrame(() => mainContent.current?.focus({ preventScroll: true }));
  };

  const handleImage = (file) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setPhotoError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('This image is over 8 MB. Choose a smaller file.');
      return;
    }
    setPhotoError('');
    setAnalysis(null);
    setAnalysisId(null);
    setAnalysisError('');
    const previous = photo;
    if (previous?.url && !reportPhotos.includes(previous)) revokeImage(previous);
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    const next = { name: file.name, url, file };
    setPhoto(next);
  };

  const addAnalysisToReport = () => {
    if (!reportPhotos.includes(photo) && reportPhotos.length >= 3) {
      setPhotoError('This report already has 3 photos. Remove one before attaching the reviewed photo.');
      return;
    }
    setReportPhotos((current) => current.includes(photo) ? current : [...current, photo]);
    setAnimal(photoAnimal);
    setObservations(`AI-generated visual notes (please verify with a veterinarian): ${analysis.visible_observations.join('; ')}`);
    setDraftPersistenceEnabled(true);
    navigate('report');
  };

  const handleReportPhotos = (files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    if (reportPhotos.length + selected.length > 3) {
      setPhotoError('Attach up to 3 photos to a report. Remove a photo before adding more.');
      return;
    }
    if (selected.some((file) => !ACCEPTED_IMAGE_TYPES.has(file.type) || file.size > 8 * 1024 * 1024)) {
      setPhotoError('Choose image files up to 8 MB each.');
      return;
    }
    const additions = selected.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return { name: file.name, url, file };
    });
    setReportPhotos((current) => [...current, ...additions]);
    setPhotoError('');
  };

  const removeImage = (target, index = 0) => {
    if (target === 'report') {
      const current = reportPhotos[index];
      if (current && current !== photo) revokeImage(current);
      setReportPhotos((items) => items.filter((_, itemIndex) => itemIndex !== index));
    } else {
      if (photo && !reportPhotos.includes(photo)) revokeImage(photo);
      setPhoto(null);
      setAnalysis(null);
      setAnalysisId(null);
      setAnalysisError('');
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const revokeImage = (image) => {
    URL.revokeObjectURL(image.url);
    objectUrls.current.delete(image.url);
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError('');
    try {
      const imageDataUrl = await imageToDataUrl(photo.file);
      const response = await privateApiFetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal: photoAnimal, imageDataUrl })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'The analysis could not be completed. Please try again.');
      setAnalysis(result.analysis);
      setAnalysisId(result.analysisId);
    } catch (error) {
      setAnalysisError(error.message === 'IMAGE_TOO_LARGE'
        ? 'This photo is too large to analyze. Choose a smaller image.'
        : error.message === 'IMAGE_ENCODE_FAILED' || error.message === 'IMAGE_READ_FAILED' || error.message === 'IMAGE_DECODE_FAILED'
          ? 'Could not prepare this photo. Try a JPG, PNG, or WebP image.'
          : error.message || 'Could not connect to the analysis service. Try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Location is unavailable in this browser. Enter an area or landmark instead.');
      return;
    }
    setNotice('Requesting location permission…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        setDraftPersistenceEnabled(true);
        setNotice('Location added. Check the area details before saving.');
        setFormError('');
      },
      () => {
        setNotice('');
        setFormError('Could not access your location. Enter an area or landmark manually.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const downloadReport = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `dermascan-report-${report.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (!location.trim()) {
      setFormError('Add an area, address, or approximate location before saving this report.');
      document.getElementById('location')?.focus();
      return;
    }
    if (!isDateTimeValue(observedAt)) {
      setFormError('Choose a valid date and time for the observation.');
      document.getElementById('observed-at')?.focus();
      return;
    }
    const reportCode = `DS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const report = {
      id: reportCode,
      createdAt: new Date().toISOString(),
      animal,
      location: location.trim(),
      landmark: landmark.trim(),
      observations: observations.trim(),
      observedAt: new Date(observedAt).toISOString(),
      photoName: reportPhotos.map((item) => item.name).join(', ').slice(0, 255) || null,
      localOwnerId: session?.user?.id || null,
      status: 'Not yet recorded on the server.'
    };

    setIsSubmittingReport(true);
    setFormError('');
    let recordError = '';
    try {
      const linkedAnalysisId = analysisId && reportPhotos.length === 1 && reportPhoto === photo && photoAnimal === animal ? analysisId : null;
      const photoDataUrls = linkedAnalysisId ? [] : await Promise.all(reportPhotos.map((item) => imageToDataUrl(item.file, 850 * 1024)));
      const response = await privateApiFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportCode,
          animal,
          location: location.trim(),
          landmark: landmark.trim(),
          observations: observations.trim(),
          observedAt: report.observedAt,
          photoName: report.photoName,
          photoDataUrls,
          analysisId: linkedAnalysisId
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not record this report on the server.');
      report.serverRecordId = result.reportId;
      report.status = 'Recorded in the secure DermaScan database; not sent to a rescue service.';
    } catch (error) {
      recordError = error.message || 'Could not reach the report server.';
      report.status = 'Not recorded on the server. Local copy only.';
    } finally {
      setIsSubmittingReport(false);
    }

    const next = [report, ...reports];
    setReports(next);
    setStorageAvailable(saveStored(REPORTS_KEY, next));
    setNotice(recordError
      ? `The report was downloaded locally but not recorded on the server: ${recordError}`
      : 'Report recorded securely. It has not been sent to a rescue service.');
    downloadReport(report);
  };

  const navItems = [
    ['home', 'Overview'], ['photo', 'Photo review'], ['report', 'Prepare a report'], ['dashboard', 'My records'], ['guidance', 'Care guidance']
  ];

  const filteredReports = serverReports.filter((report) => {
    const matchesStatus = dashboardStatus === 'all' || report.status === dashboardStatus;
    const searchable = [report.report_code, report.animal, report.location, report.landmark, report.observations].join(' ').toLowerCase();
    return matchesStatus && searchable.includes(dashboardSearch.trim().toLowerCase());
  });
  const visibleLocalReports = reports.filter((report) => session?.user?.id
    ? report.localOwnerId === session.user.id
    : !report.localOwnerId);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); navigate('home'); }} aria-label="DermaScan home">
          <span className="brand-symbol"><PawPrint size={20} strokeWidth={2.2} /></span>
          <span>derma<span className="brand-accent">scan</span></span>
        </a>
        <nav id="main-navigation" className={`main-nav ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map(([id, label]) => (
            <button key={id} className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={page === id ? 'page' : undefined}>{label}</button>
          ))}
        </nav>
        <button className="button button-primary header-cta" onClick={() => navigate('report')}><Plus size={17} /> Prepare a report</button>
        <button className="mobile-menu" aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNavOpen} aria-controls="main-navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}>{mobileNavOpen ? <X /> : <Menu />}</button>
      </header>

      <main id="main-content" ref={mainContent} tabIndex="-1" className="main-content">
        {page === 'home' && <section className="home-page page-wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="status-dot" /> A practical starting point for animal care</div>
              <h1>When an animal needs help, <span>make the next step clear.</span></h1>
          <p className="hero-lede">Organize what you observed, review a photo, and prepare a report you can share with a local rescue group or veterinarian.</p>
              <div className="hero-actions">
                <button className="button button-primary button-large" onClick={() => navigate('report')}>Prepare an incident report <ArrowRight size={18} /></button>
                <button className="button button-secondary button-large" onClick={() => navigate('photo')}><FileImage size={18} /> Review a photo</button>
              </div>
              <div className="honesty-note"><ShieldCheck size={18} /><span><strong>Clear about what this tool does.</strong> It does not diagnose, contact a rescue team, or replace a veterinarian.</span></div>
            </div>
            <div className="hero-visual" aria-label="Care steps: observe, document, contact a professional">
              <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
              <div className="visual-center"><PawPrint size={54} strokeWidth={1.6} /></div>
              <div className="visual-card visual-card-top"><IconMark><FileImage size={19} /></IconMark><span><strong>Observe</strong><small>Note visible signs</small></span></div>
              <div className="visual-card visual-card-right"><IconMark><FileText size={19} /></IconMark><span><strong>Document</strong><small>Prepare details</small></span></div>
              <div className="visual-card visual-card-bottom"><IconMark><HeartHandshake size={19} /></IconMark><span><strong>Get support</strong><small>Contact local care</small></span></div>
              <span className="visual-caption">A thoughtful first step</span>
            </div>
          </div>

          <div className="principles-row">
            <div><span className="principle-number">01</span><div><strong>Describe what you see</strong><p>Record observations in your own words.</p></div></div>
            <div><span className="principle-number">02</span><div><strong>Keep location accurate</strong><p>Use an area or landmark you can verify.</p></div></div>
            <div><span className="principle-number">03</span><div><strong>Choose where it is stored</strong><p>Drafts stay on this device. Sign in to store and manage private reports.</p></div></div>
          </div>

          <section className="section-block">
            <div className="section-heading"><div><span className="eyebrow">TOOLS</span><h2>Start with what you need</h2></div><p>Simple tools for documenting a concern. No invented diagnosis or rescue status.</p></div>
            <div className="tool-grid">
              <button className="tool-card" onClick={() => navigate('photo')}><IconMark><FileImage /></IconMark><span className="tool-arrow"><ArrowRight size={18} /></span><h3>Review a photo</h3><p>Preview and organize an image before discussing it with a veterinarian.</p><span className="text-link">Choose a photo <ChevronRight size={15} /></span></button>
              <button className="tool-card" onClick={() => navigate('report')}><IconMark><FileText /></IconMark><span className="tool-arrow"><ArrowRight size={18} /></span><h3>Prepare an incident report</h3><p>Collect an approximate location and the signs you observed in one file.</p><span className="text-link">Create a report <ChevronRight size={15} /></span></button>
              <button className="tool-card" onClick={() => navigate('guidance')}><IconMark><Stethoscope /></IconMark><span className="tool-arrow"><ArrowRight size={18} /></span><h3>Read care guidance</h3><p>Know what information to gather and when to seek urgent veterinary care.</p><span className="text-link">View guidance <ChevronRight size={15} /></span></button>
            </div>
          </section>
        </section>}

        {page === 'photo' && <section className="page-wrap content-page">
          <div className="page-intro"><span className="eyebrow">PHOTO REVIEW</span><h1>Capture and review visible signs</h1><p>Take a live photo or choose one from your device. AI can describe visible features; it cannot identify or diagnose a disease.</p></div>
          <div className="workspace-grid">
            <div className="panel upload-panel">
              <input ref={fileInput} className="visually-hidden" tabIndex="-1" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { handleImage(event.target.files?.[0], 'photo'); event.currentTarget.value = ''; }} />
              {!photo ? <button type="button" className="drop-zone" onClick={() => fileInput.current?.click()}><span className="upload-icon"><Upload size={24} /></span><strong>Choose a photo from your device</strong><span>JPG, PNG, or WebP · up to 8 MB</span><span className="button button-secondary">Browse files</span></button> : <div className="photo-preview"><img src={photo.url} alt={`Selected image: ${photo.name}`} /><div className="photo-preview-footer"><span><CheckCircle2 size={16} /> {photo.name}</span><button type="button" className="text-button" onClick={() => removeImage('photo')}>Remove photo</button></div></div>}
              <button className="button button-secondary camera-launch" onClick={openCamera}><Camera size={17} /> Take a live photo</button>
              {photoError && <p className="field-error" role="alert">{photoError}</p>}
            </div>
            <aside className="panel side-panel">
              <span className="panel-kicker">AI-assisted photo notes</span><h2>Describe visible features</h2>
              <label className="field-label" htmlFor="photo-animal">Animal in the photo</label>
              <select id="photo-animal" value={photoAnimal} onChange={(event) => setPhotoAnimal(event.target.value)}>
                <option>Dog</option><option>Cat</option><option>Bird</option><option>Other / unsure</option>
              </select>
              <ul className="check-list"><li><Check size={16} /> Use even light and keep focus</li><li><Check size={16} /> Keep a safe distance</li><li><Check size={16} /> Ask a veterinarian to assess concerns</li></ul>
              <div className="notice-box"><ShieldCheck size={17} /><p><strong>Visible features only.</strong> AI may miss or misdescribe signs. It will not identify diseases or recommend treatment. When you analyze, the photo is sent to the AI provider and saved to DermaScan’s private database. Analysis won’t complete if secure storage is unavailable.</p></div>
              {(!session || !getAuthConfig()) && <div className="notice-box account-notice"><UserRound size={17} /><p>{!getAuthConfig() ? 'Private account access is not configured yet.' : 'Sign in to save a private photo review.'} <button type="button" className="inline-link" onClick={() => navigate('dashboard')}>Go to My records</button></p></div>}
              <button className="button button-primary full-width" disabled={!photo || isAnalyzing || !session || !getAuthConfig()} onClick={analyzePhoto}>{isAnalyzing ? <><RotateCcw className="spin-icon" size={17} /> Reviewing photo…</> : <><Camera size={17} /> Analyze visible signs</>}</button>
              {analysisError && <p className="form-message error-message" role="alert">{analysisError}</p>}
            </aside>
          </div>
          {analysis && <section className="panel analysis-result" aria-live="polite">
            <span className="panel-kicker">AI-GENERATED VISUAL NOTES</span>
            <h2>{analysis.image_kind === 'animal_skin' ? 'What may be visible' : 'Photo review'}</h2>
            <p className="analysis-summary">{analysis.summary}</p>
            <p className="quality-label">Image quality: <strong>{analysis.image_quality.replaceAll('_', ' ')}</strong></p>
            {analysis.visible_observations.length > 0 && <ul className="observation-list">{analysis.visible_observations.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}
            <div className="notice-box"><ShieldCheck size={17} /><p><strong>Not a diagnosis.</strong> These are computer-generated visual observations, not confirmed symptoms or a disease identification. Have a veterinarian review any concern.</p></div>
            {analysis.image_kind === 'animal_skin' && analysis.visible_observations.length > 0 && <button type="button" className="button button-secondary" onClick={addAnalysisToReport}>Add notes and photo to report <ArrowRight size={16} /></button>}
          </section>}
          {photo && <div className="panel image-details"><IconMark><FileImage size={19} /></IconMark><div><strong>Image ready to review</strong><p>{photo.name} · {Math.max(1, Math.round(photo.file.size / 1024))} KB</p></div><button className="button button-secondary" onClick={() => navigate('guidance')}>What should I do next?</button></div>}
        </section>}

        {page === 'report' && <section className="page-wrap content-page">
          <div className="page-intro"><span className="eyebrow">REPORT PREPARATION</span><h1>Write down what happened</h1><p>Prepare a report file to share yourself. Nothing is sent to a rescue organization from this website.</p>{!session && <p className="form-message">You can prepare a local copy without an account. Sign in to securely save the report and manage it later. <button type="button" className="inline-link" onClick={() => navigate('dashboard')}>Sign in or create an account</button></p>}</div>
          <div className="report-layout">
            <form className="panel report-form" onSubmit={submitReport}>
              <div className="form-section">
                <div className="form-heading"><span>01</span><div><h2>Animal details</h2><p>Choose the closest description.</p></div></div>
                <label className="field-label" htmlFor="animal-type">Animal</label>
                <select id="animal-type" value={animal} onChange={(event) => { setAnimal(event.target.value); setDraftPersistenceEnabled(true); }}><option>Dog</option><option>Cat</option><option>Bird</option><option>Other / unsure</option></select>
                <label className="field-label" htmlFor="report-photo">Photo <span className="optional-label">Optional</span></label>
                <input ref={reportInput} id="report-photo" className="visually-hidden" tabIndex="-1" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { handleReportPhotos(event.target.files); event.currentTarget.value = ''; }} />
                <div className="attached-photo-list">{reportPhotos.map((item, index) => <div className="attached-photo" key={`${item.name}-${index}`}><img src={item.url} alt={`Report attachment: ${item.name}`} /><FileImage size={17} /><span>{item.name}</span><button type="button" className="text-button" aria-label={`Remove ${item.name}`} onClick={() => removeImage('report', index)}>Remove</button></div>)}</div>
                {reportPhotos.length < 3 && <button type="button" className="file-button" onClick={() => reportInput.current?.click()}><Upload size={17} /> {reportPhotos.length ? 'Add another photo' : 'Attach photos from this device'}{reportPhotos.length ? ` (${reportPhotos.length}/3)` : ''}</button>}
                <p className="form-footnote">Attach up to 3 JPG, PNG, or WebP images, up to 8 MB each. Signed-in reports store resized copies privately. The downloaded JSON receipt includes filenames only; share the original photos separately if needed.</p>
                {photoError && <p className="field-error" role="alert">{photoError}</p>}
              </div>
              <div className="form-section"><div className="form-heading"><span>02</span><div><h2>Where and when?</h2><p>Enter only a location and time you can verify.</p></div></div><label className="field-label" htmlFor="location">Area, address, or coordinates <span className="required-label">Required</span></label><div className="location-row"><input id="location" value={location} onChange={(event) => { setLocation(event.target.value); setDraftPersistenceEnabled(true); }} placeholder="Street, neighborhood, or nearby area" required aria-describedby={formError ? 'report-form-error' : undefined} /><button type="button" className="button button-secondary location-button" onClick={useCurrentLocation}><MapPin size={16} /> Use my location</button></div><label className="field-label" htmlFor="landmark">Landmark <span className="optional-label">Optional</span></label><input id="landmark" value={landmark} onChange={(event) => { setLandmark(event.target.value); setDraftPersistenceEnabled(true); }} placeholder="A nearby shop, junction, or building" /><label className="field-label" htmlFor="observed-at">When did you observe this? <span className="required-label">Required</span></label><input id="observed-at" type="datetime-local" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} required /></div>
              <div className="form-section"><div className="form-heading"><span>03</span><div><h2>What did you observe?</h2><p>Describe visible signs without guessing a diagnosis.</p></div></div><label className="field-label" htmlFor="observations">Notes <span className="optional-label">Optional</span></label><textarea id="observations" value={observations} onChange={(event) => { setObservations(event.target.value); setDraftPersistenceEnabled(true); }} rows="5" maxLength="1200" placeholder="For example: limping, visible wound, or when you last saw the animal." /><span className="character-count">{observations.length}/1200</span></div>
              {formError && <p id="report-form-error" className="form-message error-message" role="alert">{formError}</p>}{notice && <p className="form-message success-message" role="status">{notice}</p>}
              <button className="button button-primary button-large" type="submit" disabled={isSubmittingReport}><ArrowDownToLine size={18} /> {isSubmittingReport ? 'Recording report…' : 'Record and download report'}</button>
              <p className="form-footnote">The site attempts to record your report and photo in DermaScan’s private database. If it can’t, you’ll receive a local-download fallback notice. It does not dispatch a rescue service.</p>
            </form>
            <aside className="panel side-panel report-side"><span className="panel-kicker">Before you share</span><h2>Check the details</h2><p>Confirm the location and describe only what you directly observed. Do not approach an animal that seems frightened or injured.</p><div className="notice-box"><ShieldCheck size={17} /><p><strong>Private storage.</strong> Drafts stay in this browser. Signed-in reports/photos are private to your account and kept until you delete them. You can delete one record or all records from My records. If storage fails, the download is marked local-only.</p></div><h3>Recent report receipts</h3>{visibleLocalReports.length === 0 ? <p className="empty-state">No local report receipts for this account on this device.</p> : <ul className="saved-list">{visibleLocalReports.slice(0, 4).map((report) => <li key={report.id}><div><strong>{report.animal} · {report.location}</strong><small>{new Date(report.createdAt).toLocaleDateString()} · {report.status.startsWith('Recorded') ? 'Server recorded' : 'Local copy only'}</small></div><button type="button" className="icon-button" aria-label={`Download report ${report.id}`} onClick={() => downloadReport(report)}><ArrowDownToLine size={17} /></button></li>)}</ul>}{!storageAvailable && <p className="field-error" role="status">Browser storage is unavailable. Download reports to keep a copy.</p>}<button type="button" className="button button-secondary full-width clear-device-button" onClick={clearThisDevice}>Clear this device’s draft and receipts</button></aside>
          </div>
        </section>}

        {page === 'dashboard' && <section className="page-wrap content-page dashboard-page">
          <div className="page-intro"><span className="eyebrow">PRIVATE ACCOUNT</span><h1>My records</h1><p>Manage reports and photo reviews saved to your account. Records remain private and are kept until you delete them.</p></div>
          {!getAuthConfig() ? <div className="panel auth-panel"><span className="panel-kicker">ACCOUNT SETUP</span><h2>Private accounts are not configured</h2><p>To enable sign-in, set the Supabase URL and public anon key in the Vercel browser environment, and the Supabase URL, anon key, and secret key in the server environment. See the setup guide in README.</p></div> : !session ? <div className="panel auth-panel"><span className="panel-kicker">{authMode === 'signin' ? 'WELCOME BACK' : 'CREATE AN ACCOUNT'}</span><h2>{authMode === 'signin' ? 'Sign in to your private records' : 'Create your private account'}</h2><p>We use your account to show and manage only the records you submitted. Your report draft stays on this device.</p><form className="auth-form" onSubmit={submitAuth}><label className="field-label" htmlFor="account-email">Email</label><input id="account-email" type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required /><label className="field-label" htmlFor="account-password">Password</label><input id="account-password" type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} minLength="8" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required /><p className="form-footnote">Use at least 8 characters. Password is sent directly to Supabase Auth over HTTPS.</p>{authError && <p className="form-message error-message" role="alert">{authError}</p>}{authMessage && <p className="form-message success-message" role="status">{authMessage}</p>}<button className="button button-primary button-large" type="submit" disabled={isAuthenticating}>{isAuthenticating ? 'Please wait…' : authMode === 'signin' ? 'Sign in' : 'Create account'}</button></form><p className="auth-toggle">{authMode === 'signin' ? 'New to DermaScan?' : 'Already have an account?'} <button type="button" className="inline-link" onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); setAuthMessage(''); }}>{authMode === 'signin' ? 'Create an account' : 'Sign in'}</button></p></div> : <>
            <div className="dashboard-toolbar panel"><div className="account-identity"><span className="account-avatar"><UserRound size={20} /></span><div><strong>{session.user?.email || 'Signed in'}</strong><small>Private account · reports kept until you delete them</small></div></div><button className="button button-secondary" onClick={handleSignOut}><LogOut size={16} /> Sign out</button></div>
            {authMessage && <p className="form-message success-message" role="status">{authMessage}</p>}
            <div className="dashboard-tools"><label className="search-field"><Search size={17} /><span className="visually-hidden">Search your reports</span><input value={dashboardSearch} onChange={(event) => setDashboardSearch(event.target.value)} placeholder="Search ID, location, or notes" /></label><label className="status-filter"><span className="visually-hidden">Filter reports by status</span><select value={dashboardStatus} onChange={(event) => setDashboardStatus(event.target.value)}><option value="all">All statuses</option><option value="prepared">Prepared</option><option value="contacted">Contacted</option><option value="resolved">Resolved</option><option value="archived">Archived</option></select></label></div>
            {dashboardError && <p className="form-message error-message" role="alert">{dashboardError}</p>}
            {isLoadingDashboard ? <div className="panel empty-state">Loading your private records…</div> : <>
              <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="panel-kicker">REPORTS</span><h2>Your submitted reports</h2></div><span className="record-count">{filteredReports.length} shown</span></div>{filteredReports.length === 0 ? <p className="panel empty-state">{serverReports.length ? 'No reports match this search or status.' : 'No server reports yet. Prepare a report and sign in to save it.'}</p> : <div className="record-list">{filteredReports.map((report) => <article className="panel record-card" key={report.id}><div className="record-main"><div className="record-title-row"><span className="record-id">{report.report_code}</span><span className={`status-pill status-${report.status}`}>{report.status}</span></div><h3>{report.animal} · {report.location}</h3><p>{report.observations || 'No observation notes added.'}</p><small>Observed {new Date(report.observed_at).toLocaleString()} · Saved {new Date(report.created_at).toLocaleDateString()}{report.photo_name ? ` · Photos: ${report.photo_name}` : ''}</small></div><div className="record-actions"><label className="field-label" htmlFor={`status-${report.id}`}>Follow-up status</label><select id={`status-${report.id}`} value={report.status} onChange={(event) => updateReportStatus(report.id, event.target.value)}><option value="prepared">Prepared</option><option value="contacted">Contacted</option><option value="resolved">Resolved</option><option value="archived">Archived</option></select><div><button type="button" className="button button-secondary" onClick={() => downloadReport({ id: report.report_code, createdAt: report.created_at, observedAt: report.observed_at, animal: report.animal, location: report.location, landmark: report.landmark, observations: report.observations, photoName: report.photo_name, status: report.status })}><ArrowDownToLine size={15} /> Download</button><button type="button" className="button button-danger" onClick={() => deletePrivateRecord('report', report.id)}><Trash2 size={15} /> Delete</button></div></div></article>)}</div>}</section>
              <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="panel-kicker">PHOTO REVIEWS</span><h2>Saved visual notes</h2></div><span className="record-count">{serverAnalyses.length} total</span></div>{serverAnalyses.length === 0 ? <p className="panel empty-state">No saved photo reviews yet. Sign in before analyzing a photo to keep its notes here.</p> : <div className="record-list">{serverAnalyses.filter((item) => [item.animal, item.summary, ...(item.visible_observations || [])].join(' ').toLowerCase().includes(dashboardSearch.trim().toLowerCase())).map((item) => <article className="panel analysis-record" key={item.id}><div><span className="record-id">{item.animal} · {new Date(item.created_at).toLocaleDateString()}</span><p>{item.summary}</p><small>Image quality: {item.image_quality.replaceAll('_', ' ')} · Visual features only</small></div><button type="button" className="button button-danger" onClick={() => deletePrivateRecord('analysis', item.id)}><Trash2 size={15} /> Delete photo review</button></article>)}</div>}</section>
            </>}
            <section className="privacy-controls panel"><div><span className="panel-kicker">PRIVACY CONTROLS</span><h2>Remove stored information</h2><p>Delete a single report or photo review above, or permanently delete every report, photo review, and stored photo in this account. You can also clear this browser’s draft and local receipts.</p></div><div className="privacy-actions"><button type="button" className="button button-danger" onClick={deleteAllPrivateRecords}><Trash2 size={15} /> Delete all account records</button><button type="button" className="button button-secondary" onClick={clearThisDevice}>Clear this device’s draft and receipts</button></div></section>
          </>}
        </section>}

        {page === 'guidance' && <section className="page-wrap content-page guidance-page">
          <div className="page-intro"><span className="eyebrow">GENERAL GUIDANCE</span><h1>Care starts with a safe next step</h1><p>These notes help you prepare to contact a veterinary professional. They are not a diagnosis or treatment plan.</p></div>
          <div className="guidance-grid"><article className="panel guidance-card"><IconMark><Stethoscope /></IconMark><span className="panel-kicker">WHEN TO SEEK CARE</span><h2>Contact a veterinarian promptly</h2><p>Seek professional advice for wounds, persistent itching, swelling, hair loss, discharge, or changes in eating and movement.</p></article><article className="panel guidance-card urgent-card"><IconMark><HeartHandshake /></IconMark><span className="panel-kicker">URGENT SIGNS</span><h2>Get urgent veterinary help</h2><p>Heavy bleeding, difficulty breathing, collapse, severe pain, or inability to move needs urgent professional attention.</p></article><article className="panel guidance-card"><IconMark><FileText /></IconMark><span className="panel-kicker">WHAT TO NOTE</span><h2>Share clear observations</h2><p>Include when you first noticed the concern, the animal’s location, and any changes you’ve observed. Avoid guessing the cause.</p></article></div>
          <div className="guidance-callout"><ShieldCheck size={21} /><p><strong>DermaScan is not an emergency service.</strong> This site does not diagnose, prescribe, or notify a rescue team. Contact a local veterinarian or animal rescue organization directly for help.</p></div>
          <button className="button button-primary" onClick={() => navigate('report')}>Prepare a report <ArrowRight size={17} /></button>
        </section>}
      </main>

      {cameraOpen && <div className="camera-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCamera(); }}>
        <section className="camera-dialog" role="dialog" aria-modal="true" aria-labelledby="camera-title" ref={cameraDialog}>
          <div className="camera-heading"><div><span className="eyebrow">LIVE CAMERA</span><h2 id="camera-title">Take a photo</h2></div><button className="icon-button" aria-label="Close camera" onClick={closeCamera}><X size={18} /></button></div>
          {cameraError ? <div className="camera-error" role="alert"><Camera size={25} /><p>{cameraError}</p><button className="button button-secondary" onClick={() => { closeCamera(); openCamera(); }}><RotateCcw size={16} /> Try again</button></div> : <div className="camera-preview"><video ref={cameraVideo} autoPlay playsInline muted aria-label="Live camera preview" /><canvas ref={cameraCanvas} className="visually-hidden" /></div>}
          <p className="camera-disclaimer">Keep a safe distance. Don’t approach or handle an animal that is distressed or injured.</p>
          <div className="camera-actions"><button className="button button-secondary" onClick={closeCamera}>Cancel</button>{!cameraError && <button className="button button-primary" onClick={captureCameraPhoto}><Camera size={17} /> Capture photo</button>}</div>
        </section>
      </div>}

      <footer className="site-footer"><div className="footer-main"><a className="brand footer-brand" href="#home" onClick={(event) => { event.preventDefault(); navigate('home'); }}><span className="brand-symbol"><PawPrint size={19} /></span><span>derma<span className="brand-accent">scan</span></span></a><p>Clear, careful tools for documenting animal welfare concerns.</p><p className="footer-disclaimer">Not a diagnostic or emergency service. Submitted records are kept privately when backend storage is configured and are never dispatched to rescue groups.</p></div><div className="footer-links"><span>Explore</span>{navItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)}>{label}</button>)}</div><div className="footer-bottom"><span>© {currentYear} DermaScan</span><span>Made for clearer, more responsible care.</span></div></footer>
    </div>
  );
}

export default App;
