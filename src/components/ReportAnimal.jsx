import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Camera, 
  FileText, 
  ShieldCheck, 
  Navigation, 
  Send, 
  Copy,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReportAnimal({ onAddCase, setActiveTab, initialScanResult }) {
  // Load draft from localStorage if available
  const [animalType, setAnimalType] = useState(() => {
    if (initialScanResult?.animalType) return initialScanResult.animalType;
    try {
      const draft = localStorage.getItem('dermascan_draft_report');
      return draft ? JSON.parse(draft).animalType || 'Dog' : 'Dog';
    } catch { return 'Dog'; }
  });

  const [reporterName, setReporterName] = useState(() => {
    try {
      const draft = localStorage.getItem('dermascan_draft_report');
      return draft ? JSON.parse(draft).reporterName || '' : '';
    } catch { return ''; }
  });

  const [reporterPhone, setReporterPhone] = useState(() => {
    try {
      const draft = localStorage.getItem('dermascan_draft_report');
      return draft ? JSON.parse(draft).reporterPhone || '' : '';
    } catch { return ''; }
  });

  const [locationName, setLocationName] = useState('Nagarbhavi 2nd Stage, Bengaluru');
  const [landmark, setLandmark] = useState('Near BDA Complex Pillar 142');
  const [coordinates, setCoordinates] = useState({ lat: 12.9724, lng: 77.5098 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [urgency, setUrgency] = useState(initialScanResult?.urgency || 'High');
  const [pvasScore, setPvasScore] = useState(7);
  const [bodyRegion, setBodyRegion] = useState('Pinnae (Ear margins)');
  const [selectedSymptoms, setSelectedSymptoms] = useState(
    initialScanResult ? initialScanResult.indicators : ['Patchy Hair Loss', 'Skin Redness']
  );
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    initialScanResult?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
  );
  const [submittedCase, setSubmittedCase] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync draft to localStorage so user never loses their progress
  useEffect(() => {
    if (!submittedCase) {
      const draft = {
        reporterName,
        reporterPhone,
        animalType,
        locationName,
        landmark,
        urgency,
        pvasScore,
        bodyRegion,
        notes
      };
      localStorage.setItem('dermascan_draft_report', JSON.stringify(draft));
    }
  }, [reporterName, reporterPhone, animalType, locationName, landmark, urgency, pvasScore, bodyRegion, notes, submittedCase]);

  const symptomCategories = [
    {
      name: "Dermatological / Skin",
      items: ['Patchy Hair Loss', 'Skin Redness', 'Skin Crusting', 'Continuous Scratching', 'Flaky Skin']
    },
    {
      name: "Trauma & Wounds",
      items: ['Heavy Bleeding', 'Open Wound', 'Discharge / Pus', 'Severe Swelling']
    },
    {
      name: "Mobility & Critical Distress",
      items: ['Unable to Move', 'High Fever / Shivering', 'Limping', 'Dehydrated / Unresponsive']
    }
  ];

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const calculatePriorityScore = () => {
    let score = 25;
    if (urgency === 'Emergency') score += 45;
    else if (urgency === 'High') score += 30;
    else if (urgency === 'Medium') score += 15;

    if (selectedSymptoms.includes('Heavy Bleeding')) score += 20;
    if (selectedSymptoms.includes('Unable to Move')) score += 20;
    if (selectedSymptoms.includes('Dehydrated / Unresponsive')) score += 15;
    if (selectedSymptoms.includes('Open Wound')) score += 12;
    score += selectedSymptoms.length * 3;

    return Math.min(100, Math.max(15, score));
  };

  const priorityScore = calculatePriorityScore();
  const priorityCategory = priorityScore >= 80 ? 'Emergency' : priorityScore >= 60 ? 'High' : priorityScore >= 40 ? 'Medium' : 'Low';

  const handleGetLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4))
          });
          setLocationName(`Nagarbhavi, Bengaluru (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsDetectingLocation(false);
        },
        () => {
          setCoordinates({ lat: 12.9724, lng: 77.5098 });
          setLocationName('Nagarbhavi 2nd Stage, Bengaluru (12.9724, 77.5098)');
          setIsDetectingLocation(false);
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newCaseId = `DS-2026-${randomNum}`;

    const newCase = {
      id: newCaseId,
      animalType,
      reporterName,
      locationName: `${locationName} ${landmark ? `(${landmark})` : ''}`,
      coordinates,
      reportedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      symptoms: selectedSymptoms,
      urgency,
      priorityScore,
      pvasScore,
      bodyRegion,
      status: 'ngo_pending',
      aiPrediction: initialScanResult ? initialScanResult.prediction : 'Canine Sarcoptic Mange',
      aiConfidence: initialScanResult ? initialScanResult.confidence : 88,
      severity: initialScanResult ? initialScanResult.severity : (urgency === 'Emergency' ? 'Critical' : 'Moderate'),
      assignedNGO: null,
      assignedVolunteer: null,
      veterinaryNotes: null,
      veterinarianConfirmed: false,
      photoUrl,
      timeline: [
        { step: 'Report Created & Geotagged', date: 'Just now', done: true },
        { step: 'AI Preliminary Triage', date: 'Just now', done: true },
        { step: 'NGO Dispatch Broadcast', date: 'Broadcasting to nearby NGOs...', done: false },
        { step: 'Animal Rescued', date: 'Pending', done: false },
        { step: 'Veterinary Examination', date: 'Pending', done: false },
        { step: 'Treatment & Recovery', date: 'Pending', done: false }
      ]
    };

    // Clear saved draft on successful submission
    try {
      localStorage.removeItem('dermascan_draft_report');
    } catch { /* safe */ }

    onAddCase(newCase);
    setSubmittedCase(newCase);

    // Trigger celebratory rescue confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback if confetti context isn't available
    }
  };

  const handleCopyCaseId = () => {
    if (submittedCase) {
      navigator.clipboard?.writeText(submittedCase.id);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '36px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <span className="badge badge-low" style={{ marginBottom: '8px' }}>
          <ShieldCheck size={14} /> FIELD INCIDENT REPORTING SYSTEM
        </span>
        <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', color: 'var(--text-main)', fontWeight: 800 }}>
          Report a Stray Animal in Need
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.975rem', maxWidth: '600px', margin: '0 auto' }}>
          Record GPS coordinates, upload photo proof, and select observed symptoms. DermaScan computes a live triage priority score and immediately alerts verified rescue NGOs in the area.
        </p>
      </div>

      {submittedCase ? (
        /* Confirmation Case Receipt Card */
        <div className="glass-panel" style={{
          padding: '36px 28px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--primary-glow)'
          }}>
            <CheckCircle2 size={36} strokeWidth={2.3} />
          </div>

          <div>
            <span className="badge badge-low" style={{ marginBottom: '8px' }}>
              INCIDENT LOGGED & BROADCAST DISPATCHED
            </span>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>
              CASE ID: <span style={{ color: 'var(--primary)' }}>{submittedCase.id}</span>
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Priority Triage Score: <strong>{submittedCase.priorityScore}/100</strong> • Status: <strong>Broadcasting to Nearby NGOs</strong>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '520px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Animal Species:</span>
              <strong style={{ color: 'var(--text-main)' }}>{submittedCase.animalType}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location:</span>
              <strong style={{ color: 'var(--primary)' }}>{submittedCase.locationName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Preliminary Assessment:</span>
              <strong style={{ color: 'var(--medium)' }}>{submittedCase.aiPrediction} ({submittedCase.aiConfidence}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Response:</span>
              <strong style={{ color: 'var(--primary)' }}>~15-30 mins</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* WhatsApp Direct Field Rescue Broadcast Button */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `🚨 *DERMASCAN FIELD RESCUE INCIDENT REPORT*\n` +
                `───────────────────────────────\n` +
                `Case Tracking ID: ${submittedCase.id}\n` +
                `Species: ${submittedCase.animalType}\n` +
                `Observed Lesion: ${submittedCase.aiPrediction}\n` +
                `Triage Priority: ${submittedCase.urgency} (Score: ${submittedCase.priorityScore}/100)\n` +
                `Itch Severity: PVAS ${pvasScore}/10 (${bodyRegion})\n` +
                `Location: ${submittedCase.locationName}\n` +
                `Google Maps: https://maps.google.com/?q=${submittedCase.coordinates.lat},${submittedCase.coordinates.lng}\n` +
                `Reporter: ${submittedCase.reporterName} (${submittedCase.reporterPhone})\n` +
                `───────────────────────────────\n` +
                `Verified triage broadcast via DermaScan Animal Welfare Network.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d btn-3d-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.925rem',
                background: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MessageCircle size={18} />
              <span>Broadcast to Ambulance (WhatsApp)</span>
            </a>

            <button 
              className="btn-3d btn-3d-primary"
              onClick={() => setActiveTab('cases')}
              style={{ padding: '12px 24px', fontSize: '0.925rem' }}
            >
              <FileText size={18} />
              <span>Track Live Case Timeline</span>
            </button>

            <button 
              className="btn-3d btn-3d-secondary"
              onClick={handleCopyCaseId}
              style={{ padding: '12px 22px', fontSize: '0.925rem' }}
            >
              <Copy size={16} />
              <span>{copiedLink ? 'Copied Case ID!' : 'Copy Case ID'}</span>
            </button>

            <button 
              className="btn-3d btn-3d-secondary"
              onClick={() => setSubmittedCase(null)}
              style={{ padding: '12px 22px', fontSize: '0.925rem' }}
            >
              <span>File Another Incident</span>
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <form 
          onSubmit={handleSubmit} 
          className="glass-panel" 
          style={{ 
            padding: '30px', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Priority Score Dynamic Indicator Header */}
          <div style={{
            background: priorityCategory === 'Emergency' 
              ? 'var(--emergency-bg)' 
              : priorityCategory === 'High' 
                ? 'var(--high-bg)' 
                : 'var(--low-bg)',
            border: priorityCategory === 'Emergency' 
              ? '1px solid var(--emergency-border)' 
              : priorityCategory === 'High' 
                ? '1px solid var(--high-border)' 
                : '1px solid var(--low-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                DYNAMIC TRIAGE PRIORITY METER
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Triage Score: {priorityScore} / 100</span>
                <span className={priorityCategory === 'Emergency' ? 'badge badge-emergency' : priorityCategory === 'High' ? 'badge badge-high' : 'badge badge-medium'}>
                  {priorityCategory} Urgency
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.4 }}>
              Recalculates in real time based on active symptoms, mobility status, and emergency distress level.
            </div>
          </div>

          {/* Section 1: Reporter Contact Details */}
          <div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '14px' }}>
              1. Reporter Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Reporter Full Name:
                </label>
                <input 
                  type="text" 
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Contact Phone (For NGO coordination):
                </label>
                <input 
                  type="text" 
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98450 XXXXX"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Animal Species & Photograph Proof */}
          <div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '14px' }}>
              2. Animal Species & Visual Proof
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Animal Species:
                </label>
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  <option value="Dog">🐕 Canine / Dog</option>
                  <option value="Cat">🐈 Feline / Cat</option>
                  <option value="Cattle">🐄 Bovine / Cattle</option>
                  <option value="Wildlife">🐿️ Wildlife / Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Urgency Level:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Medium', 'High', 'Emergency'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`btn-3d ${
                        urgency === lvl 
                          ? (lvl === 'Emergency' ? 'btn-3d-danger' : lvl === 'High' ? 'btn-3d-primary' : 'btn-3d-primary')
                          : 'btn-3d-secondary'
                      }`}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      {lvl === 'Emergency' ? '🚨 SOS' : lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Anatomical Lesion Site Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Observed Anatomical Lesion Site:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'Pinnae (Ear margins)',
                  'Periocular (Eyes)',
                  'Muzzle / Lips',
                  'Elbows & Hocks',
                  'Ventral Abdomen',
                  'Lumbar Spine / Back',
                  'Paw Pads & Nails',
                  'Generalized Entire Body'
                ].map((site) => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => setBodyRegion(site)}
                    className={`btn-3d ${bodyRegion === site ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: bodyRegion === site ? 700 : 500
                    }}
                  >
                    {site}
                  </button>
                ))}
              </div>
            </div>

            {/* PVAS Pruritus Visual Analog Scale Slider */}
            <div style={{ 
              background: 'var(--bg-card-subtle)', 
              padding: '16px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Pruritus Visual Analog Scale (PVAS 0–10):
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Veterinary clinical index measuring observed scratching, biting, and head-shaking severity
                  </div>
                </div>
                <span className="badge badge-high" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '4px 10px' }}>
                  PVAS: {pvasScore} / 10
                </span>
              </div>

              <input 
                type="range"
                min="0"
                max="10"
                value={pvasScore}
                onChange={(e) => setPvasScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', margin: '8px 0' }}
              />

              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}>
                {pvasScore <= 2 && "🟢 PVAS 0–2: Normal / Mild Grooming (Occasional scratch, skin intact)"}
                {pvasScore >= 3 && pvasScore <= 5 && "🟡 PVAS 3–5: Moderate Itching (Frequent scratching, pinnal head-shaking, mild redness)"}
                {pvasScore >= 6 && pvasScore <= 8 && "🟠 PVAS 6–8: Severe Excoriation (Constant scratching, bleeding crusts, active alopecia)"}
                {pvasScore >= 9 && "🔴 PVAS 9–10: Critical Distress / Self-Mutilation (Incessant biting, vocalizing in pain, emergency triage)"}
              </div>
            </div>

            {/* Attached Photo Card */}
            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <img 
                src={photoUrl} 
                alt="Incident Subject" 
                style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--primary)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                  Attached Photograph Preview
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  A clear photo speeds up veterinary verification by up to 60%.
                </div>
                <label 
                  className="btn-3d btn-3d-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={15} color="var(--primary)" />
                  <span>Upload / Replace Photograph</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setPhotoUrl(ev.target.result);
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Geolocation */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                3. Incident Location & GPS
              </h2>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isDetectingLocation}
                className="btn-3d btn-3d-secondary"
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.785rem'
                }}
              >
                <Navigation size={14} color="var(--primary)" />
                <span>{isDetectingLocation ? 'Acquiring GPS...' : 'Auto-Detect Current GPS'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Area / Street Address:
                </label>
                <input 
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Near Nagarbhavi BDA Complex, Bengaluru"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nearby Landmark / Spotting Clue:
                </label>
                <input 
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Under tea stall shed, opposite bakery"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Observed Symptoms Multi-Select */}
          <div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '6px' }}>
              4. Observed Clinical Signs & Symptoms
            </h2>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Select all visible indicators. Each symptom helps NGOs prepare appropriate medical supplies (e.g. antiseptic wraps, ivermectin).
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {symptomCategories.map((cat, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {cat.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {cat.items.map((sym) => {
                      const isSelected = selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => toggleSymptom(sym)}
                          className={`btn-3d ${isSelected ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 700 : 500
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '} {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Additional Observations */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Additional Observations / Temperament Notes:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stray dog is frightened and sheltering behind the electrical transformer; seems docile, no aggression observed."
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Submit Action Strip */}
          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Case will be broadcast to 4 verified rescue teams in radius.
            </div>

            <button 
              type="submit" 
              className={`btn-3d ${urgency === 'Emergency' ? 'btn-3d-danger' : 'btn-3d-primary'}`}
              style={{ padding: '14px 30px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}
            >
              <Send size={18} />
              <span>Submit Incident & Dispatch Alert</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
