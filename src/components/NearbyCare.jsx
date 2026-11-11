import React, { useEffect, useState } from 'react';
import {
  Building2,
  Compass,
  ExternalLink,
  HeartHandshake,
  Home,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  Search,
  ShieldAlert,
  Stethoscope
} from 'lucide-react';

const METRO_REGIONS = [
  {
    city: 'Bengaluru',
    id: 'bangalore',
    defaultQuery: 'Bengaluru, Karnataka',
    localities: [
      { name: 'All Bengaluru', query: 'Bengaluru, Karnataka' },
      { name: 'Koramangala & HSR Layout', query: 'Koramangala HSR Layout, Bengaluru' },
      { name: 'Indiranagar & Domlur', query: 'Indiranagar, Bengaluru' },
      { name: 'Whitefield & Marathahalli', query: 'Whitefield, Bengaluru' },
      { name: 'Jayanagar & JP Nagar', query: 'Jayanagar, Bengaluru' },
      { name: 'Hebbal & Yelahanka', query: 'Hebbal, Bengaluru' },
      { name: 'Malleshwaram & Rajajinagar', query: 'Malleshwaram, Bengaluru' },
      { name: 'Electronic City & BTM', query: 'Electronic City, Bengaluru' },
      { name: 'Bellandur & Sarjapur Road', query: 'Bellandur, Bengaluru' },
    ]
  },
  {
    city: 'Mumbai',
    id: 'mumbai',
    defaultQuery: 'Mumbai, Maharashtra',
    localities: [
      { name: 'All Mumbai', query: 'Mumbai, Maharashtra' },
      { name: 'Bandra & Khar (West)', query: 'Bandra West, Mumbai' },
      { name: 'Andheri & Juhu', query: 'Andheri West, Mumbai' },
      { name: 'South Mumbai (Colaba, Fort)', query: 'South Mumbai, Maharashtra' },
      { name: 'Powai & Ghatkopar', query: 'Powai, Mumbai' },
      { name: 'Thane & Mulund', query: 'Thane, Maharashtra' },
      { name: 'Navi Mumbai', query: 'Navi Mumbai, Maharashtra' },
    ]
  },
  {
    city: 'Delhi NCR',
    id: 'delhi',
    defaultQuery: 'Delhi NCR',
    localities: [
      { name: 'All Delhi NCR', query: 'Delhi NCR' },
      { name: 'South Delhi (Hauz Khas, Saket)', query: 'South Delhi, Delhi' },
      { name: 'Gurugram (Gurgaon)', query: 'Gurugram, Haryana' },
      { name: 'Noida', query: 'Noida, Uttar Pradesh' },
      { name: 'Central Delhi', query: 'Central Delhi, Delhi' },
      { name: 'West Delhi', query: 'West Delhi, Delhi' },
    ]
  },
  {
    city: 'Hyderabad',
    id: 'hyderabad',
    defaultQuery: 'Hyderabad, Telangana',
    localities: [
      { name: 'All Hyderabad', query: 'Hyderabad, Telangana' },
      { name: 'Banjara Hills & Jubilee Hills', query: 'Banjara Hills, Hyderabad' },
      { name: 'Gachibowli & Hitec City', query: 'Gachibowli, Hyderabad' },
      { name: 'Madhapur & Kondapur', query: 'Madhapur, Hyderabad' },
      { name: 'Secunderabad', query: 'Secunderabad, Telangana' },
    ]
  },
  {
    city: 'Pune',
    id: 'pune',
    defaultQuery: 'Pune, Maharashtra',
    localities: [
      { name: 'All Pune', query: 'Pune, Maharashtra' },
      { name: 'Koregaon Park & Kalyani Nagar', query: 'Koregaon Park, Pune' },
      { name: 'Kothrud & Baner', query: 'Kothrud, Pune' },
      { name: 'Viman Nagar & Hadapsar', query: 'Viman Nagar, Pune' },
      { name: 'Wakad & Hinjewadi', query: 'Wakad, Pune' },
    ]
  },
  {
    city: 'Chennai',
    id: 'chennai',
    defaultQuery: 'Chennai, Tamil Nadu',
    localities: [
      { name: 'All Chennai', query: 'Chennai, Tamil Nadu' },
      { name: 'Adyar & Besant Nagar', query: 'Adyar, Chennai' },
      { name: 'Anna Nagar & Kilpauk', query: 'Anna Nagar, Chennai' },
      { name: 'T Nagar & Nungambakkam', query: 'T Nagar, Chennai' },
      { name: 'Velachery & OMR', query: 'Velachery, Chennai' },
    ]
  },
  {
    city: 'Kolkata',
    id: 'kolkata',
    defaultQuery: 'Kolkata, West Bengal',
    localities: [
      { name: 'All Kolkata', query: 'Kolkata, West Bengal' },
      { name: 'Salt Lake & New Town', query: 'Salt Lake, Kolkata' },
      { name: 'South Kolkata (Ballygunge, Alipore)', query: 'Ballygunge, Kolkata' },
      { name: 'Park Street & Central', query: 'Park Street, Kolkata' },
    ]
  }
];

