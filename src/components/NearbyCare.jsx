import React, { useEffect, useState } from 'react';
import {
  Car,
  ExternalLink,
  HeartHandshake,
  Home,
  Layers,
  LocateFixed,
  Mail,
  MapPin,
  Minus,
  Navigation,
  PhoneCall,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

// Comprehensive Metropolitan City & Locality Directory
const CITIES_AND_LOCALITIES = [
  {
    city: 'Bengaluru (Bangalore)',
    id: 'bangalore',
    defaultQuery: 'Bengaluru, Karnataka',
    localities: [
      { name: 'All Bengaluru (Entire City)', query: 'Bengaluru, Karnataka' },
      { name: 'Koramangala & HSR Layout', query: 'Koramangala HSR Layout Bengaluru' },
      { name: 'Indiranagar & Domlur', query: 'Indiranagar Domlur Bengaluru' },
      { name: 'Whitefield & Marathahalli', query: 'Whitefield Marathahalli Bengaluru' },
      { name: 'Jayanagar & JP Nagar', query: 'Jayanagar JP Nagar Bengaluru' },
      { name: 'Hebbal & Yelahanka', query: 'Hebbal Yelahanka Bengaluru' },
      { name: 'Malleshwaram & Rajajinagar', query: 'Malleshwaram Rajajinagar Bengaluru' },
      { name: 'Electronic City & BTM', query: 'Electronic City BTM Layout Bengaluru' },
      { name: 'Bellandur & Sarjapur Road', query: 'Bellandur Sarjapur Road Bengaluru' },
      { name: 'Kengeri & Mysore Road', query: 'Kengeri Mysore Road Bengaluru' },
    ]
  },
  {
    city: 'Mumbai',
    id: 'mumbai',
    defaultQuery: 'Mumbai, Maharashtra',
    localities: [
      { name: 'All Mumbai (Entire City)', query: 'Mumbai, Maharashtra' },
      { name: 'Bandra & Khar (West)', query: 'Bandra West Khar Mumbai' },
      { name: 'Andheri & Juhu', query: 'Andheri West Juhu Mumbai' },
      { name: 'South Mumbai (Colaba, Fort)', query: 'Colaba Fort South Mumbai' },
      { name: 'Powai & Ghatkopar', query: 'Powai Ghatkopar Mumbai' },
      { name: 'Thane & Mulund', query: 'Thane Mulund Mumbai' },
      { name: 'Navi Mumbai (Vashi, Nerul)', query: 'Vashi Nerul Navi Mumbai' },
      { name: 'Borivali & Kandivali', query: 'Borivali Kandivali Mumbai' },
      { name: 'Dadar & Prabhadevi', query: 'Dadar Prabhadevi Mumbai' },
    ]
  },
  {
    city: 'Delhi NCR',
    id: 'delhi',
    defaultQuery: 'Delhi NCR',
    localities: [
      { name: 'All Delhi NCR (Entire Region)', query: 'Delhi NCR' },
      { name: 'South Delhi (Hauz Khas, Saket)', query: 'Hauz Khas Saket South Delhi' },
      { name: 'Gurgaon / Gurugram', query: 'Cyber City Sector 29 Gurgaon' },
      { name: 'Noida & Greater Noida', query: 'Sector 18 Sector 62 Noida' },
      { name: 'Central Delhi (Connaught Place)', query: 'Connaught Place New Delhi' },
      { name: 'West Delhi (Rajouri Garden, Janakpuri)', query: 'Rajouri Garden Janakpuri West Delhi' },
      { name: 'North Delhi (Civil Lines, Rohini)', query: 'Civil Lines Rohini North Delhi' },
      { name: 'East Delhi & Ghaziabad', query: 'Mayur Vihar Ghaziabad Delhi' },
    ]
  },
  {
    city: 'Hyderabad',
    id: 'hyderabad',
    defaultQuery: 'Hyderabad, Telangana',
    localities: [
      { name: 'All Hyderabad (Entire City)', query: 'Hyderabad, Telangana' },
      { name: 'Banjara Hills & Jubilee Hills', query: 'Banjara Hills Jubilee Hills Hyderabad' },
      { name: 'Gachibowli & Hitec City', query: 'Gachibowli Hitec City Hyderabad' },
      { name: 'Madhapur & Kondapur', query: 'Madhapur Kondapur Hyderabad' },
      { name: 'Secunderabad', query: 'Secunderabad Telangana' },
      { name: 'Kukatpally & Miyapur', query: 'Kukatpally Miyapur Hyderabad' },
      { name: 'Begumpet & Somajiguda', query: 'Begumpet Somajiguda Hyderabad' },
    ]
  },
  {
    city: 'Pune',
    id: 'pune',
    defaultQuery: 'Pune, Maharashtra',
    localities: [
      { name: 'All Pune (Entire City)', query: 'Pune, Maharashtra' },
      { name: 'Koregaon Park & Kalyani Nagar', query: 'Koregaon Park Kalyani Nagar Pune' },
      { name: 'Kothrud & Baner', query: 'Kothrud Baner Pune' },
      { name: 'Viman Nagar & Hadapsar', query: 'Viman Nagar Hadapsar Pune' },
      { name: 'Wakad & Hinjewadi', query: 'Wakad Hinjewadi Pune' },
      { name: 'Aundh & Pashan', query: 'Aundh Pashan Pune' },
      { name: 'Camp & Swargate', query: 'Camp Swargate Pune' },
    ]
  },
  {
    city: 'Chennai',
    id: 'chennai',
    defaultQuery: 'Chennai, Tamil Nadu',
    localities: [
      { name: 'All Chennai (Entire City)', query: 'Chennai, Tamil Nadu' },
      { name: 'Adyar & Besant Nagar', query: 'Adyar Besant Nagar Chennai' },
      { name: 'Anna Nagar & Kilpauk', query: 'Anna Nagar Kilpauk Chennai' },
      { name: 'T Nagar & Nungambakkam', query: 'T Nagar Nungambakkam Chennai' },
      { name: 'Velachery & OMR IT Corridor', query: 'Velachery OMR Chennai' },
      { name: 'Mylapore & Alwarpet', query: 'Mylapore Alwarpet Chennai' },
      { name: 'Porur & Guindy', query: 'Porur Guindy Chennai' },
    ]
  },
  {
    city: 'Kolkata',
    id: 'kolkata',
    defaultQuery: 'Kolkata, West Bengal',
    localities: [
      { name: 'All Kolkata (Entire City)', query: 'Kolkata, West Bengal' },
      { name: 'Salt Lake & New Town', query: 'Salt Lake New Town Kolkata' },
      { name: 'South Kolkata (Ballygunge, Alipore)', query: 'Ballygunge Alipore South Kolkata' },
      { name: 'Park Street & Central Kolkata', query: 'Park Street Kolkata' },
      { name: 'North Kolkata (Shyambazar, Dum Dum)', query: 'Shyambazar Dum Dum Kolkata' },
      { name: 'Behala & Jadavpur', query: 'Behala Jadavpur Kolkata' },
    ]
  }
];

// Care Categories strictly ordered as requested:
// 1. Day Care Centers -> 2. Pet Hospitals -> 3. NGOs -> 4. Pet Shelters -> 5. 24/7 Emergency
const CARE_CATEGORIES = [
  {
    id: 'daycare',
    label: '🏡 Day Care Centers',
    badge: 'DAY CARE & BOARDING',
    icon: Home,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    googleKeyword: 'pet day care boarding dog day care pet crèche',
    headline: 'Nearby Pet Day Care & Boarding Centers',
    desc: 'Day care facilities, dog boarding, puppy socialization, and daily pet supervision centers.'
  },
  {
    id: 'hospital',
    label: '🏥 Pet Hospitals',
    badge: 'VETERINARY CLINICS & HOSPITALS',
    icon: Stethoscope,
    color: '#059669',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    googleKeyword: 'pet hospital veterinary clinic animal hospital',
    headline: 'Nearby Pet Hospitals & Veterinary Care',
    desc: 'General veterinary medicine, outpatient triage, skin scrapings, vaccines, and consultations.'
  },
  {
    id: 'ngo',
    label: '🤝 Animal Welfare NGOs',
    badge: 'RESCUE NGOS & VOLUNTEERS',
    icon: HeartHandshake,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    googleKeyword: 'animal rescue NGO stray dog welfare animal charity',
    headline: 'Animal Welfare NGOs & Rescue Organizations',
    desc: 'Registered stray rescue foundations, animal rights charities, and community ambulance teams.'
  },
  {
    id: 'shelter',
    label: '🐾 Pet Shelters',
    badge: 'ANIMAL SHELTERS & SANCTUARIES',
    icon: MapPin,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    googleKeyword: 'pet shelter animal shelter stray sanctuary animal rescue home',
    headline: 'Nearby Pet Shelters & Animal Sanctuaries',
    desc: 'Adoption kennels, permanent sanctuaries for abandoned pets, and temporary foster centers.'
  },
  {
    id: 'emergency',
    label: '🚨 24/7 Emergency Care',
    badge: 'CRITICAL TRAUMA & CASUALTY',
    icon: PhoneCall,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    googleKeyword: '24 hours emergency pet hospital veterinary casualty trauma ICU',
    headline: '24/7 Emergency Veterinary Hospitals',
    desc: 'Round-the-clock emergency casualty wards, trauma surgeries, snake bite care, and critical ICUs.'
  }
];

function createEmailDraft(report, recipient = '') {
  const subject = `Animal care report reference ${report.id || ''}`.trim();
  const body = [
    'Hello Care Team,',
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
  // Locality & City Selection States
  const [selectedCityId, setSelectedCityId] = useState('bangalore');
  const [selectedLocalityQuery, setSelectedLocalityQuery] = useState(CITIES_AND_LOCALITIES[0].localities[0].query);
  const [selectedLocalityName, setSelectedLocalityName] = useState(CITIES_AND_LOCALITIES[0].localities[0].name);
  const [customSearch, setCustomSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('daycare');

  // Customer GPS coordinates
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Ready to locate.');

  // Google Map View & Zoom Controls
  const [zoomLevel, setZoomLevel] = useState(14);
  const [mapMode, setMapMode] = useState('m'); // 'm' for standard roadmap, 'k' for satellite

  // Turn-by-Turn navigation travel mode
  const [travelMode, setTravelMode] = useState('driving'); // 'driving', 'walking', 'transit'

  // Auto-detect GPS coordinates on initial mount
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setUserCoords({ lat, lng });
        setSelectedLocalityQuery(`${lat},${lng}`);
        setSelectedLocalityName(`Live GPS Location (${lat}, ${lng})`);
        setLocationStatus(`📍 Live GPS position acquired: ${lat}, ${lng}`);
      },
      () => {
        setLocationStatus('Showing selected city locality. Tap "Use My Live GPS" to switch to device location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const handleUseGps = () => {
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
        setUserCoords({ lat, lng });
        setSelectedLocalityQuery(`${lat},${lng}`);
        setSelectedLocalityName(`Live GPS Location (${lat}, ${lng})`);
        setZoomLevel(15);
        setLocationStatus(`📍 GPS locked: ${lat}, ${lng}. Google Map centered on your position.`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(
          err.code === err.PERMISSION_DENIED
            ? 'GPS permission denied. Please select your city or locality from the dropdown.'
            : 'Could not acquire GPS fix. Please select your city below.'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    const cityObj = CITIES_AND_LOCALITIES.find(c => c.id === cityId);
    if (cityObj && cityObj.localities.length > 0) {
      setSelectedLocalityQuery(cityObj.localities[0].query);
      setSelectedLocalityName(cityObj.localities[0].name);
      setLocationStatus(`Selected city: ${cityObj.city}`);
    }
  };

  const handleLocalityChange = (locQuery, locName) => {
    setSelectedLocalityQuery(locQuery);
    setSelectedLocalityName(locName);
    setLocationStatus(`Selected locality: ${locName}`);
  };

  const handleCustomSearchSubmit = (e) => {
    e.preventDefault();
    const query = customSearch.trim();
    if (!query) return;
    setSelectedLocalityQuery(query);
    setSelectedLocalityName(query);
    setLocationStatus(`Searching Google Maps for: "${query}"`);
  };

  // Zoom control handlers for Google Map
  const zoomIn = () => setZoomLevel(z => Math.min(z + 1, 19));
  const zoomOut = () => setZoomLevel(z => Math.max(z - 1, 9));
  const resetZoom = () => setZoomLevel(14);
  const toggleMapMode = () => setMapMode(m => m === 'm' ? 'k' : 'm');

  const activeCategoryObj = CARE_CATEGORIES.find(c => c.id === activeCategory) || CARE_CATEGORIES[0];

  // Active query for Google Maps embed and links
  const targetLocation = selectedLocalityQuery;
  const embeddedMapQuery = `${activeCategoryObj.googleKeyword} near ${targetLocation}`;

  // Embedded Google Map URL with explicit zoomLevel and mapMode (m = roadmap, k = satellite)
  const googleMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(embeddedMapQuery)}&t=${mapMode}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  // Turn-by-Turn GPS navigation link generator
  const getTurnByTurnUrl = (destinationKeyword, mode = travelMode) => {
    const originParam = userCoords ? `${userCoords.lat},${userCoords.lng}` : encodeURIComponent(targetLocation);
    const destParam = encodeURIComponent(`${destinationKeyword} near ${targetLocation}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=${mode}`;
  };

  // Direct Live Google Maps Search URL
  const getGoogleSearchUrl = (keyword) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${keyword} near ${targetLocation}`)}`;
  };

  const activeCity = CITIES_AND_LOCALITIES.find(c => c.id === selectedCityId) || CITIES_AND_LOCALITIES[0];

  return (
    <section className="page-wrap content-page nearby-page" aria-labelledby="nearby-care-title">
      <header className="page-intro">
        <span className="eyebrow">GOOGLE MAPS LIVE ANIMAL CARE DIRECTORY</span>
        <h1 id="nearby-care-title">Find nearby animal care</h1>
        <p>
          Live Google Maps directory for pet day care centers, pet hospitals, animal welfare NGOs, and pet shelters with real-time GPS turn-by-turn navigation.
        </p>
      </header>

      {/* City & Locality Selector Bar */}
      <div className="nearby-search-panel panel" style={{ gap: '14px' }}>
        <div className="notice-box">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>
            <strong>Official Google Maps Source:</strong> Select your city and locality below or use your live GPS location. All facilities, directions, and reviews are loaded directly from Google without mock or fake data.
          </p>
        </div>

        {/* City and Locality Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', width: '100%' }}>
          <div>
            <label htmlFor="city-select" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
              Select City:
            </label>
            <select
              id="city-select"
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--border)',
                background: '#fff',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#0f172a'
              }}
            >
              {CITIES_AND_LOCALITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.city}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="locality-select" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
              Select Locality / Area:
            </label>
            <select
              id="locality-select"
              value={selectedLocalityQuery}
              onChange={(e) => {
                const loc = activeCity.localities.find(l => l.query === e.target.value);
                handleLocalityChange(e.target.value, loc ? loc.name : e.target.value);
              }}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--border)',
                background: '#fff',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#0f172a'
              }}
            >
              {activeCity.localities.map((loc) => (
                <option key={loc.query} value={loc.query}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GPS Button & Custom Search Input */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', alignItems: 'center' }}>
          <button
            type="button"
            className="button button-primary"
            onClick={handleUseGps}
            disabled={isLocating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '42px' }}
          >
            <LocateFixed size={17} aria-hidden="true" />
            {isLocating ? 'Locating GPS…' : 'Use My Live GPS Location'}
          </button>

          <form onSubmit={handleCustomSearchSubmit} style={{ display: 'flex', flex: '1 1 280px', gap: '8px' }}>
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="Or type any other city or area (e.g. Chandigarh, Jaipur)"
              style={{
                flex: 1,
                minHeight: '42px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff',
                fontSize: '13px'
              }}
            />
            <button
              type="submit"
              className="button button-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={15} aria-hidden="true" /> Search
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={14} color="var(--brand)" /> Active Locality: <strong>{selectedLocalityName}</strong>
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {locationStatus}
          </span>
        </div>
      </div>

      {/* Prominent Turn-by-Turn GPS Navigation Console */}
      <div className="panel" style={{
        margin: '18px 0',
        padding: '20px',
        border: '1.5px solid #059669',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#059669', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <Navigation size={20} />
            </span>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                GOOGLE MAPS GPS ROUTING
              </span>
              <h2 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Turn-by-Turn GPS Navigation
              </h2>
            </div>
          </div>

          {/* Travel Mode Selector */}
          <div style={{ display: 'flex', gap: '6px', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
            {[
              { id: 'driving', label: '🚗 Drive' },
              { id: 'walking', label: '🚶 Walk' },
              { id: 'transit', label: '🚌 Transit' }
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setTravelMode(m.id)}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: travelMode === m.id ? '#059669' : 'transparent',
                  color: travelMode === m.id ? '#fff' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 14px 0' }}>
          Tap any destination below to launch Google Maps with live voice-guided turn-by-turn navigation from your location in {selectedLocalityName}:
        </p>

        {/* 5 Instant Turn-by-Turn Launchers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <a
            href={getTurnByTurnUrl('pet day care boarding center')}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '12.5px', color: '#0284c7', borderColor: '#bae6fd' }}
          >
            <Car size={15} /> Nav to Day Care ↗
          </a>
          <a
            href={getTurnByTurnUrl('pet hospital veterinary clinic')}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '12.5px', color: '#059669', borderColor: '#bbf7d0' }}
          >
            <Car size={15} /> Nav to Pet Hospital ↗
          </a>
          <a
            href={getTurnByTurnUrl('animal welfare NGO rescue')}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '12.5px', color: '#ea580c', borderColor: '#fed7aa' }}
          >
            <Car size={15} /> Nav to Rescue NGO ↗
          </a>
          <a
            href={getTurnByTurnUrl('pet shelter animal shelter')}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '12.5px', color: '#d97706', borderColor: '#fde68a' }}
          >
            <Car size={15} /> Nav to Pet Shelter ↗
          </a>
          <a
            href={getTurnByTurnUrl('24 hours emergency pet hospital')}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '12.5px', background: '#dc2626' }}
          >
            <Navigation size={15} /> Nav to 24/7 ER ↗
          </a>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="nearby-toolbar" style={{ margin: '18px 0 12px' }}>
        <div className="nearby-filters" role="tablist" aria-label="Care categories">
          {CARE_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                borderColor: activeCategory === cat.id ? cat.color : undefined,
                color: activeCategory === cat.id ? cat.color : undefined
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <span className="record-count" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Showing: <strong>{activeCategoryObj.badge}</strong>
        </span>
      </div>

      {/* Interactive Google Map with Real Zoom In / Zoom Out Controls */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden', borderRadius: '14px', position: 'relative', border: '1.5px solid var(--border)' }}>
        {/* Floating Google Map Interactive Controls */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          padding: '6px',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          border: '1px solid #cbd5e1'
        }}>
          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={zoomIn}
            title="Zoom In"
            aria-label="Zoom in Google Map"
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              color: '#0f172a',
              fontWeight: 800
            }}
          >
            <Plus size={18} />
          </button>

          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={zoomOut}
            title="Zoom Out"
            aria-label="Zoom out Google Map"
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              color: '#0f172a',
              fontWeight: 800
            }}
          >
            <Minus size={18} />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={resetZoom}
            title="Reset Zoom (Level 14)"
            aria-label="Reset zoom level"
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              color: '#475569'
            }}
          >
            <RotateCcw size={15} />
          </button>

          {/* Satellite Toggle */}
          <button
            type="button"
            onClick={toggleMapMode}
            title={mapMode === 'm' ? 'Switch to Satellite View' : 'Switch to Street Map'}
            aria-label="Toggle map satellite view"
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: mapMode === 'k' ? '#0f766e' : '#fff',
              color: mapMode === 'k' ? '#fff' : '#0f766e',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Layers size={16} />
          </button>
        </div>

        {/* Map Header Status Banner */}
        <div style={{
          padding: '10px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12px'
        }}>
          <span style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Official Google Map View — {activeCategoryObj.label} in {selectedLocalityName}
          </span>
          <span style={{ color: '#64748b' }}>
            Zoom Level: <strong>{zoomLevel}x</strong> ({mapMode === 'k' ? 'Satellite' : 'Roadmap'})
          </span>
        </div>

        {/* Embedded Google Map */}
        <div style={{ height: '480px', width: '100%', background: '#e2e8f0' }}>
          <iframe
            key={`${embeddedMapQuery}-${zoomLevel}-${mapMode}`}
            title="Google Maps Care Center Locator"
            width="100%"
            height="100%"
            style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
            loading="lazy"
            allow="geolocation; fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
            src={googleMapEmbedUrl}
          />
        </div>
      </div>

      {/* Categorized Care Facilities List (Day Care -> Pet Hospitals -> NGOs -> Shelters -> 24/7 ER) */}
      <div style={{ marginTop: '28px' }}>
        <div className="home-section-heading" style={{ marginBottom: '16px' }}>
          <div>
            <span className="home-section-label">GOOGLE MAPS VERIFIED DIRECTORY</span>
            <h2>Care Centers in {selectedLocalityName}</h2>
          </div>
          <p>
            Real-time verified listings taken directly from Google source for {activeCity.city}. Select any facility to get turn-by-turn navigation or view live reviews.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {CARE_CATEGORIES.map((cat, idx) => {
            const IconComponent = cat.icon;
            const searchUrl = getGoogleSearchUrl(cat.googleKeyword);
            const driveNavUrl = getTurnByTurnUrl(cat.googleKeyword, 'driving');
            const walkNavUrl = getTurnByTurnUrl(cat.googleKeyword, 'walking');

            return (
              <article
                key={cat.id}
                className="panel nearby-place-card"
                style={{
                  borderLeft: `5px solid ${cat.color}`,
                  padding: '20px',
                  background: activeCategory === cat.id ? '#ffffff' : '#fafafa',
                  boxShadow: activeCategory === cat.id ? 'var(--shadow-3d-card)' : 'none'
                }}
              >
                <div className="nearby-card-heading">
                  <span
                    className="nearby-type-icon"
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    <IconComponent size={20} />
                  </span>
                  <div>
                    <span className="panel-kicker" style={{ color: cat.color }}>
                      PRIORITY #{idx + 1} · {cat.badge}
                    </span>
                    <h2>{cat.headline}</h2>
                  </div>
                </div>

                <p className="nearby-address" style={{ marginTop: '8px' }}>
                  {cat.desc}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: cat.bg,
                  fontSize: '12px',
                  color: cat.color,
                  fontWeight: 600
                }}>
                  <MapPin size={14} /> Showing results in <strong>{selectedLocalityName}</strong>
                </div>

                <div className="nearby-contact-links" style={{ marginTop: '14px', gap: '10px' }}>
                  <a
                    href={driveNavUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-primary"
                    style={{
                      background: cat.color,
                      borderColor: cat.color,
                      color: '#ffffff',
                      padding: '8px 14px',
                      fontSize: '12px'
                    }}
                  >
                    <Navigation size={14} /> Turn-by-Turn GPS Directions ↗
                  </a>

                  <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-secondary"
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    <ExternalLink size={14} /> View All on Google Maps ↗
                  </a>

                  <a
                    href={walkNavUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#475569' }}
                  >
                    🚶 Walking Route
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Case Report Sharing Card (if user has active draft report) */}
      {report && (
        <article className="panel nearby-place-card" style={{ marginTop: '20px', borderLeft: '5px solid #0284c7' }}>
          <div className="nearby-card-heading">
            <span className="nearby-type-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Mail size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="panel-kicker" style={{ color: '#0284c7' }}>ACTIVE CASE REPORT READY</span>
              <h2>Share Report #{report.id} With Google Care Provider</h2>
            </div>
          </div>
          <p className="nearby-address">
            Your observations ({report.animal || 'Animal'}, {report.location || 'Location'}) are prepared. Click below to draft an email directly to your chosen clinic from Google Maps.
          </p>
          <div className="nearby-contact-links">
            <a href={createEmailDraft(report)} className="button button-secondary" style={{ padding: '8px 14px' }}>
              <Mail size={14} aria-hidden="true" /> Compose Report Email
            </a>
          </div>
        </article>
      )}

      {/* Clinical Guidance Footnote */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.85)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '12px', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--brand-dark)', marginBottom: '4px' }}>
          <Stethoscope size={15} /> Emergency Note
        </span>
        All facility details and directions are loaded in real-time from the official Google Maps directory. For critical emergencies, call ahead while en route so veterinary casualty staff can prepare resuscitation equipment.
      </div>
    </section>
  );
}
