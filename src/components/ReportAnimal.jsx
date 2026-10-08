import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Camera, 
  FileText, 
  ShieldCheck, 
  Navigation,
  Send,
  Mic,
  Share2,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';
import CameraCaptureModal from './CameraCaptureModal';

export default function ReportAnimal({ onAddCase, setActiveTab, initialScanResult }) {
  const [animalType, setAnimalType] = useState(initialScanResult?.animalType || 'Dog');
  const [reporterName, setReporterName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 12.9724, lng: 77.5098 });
  const [urgency, setUrgency] = useState('High');
  const [selectedSymptoms, setSelectedSymptoms] = useState(
    initialScanResult ? initialScanResult.indicators : ['Hair Loss', 'Skin Redness']
  );
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    initialScanResult?.photoUrl || '/samples/dog_mange.jpg'
  );
  const [submittedCase, setSubmittedCase] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please type observations manually.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const getWhatsAppShareUrl = (c) => {
    const text = encodeURIComponent(
      `*DERMASCAN RESCUE REPORT*\n*Case ID:* ${c.id}\n*Animal:* ${c.animalType}\n*Priority:* ${c.priorityScore}/100 (${c.urgency})\n*Assessment:* ${c.aiPrediction} (${c.aiConfidence}%)\n*Location:* ${c.locationName}\n*Symptoms:* ${c.symptoms.join(', ')}\n\nDispatch coordinates: Lat ${c.coordinates.lat}, Lng ${c.coordinates.lng}`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  const availableSymptoms = [
    'Hair Loss',
    'Skin Redness',
    'Open Wound',
    'Swelling',
    'Continuous Scratching',
    'Heavy Bleeding',
    'Unable to Move',
    'Skin Crusting',
    'Discharge / Pus',
    'High Scab Density'
  ];

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const calculatePriorityScore = () => {
    let score = 30;
    if (urgency === 'Emergency') score += 40;
    else if (urgency === 'High') score += 25;
    else if (urgency === 'Medium') score += 15;

    if (selectedSymptoms.includes('Heavy Bleeding')) score += 20;
    if (selectedSymptoms.includes('Unable to Move')) score += 20;
    if (selectedSymptoms.includes('Open Wound')) score += 15;
    score += selectedSymptoms.length * 4;

    return Math.min(100, Math.max(10, score));
  };

  const priorityScore = calculatePriorityScore();
  const priorityCategory = priorityScore >= 80 ? 'Emergency' : priorityScore >= 60 ? 'High' : priorityScore >= 40 ? 'Medium' : 'Low';

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4))
          });
          setLocationName(`Nagarbhavi, Bengaluru (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          setCoordinates({ lat: 12.9724, lng: 77.5098 });
          setLocationName('Nagarbhavi 2nd Stage, Bengaluru (12.9724, 77.5098)');
        }
      );
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
      locationName,
      coordinates,
      reportedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      symptoms: selectedSymptoms,
      urgency,
      priorityScore,
      status: 'ngo_pending',
      aiPrediction: initialScanResult ? initialScanResult.prediction : 'Canine Mange',
      aiConfidence: initialScanResult ? initialScanResult.confidence : 87,
      severity: initialScanResult ? initialScanResult.severity : (urgency === 'Emergency' ? 'Critical' : 'Moderate'),
      assignedNGO: null,
      assignedVolunteer: null,
      veterinaryNotes: null,
      veterinarianConfirmed: false,
      photoUrl,
      timeline: [
        { step: 'Report Created', date: 'Just Now', done: true },
        { step: 'AI Screened', date: 'Just Now', done: true },
        { step: 'NGO Dispatch Pending', date: 'Waiting for acceptance...', done: false },
        { step: 'Animal Rescued', date: 'Pending', done: false },
        { step: 'Veterinary Check', date: 'Pending', done: false },
        { step: 'Treatment & Recovery', date: 'Pending', done: false }
      ]
    };

    onAddCase(newCase);
    setSubmittedCase(newCase);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span className="badge badge-low" style={{ marginBottom: '6px' }}>
          <ShieldCheck size={14} /> GPS RESCUE DISPATCH
        </span>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: 800 }}>
          Report a Stray Animal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto' }}>
          Submit location and symptom details to generate a tracked case ID and alert local rescue NGOs immediately.
        </p>
      </div>

      {submittedCase ? (
        <div className="glass-panel" style={{
          padding: '30px',
          borderRadius: '18px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={32} />
          </div>

          <div>
            <span className="badge badge-low" style={{ marginBottom: '4px' }}>REPORT SUCCESSFULLY GENERATED</span>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800 }}>
              CASE ID: <span style={{ color: 'var(--primary)' }}>{submittedCase.id}</span>
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Priority Score: <strong>{submittedCase.priorityScore}/100</strong> • Status: <strong>NGO Acceptance Pending</strong>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Animal Type:</span>
              <strong style={{ color: 'var(--text-main)' }}>{submittedCase.animalType}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location:</span>
              <strong style={{ color: 'var(--primary)' }}>{submittedCase.locationName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Preliminary Assessment:</span>
              <strong style={{ color: 'var(--medium)' }}>{submittedCase.aiPrediction} ({submittedCase.aiConfidence}%)</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-main)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '460px' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(submittedCase.id)}`} 
              alt="Case QR Code" 
              style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid var(--border-color)', flexShrink: 0 }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <QrCode size={15} color="var(--primary)" /> Case Access QR Pass
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Field rescuers can scan this QR code on any mobile device to open case dispatch details directly.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a 
              href={getWhatsAppShareUrl(submittedCase)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.875rem', background: '#25D366', color: '#ffffff', textDecoration: 'none' }}
            >
              <Share2 size={16} />
              <span>Share to Local NGO WhatsApp</span>
            </a>

            <button 
              className="btn-primary"
              onClick={() => setActiveTab('cases')}
              style={{ padding: '10px 20px', fontSize: '0.875rem' }}
            >
              <FileText size={16} />
              <span>Track Case Timeline</span>
            </button>

            <button 
              className="btn-secondary"
              onClick={() => setSubmittedCase(null)}
              style={{ padding: '10px 20px', fontSize: '0.875rem' }}
            >
              <span>Submit Another Report</span>
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            background: priorityCategory === 'Emergency' ? 'var(--emergency-bg)' : priorityCategory === 'High' ? 'var(--high-bg)' : 'var(--low-bg)',
            border: priorityCategory === 'Emergency' ? '1px solid rgba(220, 38, 38, 0.3)' : priorityCategory === 'High' ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid rgba(5, 150, 105, 0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                PRIORITY SCORE CALCULATION
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Score: {priorityScore} / 100</span>
                <span className={priorityCategory === 'Emergency' ? 'badge badge-emergency' : priorityCategory === 'High' ? 'badge badge-high' : 'badge badge-medium'}>
                  {priorityCategory} Priority
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
              Calculated automatically based on symptoms and urgency rating.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Your Name / Contact:
              </label>
              <input 
                type="text" 
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Your Name / Contact number"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Animal Species:
              </label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Cattle">Cattle / Cow</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <img 
              src={photoUrl} 
              alt="Report Preview" 
              style={{ width: '76px', height: '76px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                  Attached Animal Photograph
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Take a new live photo or select an existing photo from gallery
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} />
                  <span>Take Live Photo (Camera)</span>
                </button>

                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}>
                  <ImageIcon size={14} color="var(--secondary)" />
                  <span>Choose from Gallery</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setPhotoUrl(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Incident Geolocation:
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <Navigation size={13} />
                <span>Auto-Detect GPS Location</span>
              </button>
            </div>

            <input 
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Near Nagarbhavi 2nd Stage Bus Stop, Bengaluru"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              Coordinates: Lat {coordinates.lat}, Lng {coordinates.lng}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Visible Physical Symptoms:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px' }}>
              {availableSymptoms.map((sym) => {
                const checked = selectedSymptoms.includes(sym);
                return (
                  <div
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: checked ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: checked ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      color: checked ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      border: checked ? 'none' : '1px solid var(--border-color)',
                      background: checked ? 'var(--primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      {checked && <CheckCircle2 size={10} />}
                    </div>
                    <span>{sym}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Urgency Level:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              {[
                { id: 'Low', label: 'Low', desc: 'Mild symptoms' },
                { id: 'Medium', label: 'Medium', desc: 'Active skin lesion' },
                { id: 'High', label: 'High', desc: 'Extensive scabs' },
                { id: 'Emergency', label: 'Emergency', desc: 'Bleeding / Injured' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setUrgency(item.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: urgency === item.id 
                      ? item.id === 'Emergency' ? 'var(--emergency-bg)' : 'var(--primary-light)' 
                      : 'var(--bg-main)',
                    border: urgency === item.id 
                      ? item.id === 'Emergency' ? '1px solid var(--emergency)' : '1px solid var(--primary)' 
                      : '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Additional Landmark / Observations:
              </label>
              <button
                type="button"
                onClick={startVoiceDictation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: isListening ? 'var(--emergency-bg)' : 'var(--primary-light)',
                  color: isListening ? 'var(--emergency)' : 'var(--primary)',
                  border: isListening ? '1px solid var(--emergency)' : '1px solid rgba(5, 150, 105, 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <Mic size={13} className={isListening ? 'animate-beacon' : ''} />
                <span>{isListening ? 'Listening Voice Note...' : 'Hands-Free Voice Reporter'}</span>
              </button>
            </div>

            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type observations or click 'Hands-Free Voice Reporter' to dictate..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <button 
            type="submit"
            className={urgency === 'Emergency' ? 'btn-danger' : 'btn-primary'}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '0.975rem', marginTop: '6px' }}
          >
            <Send size={18} />
            <span>Submit Rescue Case Report</span>
          </button>

        </form>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => setPhotoUrl(img)}
      />

    </div>
  );
}

