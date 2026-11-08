import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, Camera, Check, CheckCircle2, ChevronRight, FileImage,
  FileText, HeartHandshake, MapPin, Menu, PawPrint, Plus, RotateCcw, ShieldCheck,
  Stethoscope, Upload, X
} from 'lucide-react';
import './App.css';

const REPORTS_KEY = 'dermascan_reports_v1';
const DRAFT_KEY = 'dermascan_report_draft_v1';

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

async function imageToDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (quality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('IMAGE_ENCODE_FAILED')), 'image/jpeg', quality);
  });
  let blob = await toBlob(0.82);
  if (blob.size > 2 * 1024 * 1024) blob = await toBlob(0.62);
  if (blob.size > 2 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');

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
  const [reportPhoto, setReportPhoto] = useState(null);
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
  const fileInput = useRef(null);
  const reportInput = useRef(null);
  const cameraVideo = useRef(null);
  const cameraCanvas = useRef(null);
  const objectUrls = useRef(new Set());

  useEffect(() => {
    document.title = 'DermaScan | Animal care, made clearer';
  }, []);

  useEffect(() => {
    saveStored(DRAFT_KEY, { animal, location, landmark, observations });
  }, [animal, location, landmark, observations]);

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!cameraOpen || !cameraStream || !cameraVideo.current) return undefined;
    cameraVideo.current.srcObject = cameraStream;
    cameraVideo.current.play().catch(() => setCameraError('Camera preview could not start. Try closing and reopening the camera.'));
    return () => cameraStream.getTracks().forEach((track) => track.stop());
  }, [cameraOpen, cameraStream]);

  const closeCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
    setCameraError('');
  };

  const openCamera = async () => {
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
    setMobileNavOpen(false);
    setFormError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImage = (file, target) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file such as JPG, PNG, or WebP.');
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
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    const next = { name: file.name, url, file };
    if (target === 'report') setReportPhoto(next);
    else setPhoto(next);
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError('');
    try {
      const imageDataUrl = await imageToDataUrl(photo.file);
      const response = await fetch('/api/analyze', {
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
        : error.message === 'IMAGE_ENCODE_FAILED' || error.message === 'IMAGE_READ_FAILED'
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
      photoName: reportPhoto?.name || null,
      status: 'Not yet recorded on the server.'
    };

    setIsSubmittingReport(true);
    setFormError('');
    let recordError = '';
    try {
      const linkedAnalysisId = analysisId && reportPhoto === photo && photoAnimal === animal ? analysisId : null;
      const photoDataUrl = reportPhoto && !linkedAnalysisId ? await imageToDataUrl(reportPhoto.file) : null;
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportCode,
          animal,
          location: location.trim(),
          landmark: landmark.trim(),
          observations: observations.trim(),
          photoName: reportPhoto?.name || null,
          photoDataUrl,
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
    ['home', 'Overview'], ['photo', 'Photo review'], ['report', 'Prepare a report'], ['guidance', 'Care guidance']
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); navigate('home'); }} aria-label="DermaScan home">
          <span className="brand-symbol"><PawPrint size={20} strokeWidth={2.2} /></span>
          <span>derma<span className="brand-accent">scan</span></span>
        </a>
        <nav className={`main-nav ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map(([id, label]) => (
            <button key={id} className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={page === id ? 'page' : undefined}>{label}</button>
          ))}
        </nav>
        <button className="button button-primary header-cta" onClick={() => navigate('report')}><Plus size={17} /> Prepare a report</button>
        <button className="mobile-menu" aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(!mobileNavOpen)}>{mobileNavOpen ? <X /> : <Menu />}</button>
      </header>

      <main>
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
            <div><span className="principle-number">03</span><div><strong>Share with a professional</strong><p>Reports stay on your device until you share them.</p></div></div>
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
              <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { handleImage(event.target.files?.[0], 'photo'); event.currentTarget.value = ''; }} />
              {!photo ? <button className="drop-zone" onClick={() => fileInput.current?.click()}><span className="upload-icon"><Upload size={24} /></span><strong>Choose a photo from your device</strong><span>JPG, PNG, or WebP · up to 8 MB</span><span className="button button-secondary">Browse files</span></button> : <div className="photo-preview"><img src={photo.url} alt={`Selected image: ${photo.name}`} /><div className="photo-preview-footer"><span><CheckCircle2 size={16} /> {photo.name}</span><button className="text-button" onClick={() => { setPhoto(null); if (fileInput.current) fileInput.current.value = ''; }}>Remove photo</button></div></div>}
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
              <button className="button button-primary full-width" disabled={!photo || isAnalyzing} onClick={analyzePhoto}>{isAnalyzing ? <><RotateCcw className="spin-icon" size={17} /> Reviewing photo…</> : <><Camera size={17} /> Analyze visible signs</>}</button>
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
            {analysis.image_kind === 'animal_skin' && analysis.visible_observations.length > 0 && <button className="button button-secondary" onClick={() => { setAnimal(photoAnimal); setReportPhoto(photo); setObservations(`AI-generated visual notes (please verify with a veterinarian): ${analysis.visible_observations.join('; ')}`); setPage('report'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Add notes to report <ArrowRight size={16} /></button>}
          </section>}
          {photo && <div className="panel image-details"><IconMark><FileImage size={19} /></IconMark><div><strong>Image ready to review</strong><p>{photo.name} · {Math.max(1, Math.round(photo.file.size / 1024))} KB</p></div><button className="button button-secondary" onClick={() => navigate('guidance')}>What should I do next?</button></div>}
        </section>}

        {page === 'report' && <section className="page-wrap content-page">
          <div className="page-intro"><span className="eyebrow">REPORT PREPARATION</span><h1>Write down what happened</h1><p>Prepare a report file to share yourself. Nothing is sent to a rescue organization from this website.</p></div>
          <div className="report-layout">
            <form className="panel report-form" onSubmit={submitReport}>
              <div className="form-section">
                <div className="form-heading"><span>01</span><div><h2>Animal details</h2><p>Choose the closest description.</p></div></div>
                <label className="field-label" htmlFor="animal-type">Animal</label>
                <select id="animal-type" value={animal} onChange={(event) => setAnimal(event.target.value)}><option>Dog</option><option>Cat</option><option>Bird</option><option>Other / unsure</option></select>
                <label className="field-label" htmlFor="report-photo">Photo <span className="optional-label">Optional</span></label>
                <input ref={reportInput} id="report-photo" className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { handleImage(event.target.files?.[0], 'report'); event.currentTarget.value = ''; }} />
                {reportPhoto ? <div className="attached-photo"><FileImage size={17} /><span>{reportPhoto.name}</span><button type="button" className="text-button" onClick={() => setReportPhoto(null)}>Remove</button></div> : <button type="button" className="file-button" onClick={() => reportInput.current?.click()}><Upload size={17} /> Attach a photo from this device</button>}
                <p className="form-footnote">The report includes the photo filename, not the image itself. Share the photo separately.</p>
                {photoError && <p className="field-error" role="alert">{photoError}</p>}
              </div>
              <div className="form-section"><div className="form-heading"><span>02</span><div><h2>Where was the animal?</h2><p>Enter only a location you can verify.</p></div></div><label className="field-label" htmlFor="location">Area, address, or coordinates <span className="required-label">Required</span></label><div className="location-row"><input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Street, neighborhood, or nearby area" required /><button type="button" className="button button-secondary location-button" onClick={useCurrentLocation}><MapPin size={16} /> Use my location</button></div><label className="field-label" htmlFor="landmark">Landmark <span className="optional-label">Optional</span></label><input id="landmark" value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="A nearby shop, junction, or building" /></div>
              <div className="form-section"><div className="form-heading"><span>03</span><div><h2>What did you observe?</h2><p>Describe visible signs without guessing a diagnosis.</p></div></div><label className="field-label" htmlFor="observations">Notes <span className="optional-label">Optional</span></label><textarea id="observations" value={observations} onChange={(event) => setObservations(event.target.value)} rows="5" maxLength="1200" placeholder="For example: limping, visible wound, or when you last saw the animal." /><span className="character-count">{observations.length}/1200</span></div>
              {formError && <p className="form-message error-message" role="alert">{formError}</p>}{notice && <p className="form-message success-message" role="status">{notice}</p>}
              <button className="button button-primary button-large" type="submit" disabled={isSubmittingReport}><ArrowDownToLine size={18} /> {isSubmittingReport ? 'Recording report…' : 'Record and download report'}</button>
              <p className="form-footnote">The site attempts to record your report and photo in DermaScan’s private database. If it can’t, you’ll receive a local-download fallback notice. It does not dispatch a rescue service.</p>
            </form>
            <aside className="panel side-panel report-side"><span className="panel-kicker">Before you share</span><h2>Check the details</h2><p>Confirm the location and describe only what you directly observed. Do not approach an animal that seems frightened or injured.</p><div className="notice-box"><ShieldCheck size={17} /><p><strong>Server storage.</strong> Submitted reports and photos are stored privately when the backend is configured. Drafts remain in this browser until you submit. If storage fails, the app marks the download as local-only.</p></div><h3>Recent report receipts</h3>{reports.length === 0 ? <p className="empty-state">No reports prepared on this device yet.</p> : <ul className="saved-list">{reports.slice(0, 4).map((report) => <li key={report.id}><div><strong>{report.animal} · {report.location}</strong><small>{new Date(report.createdAt).toLocaleDateString()} · {report.status.startsWith('Recorded') ? 'Server recorded' : 'Local copy only'}</small></div><button className="icon-button" aria-label={`Download report ${report.id}`} onClick={() => downloadReport(report)}><ArrowDownToLine size={17} /></button></li>)}</ul>}{!storageAvailable && <p className="field-error" role="status">Browser storage is unavailable. Download reports to keep a copy.</p>}</aside>
          </div>
        </section>}

        {page === 'guidance' && <section className="page-wrap content-page guidance-page">
          <div className="page-intro"><span className="eyebrow">GENERAL GUIDANCE</span><h1>Care starts with a safe next step</h1><p>These notes help you prepare to contact a veterinary professional. They are not a diagnosis or treatment plan.</p></div>
          <div className="guidance-grid"><article className="panel guidance-card"><IconMark><Stethoscope /></IconMark><span className="panel-kicker">WHEN TO SEEK CARE</span><h2>Contact a veterinarian promptly</h2><p>Seek professional advice for wounds, persistent itching, swelling, hair loss, discharge, or changes in eating and movement.</p></article><article className="panel guidance-card urgent-card"><IconMark><HeartHandshake /></IconMark><span className="panel-kicker">URGENT SIGNS</span><h2>Get urgent veterinary help</h2><p>Heavy bleeding, difficulty breathing, collapse, severe pain, or inability to move needs urgent professional attention.</p></article><article className="panel guidance-card"><IconMark><FileText /></IconMark><span className="panel-kicker">WHAT TO NOTE</span><h2>Share clear observations</h2><p>Include when you first noticed the concern, the animal’s location, and any changes you’ve observed. Avoid guessing the cause.</p></article></div>
          <div className="guidance-callout"><ShieldCheck size={21} /><p><strong>DermaScan is not an emergency service.</strong> This site does not diagnose, prescribe, or notify a rescue team. Contact a local veterinarian or animal rescue organization directly for help.</p></div>
          <button className="button button-primary" onClick={() => navigate('report')}>Prepare a report <ArrowRight size={17} /></button>
        </section>}
      </main>

      {cameraOpen && <div className="camera-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCamera(); }}>
        <section className="camera-dialog" role="dialog" aria-modal="true" aria-labelledby="camera-title">
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
