import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  HeartHandshake,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Pet Care', query: 'veterinary clinic animal hospital animal shelter' },
  { id: 'hospitals', label: 'Veterinary Hospitals', query: 'veterinary hospital pet clinic' },
  { id: 'emergency', label: '24/7 Emergency Care', query: '24 hours emergency veterinary pet hospital' },
  { id: 'shelters', label: 'Animal Shelters & Rescues', query: 'animal shelter pet rescue NGO' },
  { id: 'pharmacy', label: 'Pet Pharmacy & Diagnostics', query: 'veterinary pharmacy animal medical lab' }
];

function createEmailDraft(report, recipient = '') {
  const subject = `Animal welfare report ${report.id || ''}`.trim();
  const body = [
    'Hello Veterinary Team,',
    '',
    'I would like to share an animal care observation for your review.',
    '',
    `Report reference: ${report.id || 'Local report'}`,
    `Animal: ${report.animal || report.animalType || 'Not specified'}`,
    `Observed: ${report.observedAt ? new Date(report.observedAt).toLocaleString() : 'Recent'}`,
    `Location: ${report.location || report.locationName || 'Near customer'}`,
    report.landmark ? `Nearby landmark: ${report.landmark}` : '',
    report.observations ? `Observations: ${report.observations}` : '',
    report.photoName ? `Photo reference: ${report.photoName}` : '',
    '',
    'Photos are not attached automatically to this email. Please attach them if required.',
    'Prepared with DermaScan Community Animal Care.'
  ].filter(Boolean).join('\n');

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function NearbyCare({ report }) {
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState(() => (
    typeof navigator !== 'undefined' && navigator.geolocation ? 'Detecting your location…' : 'Near me'
  ));
  const [searchInput, setSearchInput] = useState('');
  const [activeArea, setActiveArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Request real-time GPS location of the customer
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser. You can type your city or area below.');
      setLocationLabel('Search any city or area');
      return;
    }

    setIsLocating(true);
    setLocationStatus('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setCoords({ lat, lng });
        setActiveArea('');
        setLocationLabel(`Current Location (${lat}, ${lng})`);
        setLocationStatus('GPS location acquired. Showing live Google Maps results around you.');
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location access was denied. You can search by entering your city or area below.');
          setLocationLabel('Search any city or area');
        } else {
          setLocationStatus('Unable to retrieve your GPS location. Enter your city or area below to search.');
          setLocationLabel('Search any city or area');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  // Auto-request location on initial mount silently
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setCoords({ lat, lng });
        setLocationLabel(`Current Location (${lat}, ${lng})`);
        setLocationStatus('GPS location acquired. Showing live Google Maps results around you.');
      },
      () => {
        setLocationLabel('Near me');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const handleAreaSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;
    setActiveArea(query);
    setLocationLabel(query);
    setLocationStatus(`Showing care centers in "${query}".`);
  };

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  // Build real-time Google Maps search query
  const locationTarget = activeArea
    ? activeArea
    : coords
      ? `${coords.lat},${coords.lng}`
      : 'near me';

  const fullGoogleMapsQuery = `${currentCategory.query} near ${locationTarget}`;

  // Embedded Google Map URL (official Google Maps embed)
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullGoogleMapsQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  // Direct Google Maps app & navigation links
  const directSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullGoogleMapsQuery)}`;
  const directDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    currentCategory.id === 'emergency' ? '24/7 emergency pet hospital' : 'veterinary hospital'
  )}`;
  const directSheltersUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`animal shelter rescue NGO near ${locationTarget}`)}`;
  const directEmergencyUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`24 hours emergency animal hospital near ${locationTarget}`)}`;

  return (
    <section className="page-wrap content-page nearby-page" aria-labelledby="nearby-care-title">
      <header className="page-intro">
        <span className="eyebrow">LIVE GOOGLE MAPS LOCATOR</span>
        <h1 id="nearby-care-title">Find nearby animal care</h1>
        <p>
          Locate real-time verified veterinary clinics, 24/7 animal emergency hospitals, and rescue shelters directly via Google Maps based on your current location.
        </p>
      </header>

      {/* Search & Location Bar */}
      <div className="nearby-search-panel panel">
        <div className="notice-box">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>
            <strong>Live Google Maps Integration:</strong> DermaScan uses your GPS or searched location to display genuine care providers directly on Google Maps. No mock or static data is used.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="button button-primary"
            onClick={requestLocation}
            disabled={isLocating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LocateFixed size={17} aria-hidden="true" />
            {isLocating ? 'Locating your GPS…' : 'Use my current location'}
          </button>

          <form
            onSubmit={handleAreaSearch}
            style={{ display: 'flex', flex: '1 1 280px', gap: '8px' }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Or enter city, area, or postal code (e.g. Bangalore, Austin)"
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
              <Search size={16} aria-hidden="true" /> Search
            </button>
          </form>
        </div>

        {locationStatus && (
          <p className="field-hint" style={{ color: 'var(--brand-dark)', fontWeight: 500, margin: 0 }}>
            {locationStatus}
          </p>
        )}
      </div>

      {/* Filter Chips */}
      <div className="nearby-toolbar">
        <div className="nearby-filters" role="tablist" aria-label="Care categories">
          {CATEGORIES.map((cat) => (
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
          <MapPin size={14} color="var(--brand)" /> Showing: {locationLabel}
        </span>
      </div>

      {/* Main Map & Action Grid */}
      <div className="nearby-layout">
        {/* Interactive Google Map Frame */}
        <div className="nearby-map-wrap panel" style={{ background: '#e5e7eb', minHeight: '440px' }}>
          <iframe
            title="Google Maps Care Center Locator"
            width="100%"
            height="100%"
            style={{
              border: 0,
              width: '100%',
              height: '100%',
              minHeight: '440px',
              borderRadius: 'inherit'
            }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
          />
        </div>

        {/* Live Google Maps Action Cards */}
        <div className="nearby-results">
          {/* Card 1: Direct Open in Google Maps */}
          <article className="panel nearby-place-card" style={{ borderLeft: '4px solid var(--brand)' }}>
            <div className="nearby-card-heading">
              <span className="nearby-type-icon">
                <Navigation size={18} aria-hidden="true" />
              </span>
              <div>
                <span className="panel-kicker">GOOGLE MAPS APP</span>
                <h2>Open in Google Maps</h2>
              </div>
            </div>
            <p className="nearby-address">
              View live ratings, operating hours, real user photos, and phone numbers directly in the Google Maps app or web browser.
            </p>
            <div className="nearby-contact-links">
              <a href={directSearchUrl} target="_blank" rel="noopener noreferrer" className="button button-primary" style={{ padding: '8px 14px', color: '#fff' }}>
                <ExternalLink size={15} aria-hidden="true" /> Open Google Maps Live
              </a>
            </div>
          </article>

          {/* Card 2: 24/7 Emergency Casualty */}
          <article className="panel nearby-place-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="nearby-card-heading">
              <span className="nearby-type-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                <PhoneCall size={18} aria-hidden="true" />
              </span>
              <div>
                <span className="panel-kicker" style={{ color: '#dc2626' }}>EMERGENCY TRAUMA</span>
                <h2>24/7 Emergency Pet Hospitals</h2>
              </div>
            </div>
            <p className="nearby-address">
              Locate open 24-hour veterinary emergency rooms for critical conditions, severe injuries, and urgent triage.
            </p>
            <div className="nearby-contact-links">
              <a href={directEmergencyUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} aria-hidden="true" /> View 24/7 ERs on Google Maps
              </a>
              <a href={directDirectionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation size={14} aria-hidden="true" /> Get Directions
              </a>
            </div>
          </article>

          {/* Card 3: Animal Shelters & Rescue NGOs */}
          <article className="panel nearby-place-card" style={{ borderLeft: '4px solid #ea580c' }}>
            <div className="nearby-card-heading">
              <span className="nearby-type-icon shelter">
                <HeartHandshake size={18} aria-hidden="true" />
              </span>
              <div>
                <span className="panel-kicker" style={{ color: '#ea580c' }}>RESCUE ORGANIZATIONS</span>
                <h2>Animal Shelters & Rescue Groups</h2>
              </div>
            </div>
            <p className="nearby-address">
              Find non-profit animal rescue centers, shelter sanctuaries, and community stray welfare teams in this area.
            </p>
            <div className="nearby-contact-links">
              <a href={directSheltersUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} aria-hidden="true" /> View Shelters on Google Maps
              </a>
            </div>
          </article>

          {/* Card 4: Prepared Report Email (if report was generated) */}
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
                Your report details and observations are ready. Click below to draft an email to send directly to your local veterinary clinic.
              </p>
              <div className="nearby-contact-links">
                <a href={createEmailDraft(report)} className="button button-secondary" style={{ padding: '6px 12px' }}>
                  <Mail size={14} aria-hidden="true" /> Compose Email Draft
                </a>
              </div>
            </article>
          )}

          {/* Quick Veterinary Advice Badge */}
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '12px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--brand-dark)', marginBottom: '4px' }}>
              <Stethoscope size={14} /> Tip for Visiting Veterinary Clinics
            </span>
            Call ahead to confirm doctor availability, emergency triage capacity, and any intake protocols for stray or injured animals.
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
        Live care center locations provided via Google Maps. Google and the Google Maps logo are registered trademarks of Google LLC.
      </div>
    </section>
  );
}
