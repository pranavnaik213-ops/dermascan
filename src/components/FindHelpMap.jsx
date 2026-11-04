import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldCheck, 
  Phone, 
  Clock, 
  UserCheck,
  Compass,
  MessageCircle,
  Navigation,
  MapPin,
  ExternalLink,
  Car,
  Route,
  LocateFixed,
  Star,
  CheckCircle2,
  Building2,
  Maximize2,
  Minimize2,
  Shield,
  Send
} from 'lucide-react';
import { MOCK_NGOS, VERIFIED_PET_HOSPITALS, calculateDistanceKm } from '../data/mockData';
import Interactive3DCard from './Interactive3DCard';

// Enhanced MapResizer: Fixes Leaflet tile cutoff by continuously invalidating size via ResizeObserver & multi-stage timers
function MapResizer({ mapLayoutMode }) {
  const map = useMap();
  useEffect(() => {
    // Invalidate immediately
    map.invalidateSize({ animate: false });

    // Multi-stage timers to catch post-mount DOM layout stabilization & CSS page transitions
    const timers = [
      setTimeout(() => map.invalidateSize({ animate: false }), 50),
      setTimeout(() => map.invalidateSize({ animate: false }), 150),
      setTimeout(() => map.invalidateSize({ animate: false }), 300),
      setTimeout(() => map.invalidateSize({ animate: false }), 500),
      setTimeout(() => map.invalidateSize({ animate: false }), 800),
      setTimeout(() => map.invalidateSize({ animate: false }), 1200)
    ];

    // ResizeObserver on the map's container DOM node
    const container = map.getContainer();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        map.invalidateSize({ animate: false });
      });
      ro.observe(container);
    }

    const handleResize = () => map.invalidateSize({ animate: false });
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      timers.forEach(t => clearTimeout(t));
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map, mapLayoutMode]);

  return null;
}

// Controller to smoothly pan & fit bounds when user or destination changes
function MapViewController({ targetCenter, targetZoom, targetBounds }) {
  const map = useMap();
  useEffect(() => {
    if (targetBounds && targetBounds.length >= 2) {
      map.fitBounds(targetBounds, { padding: [60, 60], maxZoom: 15, animate: true });
    } else if (targetCenter) {
      map.setView(targetCenter, targetZoom || 13, { animate: true });
    }
  }, [targetCenter, targetZoom, targetBounds, map]);
  return null;
}

