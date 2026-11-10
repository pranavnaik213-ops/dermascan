import React, { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Building2,
  ExternalLink,
  HeartHandshake,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { MOCK_NGOS, VERIFIED_PET_HOSPITALS } from '../data/mockData';

// Haversine formula to compute accurate distance in kilometers
function distanceKm(from, to) {
  if (!from || !to) return null;
  const radians = (deg) => deg * (Math.PI / 180);
  const dLat = radians(to.lat - from.lat);
  const dLon = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Controller to smoothly pan map when user location or selected place changes
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
      map.setView([center.lat, center.lng], zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet Icons
const userLocationIcon = L.divIcon({
  className: 'user-gps-marker',
  html: `
    <div style="position: relative; width: 28px; height: 28px;">
      <div style="
        position: absolute;
        top: -8px;
        left: -8px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.28);
        animation: userGpsPulse 2s infinite ease-out;
      "></div>
      <div style="
        position: absolute;
        top: 2px;
        left: 2px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #2563eb;
        border: 3.5px solid #ffffff;
        box-shadow: 0 0 14px rgba(37, 99, 235, 0.8), 0 2px 6px rgba(0,0,0,0.35);
      "></div>
      <div style="
        position: absolute;
        top: 9px;
        left: 9px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ffffff;
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16]
});

const createFacilityIcon = (type, isEmergency) => {
  let bg = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
  let emoji = '🏥';

  if (isEmergency) {
    bg = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
    emoji = '🚨';
  } else if (type === 'ngo' || type === 'shelter') {
    bg = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
    emoji = '🐾';
  } else if (type === 'care_center') {
    bg = 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)';
    emoji = '🩺';
  }

  return L.divIcon({
    className: 'facility-leaflet-icon',
    html: `
      <div style="
        background: ${bg};
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        color: #fff;
        cursor: pointer;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Combine all verified hospitals & NGOs into a unified directory
const MASTER_CARE_DIRECTORY = [
  ...VERIFIED_PET_HOSPITALS.map((h) => ({
    id: h.id,
    name: h.name,
    category: h.operatingHours?.includes('24/7') ? 'emergency' : 'hospital',
    typeLabel: h.operatingHours?.includes('24/7') ? '24/7 Emergency Pet Hospital' : 'Veterinary Hospital',
    type: 'hospital',
    isEmergency: h.operatingHours?.includes('24/7'),
    address: h.address,
    area: h.area,
    phone: h.phone || h.helpline,
    operatingHours: h.operatingHours,
    doctorInCharge: h.doctorInCharge,
    facilities: h.facilities || [],
    coordinates: h.coordinates,
    verified: true,
  })),
  ...MOCK_NGOS.map((n) => ({
    id: n.id,
    name: n.name,
    category: 'ngo',
    typeLabel: 'Animal Shelter & Rescue NGO',
    type: 'ngo',
    isEmergency: false,
    address: n.address,
    area: n.area,
    phone: n.helpline || n.phone,
    operatingHours: n.operatingHours,
    doctorInCharge: n.headVolunteer,
    facilities: n.specialties || [],
    coordinates: n.coordinates,
    verified: true,
  }))
];

function createEmailDraft(report, recipient = '') {
  const subject = `Animal care report reference ${report.id || ''}`.trim();
  const body = [
    'Hello Veterinary Team / Rescue Coordinator,',
    '',
    'I would like to share an animal care observation for your review.',
    '',
    `Report reference: ${report.id || 'Local report'}`,
    `Animal: ${report.animal || report.animalType || 'Not specified'}`,
    `Observed: ${report.observedAt ? new Date(report.observedAt).toLocaleString() : 'Recent'}`,
    `Location: ${report.location || report.locationName || 'Near customer'}`,
    report.landmark ? `Nearby landmark: ${report.landmark}` : '',
    report.observations ? `Observations: ${report.observations}` : '',
    '',
    'Prepared with DermaScan Community Animal Care.'
  ].filter(Boolean).join('\n');

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function NearbyCare({ report }) {
  // Default center (Bangalore coordinate fallback if GPS not yet granted)
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [zoomLevel, setZoomLevel] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(() => (
    typeof navigator !== 'undefined' && navigator.geolocation
      ? ''
      : 'GPS not available in this browser. Showing care center directory.'
  ));
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [citySearch, setCitySearch] = useState('');

  // Auto-acquire user GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 150;
        setUserLocation({ lat, lng, accuracy });
        setMapCenter({ lat, lng });
        setZoomLevel(13);
        setLocationStatus(`📍 Current location acquired (${lat}, ${lng}). Accuracy ~${accuracy}m.`);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location permission was not granted. Tap "Locate Me" or search your city below.');
        } else {
          setLocationStatus('Could not get GPS fix. Showing verified veterinary network.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationStatus('Acquiring high-accuracy GPS position…');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 100;
        setUserLocation({ lat, lng, accuracy });
        setMapCenter({ lat, lng });
        setZoomLevel(14);
        setLocationStatus(`📍 GPS location locked (${lat}, ${lng}). Showing centers closest to you.`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocationStatus('GPS signal timed out. Please check location permissions in your browser.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    const query = citySearch.trim();
    if (!query) return;

    // Direct Google search redirection for custom city query
    const targetUrl = `https://www.google.com/maps/search/veterinary+hospital+animal+shelter+in+${encodeURIComponent(query)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setLocationStatus(`Opened Google Maps for "${query}".`);
  };

  // Compute live distance from user location for each place
  const placesWithDistance = MASTER_CARE_DIRECTORY.map((place) => {
    const dist = userLocation ? distanceKm(userLocation, place.coordinates) : null;
    return { ...place, distanceKm: dist };
  }).sort((a, b) => {
    if (a.distanceKm != null && b.distanceKm != null) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  // Filter places based on active category
  const filteredPlaces = placesWithDistance.filter((place) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'hospital') return place.type === 'hospital';
    if (selectedCategory === 'emergency') return place.isEmergency;
    if (selectedCategory === 'ngo') return place.type === 'ngo';
    return true;
  });

  // Dynamic Google search queries based on user coordinates
  const userLat = userLocation?.lat || mapCenter.lat;
  const userLng = userLocation?.lng || mapCenter.lng;

  const googlePetHospitalsUrl = `https://www.google.com/maps/search/pet+hospital+veterinary+near+me/@${userLat},${userLng},14z`;
  const googleEmergencyUrl = `https://www.google.com/maps/search/24+hours+emergency+pet+hospital+near+me/@${userLat},${userLng},14z`;
  const googleNgosUrl = `https://www.google.com/maps/search/animal+shelter+rescue+ngo+near+me/@${userLat},${userLng},14z`;
  const googleDirectionsUrl = (place) =>
    `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;
  const googlePlaceSearchUrl = (place) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}`;

  const focusPlaceOnMap = (place) => {
    setSelectedPlaceId(place.id);
    setMapCenter(place.coordinates);
    setZoomLevel(15);
  };

  return (
    <section className="page-wrap content-page nearby-page" aria-labelledby="nearby-care-title">
      <header className="page-intro">
        <span className="eyebrow">COMMUNITY RESCUE & VETERINARY NETWORK</span>
        <h1 id="nearby-care-title">Find nearby animal care</h1>
        <p>
          Locate verified veterinary hospitals, 24/7 trauma emergency care, and animal rescue NGOs around your live GPS position with direct Google Maps navigation.
        </p>
      </header>

      {/* Location Controls & Google Maps Live Action Hub */}
      <div className="nearby-search-panel panel">
        <div className="notice-box">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>
            <strong>Live Geolocation Active:</strong> Your current location is plotted with the pulsing blue dot on the map. Every care center includes verified contact details and direct Google Maps turn-by-turn navigation.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="button button-primary"
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LocateFixed size={17} aria-hidden="true" />
            {isLocating ? 'Acquiring GPS…' : 'Locate Me (Show Blue Dot)'}
          </button>

          <form
            onSubmit={handleCitySearch}
            style={{ display: 'flex', flex: '1 1 280px', gap: '8px' }}
          >
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search other city on Google Maps (e.g. Mumbai, Delhi, Austin)"
              style={{
                flex: 1,
                minHeight: '42px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff'
              }}
            />
            <button
              type="submit"
              className="button button-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={16} aria-hidden="true" /> Google Search
            </button>
          </form>
        </div>

        {locationStatus && (
          <p className="field-hint" style={{ color: 'var(--brand-dark)', fontWeight: 600, margin: 0 }}>
            {locationStatus}
          </p>
        )}

        {/* Live Google Maps Direct Search Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Take from Google:
          </span>
          <a
            href={googlePetHospitalsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
            style={{ padding: '6px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            🏥 Pet Hospitals Near Me <ExternalLink size={13} />
          </a>
          <a
            href={googleEmergencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
            style={{ padding: '6px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#dc2626' }}
          >
            🚨 24/7 Emergency Care <ExternalLink size={13} />
          </a>
          <a
            href={googleNgosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
            style={{ padding: '6px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ea580c' }}
          >
            🐾 Animal Shelters & NGOs <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="nearby-toolbar">
        <div className="nearby-filters" role="tablist" aria-label="Care categories">
          {[
            { id: 'all', label: 'All Centers' },
            { id: 'hospital', label: '🏥 Pet Hospitals' },
            { id: 'emergency', label: '🚨 24/7 Emergency' },
            { id: 'ngo', label: '🐾 NGOs & Shelters' }
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              role="tab"
              aria-selected={selectedCategory === cat.id}
              className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <span className="record-count" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color="var(--brand)" /> Showing {filteredPlaces.length} verified care facilities
        </span>
      </div>

      {/* Main Map & Facility List Layout */}
      <div className="nearby-layout">
        {/* Interactive Leaflet Map with Blue GPS Dot */}
        <div className="nearby-map-wrap panel" style={{ height: '520px', position: 'relative' }}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={zoomLevel}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewUpdater center={mapCenter} zoom={zoomLevel} />

            {/* Current User Location Blue Pulsing Dot */}
            {userLocation && (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                  <Popup>
                    <div style={{ textAlign: 'center', padding: '4px' }}>
                      <strong style={{ color: '#2563eb', fontSize: '13px' }}>📍 You Are Here</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Your current GPS coordinates: {userLocation.lat}, {userLocation.lng}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={userLocation.accuracy || 200}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#60a5fa',
                    fillOpacity: 0.15,
                    weight: 1.5
                  }}
                />
              </>
            )}

            {/* Care Facility Pins */}
            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                position={[place.coordinates.lat, place.coordinates.lng]}
                icon={createFacilityIcon(place.type, place.isEmergency)}
                eventHandlers={{
                  click: () => setSelectedPlaceId(place.id)
                }}
              >
                <Popup>
                  <div style={{ minWidth: '220px', padding: '4px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: place.isEmergency ? '#fee2e2' : place.type === 'ngo' ? '#ffedd5' : '#dcfce7',
                      color: place.isEmergency ? '#b91c1c' : place.type === 'ngo' ? '#c2410c' : '#15803d',
                      marginBottom: '4px'
                    }}>
                      {place.typeLabel}
                    </span>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{place.name}</strong>
                    {place.distanceKm != null && (
                      <span style={{ display: 'block', fontSize: '11px', color: '#0f766e', fontWeight: 700, margin: '2px 0' }}>
                        📍 {place.distanceKm.toFixed(1)} km from your blue dot
                      </span>
                    )}
                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0' }}>{place.address}</p>
                    <p style={{ fontSize: '11px', color: '#0369a1', margin: '2px 0' }}>🕒 {place.operatingHours}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      <a
                        href={googleDirectionsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#047857',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Navigation size={12} /> Google Directions
                      </a>
                      <a
                        href={`tel:${place.phone.replace(/[^+\d]/g, '')}`}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#2563eb',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Phone size={12} /> Call
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 1000,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} /> You (Blue Dot)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🏥</span> Pet Hospital
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚨</span> 24/7 Emergency
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🐾</span> Animal Shelter & NGO
            </span>
          </div>
        </div>

        {/* Nearby Facilities List & Details */}
        <div className="nearby-results" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {filteredPlaces.map((place) => {
            const isSelected = selectedPlaceId === place.id;
            return (
              <article
                key={place.id}
                className="panel nearby-place-card"
                style={{
                  borderLeft: isSelected
                    ? '4px solid #2563eb'
                    : place.isEmergency
                      ? '4px solid #ef4444'
                      : place.type === 'ngo'
                        ? '4px solid #ea580c'
                        : '4px solid var(--brand)',
                  background: isSelected ? '#f8fafc' : '#ffffff',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="nearby-card-heading">
                  <span
                    className="nearby-type-icon"
                    style={{
                      background: place.isEmergency ? '#fee2e2' : place.type === 'ngo' ? '#fff7ed' : 'var(--brand-soft)',
                      color: place.isEmergency ? '#dc2626' : place.type === 'ngo' ? '#ea580c' : 'var(--brand)'
                    }}
                  >
                    {place.isEmergency ? (
                      '🚨'
                    ) : place.type === 'ngo' ? (
                      <HeartHandshake size={18} />
                    ) : (
                      <Building2 size={18} />
                    )}
                  </span>
                  <div>
                    <span
                      className="panel-kicker"
                      style={{
                        color: place.isEmergency ? '#dc2626' : place.type === 'ngo' ? '#ea580c' : 'var(--brand-dark)'
                      }}
                    >
                      {place.typeLabel}
                    </span>
                    <h2>{place.name}</h2>
                  </div>
                  {place.distanceKm != null && (
                    <span className="nearby-distance">
                      {place.distanceKm.toFixed(1)} km away
                    </span>
                  )}
                </div>

                <p className="nearby-address">
                  <MapPin size={15} /> {place.address}
                </p>

                <p style={{ fontSize: '11.5px', color: '#0369a1', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  🕒 <strong>Hours:</strong> {place.operatingHours}
                </p>

                {place.doctorInCharge && (
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
                    👨‍⚕️ In Charge: {place.doctorInCharge}
                  </p>
                )}

                <div className="nearby-contact-links">
                  <button
                    type="button"
                    onClick={() => focusPlaceOnMap(place)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-dark)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <MapPin size={14} /> Center on Map
                  </button>

                  <a
                    href={googleDirectionsUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation size={14} /> Directions in Google Maps
                  </a>

                  <a
                    href={googlePlaceSearchUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={14} /> Google Info
                  </a>

                  {place.phone && (
                    <a
                      href={`tel:${place.phone.replace(/[^+\d]/g, '')}`}
                      style={{ color: '#2563eb' }}
                    >
                      <Phone size={14} /> Call {place.phone}
                    </a>
                  )}
                </div>
              </article>
            );
          })}

          {/* Active Report Case Card */}
          {report && (
            <article className="panel nearby-place-card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div className="nearby-card-heading">
                <span className="nearby-type-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
                  <Mail size={18} aria-hidden="true" />
                </span>
                <div>
                  <span className="panel-kicker" style={{ color: '#0284c7' }}>ACTIVE CASE REPORT</span>
                  <h2>Share Report #{report.id}</h2>
                </div>
              </div>
              <p className="nearby-address">
                Your report details and observations are ready. Email this case directly to any care center above.
              </p>
              <div className="nearby-contact-links">
                <a href={createEmailDraft(report)} className="button button-secondary" style={{ padding: '6px 12px' }}>
                  <Mail size={14} aria-hidden="true" /> Email Report to Clinic
                </a>
              </div>
            </article>
          )}

          {/* Clinical Guidance Note */}
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.85)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '12px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--brand-dark)', marginBottom: '4px' }}>
              <Stethoscope size={14} /> Emergency Guidance
            </span>
            For critical trauma, poison ingestion, or heat stroke, head directly to a 24/7 emergency hospital. Call ahead while en route so their casualty team can prepare.
          </div>
        </div>
      </div>
    </section>
  );
}
