import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, CheckCircle2, Download, FileText, LocateFixed, ShieldCheck, Trash2, Upload, AlertCircle } from 'lucide-react';
import CameraModal from './CameraModal';
import { downloadCaseReportPDF } from '../services/pdfReportGenerator';
import { analytics } from '../services/analytics';

const DRAFT_KEY = 'dermascan_draft_report';
const RATE_LIMIT_KEY = 'dermascan_submission_timestamps';
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MIN_SUBMISSION_TIME_MS = 2000; // Time gate: bot protection against instant form submission
const MAX_SUBMISSIONS_PER_MINUTE = 3;

function readDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch { return {}; }
}

function localDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

// Bot protection: check client rate limit
function checkRateLimit() {
  try {
    const now = Date.now();
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const timestamps = raw ? JSON.parse(raw) : [];
    const recent = timestamps.filter(t => now - t < 60000);
    if (recent.length >= MAX_SUBMISSIONS_PER_MINUTE) {
      return false;
    }
    recent.push(now);
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
    return true;
  } catch {
    return true; // Allow if sessionStorage is disabled
  }
}

export default function ReportAnimal({ onAddCase, setActiveTab, initialPhoto }) {
  const [draft] = useState(readDraft);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [animal, setAnimal] = useState(draft.animal || initialPhoto?.animalType || '');
  const [location, setLocation] = useState(draft.location || '');
  const [landmark, setLandmark] = useState(draft.landmark || '');
  const [observedAt, setObservedAt] = useState(draft.observedAt || localDateTime());
  const [observations, setObservations] = useState(draft.observations || initialPhoto?.observations || '');
  const [photo, setPhoto] = useState(initialPhoto || null);
  const [aiDiagnosis, setAiDiagnosis] = useState(initialPhoto?.aiDiagnosis || null);
  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedReport, setSavedReport] = useState(null);
  const [saveError, setSaveError] = useState('');

  // Anti-bot Honeypot & Time-Gate Protection (Items 17 & 18)
  const [honeypot, setHoneypot] = useState('');
  const mountTimeRef = useRef(0);

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  const [prevInitialPhoto, setPrevInitialPhoto] = useState(initialPhoto);
  if (initialPhoto !== prevInitialPhoto) {
    setPrevInitialPhoto(initialPhoto);
    if (initialPhoto) {
      if (initialPhoto.photoUrl) {
        setPhoto({
          photoUrl: initialPhoto.photoUrl,
          photoName: initialPhoto.photoName || 'AI Scanned Image'
        });
      }
      if (initialPhoto.animalType) {
        setAnimal(initialPhoto.animalType);
      }
      if (initialPhoto.observations) {
        setObservations(initialPhoto.observations);
      }
      if (initialPhoto.aiDiagnosis) {
        setAiDiagnosis(initialPhoto.aiDiagnosis);
      }
    }
  }

  useEffect(() => {
    if (savedReport) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ animal, location, landmark, observedAt, observations }));
    } catch { /* The form remains usable if local storage is unavailable. */ }
  }, [animal, location, landmark, observedAt, observations, savedReport]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose a valid image file (JPEG, PNG, WebP) to attach.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Image exceeds 8 MB. Please choose a compressed photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setPhoto({ photoUrl: reader.result, photoName: file.name }); setError(''); };
    reader.onerror = () => setError('This image could not be opened. Try another file.');
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location sharing is not available in this browser. Enter the area or address instead.');
      return;
    }
    setIsLocating(true);
    setLocationMessage('');
    navigator.geolocation.getCurrentPosition((position) => {
      const point = { lat: Number(position.coords.latitude.toFixed(5)), lng: Number(position.coords.longitude.toFixed(5)) };
      setCoordinates(point);
      setLocationMessage('Exact GPS coordinates added to this report.');
      setIsLocating(false);
    }, () => {
      setLocationMessage('Location was not available. Enter the area or address manually.');
      setIsLocating(false);
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
  };

  // Form Validation (Item 17)
  const validateForm = () => {
    const errors = {};
    if (!animal) {
      errors.animal = 'Please select the type of animal.';
    }
    if (!location.trim()) {
      errors.location = 'Please provide an area, street, or address.';
    } else if (location.trim().length < 4) {
      errors.location = 'Location description should be at least 4 characters.';
    }
    if (!observations.trim()) {
      errors.observations = 'Please describe what you observed (appearance, symptoms, behavior).';
    } else if (observations.trim().length < 8) {
      errors.observations = 'Observations should be at least 8 characters for clinical clarity.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaveError('');

    // Spam Protection 1: Honeypot trap (Item 18)
    if (honeypot.trim()) {
      // Silently discard spam submission without revealing bot trap
      console.warn('[Security] Honeypot field triggered; ignoring bot submission.');
      setSavedReport({
        id: `DS-${Date.now()}`,
        animalType: animal || 'Dog',
        location: location || 'Unknown',
        storageMode: 'browser'
      });
      return;
    }

    // Spam Protection 2: Time Gate (reject robotic submissions under 2 seconds)
    const elapsed = Date.now() - mountTimeRef.current;
    if (elapsed < MIN_SUBMISSION_TIME_MS) {
      setError('Form submitted too rapidly. Please review the details before submitting.');
      return;
    }

    // Spam Protection 3: Rate Limiting
    if (!checkRateLimit()) {
      setError('Submission limit reached (maximum 3 reports per minute). Please wait a moment.');
      return;
    }

    // Form Validation (Item 17)
    if (!validateForm()) {
      setError('Please resolve the highlighted fields before saving.');
      return;
    }

    setIsSaving(true);
    const report = {
      id: `DS-${Date.now()}`,
      animalType: animal,
      animal,
      locationName: location.trim(),
      location: location.trim(),
      landmark: landmark.trim(),
      coordinates,
      observedAt: new Date(observedAt).toISOString(),
      observations: observations.trim(),
      notes: observations.trim(),
      photoUrl: photo?.photoUrl || '',
      photoName: photo?.photoName || '',
      aiDiagnosis: aiDiagnosis || null,
      status: 'received',
    };

    try {
      const result = await onAddCase(report);
      const completeReport = { ...report, ...result };
      setSavedReport(completeReport);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Saved */ }

      // Analytics Event (Item 19)
      analytics.track('report_submitted', {
        animal,
        hasPhoto: Boolean(photo?.photoUrl),
        hasCoordinates: Boolean(coordinates)
      });

      // Automatically download PDF report to reporter device
      try {
        await downloadCaseReportPDF(completeReport);
      } catch (pdfErr) {
        console.warn('[ReportAnimal] Auto-download PDF error:', pdfErr);
      }
    } catch {
      setSaveError('The report could not be saved. Your draft is still preserved on this device; try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (savedReport) {
    const savedLocally = savedReport.storageMode === 'browser';
    const sessionOnly = savedReport.storageMode === 'session';
    return (
      <section className="page-wrap content-page report-page" aria-labelledby="report-saved-title">
        <div className="report-confirmation panel">
          <span className="report-confirmation-icon"><CheckCircle2 size={30} aria-hidden="true" /></span>
          <span className="eyebrow">REPORT PREPARED</span>
          <h1 id="report-saved-title">Your report is ready</h1>
          <p>{savedLocally ? 'It was saved in this browser because server storage is unavailable.' : sessionOnly ? 'Browser storage is unavailable, so this report will stay on this page until you leave.' : 'It was saved to the DermaScan server.'} It has not been sent to a veterinarian or rescue group.</p>
          <div className="report-reference"><span>Reference</span><strong>{savedReport.id}</strong></div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '13px',
            fontWeight: 600,
            margin: '14px 0 20px'
          }}>
            <Download size={16} /> Official PDF report has been downloaded to your device
          </div>

          <div className="report-confirmation-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            <button type="button" className="button button-primary" onClick={() => setActiveTab('help')}>
              Find local care <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => downloadCaseReportPDF(savedReport)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={15} aria-hidden="true" /> Download PDF again
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => { setSavedReport(null); setAnimal(''); setLocation(''); setLandmark(''); setObservations(''); setPhoto(null); setCoordinates(null); setFieldErrors({}); }}
            >
              Create another report
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-wrap content-page report-page" aria-labelledby="report-title">
      <header className="page-intro page-intro-left">
        <span className="eyebrow">ANIMAL REPORT</span>
        <h1 id="report-title">Share what you noticed</h1>
        <p>Record a few details to help you contact a local care provider. A report is not sent to a rescue group automatically.</p>
      </header>

      <form className="panel report-form" onSubmit={handleSubmit} noValidate>
        {/* Anti-spam honeypot field (hidden from humans, filled by spam scrapers) */}
        <input
          type="text"
          name="hp_agency_code"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }}
          aria-hidden="true"
        />

        <div className="report-form-notice">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>Your draft stays in this browser. When you select Save report, the details and attached photo are stored locally or synced to the DermaScan network. Location is requested only if you choose Use my location.</p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="report-animal">
              Animal <span className="required-star" aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="report-animal"
              value={animal}
              onChange={(event) => {
                setAnimal(event.target.value);
                if (fieldErrors.animal) setFieldErrors(prev => ({ ...prev, animal: null }));
              }}
              aria-invalid={Boolean(fieldErrors.animal)}
              aria-describedby={fieldErrors.animal ? 'report-animal-error' : undefined}
              required
            >
              <option value="">Choose an animal</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Other">Other or not sure</option>
            </select>
            {fieldErrors.animal && (
              <span id="report-animal-error" className="field-error-message" role="alert" style={{ color: '#b91c1c', fontSize: '0.82rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> {fieldErrors.animal}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="report-time">When did you see them?</label>
            <input id="report-time" type="datetime-local" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} required />
          </div>

          <div className="form-field form-field-wide">
            <div className="form-label-row">
              <label htmlFor="report-location">
                Area or address <span className="required-star" aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
              </label>
              <button className="inline-button" type="button" onClick={handleGetLocation} disabled={isLocating}>
                <LocateFixed size={15} aria-hidden="true" />
                {isLocating ? 'Getting location…' : 'Use my location'}
              </button>
            </div>
            <input
              id="report-location"
              type="text"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                if (fieldErrors.location) setFieldErrors(prev => ({ ...prev, location: null }));
              }}
              placeholder="Street, neighborhood, or nearby area"
              maxLength={180}
              aria-invalid={Boolean(fieldErrors.location)}
              aria-describedby={fieldErrors.location ? 'report-location-error' : undefined}
              required
            />
            {fieldErrors.location ? (
              <span id="report-location-error" className="field-error-message" role="alert" style={{ color: '#b91c1c', fontSize: '0.82rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> {fieldErrors.location}
              </span>
            ) : locationMessage ? (
              <span className="field-hint" role="status">{locationMessage}</span>
            ) : null}
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="report-landmark">Nearby landmark <span className="optional-label">Optional</span></label>
            <input id="report-landmark" type="text" value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="A shop, building, or other easy-to-find landmark" maxLength={180} />
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="report-observations">
              What did you notice? <span className="required-star" aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="report-observations"
              value={observations}
              onChange={(event) => {
                setObservations(event.target.value);
                if (fieldErrors.observations) setFieldErrors(prev => ({ ...prev, observations: null }));
              }}
              placeholder="Describe fur loss, redness, scabs, limping, or behavioral distress. Avoid guessing at clinical diagnoses."
              maxLength={1200}
              rows={5}
              aria-invalid={Boolean(fieldErrors.observations)}
              aria-describedby={fieldErrors.observations ? 'report-obs-error' : undefined}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              {fieldErrors.observations ? (
                <span id="report-obs-error" className="field-error-message" role="alert" style={{ color: '#b91c1c', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> {fieldErrors.observations}
                </span>
              ) : <span />}
              <span className="field-hint">{observations.length}/1200 characters</span>
            </div>
          </div>
        </div>

        <div className="report-photo-field">
          <div>
            <strong>Photo <span className="optional-label">Optional</span></strong>
            <p>A photo helps veterinarians assess the animal's condition. Take one only if it is safe and humane.</p>
          </div>

          {photo?.photoUrl && (
            <img
              className="report-photo-preview"
              src={photo.photoUrl}
              alt={photo?.photoName ? `Attached photo of observed animal: ${photo.photoName}` : 'Attached photo of animal skin observation'}
            />
          )}

          <div className="report-photo-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <label
              htmlFor="report-photo-file-input"
              className="button button-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                margin: 0
              }}
            >
              <Upload size={16} aria-hidden="true" />
              {photo ? 'Change photo' : 'Choose photo'}
            </label>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => setCameraOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Camera size={16} aria-hidden="true" />
              Take photo
            </button>

            {photo && (
              <button
                type="button"
                className="button button-outline"
                onClick={() => setPhoto(null)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}
              >
                <Trash2 size={15} aria-hidden="true" />
                Remove
              </button>
            )}
          </div>

          <input
            id="report-photo-file-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              borderWidth: 0,
              opacity: 0,
              pointerEvents: 'none'
            }}
            aria-label="Upload photo of animal"
          />
        </div>

        <CameraModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={(dataUrl) => {
            setPhoto({ photoUrl: dataUrl, photoName: 'Camera capture' });
            setError('');
          }}
        />

        {(error || saveError) && (
          <p className="form-message error-message" role="alert" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px' }}>
            {error || saveError}
          </p>
        )}

        <div className="report-form-actions">
          <button className="button button-primary button-large" type="submit" disabled={isSaving}>
            <FileText size={17} aria-hidden="true" />
            {isSaving ? 'Saving report…' : 'Save report'}
          </button>
          <span style={{ color: '#475569', fontSize: '0.88rem' }}>
            Saving does not contact an organization or emergency service.
          </span>
        </div>
      </form>
    </section>
  );
}
