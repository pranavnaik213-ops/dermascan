import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Minus, 
  ExternalLink,
  Navigation,
  Check
} from 'lucide-react';
import { MOCK_NGOS } from '../data/mockData';

export default function NgoPortal({ 
  cases = [], 
  onAcceptCase, 
  onUpdateStatus, 
  setActiveTab 
}) {
  // Currently selected NGO station (defaults to CUPA)
  const [selectedNgoId, setSelectedNgoId] = useState('ngo-cupa');
  const currentNgo = MOCK_NGOS.find(n => n.id === selectedNgoId) || MOCK_NGOS[0];

  // Filter for incoming triage
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'emergency', 'assigned', 'pending'

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Volunteer driver assignment state for modal
  const [assigningCaseId, setAssigningCaseId] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('Volunteer Chethan Sharma (Van #2)');

  // Local bed capacity
  const [bedCapacity, setBedCapacity] = useState(currentNgo.availableBeds || 18);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Accept case handler
  const handleConfirmAccept = (caseId) => {
    if (onAcceptCase) {
      onAcceptCase(caseId, currentNgo.name, selectedVolunteer);
    }
    setAssigningCaseId(null);
    showToast(`🚑 Ambulance Dispatched! ${selectedVolunteer} assigned to Case ${caseId}.`, 'success');
  };

  // Pending cases in Bangalore
  const pendingCases = cases.filter(c => c.status === 'ngo_pending' || !c.assignedNGO);
  const myAssignedCases = cases.filter(c => c.assignedNGO && c.assignedNGO.includes(currentNgo.name.split(' ')[0]));
  const emergencyCases = cases.filter(c => c.urgency === 'Emergency');

  // Filtered cases to display
  const displayedCases = cases.filter(c => {
    if (filterMode === 'emergency') return c.urgency === 'Emergency';
    if (filterMode === 'pending') return c.status === 'ngo_pending' || !c.assignedNGO;
    if (filterMode === 'assigned') return c.assignedNGO && c.assignedNGO.includes(currentNgo.name.split(' ')[0]);
    return true;
  });

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

      {/* NGO Dispatcher Station Header */}
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
            background: 'linear-gradient(135deg, var(--secondary) 0%, #0d9488 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px var(--primary-glow)',
            flexShrink: 0
          }}>
            <Truck size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Station Switcher Dropdown */}
              <select
                value={selectedNgoId}
                onChange={(e) => {
                  setSelectedNgoId(e.target.value);
                  const found = MOCK_NGOS.find(n => n.id === e.target.value);
                  if (found) setBedCapacity(found.availableBeds || 18);
                  showToast(`Switched active station to: ${found?.name.split('(')[0]}`);
                }}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {MOCK_NGOS.map(ngo => (
                  <option key={ngo.id} value={ngo.id}>
                    {ngo.name}
                  </option>
                ))}
              </select>

              <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> AWBI ACCREDITED STATION
              </span>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '4px', margin: 0 }}>
              {currentNgo.area} • 24/7 Field Van Dispatch Unit • Hotline: {currentNgo.phone}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab && setActiveTab('help')}
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
            <MapPin size={16} />
            <span>Open GPS Rescue Radar</span>
          </button>

          <a
            href={`tel:${currentNgo.phone}`}
            className="btn-3d btn-3d-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Phone size={16} />
            <span>Emergency Station Line</span>
          </a>
        </div>
      </section>

      {/* Live Operational KPIs */}
      <section className="hero-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Incoming Rescues</span>
            <AlertTriangle size={18} color="var(--high)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {pendingCases.length} Pending
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--high)', marginTop: '4px', fontWeight: 600 }}>
            {emergencyCases.length} Emergency Priority
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Dispatches</span>
            <Truck size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {myAssignedCases.length} In-Flight
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
            Assigned to {currentNgo.name.split(' ')[0]}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Shelter Bed Capacity</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setBedCapacity(prev => Math.max(0, prev - 1))}
                className="btn-3d btn-3d-secondary"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                title="Decrease"
              >
                <Minus size={11} />
              </button>
              <button 
                onClick={() => setBedCapacity(prev => prev + 1)}
                className="btn-3d btn-3d-secondary"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                title="Increase"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {bedCapacity} Kennels
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '4px', fontWeight: 600 }}>
            Mange & Trauma Isolation
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Station Ambulance Fleet</span>
            <Radio size={18} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {currentNgo.fieldVanCount} Vans
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>
            Status: {currentNgo.ambulanceStatus}
          </div>
        </div>

      </section>

      {/* Incoming Rescue Triage Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Controls & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Live Rescue Triage & Dispatch Radar ({displayedCases.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Accept incoming community reports, dispatch field vans, and coordinate immediate veterinary rescue.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {[
              { id: 'all', label: `All Reports (${cases.length})` },
              { id: 'emergency', label: `🚨 Emergency (${emergencyCases.length})` },
              { id: 'pending', label: `⏳ Unassigned (${pendingCases.length})` },
              { id: 'assigned', label: `🏥 Our Station (${myAssignedCases.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                className={`btn-3d ${filterMode === tab.id ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Triage Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {displayedCases.map(c => {
            const isEmergency = c.urgency === 'Emergency';
            const isAssignedToThisNgo = c.assignedNGO && c.assignedNGO.includes(currentNgo.name.split(' ')[0]);

            return (
              <div
                key={c.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: isEmergency ? '1.5px solid var(--emergency)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isEmergency ? '0 8px 24px var(--emergency-glow)' : 'var(--shadow-sm)'
                }}
              >
                {/* Top Severity Ribbon */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: isEmergency ? 'var(--emergency)' : (c.urgency === 'High' ? 'var(--high)' : 'var(--primary)')
                }} />

                {/* Case ID and Urgency */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={c.photoUrl}
                      alt="Stray lesion"
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                        {c.animalType} • {c.id}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={11} /> {c.reportedAt || 'Today'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${isEmergency ? 'badge-emergency' : (c.urgency === 'High' ? 'badge-high' : 'badge-low')}`}>
                    {c.urgency} Priority
                  </span>
                </div>

                {/* Location & AI Prediction */}
                <div style={{
                  background: 'var(--bg-card-subtle)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <MapPin size={14} color="var(--primary)" flexShrink={0} />
                    <span>{c.locationName}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>AI Triage Diagnosis:</span>
                    <strong style={{ color: 'var(--primary)' }}>{c.aiPrediction} ({c.aiConfidence}%)</strong>
                  </div>

                  {c.assignedNGO && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', paddingTop: '4px', borderTop: '1px dashed var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned Team:</span>
                      <strong style={{ color: 'var(--secondary)' }}>{c.assignedNGO}</strong>
                    </div>
                  )}
                </div>

                {/* Dispatch Status or Action Trigger */}
                {assigningCaseId === c.id ? (
                  /* Volunteer Selector Sub-Form */
                  <div style={{
                    background: 'var(--primary-light)',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Select Volunteer Driver for Case {c.id}:
                    </div>

                    <select
                      value={selectedVolunteer}
                      onChange={(e) => setSelectedVolunteer(e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <option value="Volunteer Chethan Sharma (Van #2)">Volunteer Chethan Sharma (Ambulance Van #2)</option>
                      <option value="Volunteer Ramesh Kumar (Van #1)">Volunteer Ramesh Kumar (Ambulance Van #1)</option>
                      <option value="Volunteer Dr. Preeti (Mobile Clinic)">Dr. Preeti Chandrasekhar (Mobile Triage)</option>
                      <option value="Volunteer Haris Ali (Rapid Bike Unit)">Haris Ali (Emergency First Responder)</option>
                    </select>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleConfirmAccept(c.id)}
                        className="btn-3d btn-3d-primary"
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        Confirm Ambulance Dispatch
                      </button>
                      <button
                        onClick={() => setAssigningCaseId(null)}
                        className="btn-3d btn-3d-ghost"
                        style={{ padding: '8px', fontSize: '0.8rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Dispatch & Logistics Controls */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                    
                    {!c.assignedNGO || c.status === 'ngo_pending' ? (
                      <button
                        onClick={() => setAssigningCaseId(c.id)}
                        className="btn-3d btn-3d-primary"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '0.875rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Truck size={17} />
                        <span>Accept Case & Dispatch Ambulance</span>
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Status: <strong style={{ color: 'var(--primary)' }}>{c.status.replace('_', ' ').toUpperCase()}</strong>
                        </div>
                        {isAssignedToThisNgo && c.status !== 'recovered' && (
                          <button
                            onClick={() => {
                              if (onUpdateStatus) {
                                onUpdateStatus(c.id, 'in_treatment');
                              }
                              showToast(`Case ${c.id} admitted to shelter inpatient treatment`);
                            }}
                            className="btn-3d btn-3d-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                          >
                            <Check size={12} color="var(--primary)" />
                            <span>Admit to Inpatient</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Quick Communication & GPS Links */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${c.coordinates ? `${c.coordinates.lat},${c.coordinates.lng}` : encodeURIComponent(c.locationName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-3d btn-3d-ghost"
                        style={{
                          flex: 1,
                          padding: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Navigation size={13} color="var(--primary)" />
                        <span>Directions</span>
                        <ExternalLink size={10} />
                      </a>

                      <a
                        href={`https://wa.me/919988776655?text=${encodeURIComponent(`[DermaScan Rescue Alert] Hi ${c.reporterName}, ${currentNgo.name} is dispatching a rescue van for the reported ${c.animalType} in ${c.locationName}. Please confirm if the animal is still on site.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-3d btn-3d-ghost"
                        style={{
                          flex: 1,
                          padding: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: 'var(--primary)'
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Reporter</span>
                      </a>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
