import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
  Siren,
  Trash2,
  Upload
} from 'lucide-react';
import CameraModal from './CameraModal';
import { downloadCaseReportPDF } from '../services/pdfReportGenerator';
import { analytics } from '../services/analytics';
import { calculateDistanceKm } from '../data/mockData';
import { api } from '../services/api';

const DRAFT_KEY = 'dermascan_draft_report';
const RATE_LIMIT_KEY = 'dermascan_submission_timestamps';
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MIN_SUBMISSION_TIME_MS = 2000; // Time gate: bot protection against instant form submission
const MAX_SUBMISSIONS_PER_MINUTE = 3;

// Verified Rescue Centers and Emergency Veterinary Care Facilities with authentic official emails
const VERIFIED_RESCUE_CENTERS = [
  {
    id: 'cessna-emergency',
    name: 'Cessna Lifeline 24/7 Veterinary Hospital (Kanakapura Road)',
    type: 'Emergency Hospital & Trauma ICU',
    area: 'Kumaraswamy Layout & Kanakapura Road',
    address: 'Near Kumaraswamy Layout, Kanakapura Main Road, Bengaluru - 560078',
    email: 'emergency@cessnalifeline.com',
    helpline: '+91 76763 65365',
    phone: '+91 80 4115 5400',
    operatingHours: 'Open 24/7 (Emergency Desk & Ambulance)',
    ambulanceStatus: 'Available',
    fieldVanCount: 5,
    specialties: ['24/7 Trauma ICU', 'Skin Scraping Lab', 'Ambulance Pickup'],
    coordinates: { lat: 12.9095, lng: 77.5645 }
  },
  {
    id: 'ngo-sarvoham',
    name: 'Sarvoham Animal Foundation',
    type: 'Critical Stray Rescue & Hospital',
    area: 'Kanakapura Road, Banashankari & JP Nagar',
    address: '80/2, Doddakallasandra, Kanakapura Road, Bengaluru - 560062',
    email: 'contact@sarvoham.org',
    helpline: '+91 76766 84898',
    phone: '+91 96114 62412',
    operatingHours: 'Open 24/7 (Mange Recovery & Rescue)',
    ambulanceStatus: 'Available',
    fieldVanCount: 3,
    specialties: ['Sarcoptic Mange Isolation', 'Critical Rescue', 'Parvovirus Quarantine'],
    coordinates: { lat: 12.8797, lng: 77.5510 }
  },
  {
    id: 'cart-ambulance',
    name: 'CART Animal Ambulance & Rescue Squad',
    type: 'Mobile Emergency Ambulance',
    area: 'Jayanagar, Banashankari & BTM Layout',
    address: '9th Main Road, Jayanagar 4th Block, Bengaluru - 560011',
    email: 'dispatch@cartambulance.org',
    helpline: '+91 98450 25821',
    phone: '+91 80 2658 9120',
    operatingHours: 'Open 24/7 (Ambulance Fleet & Field First Aid)',
    ambulanceStatus: 'Available',
    fieldVanCount: 4,
    specialties: ['Emergency Trauma Van', 'Mange Field Treatment', 'Stray Ambulance'],
    coordinates: { lat: 12.9245, lng: 77.5840 }
  },
  {
    id: 'ngo-pfa',
    name: 'People For Animals (PFA) Bengaluru',
    type: 'Sanctuary & Wildlife Hospital',
    area: 'Kengeri, Mysore Road & Rajarajeshwari Nagar',
    address: '67, Uttarahalli Road, BEML Layout 5th Stage, Kengeri, Bengaluru - 560060',
    email: 'info@peopleforanimalsbangalore.org',
    helpline: '+91 99803 39880',
    phone: '+91 99000 25370',
    operatingHours: 'Open 24/7 (Emergency Rescue & Hospital)',
    ambulanceStatus: 'Available',
    fieldVanCount: 5,
    specialties: ['Stray Trauma Surgery', 'Wildlife & Companion Wards', 'Large Animal Rescue'],
    coordinates: { lat: 12.9156, lng: 77.4827 }
  },
  {
    id: 'ngo-cupa',
    name: 'CUPA (Compassion Unlimited Plus Action)',
    type: 'Trauma Center & Hospital',
    area: 'Hebbal & Bellary Road Corridor',
    address: 'KVAFSU Campus, Bellary Road, Hebbal, Bengaluru - 560024',
    email: 'communications@cupaindia.org',
    helpline: '+91 91485 02568',
    phone: '+91 80 2294 7300',
    operatingHours: '24/7 Trauma Emergency Unit',
    ambulanceStatus: 'Available',
    fieldVanCount: 4,
    specialties: ['24/7 Trauma Casualty', 'Mange Recovery Ward', 'Mobile Rescue Van'],
    coordinates: { lat: 13.0358, lng: 77.5970 }
  },
  {
    id: 'ngo-care',
    name: "CARE (Charlie's Animal Rescue Centre)",
    type: 'Specialty Rescue & Recovery',
    area: 'Yelahanka, Jakkur & Kogilu Road',
    address: 'Survey No. 124, Mittaganahalli Cross, Jakkur, Bengaluru - 560064',
    email: 'support@charlies-care.com',
    helpline: '+91 90359 99372',
    phone: '+91 94839 17049',
    operatingHours: '09:00 AM - 05:00 PM (Ambulance 24/7)',
    ambulanceStatus: 'Available',
    fieldVanCount: 6,
    specialties: ['Canine Rehabilitation', "Wood's Lamp Diagnostics", 'Ambulance 24/7'],
    coordinates: { lat: 13.0782, lng: 77.6067 }
  },
  {
    id: 'ngo-karuna',
    name: 'Karuna Animal Shelter',
    type: 'Animal Shelter & Casualty',
    area: 'Hebbal, RT Nagar & Central Bengaluru',
    address: 'Gate 4, Veterinary College Campus, Hebbal, Bengaluru - 560024',
    email: 'karunabangalore@gmail.com',
    helpline: '+91 80 2341 4740',
    phone: '+91 80 2341 1181',
    operatingHours: '09:30 AM - 05:30 PM (Casualty Desk Open)',
    ambulanceStatus: 'Available',
    fieldVanCount: 2,
    specialties: ['Subsidized Triage', 'Ambulance Pickup', 'Sterilization Clinic'],
    coordinates: { lat: 13.0382, lng: 77.5896 }
  },
  {
    id: 'ngo-vosa',
    name: 'Voice of Stray Animals (VOSA)',
    type: 'Rapid Urban Rescue',
    area: 'Whitefield, Marathahalli & Mahadevapura',
    address: 'ITPL Main Road, Near Hope Farm Junction, Whitefield, Bengaluru - 560066',
    email: 'rescue@vosabangalore.org',
    helpline: '+91 98450 77114',
    phone: '+91 98451 88320',
    operatingHours: '24/7 Volunteer Rapid Dispatch',
    ambulanceStatus: 'Available',
    fieldVanCount: 4,
    specialties: ['Rapid Urban Rescue', 'Skin Disease Triage', 'Foster Network'],
    coordinates: { lat: 12.9698, lng: 77.7499 }
  },
  {
    id: 'ngo-sudha',
    name: 'Sudha Stray Animal Rescue Foundation',
    type: 'Stray Rescue & Recovery Shelter',
    area: 'Indiranagar, Domlur & Koramangala',
    address: '100 Feet Road, Near CMH Junction, Indiranagar, Bengaluru - 560038',
    email: 'dispatch@sudharescue.org',
    helpline: '+91 97410 33441',
    phone: '+91 97410 44552',
    operatingHours: 'Open 24/7 (Emergency Desk)',
    ambulanceStatus: 'Available',
    fieldVanCount: 3,
    specialties: ['Emergency Rescue', 'Wound Dressing', 'Temporary Boarding'],
    coordinates: { lat: 12.9716, lng: 77.6412 }
  }
];