// Custom Marker Icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 14px ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulseGlow 2s infinite;
    ">
      <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
    </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createHospitalIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background: ${isSelected ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#059669'};
      width: ${isSelected ? '36px' : '30px'};
      height: ${isSelected ? '36px' : '30px'};
      border-radius: 10px;
      border: 2.5px solid #ffffff;
      box-shadow: ${isSelected ? '0 0 16px rgba(5, 150, 105, 0.7)' : '0 4px 10px rgba(0,0,0,0.3)'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: ${isSelected ? '16px' : '13px'};
      transition: all 0.2s ease;
    ">
      🏥
    </div>`,
    iconSize: isSelected ? [36, 36] : [30, 30],
    iconAnchor: isSelected ? [18, 18] : [15, 15]
  });
};

const createNgoIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background: ${isSelected ? 'linear-gradient(135deg, #0d9488 0%, #047857 100%)' : '#0d9488'};
      width: ${isSelected ? '36px' : '30px'};
      height: ${isSelected ? '36px' : '30px'};
      border-radius: 10px;
      border: 2.5px solid #ffffff;
      box-shadow: ${isSelected ? '0 0 16px rgba(13, 148, 136, 0.7)' : '0 4px 10px rgba(0,0,0,0.3)'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: ${isSelected ? '16px' : '13px'};
      transition: all 0.2s ease;
    ">
      🛡️
    </div>`,
    iconSize: isSelected ? [36, 36] : [30, 30],
    iconAnchor: isSelected ? [18, 18] : [15, 15]
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="
      position: relative;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #0284c7;
      border: 3px solid #ffffff;
      box-shadow: 0 0 16px rgba(2, 132, 199, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

export default function FindHelpMap({ cases, onAcceptCase, currentRole: _currentRole, theme: _theme = 'light' }) {
  // Navigation & Category Modes: 'hospitals', 'ngos', 'cases'
  const [activeCategory, setActiveCategory] = useState('hospitals');
  const [selectedHospitalId, setSelectedHospitalId] = useState(VERIFIED_PET_HOSPITALS[0].id);
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [selectedNgoId, setSelectedNgoId] = useState(MOCK_NGOS[0].id);
  const [viewMode, setViewMode] = useState('pins'); // 'pins' or 'heatmap'
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Real Google Maps / Tile Layer Provider
  const [mapLayer, setMapLayer] = useState('google_roadmap'); // 'google_roadmap', 'google_satellite', 'dark', 'osm'
  const [mapLayoutMode, setMapLayoutMode] = useState('split'); // 'split' (side-by-side) or 'full' (full-width)
  const [dispatchAlertToast, setDispatchAlertToast] = useState(null);

  // User Current Location State
  const [userLocation, setUserLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
    name: "Bengaluru (City Center)",
    detected: false
  });
  const [isLocating, setIsLocating] = useState(false);

  // Auto-detect user geolocation on mount
  const detectUserLocation = useCallback(() => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "My Detected GPS Location",
            detected: true
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation fallback:", err.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted) return;
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "My Detected GPS Location",
            detected: true
          });
        },
        (err) => {
          console.warn("Geolocation initial scan fallback:", err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Derive Hospitals with Real-time Distance and Drive Time from User Location
  const hospitalsWithDistance = VERIFIED_PET_HOSPITALS.map((hosp) => {
    const distKm = calculateDistanceKm(
      userLocation.lat,
      userLocation.lng,
      hosp.coordinates.lat,
      hosp.coordinates.lng
    );
    const driveMinutes = Math.max(4, Math.round((distKm / 22) * 60));
    return {
      ...hosp,
      distanceKm: distKm,
      driveMinutes
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Derive NGOs with Real-time Distance and Drive Time from User Location
  const ngosWithDistance = MOCK_NGOS.map((ngo) => {
    const distKm = calculateDistanceKm(
      userLocation.lat,
      userLocation.lng,
      ngo.coordinates.lat,
      ngo.coordinates.lng
    );
    const driveMinutes = Math.max(3, Math.round((distKm / 22) * 60));
    return {
      ...ngo,
      distanceKm: distKm,
      driveMinutes
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Currently Selected Objects
  const selectedHospital = hospitalsWithDistance.find(h => h.id === selectedHospitalId) || hospitalsWithDistance[0];
  const selectedNgo = ngosWithDistance.find(n => n.id === selectedNgoId) || ngosWithDistance[0];
  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Filtered Cases
  const filteredCases = cases.filter(c => {
    if (filterPriority === 'All') return true;
    if (filterPriority === 'Emergency') return c.urgency === 'Emergency';
    if (filterPriority === 'High') return c.urgency === 'High';
    if (filterPriority === 'Medium') return c.urgency === 'Medium';
    if (filterPriority === 'Resolved') return c.status === 'recovered';
    return true;
  });

  const getMarkerColor = (c) => {
    if (c.status === 'recovered') return '#059669';
    if (c.urgency === 'Emergency') return '#ef4444';
    if (c.urgency === 'High') return '#ea580c';
    if (c.urgency === 'Medium') return '#d97706';
    return '#059669';
  };

  const hotspots = [
    { name: "Nagarbhavi Cluster", center: [12.9724, 77.5098], radius: 1200, count: 142, color: "#ef4444" },
    { name: "Vijayanagar Cluster", center: [12.9698, 77.5358], radius: 1000, count: 118, color: "#ea580c" },
    { name: "Kengeri Cluster", center: [12.9081, 77.4842], radius: 1500, count: 95, color: "#ef4444" },
    { name: "Rajajinagar Cluster", center: [12.9915, 77.5530], radius: 800, count: 86, color: "#d97706" }
  ];

  // Map Tile Configuration
  const getTileConfig = () => {
    switch (mapLayer) {
      case 'google_roadmap':
        return {
          url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps'
        };
      case 'google_satellite':
        return {
          url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps Imagery'
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; CARTO &copy; OpenStreetMap'
        };
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors'
        };
    }
  };

  const tileConfig = getTileConfig();

  // Route Polyline Waypoints from User Location -> Selected Hospital
  const routeWaypoints = selectedHospital ? [
    [userLocation.lat, userLocation.lng],
    [
      (userLocation.lat * 2 + selectedHospital.coordinates.lat) / 3,
      (userLocation.lng * 2 + selectedHospital.coordinates.lng) / 3 + 0.004
    ],
    [
      (userLocation.lat + selectedHospital.coordinates.lat * 2) / 3,
      (userLocation.lng + selectedHospital.coordinates.lng * 2) / 3 - 0.003
    ],
    [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng]
  ] : [];

  // Route Polyline Waypoints from User Location -> Selected NGO
  const ngoRouteWaypoints = selectedNgo ? [
    [userLocation.lat, userLocation.lng],
    [
      (userLocation.lat * 2 + selectedNgo.coordinates.lat) / 3,
      (userLocation.lng * 2 + selectedNgo.coordinates.lng) / 3 - 0.004
    ],
    [
      (userLocation.lat + selectedNgo.coordinates.lat * 2) / 3,
      (userLocation.lng + selectedNgo.coordinates.lng * 2) / 3 + 0.003
    ],
    [selectedNgo.coordinates.lat, selectedNgo.coordinates.lng]
  ] : [];

  // Google Maps Turn-by-Turn Navigation URLs
  const googleMapsDirectionsUrl = selectedHospital ? 
    `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedHospital.coordinates.lat},${selectedHospital.coordinates.lng}&travelmode=driving` : '#';

  const googleMapsNgoDirectionsUrl = selectedNgo ?
    `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedNgo.coordinates.lat},${selectedNgo.coordinates.lng}&travelmode=driving` : '#';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '36px' }}>
      
      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-low" style={{ marginBottom: '6px' }}>
            <Compass size={13} /> GOOGLE MAPS POWERED RESCUE & VETERINARY NAVIGATION
          </span>
          <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', color: 'var(--text-main)', fontWeight: 800 }}>
            Nearby Verified Pet Hospitals & Emergency Radar
          </h1>
          <div style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>
            Real-time GPS proximity routing to accredited veterinary college hospitals, 24/7 ICUs, and stray rescue ambulances.
          </div>
        </div>

        {/* User Geolocation Status & Re-locate Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-main)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: userLocation.detected ? '#10b981' : '#0284c7',
              boxShadow: userLocation.detected ? '0 0 8px #10b981' : '0 0 8px #0284c7'
            }} />
            <span>
              <strong>GPS:</strong> {userLocation.name}
            </span>
            <button
              onClick={detectUserLocation}
              disabled={isLocating}
              title="Detect my current location"
              style={{
                background: 'transparent',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              <LocateFixed size={14} className={isLocating ? 'animate-spin' : ''} />
              <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top View Toggle: Verified Hospitals vs Nearby NGOs vs Reported Incidents */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory('hospitals')}
            className={`btn-3d ${activeCategory === 'hospitals' ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
            style={{
              padding: '9px 18px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Building2 size={16} />
            <span>Verified Hospitals ({hospitalsWithDistance.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('ngos')}
            className={`btn-3d ${activeCategory === 'ngos' ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
            style={{
              padding: '9px 18px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Shield size={16} />
            <span>Nearby Rescue NGOs ({ngosWithDistance.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('cases')}
            className={`btn-3d ${activeCategory === 'cases' ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
            style={{
              padding: '9px 18px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MapPin size={16} />
            <span>Reported Incidents ({cases.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Map Layout View Mode: Side-by-side vs Full Width */}
          <button
            onClick={() => setMapLayoutMode(prev => prev === 'split' ? 'full' : 'split')}
            className={`btn-3d ${mapLayoutMode === 'full' ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            title={mapLayoutMode === 'full' ? 'Switch back to Side-by-Side Split View' : 'Expand Google Map to Full Screen Width'}
          >
            {mapLayoutMode === 'full' ? (
              <>
                <Minimize2 size={13} />
                <span>Side-by-Side View</span>
              </>
            ) : (
              <>
                <Maximize2 size={13} />
                <span>Full-Width Map</span>
              </>
            )}
          </button>

          {/* Map Layer Switcher: Google Roadmap / Google Satellite / Dark Matter / OSM */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-card-subtle)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 4px', fontWeight: 600 }}>MAP LAYER:</span>
            
            <button
              onClick={() => setMapLayer('google_roadmap')}
              className={`btn-3d ${mapLayer === 'google_roadmap' ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: '4px' }}
            >
              🗺️ Google Roads
            </button>

            <button
              onClick={() => setMapLayer('google_satellite')}
              className={`btn-3d ${mapLayer === 'google_satellite' ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: '4px' }}
            >
              🛰️ Satellite
            </button>

            <button
              onClick={() => setMapLayer('dark')}
              className={`btn-3d ${mapLayer === 'dark' ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: '4px' }}
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </div>

      {/* Incident Sub-filters (Priority & ViewMode) */}
      {activeCategory === 'cases' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-card)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SEVERITY FILTER:</span>
            {['All', 'Emergency', 'High', 'Medium', 'Resolved'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterPriority(lvl)}
                className={`btn-3d ${filterPriority === lvl ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
                style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>VIEW:</span>
            <button
              onClick={() => setViewMode('pins')}
              className={`btn-3d ${viewMode === 'pins' ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
              style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
            >
              📍 Pins
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`btn-3d ${viewMode === 'heatmap' ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
              style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
            >
              🔥 Hotspots
            </button>
          </div>
        </div>
      )}

      {/* Main Map + Details Split View */}
      <div 
        className={`map-split-grid ${mapLayoutMode === 'full' ? 'is-full-map' : ''}`} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: mapLayoutMode === 'full' ? '1fr' : undefined,
          gap: '22px',
          alignItems: 'stretch'
        }}
      >
        
        {/* Left Column: Interactive Map with User Marker, Destinations & Driving Route */}
        <div className="glass-panel" style={{ 
          position: 'relative', 
          minHeight: mapLayoutMode === 'full' ? '640px' : '650px', 
          borderRadius: 'var(--radius-lg)', 
          overflow: 'hidden', 
          padding: 0,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ 
              width: '100%', 
              height: '100%', 
              minHeight: mapLayoutMode === 'full' ? '640px' : '650px', 
              flex: 1 
            }}
          >
            <MapResizer mapLayoutMode={mapLayoutMode} />
            
            {/* Dynamic Map FlyTo when selecting hospital, NGO, or case */}
            <MapViewController 
              targetBounds={
                activeCategory === 'hospitals' && selectedHospital ? [
                  [userLocation.lat, userLocation.lng],
                  [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng]
                ] : activeCategory === 'ngos' && selectedNgo ? [
                  [userLocation.lat, userLocation.lng],
                  [selectedNgo.coordinates.lat, selectedNgo.coordinates.lng]
                ] : null
              }
              targetCenter={activeCategory === 'cases' && selectedCase ? [selectedCase.coordinates.lat, selectedCase.coordinates.lng] : null}
            />

            {/* Tile Layer (Google Maps Roadmap, Satellite, Dark or OSM) */}
            <TileLayer
              attribution={tileConfig.attribution}
              url={tileConfig.url}
              subdomains={mapLayer.startsWith('google') ? ['mt0', 'mt1', 'mt2', 'mt3'] : ['a', 'b', 'c']}
            />

            {/* User Current Location Marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div style={{ minWidth: '170px' }}>
                  <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.85rem' }}>📍 YOUR LOCATION</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>{userLocation.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</div>
                </div>
              </Popup>
            </Marker>

            {/* User GPS Proximity Radius Circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={350}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#38bdf8',
                fillOpacity: 0.15,
                weight: 1.5
              }}
            />

            {/* Driving Route Polyline from User Location to Selected Hospital */}
            {activeCategory === 'hospitals' && selectedHospital && routeWaypoints.length > 0 && (
              <Polyline
                positions={routeWaypoints}
                pathOptions={{
                  color: '#059669',
                  weight: 5,
                  dashArray: '10, 8',
                  opacity: 0.9
                }}
              />
            )}

            {/* Driving Route Polyline from User Location to Selected NGO */}
            {activeCategory === 'ngos' && selectedNgo && ngoRouteWaypoints.length > 0 && (
              <Polyline
                positions={ngoRouteWaypoints}
                pathOptions={{
                  color: '#0d9488',
                  weight: 5,
                  dashArray: '10, 8',
                  opacity: 0.95
                }}
              />
            )}

            {/* Verified Pet Hospital Markers */}
            {activeCategory === 'hospitals' && hospitalsWithDistance.map((hosp) => {
              const isSelected = selectedHospitalId === hosp.id;
              return (
                <Marker
                  key={hosp.id}
                  position={[hosp.coordinates.lat, hosp.coordinates.lng]}
                  icon={createHospitalIcon(isSelected)}
                  eventHandlers={{
                    click: () => setSelectedHospitalId(hosp.id)
                  }}
                >
                  <Popup>
                    <div style={{ textAlign: 'left', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.75rem', fontWeight: 800 }}>
                        <CheckCircle2 size={12} /> VERIFIED PET HOSPITAL
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                        {hosp.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {hosp.address}</div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                        🚗 {hosp.distanceKm} km away • ~{hosp.driveMinutes} mins drive
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '2px' }}>
                        📞 {hosp.phone}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Verified Rescue NGO Markers */}
            {activeCategory === 'ngos' && ngosWithDistance.map((ngo) => {
              const isSelected = selectedNgoId === ngo.id;
              return (
                <Marker
                  key={ngo.id}
                  position={[ngo.coordinates.lat, ngo.coordinates.lng]}
                  icon={createNgoIcon(isSelected)}
                  eventHandlers={{
                    click: () => setSelectedNgoId(ngo.id)
                  }}
                >
                  <Popup>
                    <div style={{ textAlign: 'left', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0d9488', fontSize: '0.75rem', fontWeight: 800 }}>
                        <ShieldCheck size={12} /> VERIFIED RESCUE NGO
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                        {ngo.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {ngo.address}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 700, marginTop: '4px' }}>
                        🚗 {ngo.distanceKm} km away • ~{ngo.driveMinutes} mins drive
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '2px' }}>
                        📞 Helpline: {ngo.helpline}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>
                          Fleet: {ngo.ambulanceStatus} • {ngo.availableBeds} beds
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Reported Stray Incident Markers */}
            {activeCategory === 'cases' && filteredCases.map((c) => (
              <Marker
                key={c.id}
                position={[c.coordinates.lat, c.coordinates.lng]}
                icon={createCustomIcon(getMarkerColor(c))}
                eventHandlers={{
                  click: () => setSelectedCaseId(c.id)
                }}
              >
                <Popup>
                  <div style={{ textAlign: 'left', minWidth: '180px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{c.id}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      {c.aiPrediction}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {c.locationName}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: 700, color: getMarkerColor(c) }}>
                      {c.urgency} Urgency • Score: {c.priorityScore}/100
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Heatmap Overlay Circles */}
            {activeCategory === 'cases' && viewMode === 'heatmap' && hotspots.map((spot, idx) => (
              <Circle
                key={idx}
                center={spot.center}
                radius={spot.radius}
                pathOptions={{
                  fillColor: spot.color,
                  fillOpacity: 0.32,
                  color: spot.color,
                  weight: 2
                }}
              >
                <Popup>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{spot.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reported Cluster Volume: {spot.count} cases</div>
                  </div>
                </Popup>
              </Circle>
            ))}

          </MapContainer>

          {/* Floating Map Status Strip */}
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            zIndex: 999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
              <span>You</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>{activeCategory === 'ngos' ? '🛡️ Rescue NGO' : '🏥 Verified Hospital'}</span>
            </div>
            {(activeCategory === 'hospitals' || activeCategory === 'ngos') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: activeCategory === 'ngos' ? '#0d9488' : '#059669', fontWeight: 700 }}>
                <span>╌╌ Driving Route</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hospital Info, NGO Details, or Case Panel */}
        <div className="glass-panel" style={{ 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '18px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          height: '100%'
        }}>
          
          {activeCategory === 'hospitals' && selectedHospital ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Hospital Title & Verified Badges */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="badge badge-low" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={13} /> {selectedHospital.type}
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b' }}>
                    <Star size={14} fill="#f59e0b" />
                    <span>{selectedHospital.rating} Rating</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800, marginTop: '8px', lineHeight: 1.25 }}>
                  {selectedHospital.name}
                </h2>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                  🛡️ {selectedHospital.regNo}
                </div>
              </div>

              {/* Distance & Drive Time Highlight Pill */}
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-card-subtle) 100%)',
                border: '1.5px solid var(--low-border)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Car size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {selectedHospital.distanceKm} km away
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Est. Drive Time: <strong>~{selectedHospital.driveMinutes} mins</strong> from your location
                    </div>
                  </div>
                </div>

                <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                  {selectedHospital.operatingHours.includes('24/7') ? '🟢 24/7 Emergency' : '🟡 Open Today'}
                </span>
              </div>

              {/* Physical Location & Contact */}
              <div style={{
                background: 'var(--bg-card-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.84rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>HOSPITAL ADDRESS & LANDMARK:</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>📍 {selectedHospital.address}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Landmark: {selectedHospital.landmark}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>CASUALTY: </span>
                    <a href={`tel:${selectedHospital.phone}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {selectedHospital.phone}
                    </a>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>24/7 HELPLINE: </span>
                    <a href={`tel:${selectedHospital.emergencyPhone}`} style={{ color: 'var(--emergency)', fontWeight: 700 }}>
                      {selectedHospital.emergencyPhone}
                    </a>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ⏰ Operating Hours: {selectedHospital.operatingHours}
                </div>
              </div>

              {/* Clinical Facilities */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  CLINICAL SPECIALTIES & FACILITIES:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedHospital.facilities.map((fac, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      ✓ {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Directions Guide */}
              <div style={{
                background: 'var(--bg-card-subtle)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Route size={14} color="var(--primary)" />
                  <span>Driving Directions from Your Coordinates:</span>
                </div>
                <ol style={{ paddingLeft: '18px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.4 }}>
                  <li>Depart from <strong>{userLocation.name}</strong>.</li>
                  <li>Head towards nearest primary arterial road connecting to <strong>{selectedHospital.area}</strong>.</li>
                  <li>Follow Google Maps navigation to destination gate: <strong>{selectedHospital.landmark}</strong>.</li>
                </ol>
              </div>

              {/* Primary Actions: Open in Google Maps + Call + WhatsApp */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d btn-3d-primary"
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.925rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px var(--primary-glow)'
                  }}
                >
                  <Navigation size={18} />
                  <span>Start Turn-by-Turn Navigation (Google Maps)</span>
                  <ExternalLink size={14} />
                </a>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <a
                    href={`tel:${selectedHospital.phone}`}
                    className="btn-3d btn-3d-secondary"
                    style={{
                      padding: '10px',
                      fontSize: '0.825rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Phone size={14} color="var(--primary)" />
                    <span>Call Casualty Desk</span>
                  </a>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `🏥 *VERIFIED PET HOSPITAL DIRECTIONS*\n` +
                      `Hospital: ${selectedHospital.name}\n` +
                      `Type: ${selectedHospital.type}\n` +
                      `Address: ${selectedHospital.address}\n` +
                      `Landmark: ${selectedHospital.landmark}\n` +
                      `Casualty Phone: ${selectedHospital.phone}\n` +
                      `Distance: ${selectedHospital.distanceKm} km (~${selectedHospital.driveMinutes} mins drive)\n\n` +
                      `📍 Google Maps Directions: ${googleMapsDirectionsUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d btn-3d-secondary"
                    style={{
                      padding: '10px',
                      fontSize: '0.825rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: '#059669',
                      borderColor: 'rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          ) : activeCategory === 'ngos' && selectedNgo ? (
            /* Selected NGO Profile Card */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="badge badge-low" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={13} /> AWBI ACCREDITED RESCUE NGO
                  </span>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedNgo.ambulanceStatus === 'Available' ? 'var(--primary-light)' : 'var(--high-bg)',
                    color: selectedNgo.ambulanceStatus === 'Available' ? 'var(--primary)' : 'var(--high)',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    <span>Ambulance: {selectedNgo.ambulanceStatus}</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800, marginTop: '8px', lineHeight: 1.25 }}>
                  {selectedNgo.name}
                </h2>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '4px' }}>
                  🛡️ {selectedNgo.regNo}
                </div>
              </div>

              {/* Distance & Drive Time Highlight Pill */}
              <div style={{
                background: 'linear-gradient(135deg, var(--secondary-light) 0%, var(--bg-card-subtle) 100%)',
                border: '1.5px solid rgba(13, 148, 136, 0.25)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--secondary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Car size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {selectedNgo.distanceKm} km away
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Est. Drive Time: <strong>~{selectedNgo.driveMinutes} mins</strong> from your location
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedNgo.availableBeds} Free Kennels
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedNgo.fieldVanCount} Rescue Vans Active
                  </div>
                </div>
              </div>

              {/* Physical Location & Contact */}
              <div style={{
                background: 'var(--bg-card-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.84rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>HEADQUARTERS & SERVICE CORRIDOR:</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>📍 {selectedNgo.address}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Covered Zone: {selectedNgo.area}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>24/7 HELPLINE: </span>
                    <a href={`tel:${selectedNgo.helpline}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {selectedNgo.helpline}
                    </a>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>PHONE: </span>
                    <a href={`tel:${selectedNgo.phone}`} style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                      {selectedNgo.phone}
                    </a>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>⏰ Hours: {selectedNgo.operatingHours}</span>
                  <span>Lead: <strong>{selectedNgo.headVolunteer}</strong></span>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  RESCUE SPECIALTIES & WARD FACILITIES:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedNgo.specialties.map((spec, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      ✓ {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Actions: Navigation + Dispatch + WhatsApp */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <a
                  href={googleMapsNgoDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d btn-3d-primary"
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.925rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px var(--primary-glow)'
                  }}
                >
                  <Navigation size={18} />
                  <span>Start Turn-by-Turn Navigation to NGO (Google Maps)</span>
                  <ExternalLink size={14} />
                </a>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setDispatchAlertToast(`Emergency Dispatch sent to ${selectedNgo.name}! Volunteer coordinator ${selectedNgo.headVolunteer} alerted.`);
                      setTimeout(() => setDispatchAlertToast(null), 4500);
                    }}
                    className="btn-3d btn-3d-secondary"
                    style={{
                      padding: '10px',
                      fontSize: '0.825rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Send size={14} color="var(--primary)" />
                    <span>Dispatch Alert</span>
                  </button>

                  <a
                    href={`https://wa.me/${selectedNgo.helpline.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `🚨 *STRAY ANIMAL RESCUE REQUEST*\n` +
                      `To: ${selectedNgo.name}\n` +
                      `Nearest Location: ${userLocation.name} (${userLocation.lat}, ${userLocation.lng})\n` +
                      `Please check nearest ambulance dispatch.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d btn-3d-secondary"
                    style={{
                      padding: '10px',
                      fontSize: '0.825rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: '#059669',
                      borderColor: 'rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp NGO</span>
                  </a>
                </div>
              </div>

              {dispatchAlertToast && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'pageFadeIn 0.2s ease'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{dispatchAlertToast}</span>
                </div>
              )}

            </div>
          ) : activeCategory === 'cases' && selectedCase ? (
            /* Selected Incident Card */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img 
                  src={selectedCase.photoUrl} 
                  alt={selectedCase.animalType}
                  style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                  <span className={selectedCase.urgency === 'Emergency' ? 'badge badge-emergency' : selectedCase.urgency === 'High' ? 'badge badge-high' : 'badge badge-low'}>
                    {selectedCase.urgency} Urgency
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {selectedCase.aiPrediction}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
                    📍 {selectedCase.locationName}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-card-subtle)', 
                padding: '14px', 
                borderRadius: 'var(--radius-sm)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                fontSize: '0.85rem', 
                border: '1px solid var(--border-color)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Citizen Reporter:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedCase.reporterName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Rescue Org:</span>
                  <strong style={{ color: selectedCase.assignedNGO ? 'var(--primary)' : 'var(--high)' }}>
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

              {selectedCase.status === 'ngo_pending' && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    className="btn-3d btn-3d-primary"
                    onClick={() => onAcceptCase(selectedCase.id, 'CUPA (Compassion Unlimited Plus Action)', 'Kiran Gowda (Field Squad)')}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  >
                    <UserCheck size={16} />
                    <span>Dispatch Ambulance (CUPA Bangalore)</span>
                  </button>
                  <button 
                    className="btn-3d btn-3d-secondary"
                    onClick={() => onAcceptCase(selectedCase.id, 'People For Animals (PFA) Bengaluru', 'Chethan Kumar (Rescue Team)')}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}
                  >
                    <span>Dispatch Via PFA Kengeri</span>
                  </button>
                </div>
              )}

              {/* Direct Link to Google Maps for this Case */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedCase.coordinates.lat},${selectedCase.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d btn-3d-secondary"
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Navigation size={15} color="var(--primary)" />
                <span>Open Incident Coordinates in Google Maps</span>
              </a>

            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              Select any hospital, NGO, or incident marker on the map to view details.
            </div>
          )}

        </div>

      </div>

      {/* Dynamic Proximity Directory: Hospitals, NGOs, or Cases */}
      {activeCategory === 'hospitals' && (
        <section className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                Nearby Verified Pet Hospitals & Emergency Clinics
              </h2>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Sorted by proximity from your location ({userLocation.name})
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{hospitalsWithDistance.length}</strong> accredited centers
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {hospitalsWithDistance.map((hosp) => {
              const isSelected = selectedHospitalId === hosp.id;
              return (
                <Interactive3DCard 
                  key={hosp.id} 
                  maxTilt={10} 
                  scale={1.02} 
                  glare={true}
                  style={{ borderRadius: 'var(--radius-md)' }}
                  onClick={() => {
                    setActiveCategory('hospitals');
                    setSelectedHospitalId(hosp.id);
                  }}
                >
                  <div 
                    className="interactive-card" 
                    style={{
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      height: '100%',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 6px 18px var(--primary-glow)' : 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>
                        {hosp.name}
                      </h3>
                      <span className="badge badge-low" style={{ fontSize: '0.675rem', flexShrink: 0 }}>
                        {hosp.distanceKm} km
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                      📍 {hosp.area} • ~{hosp.driveMinutes} mins drive
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {hosp.address}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                      <Phone size={13} />
                      <span>{hosp.phone}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <Clock size={13} />
                      <span>{hosp.operatingHours}</span>
                    </div>

                    <div style={{ 
                      borderTop: '1px solid var(--border-color)', 
                      paddingTop: '10px', 
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--primary)'
                    }}>
                      <span>View Map & Route</span>
                      <Navigation size={14} />
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>
      )}

      {activeCategory === 'ngos' && (
        <section className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="var(--secondary)" />
                Nearby Verified Animal Rescue NGOs & Shelters
              </h2>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Connected rescue network sorted by distance from your location ({userLocation.name})
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{ngosWithDistance.length}</strong> active rescue organizations
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {ngosWithDistance.map((ngo) => {
              const isSelected = selectedNgoId === ngo.id;
              return (
                <Interactive3DCard 
                  key={ngo.id} 
                  maxTilt={10} 
                  scale={1.02} 
                  glare={true}
                  style={{ borderRadius: 'var(--radius-md)' }}
                  onClick={() => {
                    setActiveCategory('ngos');
                    setSelectedNgoId(ngo.id);
                  }}
                >
                  <div 
                    className="interactive-card" 
                    style={{
                      background: isSelected ? 'var(--secondary-light)' : 'var(--bg-card-subtle)',
                      border: isSelected ? '1.5px solid var(--secondary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      height: '100%',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 6px 18px rgba(13, 148, 136, 0.25)' : 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>
                        {ngo.name}
                      </h3>
                      <span className="badge badge-low" style={{ fontSize: '0.675rem', flexShrink: 0 }}>
                        {ngo.distanceKm} km
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      📍 {ngo.area} • ~{ngo.driveMinutes} mins drive
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {ngo.address}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        📞 {ngo.helpline}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        {ngo.availableBeds} Free Beds
                      </span>
                    </div>

                    <div style={{ 
                      borderTop: '1px solid var(--border-color)', 
                      paddingTop: '10px', 
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--secondary)'
                    }}>
                      <span>Ambulance: {ngo.ambulanceStatus}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>View Route</span>
                        <Navigation size={14} />
                      </div>
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>
      )}

      {activeCategory === 'cases' && (
        <section className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--primary)" />
                Active Stray Animal Incidents in Bengaluru
              </h2>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Field cases awaiting NGO response or volunteer transport
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredCases.length}</strong> reported incidents
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredCases.map((c) => {
              const isSelected = selectedCaseId === c.id;
              return (
                <Interactive3DCard 
                  key={c.id} 
                  maxTilt={10} 
                  scale={1.02} 
                  glare={true}
                  style={{ borderRadius: 'var(--radius-md)' }}
                  onClick={() => {
                    setActiveCategory('cases');
                    setSelectedCaseId(c.id);
                  }}
                >
                  <div 
                    className="interactive-card" 
                    style={{
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      height: '100%',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 6px 18px var(--primary-glow)' : 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <div>
                        <span className={c.urgency === 'Emergency' ? 'badge badge-emergency' : c.urgency === 'High' ? 'badge badge-high' : 'badge badge-low'} style={{ fontSize: '0.675rem' }}>
                          {c.urgency}
                        </span>
                        <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 800, marginTop: '4px' }}>
                          {c.aiPrediction}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {c.id}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                      📍 {c.locationName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span>Score: <strong>{c.priorityScore}/100</strong></span>
                      <span>{c.assignedNGO ? '✓ NGO Assigned' : '⏳ Pending'}</span>
                    </div>

                    <div style={{ 
                      borderTop: '1px solid var(--border-color)', 
                      paddingTop: '10px', 
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--primary)'
                    }}>
                      <span>Inspect on Map</span>
                      <Navigation size={14} />
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