const SERVICE_CATEGORIES = [
  {
    id: 'daycare',
    title: 'Pet Day Care & Boarding',
    subtitle: 'Daily sitting, boarding kennels, and supervision',
    icon: Home,
    keyword: 'pet day care boarding dog creche'
  },
  {
    id: 'hospital',
    title: 'Pet Hospitals & Clinics',
    subtitle: 'Veterinary medicine, outpatient checkups, and diagnostic labs',
    icon: Building2,
    keyword: 'veterinary clinic pet hospital animal clinic'
  },
  {
    id: 'ngo',
    title: 'Animal Welfare NGOs',
    subtitle: 'Rescue organizations, community animal welfare, and ambulance teams',
    icon: HeartHandshake,
    keyword: 'animal rescue NGO stray welfare animal charity'
  },
  {
    id: 'shelter',
    title: 'Pet Shelters & Sanctuaries',
    subtitle: 'Adoption shelters, rescue kennels, and rehabilitation sanctuaries',
    icon: Compass,
    keyword: 'animal shelter pet adoption rescue shelter'
  },
  {
    id: 'emergency',
    title: '24/7 Emergency Veterinary Care',
    subtitle: 'Round-the-clock emergency casualty, trauma triage, and critical ICU',
    icon: ShieldAlert,
    keyword: '24 hours emergency pet hospital veterinary casualty'
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
  const [selectedCityId, setSelectedCityId] = useState('bangalore');
  const [selectedLocalityQuery, setSelectedLocalityQuery] = useState(METRO_REGIONS[0].localities[0].query);
  const [selectedLocalityName, setSelectedLocalityName] = useState(METRO_REGIONS[0].localities[0].name);
  const [customSearch, setCustomSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('daycare');
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Auto-detect GPS location on initial load if supported
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setUserCoords({ lat, lng });
        setSelectedLocalityQuery(`${lat},${lng}`);
        setSelectedLocalityName('Current Location');
        setStatusText(`Location acquired (${lat}, ${lng})`);
      },
      () => {
        // Fall back to city selection cleanly without warning
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setStatusText('Location services are not available in this browser.');
      return;
    }
    setIsLocating(true);
    setStatusText('Locating your position…');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setUserCoords({ lat, lng });
        setSelectedLocalityQuery(`${lat},${lng}`);
        setSelectedLocalityName('Current Location');
        setStatusText(`Centered on your position (${lat}, ${lng})`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setStatusText(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was declined. Select a locality from the dropdown.'
            : 'Could not obtain location. Select your city below.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    const region = METRO_REGIONS.find((r) => r.id === cityId);
    if (region && region.localities.length > 0) {
      setSelectedLocalityQuery(region.localities[0].query);
      setSelectedLocalityName(region.localities[0].name);
      setStatusText(`Selected city: ${region.city}`);
    }
  };

  const handleLocalityChange = (locQuery, locName) => {
    setSelectedLocalityQuery(locQuery);
    setSelectedLocalityName(locName);
    setStatusText(`Selected locality: ${locName}`);
  };

  const handleCustomSearch = (e) => {
    e.preventDefault();
    const query = customSearch.trim();
    if (!query) return;
    setSelectedLocalityQuery(query);
    setSelectedLocalityName(query);
    setStatusText(`Searching for: ${query}`);
  };

  const activeCategoryObj =
    SERVICE_CATEGORIES.find((c) => c.id === activeCategory) || SERVICE_CATEGORIES[0];

  // Active query passed to Google Maps
  const mapSearchQuery = `${activeCategoryObj.keyword} in ${selectedLocalityQuery}`;
  const googleMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&z=14&output=embed`;

  // Real turn-by-turn navigation URL for Google Maps
  const getDirectionsUrl = (keyword, mode = 'driving') => {
    const originParam = userCoords ? `${userCoords.lat},${userCoords.lng}` : encodeURIComponent(selectedLocalityQuery);
    const destParam = encodeURIComponent(`${keyword} near ${selectedLocalityQuery}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=${mode}`;
  };

  const getSearchUrl = (keyword) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${keyword} near ${selectedLocalityQuery}`)}`;
  };

  const activeRegion = METRO_REGIONS.find((r) => r.id === selectedCityId) || METRO_REGIONS[0];

  return (
    <section className="page-wrap content-page nearby-page" aria-labelledby="nearby-care-heading">
      <header className="page-intro page-intro-left" style={{ marginBottom: '24px' }}>
        <span className="eyebrow">DIRECTORY & NAVIGATION</span>
        <h1 id="nearby-care-heading">Find nearby animal care</h1>
        <p>
          Locate pet hospitals, day care centers, rescue NGOs, and shelters near you with turn-by-turn directions powered directly by Google Maps.
        </p>
      </header>

      {/* Location and Search Controls */}
      <div className="panel" style={{ padding: '20px', marginBottom: '20px', borderRadius: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="nearby-city-select" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
              City
            </label>
            <select
              id="nearby-city-select"
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              style={{
                width: '100%',
                minHeight: '42px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff',
                fontSize: '13.5px',
                color: '#0f172a'
              }}
            >
              {METRO_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.city}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nearby-locality-select" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
              Locality
            </label>
            <select
              id="nearby-locality-select"
              value={selectedLocalityQuery}
              onChange={(e) => {
                const loc = activeRegion.localities.find((l) => l.query === e.target.value);
                handleLocalityChange(e.target.value, loc ? loc.name : e.target.value);
              }}
              style={{
                width: '100%',
                minHeight: '42px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff',
                fontSize: '13.5px',
                color: '#0f172a'
              }}
            >
              {activeRegion.localities.map((loc) => (
                <option key={loc.query} value={loc.query}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleLocateMe}
              disabled={isLocating}
              style={{ flex: 1, minHeight: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <LocateFixed size={16} aria-hidden="true" />
              {isLocating ? 'Locating…' : 'Current location'}
            </button>
          </div>
        </div>

        {/* Custom area search fallback */}
        <form onSubmit={handleCustomSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
          <input
            type="text"
            value={customSearch}
            onChange={(e) => setCustomSearch(e.target.value)}
            placeholder="Or search any custom neighborhood or city…"
            style={{
              flex: '1 1 200px',
              minWidth: 0,
              minHeight: '42px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: '#fff',
              fontSize: '13.5px'
            }}
          />
          <button
            type="submit"
            className="button button-secondary"
            style={{ minHeight: '42px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Search size={15} aria-hidden="true" /> Search
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={13} color="var(--brand)" /> Active Area: <strong style={{ color: '#0f172a' }}>{selectedLocalityName}</strong>
          </span>
          {statusText && <span>{statusText}</span>}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="nearby-toolbar" style={{ margin: '0 0 16px' }}>
        <div className="nearby-filters" role="tablist" aria-label="Care categories">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Google Map on top, followed by structured facility directory */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Google Map Viewer */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{
            padding: '12px 16px',
            background: '#fafafa',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12.5px',
            color: '#475569'
          }}>
            <span>
              Google Maps &bull; <strong>{activeCategoryObj.title}</strong> near {selectedLocalityName}
            </span>
            <a
              href={getSearchUrl(activeCategoryObj.keyword)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--brand-dark)', fontWeight: 600 }}
            >
              Open in Google Maps <ExternalLink size={13} />
            </a>
          </div>

          <div className="nearby-gmap-frame">
            <iframe
              key={`${mapSearchQuery}`}
              title="Google Maps Care Center Finder"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              allow="geolocation"
              referrerPolicy="no-referrer-when-downgrade"
              src={googleMapEmbedUrl}
            />
          </div>
        </div>

        {/* Structured Service Directory (Ordered: Day Care -> Pet Hospitals -> NGOs -> Shelters -> 24/7 ER) */}
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Available Services in {selectedLocalityName}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Real-time care providers verified via Google Maps. Tap Directions to begin turn-by-turn navigation.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {SERVICE_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = activeCategory === cat.id;
              const driveUrl = getDirectionsUrl(cat.keyword, 'driving');
              const searchUrl = getSearchUrl(cat.keyword);

              return (
                <article
                  key={cat.id}
                  className="panel nearby-service-card"
                  style={{
                    padding: '18px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid var(--brand)' : '1px solid var(--border)',
                    background: isSelected ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: 0 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--brand-soft)' : '#f1f5f9',
                      color: isSelected ? 'var(--brand)' : '#475569',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={18} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                        {cat.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="nearby-service-actions">
                    <a
                      href={driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-primary"
                      style={{ padding: '7px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Navigation size={14} /> Turn-by-turn directions
                    </a>
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-secondary"
                      style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <ExternalLink size={13} /> View on Google Maps
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Case report email draft if user has report in state */}
      {report && (
        <div className="panel" style={{ marginTop: '20px', padding: '18px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>
              Active Case Report: {report.id}
            </strong>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              {report.animal || 'Animal'} observed at {report.location || 'Report location'}.
            </span>
          </div>
          <a
            href={createEmailDraft(report)}
            className="button button-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <Mail size={14} /> Draft email to care center
          </a>
        </div>
      )}

      {/* Professional clinical note */}
      <footer style={{ marginTop: '24px', padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Stethoscope size={15} color="var(--brand)" style={{ flexShrink: 0 }} />
        <span>
          Facility details, hours, and navigation are queried live via Google Maps. For severe trauma or poisoning, call the veterinary facility while in transit.
        </span>
      </footer>
    </section>
  );
}