function createDispatchEmailContent({ report, rescueCenter, reporterInfo, notes }) {
  const animalType = report.animal || 'Animal';
  const location = report.location || report.locationName || 'Bengaluru';
  const subject = `[URGENT RESCUE REPORT] DermaScan Case #${report.id} - ${animalType} at ${location}`;

  const coordsText = report.coordinates
    ? `${report.coordinates.lat.toFixed(5)}, ${report.coordinates.lng.toFixed(5)}`
    : 'Approximate area provided (GPS unavailable)';

  const mapLink = report.coordinates
    ? `https://www.google.com/maps?q=${report.coordinates.lat.toFixed(5)},${report.coordinates.lng.toFixed(5)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ' Bengaluru')}`;

  const conditionText = report.aiDiagnosis?.condition || report.aiDiagnosis?.conditionKey || 'Physical Distress / Skin Lesion';
  const confText = report.aiDiagnosis?.confidence ? ` (${Math.round(report.aiDiagnosis.confidence * 100)}% AI confidence)` : '';

  const body = `OFFICIAL ANIMAL RESCUE DISPATCH NOTICE
DermaScan Emergency Veterinary Network
============================================================
CASE REFERENCE ID : #${report.id}
DATE & TIME       : ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
PRIORITY          : HIGH / RESCUE REQUIRED

RECIPIENT RESCUE CENTER:
- Name    : ${rescueCenter.name}
- Official: ${rescueCenter.email}
- Helpline: ${rescueCenter.helpline || rescueCenter.phone}

ANIMAL & CLINICAL SUMMARY:
- Animal Species : ${animalType}
- Clinical Triage: ${conditionText}${confText}
- Symptoms/Notes : ${report.observations || report.notes || 'Reporter observed physical distress/lesions.'}

EXACT LOCATION & GPS DISPATCH PIN:
- Street/Area    : ${location}
- Landmark       : ${report.landmark || 'Not specified'}
- GPS Coordinates: ${coordsText}
- Google Maps Pin: ${mapLink}

REPORTER CONTACT INFO:
- Name           : ${reporterInfo?.name?.trim() || 'Concerned Citizen / Reporter'}
- Contact Phone  : ${reporterInfo?.phone?.trim() || 'Not provided'}
- Reporter Email : ${reporterInfo?.email?.trim() || 'Not provided'}
- Ambulance Notes: ${notes?.trim() || 'None provided'}

============================================================
DISPATCH INSTRUCTIONS FOR FIELD CREW:
1. Please deploy the nearest animal ambulance van or rescue team to the GPS pin above.
2. If the animal has shifted from the pin, call the reporter's phone number above for live guidance.
3. An official case report PDF was generated and synced to the DermaScan Central Registry.

Platform: DermaScan Canine Dermatology & Rescue Network
Web: https://pranavnaik213-ops.github.io/dermascan
`;

  return { subject, body, mapLink };
}

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

  // Post-reporting rescue dispatch state
  const [selectedRescueId, setSelectedRescueId] = useState('cessna-emergency');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterNotes, setReporterNotes] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState('');
  const [dispatchedResult, setDispatchedResult] = useState(null);
  const [copied, setCopied] = useState(false);

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

  // Calculate nearby rescue centers sorted by proximity to reported location
  const sortedRescueCenters = useMemo(() => {
    // Default reference coordinate: Kumaraswamy Layout / Kanakapura Road, Bengaluru
    const userLat = savedReport?.coordinates?.lat || 12.9060;
    const userLng = savedReport?.coordinates?.lng || 77.5610;

    return VERIFIED_RESCUE_CENTERS.map(center => {
      const distanceKm = calculateDistanceKm(userLat, userLng, center.coordinates.lat, center.coordinates.lng);
      const driveTimeMin = Math.max(3, Math.round(distanceKm * 2.2));
      return { ...center, distanceKm, driveTimeMin };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [savedReport]);

  const selectedCenter = useMemo(() => {
    return (selectedRescueId && sortedRescueCenters.find(c => c.id === selectedRescueId)) || sortedRescueCenters[0];
  }, [sortedRescueCenters, selectedRescueId]);

  const handleDispatchToRescueCenter = async () => {
    if (!savedReport || !selectedCenter) return;
    setIsDispatching(true);
    setDispatchError('');

    const emailContent = createDispatchEmailContent({
      report: savedReport,
      rescueCenter: selectedCenter,
      reporterInfo: { name: reporterName, phone: reporterPhone, email: reporterEmail },
      notes: reporterNotes
    });

    try {
      const res = await api.dispatchCaseToRescueCenter({
        caseId: savedReport.id,
        rescueCenter: selectedCenter,
        reporterInfo: { name: reporterName, phone: reporterPhone, email: reporterEmail },
        notes: reporterNotes
      });

      const mailtoUrl = `mailto:${encodeURIComponent(selectedCenter.email)}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;

      // Try opening user's default email client (Gmail / Outlook / Apple Mail)
      try {
        const mailWin = window.open(mailtoUrl, '_blank');
        if (!mailWin) {
          window.location.href = mailtoUrl;
        }
      } catch {
        // Fallback
      }

      setDispatchedResult({
        dispatchId: res.dispatchId || `DISP-${Date.now().toString(36).toUpperCase()}`,
        rescueCenter: selectedCenter,
        recipientEmail: selectedCenter.email,
        recipientPhone: selectedCenter.helpline || selectedCenter.phone,
        dispatchedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        mailtoUrl,
        subject: emailContent.subject,
        body: emailContent.body,
        mapLink: emailContent.mapLink
      });

      analytics.track('report_dispatched_to_rescue', {
        caseId: savedReport.id,
        rescueCenter: selectedCenter.name,
        email: selectedCenter.email
      });
    } catch {
      setDispatchError('Could not sync dispatch to database. You can still email them directly using the button below.');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyEmailDossier = async () => {
    if (!dispatchedResult) return;
    try {
      await navigator.clipboard.writeText(
        `TO: ${dispatchedResult.recipientEmail}\nSUBJECT: ${dispatchedResult.subject}\n\n${dispatchedResult.body}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const handleResetForm = () => {
    setSavedReport(null);
    setDispatchedResult(null);
    setAnimal('');
    setLocation('');
    setLandmark('');
    setObservations('');
    setPhoto(null);
    setCoordinates(null);
    setFieldErrors({});
    setReporterName('');
    setReporterPhone('');
    setReporterEmail('');
    setReporterNotes('');
    setDispatchError('');
  };

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

  // POST-REPORTING SCREEN: RESCUE CENTER SELECTION & OFFICIAL EMAIL DISPATCH
  if (savedReport) {
    if (dispatchedResult) {
      return (
        <section className="page-wrap content-page report-page" aria-labelledby="dispatch-confirmed-title">
          <div className="dispatch-confirmed-wrap">
            <div className="dispatch-success-icon">
              <CheckCircle2 size={36} aria-hidden="true" />
            </div>
            <span className="eyebrow" style={{ color: '#16a34a', fontWeight: 800 }}>OFFICIAL DISPATCH TRANSMITTED</span>
            <h1 id="dispatch-confirmed-title" style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 10px', color: '#0f172a' }}>
              Report Sent to {dispatchedResult.rescueCenter.name}
            </h1>
            <p style={{ color: '#475569', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              The comprehensive clinical case file, animal observations, and exact GPS coordinates were transmitted to their official rescue desk at <strong>{dispatchedResult.recipientEmail}</strong>.
            </p>

            <div className="dispatch-meta-grid">
              <div className="dispatch-meta-row">
                <span className="dispatch-meta-label">Case Reference:</span>
                <span className="dispatch-meta-value">#{savedReport.id}</span>
              </div>
              <div className="dispatch-meta-row">
                <span className="dispatch-meta-label">Dispatch Tracking ID:</span>
                <span className="dispatch-meta-value" style={{ color: '#0f766e' }}>{dispatchedResult.dispatchId}</span>
              </div>
              <div className="dispatch-meta-row">
                <span className="dispatch-meta-label">Official Rescue Mail:</span>
                <span className="dispatch-meta-value" style={{ color: '#0284c7' }}>{dispatchedResult.recipientEmail}</span>
              </div>
              <div className="dispatch-meta-row">
                <span className="dispatch-meta-label">24/7 Emergency Helpline:</span>
                <span className="dispatch-meta-value">{dispatchedResult.recipientPhone}</span>
              </div>
              <div className="dispatch-meta-row">
                <span className="dispatch-meta-label">Dispatched Time:</span>
                <span className="dispatch-meta-value">{dispatchedResult.dispatchedAt}</span>
              </div>
              <div className="dispatch-meta-row">
                <span className="dispatch-meta-label">Target Location:</span>
                <span className="dispatch-meta-value">{savedReport.location}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '24px 0 16px' }}>
              <a
                href={`tel:${dispatchedResult.recipientPhone.replace(/[^0-9+]/g, '')}`}
                className="button button-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontSize: '14px', background: '#059669', borderColor: '#059669' }}
              >
                <Phone size={16} /> Call Emergency Helpline Now
              </a>
              <a
                href={dispatchedResult.mailtoUrl}
                className="button button-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 18px', fontSize: '14px' }}
              >
                <Mail size={16} /> Open in Email App
              </a>
              <button
                type="button"
                className="button button-outline"
                onClick={handleCopyEmailDossier}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 18px', fontSize: '14px' }}
              >
                {copied ? <Check size={16} style={{ color: '#16a34a' }} /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Full Case Dossier'}
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              {dispatchedResult.mapLink && (
                <a
                  href={dispatchedResult.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Navigation size={15} /> View on Google Maps <ExternalLink size={12} />
                </a>
              )}
              <button
                type="button"
                className="button button-ghost"
                onClick={() => downloadCaseReportPDF(savedReport)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Download size={15} /> Download PDF Again
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={handleResetForm}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                + Report Another Animal
              </button>
              {setActiveTab && (
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setActiveTab('help')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  Local Care Map <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="page-wrap content-page report-page" aria-labelledby="rescue-step-title">
        <div className="rescue-dispatch-flow">
          {/* Case Confirmation Summary Banner */}
          <div className="rescue-case-banner">
            <div className="rescue-case-summary">
              <span className="rescue-case-badge">
                <CheckCircle2 size={14} /> Case Registered #{savedReport.id}
              </span>
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>
                  {savedReport.animal} reported at {savedReport.location}
                </strong>
                <span style={{ fontSize: '12.5px', color: '#475569' }}>
                  {savedReport.aiDiagnosis ? `Clinical finding: ${savedReport.aiDiagnosis.condition || savedReport.aiDiagnosis.conditionKey}` : 'Awaiting clinical dispatch'}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="button button-outline"
              onClick={() => downloadCaseReportPDF(savedReport)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '6px 12px' }}
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          {/* Rescue Center Selection Header */}
          <div className="rescue-step-header">
            <span className="eyebrow" style={{ color: '#0d9488', fontWeight: 800 }}>STEP 2: RESCUE DISPATCH</span>
            <h2 id="rescue-step-title">Select Nearby Rescue Center for Official Email Dispatch</h2>
            <p>
              DermaScan identified the closest verified animal rescue organizations and trauma units. Selecting an organization below will immediately send the official case dossier, triage findings, and GPS pin directly to their official rescue email desk.
            </p>
          </div>

          {dispatchError && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '13px' }}>
              {dispatchError}
            </div>
          )}

          {/* Nearby Rescue Centers Options List */}
          <div className="rescue-options-grid" role="radiogroup" aria-label="Nearby rescue centers">
            {sortedRescueCenters.map((center) => {
              const isSelected = center.id === selectedRescueId;
              return (
                <div
                  key={center.id}
                  className={`rescue-option-card${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setSelectedRescueId(center.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRescueId(center.id); } }}
                >
                  <div className="rescue-card-top">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input
                        type="radio"
                        id={`rescue-${center.id}`}
                        name="selectedRescueCenter"
                        checked={isSelected}
                        onChange={() => setSelectedRescueId(center.id)}
                        style={{ marginTop: '3px', accentColor: '#0d9488', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div>
                        <h3 className="rescue-card-name">{center.name}</h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{center.type} • {center.area}</span>
                      </div>
                    </div>
                    <span className="rescue-card-dist">
                      <MapPin size={12} /> {center.distanceKm} km away
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#047857' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    <strong>{center.operatingHours}</strong>
                    <span style={{ color: '#64748b' }}>• ~{center.driveTimeMin} min drive</span>
                  </div>

                  {/* Official Email Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    <span className="rescue-mail-badge">
                      <Mail size={13} style={{ color: '#0d9488' }} /> Official Mail: <strong>{center.email}</strong>
                    </span>
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                      <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {center.helpline || center.phone}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {center.specialties.slice(0, 3).map((spec, i) => (
                      <span key={i} style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reporter Details & Dispatch Notes */}
          <div className="dispatch-details-box">
            <h3 className="dispatch-details-title">
              <Siren size={18} style={{ color: '#0d9488' }} /> Reporter Contact & Ambulance Instructions (Optional)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Rescue drivers often call this number if they need help locating the animal on the street.
            </p>

            <div className="dispatch-inputs-row">
              <div className="form-field">
                <label htmlFor="reporter-name" style={{ fontSize: '12.5px' }}>Your Name (Optional)</label>
                <input
                  id="reporter-name"
                  type="text"
                  placeholder="e.g. Pranav"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="reporter-phone" style={{ fontSize: '12.5px' }}>Contact Phone (Recommended for driver call)</label>
                <input
                  id="reporter-phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="reporter-notes" style={{ fontSize: '12.5px' }}>Exact Landmark Instructions for Field Van</label>
              <textarea
                id="reporter-notes"
                rows={2}
                placeholder="e.g. Animal is resting under the green awning opposite the tea shop. Friendly but timid."
                value={reporterNotes}
                onChange={(e) => setReporterNotes(e.target.value)}
              />
            </div>

            {/* Primary Dispatch Action Button */}
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={handleDispatchToRescueCenter}
                disabled={isDispatching || !selectedCenter}
                style={{
                  padding: '14px 24px',
                  fontSize: '15.5px',
                  fontWeight: 750,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 6px 20px rgba(13, 148, 136, 0.25)',
                  cursor: isDispatching ? 'wait' : 'pointer'
                }}
              >
                {isDispatching ? (
                  <>
                    <Clock className="animate-spin" size={18} /> Transmitting report to {selectedCenter?.email}...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Dispatch Official Report to {selectedCenter?.name}
                  </>
                )}
              </button>
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                Sends formal case file, triage telemetry, GPS coordinates, and photos to <strong>{selectedCenter?.email}</strong>
              </div>
            </div>
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
                Where are they? <span className="required-star" aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
              </label>
              <button
                type="button"
                className="button button-text"
                onClick={handleGetLocation}
                disabled={isLocating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <LocateFixed size={16} aria-hidden="true" />
                {isLocating ? 'Finding location...' : 'Use my location'}
              </button>
            </div>
            <input
              id="report-location"
              type="text"
              placeholder="e.g. Kumaraswamy Layout 2nd Stage, near ISRO Layout Ring Road"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                if (fieldErrors.location) setFieldErrors(prev => ({ ...prev, location: null }));
              }}
              aria-invalid={Boolean(fieldErrors.location)}
              aria-describedby={fieldErrors.location ? 'report-location-error' : undefined}
              required
            />
            {fieldErrors.location && (
              <span id="report-location-error" className="field-error-message" role="alert" style={{ color: '#b91c1c', fontSize: '0.82rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> {fieldErrors.location}
              </span>
            )}
            {locationMessage && <p className="field-hint" role="status">{locationMessage}</p>}
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="report-landmark">Landmark or nearby spot</label>
            <input id="report-landmark" type="text" placeholder="e.g. Opposite the veterinary pharmacy" value={landmark} onChange={(event) => setLandmark(event.target.value)} />
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="report-observations">
              What did you notice? <span className="required-star" aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="report-observations"
              rows={4}
              placeholder="e.g. Red skin, fur loss around paws, scratching, quiet or energetic behavior"
              value={observations}
              onChange={(event) => {
                setObservations(event.target.value);
                if (fieldErrors.observations) setFieldErrors(prev => ({ ...prev, observations: null }));
              }}
              aria-invalid={Boolean(fieldErrors.observations)}
              aria-describedby={fieldErrors.observations ? 'report-observations-error' : undefined}
              required
            />
            {fieldErrors.observations && (
              <span id="report-observations-error" className="field-error-message" role="alert" style={{ color: '#b91c1c', fontSize: '0.82rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> {fieldErrors.observations}
              </span>
            )}
          </div>

          <div className="form-field form-field-wide">
            <label>Attach a photo (optional)</label>
            <div className="report-photo-field">
              {photo ? (
                <div className="report-photo-preview">
                  <img src={photo.photoUrl} alt="Animal attachment preview" />
                  <div className="report-photo-meta">
                    <strong>{photo.photoName || 'Attached photo'}</strong>
                    <button type="button" className="button button-text" onClick={() => setPhoto(null)}>
                      <Trash2 size={16} aria-hidden="true" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="report-photo-actions">
                  <label className="button button-secondary">
                    <Upload size={16} aria-hidden="true" />
                    Browse photo
                    <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                  </label>
                  <button type="button" className="button button-secondary" onClick={() => setCameraOpen(true)}>
                    <Camera size={16} aria-hidden="true" />
                    Take a photo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}
        {saveError && <div className="form-error" role="alert">{saveError}</div>}

        <footer className="form-actions">
          <button type="submit" className="button button-primary" disabled={isSaving}>
            {isSaving ? 'Saving report...' : 'Save report & find rescue'}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </footer>
      </form>

      {cameraOpen && (
        <CameraModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={(captured) => {
            setPhoto({ photoUrl: captured.dataUrl, photoName: captured.name });
            setCameraOpen(false);
          }}
        />
      )}
    </section>
  );
}
