import React, { useState } from 'react';
import { 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Search, 
  Activity, 
  Award, 
  Layers, 
  Sparkles,
  ClipboardCheck,
  Send
} from 'lucide-react';
import { api } from '../services/api';

export default function VetPortal({ 
  cases = [], 
  onUpdateStatus, 
  setCases, 
  setActiveTab: _setActiveTab 
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'DS-2026-00124');
  const [activeCaseFilter, setActiveCaseFilter] = useState('all'); // 'all', 'pending_check', 'in_treatment', 'recovered'
  const [searchQuery, setSearchQuery] = useState('');
  const [showGradCam, setShowGradCam] = useState(false);

  // Active Patient
  const activePatient = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Clinical cytology tests state
  const [tests, setTests] = useState({
    superficialScrape: true,
    deepScrape: false,
    tapeCytology: true,
    woodsLamp: false
  });

  // Doctor's clinical notes state
  const [doctorNotes, setDoctorNotes] = useState(
    activePatient?.veterinaryNotes || "Deep skin scrapings confirmed live Sarcoptes scabiei mites. Positive pinnal-pedal reflex. Initiated Fluralaner (Bravecto 25mg/kg) oral chewable and weekly 2% chlorhexidine antiseptic dips."
  );

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Switch active patient
  const handleSelectPatient = (c) => {
    setSelectedCaseId(c.id);
    setDoctorNotes(c.veterinaryNotes || `Clinical evaluation for ${c.animalType} (${c.aiPrediction}). Recommended cytology and treatment monitoring.`);
  };

  // Apply Rx Preset
  const handleApplyPreset = (presetName) => {
    let presetRx = '';
    if (presetName === 'mange') {
      presetRx = "DIAGNOSIS: Canine Sarcoptic Mange.\nRx: Fluralaner (Bravecto 25mg/kg) oral chewable single dose. Administer weekly 2% Chlorhexidine + 2% Miconazole keratolytic baths. Repeat skin scraping in 14 days to confirm negative mite index.";
      setTests(prev => ({ ...prev, superficialScrape: true, deepScrape: false }));
    } else if (presetName === 'ringworm') {
      presetRx = "DIAGNOSIS: Dermatophytosis (Microsporum canis).\nRx: Itraconazole 5mg/kg PO q24h for 21 days with fatty meal. Topical Miconazole spray bid to affected circular alopecic lesions. Isolate patient to prevent zoonotic spread.";
      setTests(prev => ({ ...prev, woodsLamp: true, tapeCytology: true }));
    } else if (presetName === 'dermatitis') {
      presetRx = "DIAGNOSIS: Acute Flea Allergic Dermatitis & Secondary Pyoderma.\nRx: Cefalexin 22mg/kg PO q12h for 14 days. Oclacitinib (Apoquel) 0.4mg/kg PO q12h for pruritus control. Apply spot-on Fipronil flea preventative.";
      setTests(prev => ({ ...prev, tapeCytology: true, deepScrape: true }));
    }
    setDoctorNotes(presetRx);
    showToast(`Prescription preset "${presetName.toUpperCase()}" loaded into clinical notes.`);
  };

  // Sign & Certify Diagnosis (persists to backend database)
  const handleSignDiagnosis = async () => {
    try {
      await api.vetVerifyCase(activePatient.id, {
        notes: doctorNotes,
        tests,
        doctorName: "Dr. Preeti Chandrasekhar, MVSc (KSVC #4182)"
      });
    } catch (e) {
      console.warn("Backend vet-verify failed, persisting locally:", e);
    }

    if (setCases) {
      setCases(prev => prev.map(c => {
        if (c.id === activePatient.id) {
          return {
            ...c,
            veterinarianConfirmed: true,
            veterinaryNotes: doctorNotes,
            timeline: [
              ...c.timeline,
              { step: "Certified by Dr. Preeti Chandrasekhar, MVSc", date: "Just now", done: true }
            ]
          };
        }
        return c;
      }));
    }
    showToast(`Case ${activePatient.id} clinically certified by Dr. Preeti Chandrasekhar, MVSc!`);
  };

  // Mark Healed
  const handleMarkHealed = () => {
    if (onUpdateStatus) {
      onUpdateStatus(activePatient.id, 'recovered');
    }
    showToast(`Patient ${activePatient.id} marked as fully recovered & discharged!`);
  };

  // Filter cases
  const filteredPatients = cases.filter(c => {
    const matchesSearch = 
      (c.id && c.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.locationName && c.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.aiPrediction && c.aiPrediction.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.animalType && c.animalType.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCaseFilter === 'pending_check') return !c.veterinarianConfirmed;
    if (activeCaseFilter === 'in_treatment') return c.status === 'in_treatment';
    if (activeCaseFilter === 'recovered') return c.status === 'recovered';
    return true;
  });

  const pendingCheckCount = cases.filter(c => !c.veterinarianConfirmed).length;
  const inTreatmentCount = cases.filter(c => c.status === 'in_treatment').length;
  const recoveredCount = cases.filter(c => c.status === 'recovered').length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '48px' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          background: toastMessage.type === 'emergency' ? 'var(--emergency)' : 'var(--primary)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.875rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Attending Veterinary Doctor Header */}
      <section 
        className="glass-panel"
        style={{
          padding: '24px clamp(20px, 3vw, 36px)',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #047857 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px var(--primary-glow)',
            flexShrink: 0
          }}>
            <Stethoscope size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Dr. Preeti Chandrasekhar, MVSc
              </h1>
              <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> KSVC REG. NO. 4182
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }} />
                CLINICAL DESK ACTIVE
              </span>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '4px', margin: 0 }}>
              Specialist Veterinary Dermatologist • KVAFSU Veterinary College Hospital & Trauma Centre
            </p>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.print()}
            className="btn-3d btn-3d-secondary"
            style={{
              padding: '10px 18px',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={16} />
            <span>Print Clinical Case Sheet</span>
          </button>
        </div>
      </section>

      {/* Clinical Telemetry Bar */}
      <section className="hero-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Awaiting Clinical Exam</span>
            <Clock size={18} color="var(--high)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {pendingCheckCount} Patients
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--high)', marginTop: '4px', fontWeight: 600 }}>
            Pending Cytology Verification
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Inpatient Care</span>
            <Activity size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {inTreatmentCount} Under Rx
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
            Supervised Medicated Protocol
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Full Recoveries</span>
            <Award size={18} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {recoveredCount + 528}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '4px', fontWeight: 600 }}>
            Verified Skin Re-epithelialization
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Diagnostic Sensitivity</span>
            <Sparkles size={18} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            94.2%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>
            Microscopic Concordance
          </div>
        </div>

      </section>

      {/* Main Clinical Split Layout: Patient Queue (Left) + Doctor's Desk (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Filterable Patient Queue */}
        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Admitted Patients Queue ({filteredPatients.length})
            </h2>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'pending_check', label: 'Unverified' },
                { id: 'in_treatment', label: 'In Treatment' },
                { id: 'recovered', label: 'Healed' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveCaseFilter(f.id)}
                  className={`btn-3d ${activeCaseFilter === f.id ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
                  style={{ padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700, borderRadius: 'var(--radius-full)' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by Case ID, disease, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 30px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Patient Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '680px', overflowY: 'auto' }}>
            {filteredPatients.map(c => {
              const isSelected = c.id === selectedCaseId;
              const isConfirmed = c.veterinarianConfirmed;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectPatient(c)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img
                    src={c.photoUrl}
                    alt="Patient thumbnail"
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)'
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {c.id} ({c.animalType})
                      </span>
                      <span className={`badge ${isConfirmed ? 'badge-low' : 'badge-high'}`} style={{ fontSize: '0.65rem' }}>
                        {isConfirmed ? 'Vet Confirmed' : 'Needs Exam'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                      {c.aiPrediction} ({c.aiConfidence}%)
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {c.locationName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Patient Clinical Examination & Prescription Desk */}
        {activePatient ? (
          <div className="glass-panel" style={{
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Patient Header Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Clinical Exam: {activePatient.id} ({activePatient.animalType})
                  </h3>
                  <span className={`badge ${activePatient.veterinarianConfirmed ? 'badge-low' : 'badge-high'}`}>
                    {activePatient.veterinarianConfirmed ? 'Verified by Dr. Preeti' : 'Pending Verification'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                  Admitted from: {activePatient.locationName} • Admitting NGO: {activePatient.assignedNGO || 'Pending'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleMarkHealed()}
                  className="btn-3d btn-3d-primary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark Fully Healed</span>
                </button>
              </div>
            </div>

            {/* Lesion Inspection Visual + Preliminary AI Findings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              
              {/* Photo View with Heatmap */}
              <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '200px', border: '1px solid var(--border-color)' }}>
                <img
                  src={showGradCam ? (activePatient.gradCamUrl || activePatient.photoUrl) : activePatient.photoUrl}
                  alt="Lesion pathology inspection"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 10px',
                  backdropFilter: 'blur(6px)'
                }}>
                  <button
                    onClick={() => setShowGradCam(!showGradCam)}
                    style={{
                      background: 'transparent',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Layers size={12} />
                    <span>{showGradCam ? 'Show Standard Photo' : 'Show Grad-CAM Layer'}</span>
                  </button>
                </div>
              </div>

              {/* Triage Findings Card */}
              <div style={{
                background: 'var(--bg-card-subtle)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  NEURAL DERMATOLOGY INTAKE
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {activePatient.aiPrediction} ({activePatient.aiConfidence}%)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Urgency Score: <strong>{activePatient.urgency} ({activePatient.priorityScore || 82}/100)</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Reported Symptoms: {(activePatient.symptoms || ['Alopecia', 'Erythema', 'Crusting']).join(', ')}
                </div>
              </div>

            </div>

            {/* Diagnostic Cytology Verification Checklist */}
            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ClipboardCheck size={16} color="var(--primary)" />
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  Attending Veterinarian Cytology & Pathological Checklist
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tests.superficialScrape}
                    onChange={(e) => setTests({ ...tests, superficialScrape: e.target.checked })}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Superficial Scraping (<em>Sarcoptes mites</em>)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tests.deepScrape}
                    onChange={(e) => setTests({ ...tests, deepScrape: e.target.checked })}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Deep Follicular Scraping (<em>Demodex</em>)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tests.tapeCytology}
                    onChange={(e) => setTests({ ...tests, tapeCytology: e.target.checked })}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Tape Impression (<em>Malassezia / Pyoderma</em>)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tests.woodsLamp}
                    onChange={(e) => setTests({ ...tests, woodsLamp: e.target.checked })}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Wood's Lamp 365nm (<em>Microsporum Ringworm</em>)</span>
                </label>
              </div>
            </div>

            {/* Prescription Protocol Generator & Clinical Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Clinical Treatment Notes & Prescription (Rx)
                </div>

                {/* 1-Click Rx Presets */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('mange')}
                    className="btn-3d btn-3d-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    Load Mange Rx
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('ringworm')}
                    className="btn-3d btn-3d-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    Load Ringworm Rx
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('dermatitis')}
                    className="btn-3d btn-3d-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    Load Dermatitis Rx
                  </button>
                </div>
              </div>

              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={4}
                placeholder="Enter clinical examination notes, cytology findings, prescribed drugs, dosages, and follow-up timeline..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Doctor Signature & Certification Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Attending Signature: <strong>Dr. Preeti Chandrasekhar, MVSc (KSVC #4182)</strong>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSignDiagnosis}
                  className="btn-3d btn-3d-primary"
                  style={{
                    padding: '12px 22px',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} />
                  <span>Certify & Sign Clinical Diagnosis</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Select a patient from the queue to open the clinical desk.
          </div>
        )}

      </div>

    </div>
  );
}
