import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Heart,
  Search,
  FileCheck,
  Stethoscope,
  Printer
} from 'lucide-react';

export default function CasesTracker({ cases = [], currentRole, onUpdateStatus }) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0] || null;

  const filteredCases = cases.filter(c => {
    const matchesFilter = 
      filterStatus === 'All' ? true :
      filterStatus === 'Active' ? c.status !== 'recovered' :
      filterStatus === 'Recovered' ? c.status === 'recovered' :
      filterStatus === 'Emergency' ? c.urgency === 'Emergency' : true;

    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.aiPrediction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.animalType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '36px' }}>
      
      {/* Page Header */}
      <div>
        <span className="badge badge-low" style={{ marginBottom: '6px' }}>
          <FileCheck size={13} /> CLINICAL CASE MANAGEMENT & RECOVERY TIMELINES
        </span>
        <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', color: 'var(--text-main)', fontWeight: 800 }}>
          Rescue Case Hub & Treatment Tracker
        </h1>
        <div style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>
          Transparent audit trails from citizen discovery and neural screening to full veterinary recovery.
        </div>
      </div>

      {/* Grid Layout: Master Case List (Left) + Detail Inspector (Right) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '22px', 
        alignItems: 'start' 
      }}>
        
        {/* Left Column: Filterable Case Selector */}
        <div className="glass-panel" style={{ 
          padding: '18px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '14px',
          borderRadius: 'var(--radius-md)'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800 }}>
              Tracked Cases ({filteredCases.length})
            </h2>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['All', 'Active', 'Emergency', 'Recovered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`btn-3d ${filterStatus === st ? (st === 'Emergency' ? 'btn-3d-danger' : 'btn-3d-primary') : 'btn-3d-ghost'}`}
                  style={{
                    padding: '5px 11px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.725rem',
                    fontWeight: 700
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search by ID, disease, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.825rem'
              }}
            />
          </div>

          {/* Case Items List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            maxHeight: '560px', 
            overflowY: 'auto', 
            paddingRight: '4px' 
          }}>
            {filteredCases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No cases matched your search filter.
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = c.id === activeCase?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className="interactive-card"
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <img 
                      src={c.photoUrl} 
                      alt={c.animalType}
                      style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />

                    <div style={{ overflow: 'hidden', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{c.id}</span>
                        <span 
                          className={
                            c.status === 'recovered' 
                              ? 'badge badge-resolved' 
                              : c.urgency === 'Emergency' 
                                ? 'badge badge-emergency' 
                                : 'badge badge-high'
                          } 
                          style={{ fontSize: '0.65rem', padding: '2px 7px' }}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 700, 
                        color: 'var(--text-main)', 
                        textOverflow: 'ellipsis', 
                        overflow: 'hidden', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {c.aiPrediction}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📍 {c.locationName}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Case Deep Inspector */}
        {activeCase ? (
          <div className="glass-panel" style={{ 
            padding: '26px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '22px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}>
            
            {/* Header Strip */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              flexWrap: 'wrap', 
              gap: '14px', 
              borderBottom: '1px solid var(--border-color)', 
              paddingBottom: '16px' 
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.65rem', color: 'var(--text-main)', fontWeight: 800 }}>
                    CASE #{activeCase.id}
                  </h2>
                  <span className={activeCase.urgency === 'Emergency' ? 'badge badge-emergency' : 'badge badge-high'}>
                    {activeCase.urgency} Urgency
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Reported by <strong>{activeCase.reporterName}</strong> • {activeCase.reportedAt}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Print Official Clinical Sheet Button */}
                <button
                  className="btn-3d btn-3d-secondary"
                  onClick={() => window.print()}
                  title="Print or Save as PDF Clinical Case Sheet"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.825rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={15} color="var(--primary)" />
                  <span>Print Case Sheet</span>
                </button>

                {/* Status Update Controls */}
                {(currentRole === 'ngo' || currentRole === 'vet' || currentRole === 'admin') && (
                  <>
                    {activeCase.status !== 'in_treatment' && activeCase.status !== 'recovered' && (
                      <button
                        className="btn-3d btn-3d-secondary"
                        onClick={() => onUpdateStatus(activeCase.id, 'in_treatment')}
                        style={{ padding: '8px 16px', fontSize: '0.825rem' }}
                      >
                        <Stethoscope size={15} color="var(--primary)" />
                        <span>Move to Treatment</span>
                      </button>
                    )}
                    {activeCase.status !== 'recovered' && (
                      <button
                        className="btn-3d btn-3d-primary"
                        onClick={() => onUpdateStatus(activeCase.id, 'recovered')}
                        style={{ padding: '8px 18px', fontSize: '0.825rem' }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Mark Fully Recovered</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Assessment and Assigned Organization Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              
              <div style={{ 
                background: 'var(--bg-card-subtle)', 
                padding: '16px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border-color)' 
              }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  PRELIMINARY NEURAL DIAGNOSIS
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                  {activeCase.aiPrediction}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                  Confidence: {activeCase.aiConfidence}% • Severity: {activeCase.severity}
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-card-subtle)', 
                padding: '16px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border-color)' 
              }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  DISPATCHED RESCUE TEAM
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                  {activeCase.assignedNGO || 'Pending NGO Pickup'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Assigned: {activeCase.assignedVolunteer || 'Broadcast in Progress'}
                </div>
              </div>

            </div>

            {/* 6-Stage Rescue & Clinical Timeline */}
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '16px' }}>
                Incident Audit Trail & Timeline
              </h3>

              <div style={{ 
                position: 'relative', 
                paddingLeft: '22px', 
                borderLeft: '2px solid var(--border-color)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '18px' 
              }}>
                {activeCase.timeline.map((t, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    
                    <div style={{
                      position: 'absolute',
                      left: '-28px',
                      top: '3px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: t.done ? 'var(--primary)' : 'var(--border-color)',
                      border: '2px solid var(--bg-card)',
                      boxShadow: t.done ? '0 0 6px var(--primary-glow)' : 'none'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: t.done ? 700 : 500, fontSize: '0.875rem', color: t.done ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {t.step}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: t.done ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {t.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Before / After Recovery Spotlight */}
            {activeCase.afterPhotoUrl && (
              <div style={{
                background: 'var(--primary-light)',
                border: '1px solid var(--low-border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}>
                <h4 style={{ 
                  fontSize: '0.95rem', 
                  color: 'var(--text-main)', 
                  fontWeight: 800, 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <Heart size={16} color="var(--primary)" fill="var(--primary)" />
                  RECOVERY TRANSFORMATION RESULT
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <img src={activeCase.photoUrl} alt="Before Treatment" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'var(--emergency)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      DAY 1: INCIDENT
                    </div>
                  </div>

                  <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <img src={activeCase.afterPhotoUrl} alt="After Treatment" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      DAY 28: RECOVERED
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Veterinary Clinical Records */}
            <div style={{ 
              background: 'var(--bg-card-subtle)', 
              padding: '16px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-color)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700 }}>
                  VETERINARY CLINICAL LOG (REF: MED-{activeCase.id.slice(-5)})
                </h4>
                <span className={activeCase.veterinarianConfirmed ? 'badge badge-low' : 'badge badge-medium'} style={{ fontSize: '0.65rem' }}>
                  {activeCase.veterinarianConfirmed ? 'Vet Confirmed' : 'Pending Vet Check'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                Species: <strong>{activeCase.animalType}</strong> • Location: <strong>{activeCase.locationName}</strong>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                Notes: "{activeCase.veterinaryNotes || 'Awaiting initial physical exam notes from attending veterinarian.'}"
              </div>
            </div>

            {/* Official Printable Clinical Case Sheet (Visible in print preview / PDF download) */}
            <div className="printable-case-sheet">
              <div style={{ borderBottom: '3px solid #059669', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '20px', color: '#059669', fontWeight: 800 }}>
                    DERMASCAN CLINICAL VETERINARY TRIAGE SHEET
                  </h1>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    AWBI Partner Rescue Network • Automated Dermatological Pathology Intake
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>CASE ID: {activeCase.id}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Reported: {activeCase.reportedAt}</div>
                </div>
              </div>

              {/* Triage & Patient Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '14px 0', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px' }}>
                <div><strong>Patient Species:</strong> {activeCase.animalType}</div>
                <div><strong>Location:</strong> {activeCase.locationName}</div>
                <div><strong>Priority Score:</strong> {activeCase.urgency} ({activeCase.priorityScore}/100)</div>
                <div><strong>Primary Diagnosis:</strong> {activeCase.aiPrediction} ({activeCase.aiConfidence}%)</div>
                <div><strong>Pruritus Index:</strong> PVAS {activeCase.pvasScore || 7}/10</div>
                <div><strong>Admitting NGO:</strong> {activeCase.assignedNGO || 'CUPA Bengaluru Central Inpatient'}</div>
              </div>

              {/* Mandatory Diagnostic Cytology Recommendations */}
              <div style={{ margin: '14px 0', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>
                  Attending Veterinarian Cytology & Diagnostic Checklist:
                </h3>
                <div style={{ fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#334155' }}>
                  <div>[ ] Superficial Mineral Oil Skin Scraping (*Sarcoptes scabiei*)</div>
                  <div>[ ] Deep Follicular Skin Scraping (*Demodex canis*)</div>
                  <div>[ ] Acetate Tape Impression Cytology (Malassezia yeast / bacterial pyoderma)</div>
                  <div>[ ] Wood's Lamp (365nm UV) Fluorescence & DTM Fungal Inoculation</div>
                </div>
              </div>

              {/* Rx Summary & Attending Vet Sign-off */}
              <div style={{ margin: '14px 0', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>
                  Clinical Treatment Notes & Prescription:
                </h3>
                <p style={{ fontSize: '11px', color: '#334155', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                  {activeCase.veterinaryNotes || 'Recommended protocol: Fluralaner / Sarolaner single dose + twice-weekly 2% Chlorhexidine keratolytic baths. Re-scrape in 14 days.'}
                </p>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                  <div>Attending Veterinarian Signature: _______________________________</div>
                  <div>Admitting Hospital Seal: _______________________________</div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Select a case on the left to inspect its timeline.
          </div>
        )}

      </div>

    </div>
  );
}
