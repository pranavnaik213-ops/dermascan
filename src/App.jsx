import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, Check, CheckCircle2, ChevronRight, FileImage,
  FileText, HeartHandshake, MapPin, Menu, PawPrint, Plus, ShieldCheck,
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
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const fileInput = useRef(null);
  const reportInput = useRef(null);
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
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    const next = { name: file.name, url, file };
    if (target === 'report') setReportPhoto(next);
    else setPhoto(next);
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

  const submitReport = (event) => {
    event.preventDefault();
    if (!location.trim()) {
      setFormError('Add an area, address, or approximate location before saving this report.');
      return;
    }
    const report = {
      id: `DS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      animal,
      location: location.trim(),
      landmark: landmark.trim(),
      observations: observations.trim(),
      photoName: reportPhoto?.name || null,
      status: 'Prepared on this device; not sent to a rescue service.'
    };
    const next = [report, ...reports];
    setReports(next);
    setStorageAvailable(saveStored(REPORTS_KEY, next));
    setFormError('');
    setNotice('Report prepared on this device. It has not been sent to a rescue service.');
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
          <div className="page-intro"><span className="eyebrow">PHOTO REVIEW</span><h1>Organize a clear photo</h1><p>Preview an image and note the area of concern. This page does not analyze images or identify a condition.</p></div>
          <div className="workspace-grid">
            <div className="panel upload-panel">
              <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { handleImage(event.target.files?.[0], 'photo'); event.currentTarget.value = ''; }} />
              {!photo ? <button className="drop-zone" onClick={() => fileInput.current?.click()}><span className="upload-icon"><Upload size={24} /></span><strong>Choose a photo from your device</strong><span>JPG, PNG, or WebP · up to 8 MB</span><span className="button button-secondary">Browse files</span></button> : <div className="photo-preview"><img src={photo.url} alt={`Selected image: ${photo.name}`} /><div className="photo-preview-footer"><span><CheckCircle2 size={16} /> {photo.name}</span><button className="text-button" onClick={() => { setPhoto(null); if (fileInput.current) fileInput.current.value = ''; }}>Remove photo</button></div></div>}
              {photoError && <p className="field-error" role="alert">{photoError}</p>}
            </div>
            <aside className="panel side-panel"><span className="panel-kicker">A helpful photo</span><h2>Keep it simple and safe</h2><ul className="check-list"><li><Check size={16} /> Use good, even light</li><li><Check size={16} /> Keep a comfortable distance</li><li><Check size={16} /> Avoid touching an injured animal</li><li><Check size={16} /> Ask a veterinarian to assess the image</li></ul><div className="notice-box"><ShieldCheck size={17} /><p><strong>No automated assessment.</strong> A photo preview is not a diagnosis. No image is uploaded by this page.</p></div><button className="button button-primary full-width" disabled={!photo} onClick={() => { setReportPhoto(photo); setPage('report'); setNotice('Photo attached to your local report draft.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Add photo to report <ArrowRight size={17} /></button></aside>
          </div>
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
              <button className="button button-primary button-large" type="submit"><ArrowDownToLine size={18} /> Prepare and download report</button>
              <p className="form-footnote">This creates a file on your device. You choose if, when, and with whom to share it.</p>
            </form>
            <aside className="panel side-panel report-side"><span className="panel-kicker">Before you share</span><h2>Check the details</h2><p>Confirm the location and describe only what you directly observed. Do not approach an animal that seems frightened or injured.</p><div className="notice-box"><ShieldCheck size={17} /><p><strong>Private by default.</strong> Your report and draft stay in this browser. They are not sent to a rescue group.</p></div><h3>Reports saved here</h3>{reports.length === 0 ? <p className="empty-state">No reports prepared on this device yet.</p> : <ul className="saved-list">{reports.slice(0, 4).map((report) => <li key={report.id}><div><strong>{report.animal} · {report.location}</strong><small>{new Date(report.createdAt).toLocaleDateString()}</small></div><button className="icon-button" aria-label={`Download report ${report.id}`} onClick={() => downloadReport(report)}><ArrowDownToLine size={17} /></button></li>)}</ul>}{!storageAvailable && <p className="field-error" role="status">Browser storage is unavailable. Download reports to keep a copy.</p>}</aside>
          </div>
        </section>}

        {page === 'guidance' && <section className="page-wrap content-page guidance-page">
          <div className="page-intro"><span className="eyebrow">GENERAL GUIDANCE</span><h1>Care starts with a safe next step</h1><p>These notes help you prepare to contact a veterinary professional. They are not a diagnosis or treatment plan.</p></div>
          <div className="guidance-grid"><article className="panel guidance-card"><IconMark><Stethoscope /></IconMark><span className="panel-kicker">WHEN TO SEEK CARE</span><h2>Contact a veterinarian promptly</h2><p>Seek professional advice for wounds, persistent itching, swelling, hair loss, discharge, or changes in eating and movement.</p></article><article className="panel guidance-card urgent-card"><IconMark><HeartHandshake /></IconMark><span className="panel-kicker">URGENT SIGNS</span><h2>Get urgent veterinary help</h2><p>Heavy bleeding, difficulty breathing, collapse, severe pain, or inability to move needs urgent professional attention.</p></article><article className="panel guidance-card"><IconMark><FileText /></IconMark><span className="panel-kicker">WHAT TO NOTE</span><h2>Share clear observations</h2><p>Include when you first noticed the concern, the animal’s location, and any changes you’ve observed. Avoid guessing the cause.</p></article></div>
          <div className="guidance-callout"><ShieldCheck size={21} /><p><strong>DermaScan is not an emergency service.</strong> This site does not diagnose, prescribe, or notify a rescue team. Contact a local veterinarian or animal rescue organization directly for help.</p></div>
          <button className="button button-primary" onClick={() => navigate('report')}>Prepare a report <ArrowRight size={17} /></button>
        </section>}
      </main>

      <footer className="site-footer"><div className="footer-main"><a className="brand footer-brand" href="#home" onClick={(event) => { event.preventDefault(); navigate('home'); }}><span className="brand-symbol"><PawPrint size={19} /></span><span>derma<span className="brand-accent">scan</span></span></a><p>Clear, careful tools for documenting animal welfare concerns.</p><p className="footer-disclaimer">Not a diagnostic or emergency service. Reports are prepared locally and are not sent to rescue organizations.</p></div><div className="footer-links"><span>Explore</span>{navItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)}>{label}</button>)}</div><div className="footer-bottom"><span>© {currentYear} DermaScan</span><span>Made for clearer, more responsible care.</span></div></footer>
    </div>
  );
}

export default App;
