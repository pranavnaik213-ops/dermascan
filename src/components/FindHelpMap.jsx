import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldCheck, 
  Phone, 
  Clock, 
  Flame, 
  UserCheck
} from 'lucide-react';
import { MOCK_NGOS } from '../data/mockData';

// Custom Pin Icon generator
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const createNgoIcon = () => {
  return L.divIcon({
    className: 'custom-ngo-marker',
    html: `<div style="
      background-color: #0284c7;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function FindHelpMap({ cases, onAcceptCase, currentRole }) {
  const [viewMode, setViewMode] = useState('pins'); // 'pins' or 'heatmap'
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [filterPriority, setFilterPriority] = useState('All');

  // Derive selectedCase dynamically from current cases list
  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const filteredCases = cases.filter(c => {
    if (filterPriority === 'All') return true;
    if (filterPriority === 'Emergency') return c.urgency === 'Emergency';
    if (filterPriority === 'High') return c.urgency === 'High';
    if (filterPriority === 'Medium') return c.urgency === 'Medium';
    if (filterPriority === 'Resolved') return c.status === 'recovered';
    return true;
  });

  const getMarkerColor = (c) => {
    if (c.status === 'recovered') return 'var(--low)';
    if (c.urgency === 'Emergency') return 'var(--emergency)';
    if (c.urgency === 'High') return 'var(--high)';
    if (c.urgency === 'Medium') return 'var(--medium)';
    return 'var(--low)';
  };

  const hotspots = [
    { name: "Nagarbhavi Sector", center: [12.9724, 77.5098], radius: 1200, count: 142, color: "var(--emergency)" },
    { name: "Vijayanagar Sector", center: [12.9698, 77.5358], radius: 1000, count: 118, color: "var(--high)" },
    { name: "Kengeri Sector", center: [12.9081, 77.4842], radius: 1500, count: 95, color: "var(--emergency)" },
    { name: "Rajajinagar Sector", center: [12.9915, 77.5530], radius: 800, count: 86, color: "var(--medium)" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="badge badge-low" style={{ marginBottom: '4px' }}>RESCUE DISPATCH COORDINATOR ({currentRole.toUpperCase()})</span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Geospatial Rescue Map & NGO Network
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time geospatial distribution of reported stray cases and rescue volunteers
          </div>
        </div>

        {/* View Switchers & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <div style={{ background: 'var(--bg-card)', padding: '3px', borderRadius: '8px', display: 'flex', gap: '4px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('pins')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: viewMode === 'pins' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'pins' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              Case Markers
            </button>

            <button
              onClick={() => setViewMode('heatmap')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: viewMode === 'heatmap' ? 'var(--emergency)' : 'transparent',
                color: viewMode === 'heatmap' ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Flame size={14} />
              <span>Incidence Zones</span>
            </button>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.825rem'
            }}
          >
            <option value="All">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High Urgency</option>
            <option value="Medium">Medium Priority</option>
            <option value="Resolved">Recovered Cases</option>
          </select>

        </div>
      </div>

      {/* Map + Side Drawer Split Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
        
        {/* Left Column: Interactive Map */}
        <div className="glass-panel" style={{ position: 'relative', minHeight: '450px', borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
          
          <MapContainer
            center={[12.9600, 77.5200]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '480px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Case Pin Markers */}
            {viewMode === 'pins' && filteredCases.map((c) => (
              <Marker
                key={c.id}
                position={[c.coordinates.lat, c.coordinates.lng]}
                icon={createCustomIcon(getMarkerColor(c))}
                eventHandlers={{
                  click: () => setSelectedCaseId(c.id)
                }}
              >
                <Popup>
                  <div style={{ textAlign: 'left', minWidth: '160px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{c.id}</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>{c.aiPrediction}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location: {c.locationName}</div>
                    <div style={{ fontSize: '0.725rem', marginTop: '4px', fontWeight: 600, color: getMarkerColor(c) }}>
                      {c.urgency} Priority • Score: {c.priorityScore}/100
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* NGO Markers */}
            {viewMode === 'pins' && MOCK_NGOS.map((ngo) => (
              <Marker
                key={ngo.id}
                position={[ngo.coordinates.lat, ngo.coordinates.lng]}
                icon={createNgoIcon()}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--secondary)' }}>{ngo.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Rescue Org</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>Phone: {ngo.phone}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Heatmap Overlay Circles */}
            {viewMode === 'heatmap' && hotspots.map((spot, idx) => (
              <Circle
                key={idx}
                center={spot.center}
                radius={spot.radius}
                pathOptions={{
                  fillColor: spot.color,
                  fillOpacity: 0.35,
                  color: spot.color,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div>
                    <strong>{spot.name}</strong>
                    <div>Total Reported Cases: {spot.count}</div>
                  </div>
                </Popup>
              </Circle>
            ))}

          </MapContainer>

          {/* Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.725rem',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emergency)' }}></span>
              <span>Emergency</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--high)' }}></span>
              <span>High</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--medium)' }}></span>
              <span>Medium</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--low)' }}></span>
              <span>Recovered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0284c7' }}></span>
              <span>NGO Center</span>
            </div>
          </div>
        </div>

        {/* Right Column: Case Inspector */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Selected Case Details: {selectedCase ? selectedCase.id : 'Select Pin'}
          </h3>

          {selectedCase ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img 
                  src={selectedCase.photoUrl} 
                  alt={selectedCase.animalType}
                  style={{ width: '76px', height: '76px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                  <span className={selectedCase.urgency === 'Emergency' ? 'badge badge-emergency' : selectedCase.urgency === 'High' ? 'badge badge-high' : 'badge badge-medium'}>
                    {selectedCase.urgency} Priority ({selectedCase.priorityScore}/100)
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '3px' }}>
                    {selectedCase.aiPrediction}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--primary)' }}>
                    Location: {selectedCase.locationName}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reporter:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedCase.reporterName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Rescue Org:</span>
                  <strong style={{ color: selectedCase.assignedNGO ? 'var(--primary)' : 'var(--medium)' }}>
                    {selectedCase.assignedNGO || 'Pending NGO Assignment'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                  <strong style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>
                    {selectedCase.status.replace('_', ' ')}
                  </strong>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>REPORTED SYMPTOMS:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedCase.symptoms.map((s, idx) => (
                    <span key={idx} className="badge badge-low" style={{ fontSize: '0.725rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCase.status === 'ngo_pending' && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <button 
                    className="btn-primary"
                    onClick={() => onAcceptCase(selectedCase.id, 'ABC Animal Rescue', 'Rahul Sharma')}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                  >
                    <UserCheck size={16} />
                    <span>Accept Case (ABC Animal Rescue)</span>
                  </button>
                </div>
              )}

              {selectedCase.status !== 'ngo_pending' && (
                <div style={{
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                  fontSize: '0.825rem',
                  color: 'var(--primary)',
                  fontWeight: 600
                }}>
                  ✓ Accepted by {selectedCase.assignedNGO}. Volunteer: {selectedCase.assignedVolunteer || 'Assigned'}
                </div>
              )}

            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              Select a marker on the map to view case details.
            </div>
          )}

        </div>

      </div>

      {/* Verified NGO Network */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          Verified Rescue Organizations Network
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {MOCK_NGOS.map((ngo) => (
            <div key={ngo.id} className="interactive-card" style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '0.975rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  {ngo.name}
                </h4>
                <span className="badge badge-low" style={{ fontSize: '0.675rem' }}>
                  Verified
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Coverage: <strong>{ngo.area}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                <Phone size={13} />
                <span>{ngo.phone}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Clock size={13} />
                <span>{ngo.operatingHours}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '2px' }}>
                <span>Active Cases: <strong>{ngo.activeCases}</strong></span>
                <span>Resolved: <strong>{ngo.resolvedCases}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

