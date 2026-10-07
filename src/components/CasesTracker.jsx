import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Heart,
  Share2
} from 'lucide-react';
import ImageSlider from './ImageSlider';
import PrescriptionCard from './PrescriptionCard';

export default function CasesTracker({ cases, currentRole, onUpdateStatus }) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'DS-2026-00124');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showPrescription, setShowPrescription] = useState(false);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const filteredCases = cases.filter(c => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') return c.status !== 'recovered';
    if (filterStatus === 'Recovered') return c.status === 'recovered';
    return true;
  });

  const getWhatsAppShareUrl = (c) => {
    const text = encodeURIComponent(
      `*DERMASCAN CASE UPDATE*\n*Case ID:* ${c.id}\n*Animal:* ${c.animalType}\n*Status:* ${c.status.replace('_', ' ').toUpperCase()}\n*Assessment:* ${c.aiPrediction} (${c.aiConfidence}%)\n*Location:* ${c.locationName}`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge badge-low" style={{ marginBottom: '4px' }}>RESCUE TRACKING & CLINICAL LOGS ({currentRole.toUpperCase()})</span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Case Timeline & Recovery Hub
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Audit log from initial assessment to full veterinary recovery
          </div>
        </div>

        <button
          onClick={() => setShowPrescription(!showPrescription)}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <span>{showPrescription ? '📋 View Audit Timeline' : '🩺 Treatment & Dosage Calculator'}</span>
        </button>
      </div>

      {showPrescription && (
        <PrescriptionCard selectedCase={activeCase} />
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        
        {/* Left Column: Cases Selection Sidebar */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.975rem', color: 'var(--text-main)', fontWeight: 700 }}>
              Cases Logged ({cases.length})
            </h3>

            <div style={{ display: 'flex', gap: '3px' }}>
              {['All', 'Active', 'Recovered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    background: filterStatus === st ? 'var(--primary)' : 'var(--bg-main)',
                    color: filterStatus === st ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto', paddingRight: '2px' }}>
            {filteredCases.map((c) => {
              const isSelected = c.id === activeCase.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img 
                    src={c.photoUrl} 
                    alt={c.animalType}
                    style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                  />

                  <div style={{ overflow: 'hidden', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{c.id}</span>
                      <span className={c.status === 'recovered' ? 'badge badge-resolved' : 'badge badge-high'} style={{ fontSize: '0.625rem' }}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {c.aiPrediction}
                    </div>

                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Location: {c.locationName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Case Details & Timeline Inspector */}
        {activeCase && (
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Case Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800 }}>
                    CASE {activeCase.id}
                  </h2>
                  <span className={activeCase.urgency === 'Emergency' ? 'badge badge-emergency' : 'badge badge-high'}>
                    {activeCase.urgency} Urgency
                  </span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Reported by <strong>{activeCase.reporterName}</strong> on {activeCase.reportedAt}
                </div>
              </div>

              {/* Status & Share Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href={getWhatsAppShareUrl(activeCase)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.775rem', color: '#25D366', borderColor: '#25D366' }}
                >
                  <Share2 size={13} />
                  <span>Share WhatsApp</span>
                </a>

                {(currentRole === 'ngo' || currentRole === 'vet' || currentRole === 'admin') && (
                  <>
                    {activeCase.status !== 'in_treatment' && activeCase.status !== 'recovered' && (
                      <button
                        className="btn-secondary"
                        onClick={() => onUpdateStatus(activeCase.id, 'in_treatment')}
                        style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                      >
                        <span>Mark In Treatment</span>
                      </button>
                    )}
                    {activeCase.status !== 'recovered' && (
                      <button
                        className="btn-primary"
                        onClick={() => onUpdateStatus(activeCase.id, 'recovered')}
                        style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark Recovered</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Assessment & Rescue Team Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              
              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>INITIAL ASSESSMENT</div>
                <div style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {activeCase.aiPrediction}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '2px' }}>
                  Certainty: {activeCase.aiConfidence}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED RESCUE ORG</div>
                <div style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {activeCase.assignedNGO || 'Pending Assignment'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '2px' }}>
                  Volunteer: {activeCase.assignedVolunteer || 'Unassigned'}
                </div>
              </div>

            </div>

            {/* Vertical Timeline */}
            <div>
              <h3 style={{ fontSize: '0.975rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '14px' }}>
                Rescue & Clinical Audit Log
              </h3>

              <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeCase.timeline.map((t, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    
                    <div style={{
                      position: 'absolute',
                      left: '-26px',
                      top: '2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: t.done ? 'var(--primary)' : 'var(--border-color)',
                      border: '2px solid var(--bg-card)'
                    }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: t.done ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {t.step}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: t.done ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {t.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Before / After Interactive Drag Slider */}
            {activeCase.afterPhotoUrl && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Heart size={15} color="var(--primary)" />
                  INTERACTIVE RECOVERY TRANSFORMATION SLIDER (Drag to compare Day 1 vs Day 28)
                </h4>

                <ImageSlider 
                  beforeImage={activeCase.photoUrl} 
                  afterImage={activeCase.afterPhotoUrl} 
                  beforeLabel="Day 1: Before Rescue"
                  afterLabel="Day 28: Fully Recovered"
                />
              </div>
            )}

            {/* Animal Profile Card */}
            <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                ANIMAL RECORD: DS-A-{activeCase.id.slice(-4)}
              </h4>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                Species: <strong>{activeCase.animalType}</strong> • Region: <strong>{activeCase.locationName}</strong> • Skin Scrapes: <strong>{activeCase.veterinarianConfirmed ? 'Verified Cleared' : 'Pending Culture'}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Veterinary Notes: <em>"{activeCase.veterinaryNotes || 'Awaiting initial clinical assessment notes.'}"</em>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
