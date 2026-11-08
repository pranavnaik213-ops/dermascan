import { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building2, ExternalLink, HeartHandshake, LocateFixed, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const SEARCH_RADIUS_METERS = 15000;
const SEARCH_RADIUS_KM = SEARCH_RADIUS_METERS / 1000;
let nearbyCache = null;

function distanceKm(from, to) {
  const radians = (degrees) => degrees * (Math.PI / 180);
  const dLat = radians(to.lat - from.lat);
  const dLon = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function safeWebsite(value) {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function normalizePlace(element, origin) {
  const tags = element.tags || {};
  const lat = Number(element.lat ?? element.center?.lat);
  const lng = Number(element.lon ?? element.center?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const type = tags.amenity === 'veterinary' ? 'veterinary' : 'shelter';
  const addressParts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village']
  ].filter(Boolean);
  const email = (tags.email || tags['contact:email'] || '').replace(/^mailto:/i, '').trim();
  return {
    id: `${element.type}-${element.id}`,
    type,
    name: (tags.name || tags['name:en'] || (type === 'veterinary' ? 'Unnamed veterinary listing' : 'Unnamed animal shelter listing')).slice(0, 140),
    lat,
    lng,
    address: addressParts.join(', '),
    phone: tags.phone || tags['contact:phone'] || '',
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email) ? email : '',
    website: safeWebsite(tags.website || tags['contact:website'] || ''),
    distanceKm: distanceKm(origin, { lat, lng })
  };
}

function makeMarkerIcon(type) {
  return L.divIcon({
    className: `nearby-marker nearby-marker-${type}`,
    html: `<span>${type === 'veterinary' ? '+' : 'R'}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
}

function MapCenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => { map.setView([latitude, longitude], 13); }, [latitude, longitude, map]);
  return null;
}

function createEmailDraft(report, recipient, organization) {
  const subject = `Animal welfare report ${report.id || ''}`.trim();
  const body = [
    `Hello ${organization},`,
    '',
    'I would like to share an animal welfare observation for your review.',
    '',
    `Report reference: ${report.id || 'Local report'}`,
    `Animal: ${report.animal || 'Not specified'}`,
    `Observed: ${report.observedAt ? new Date(report.observedAt).toLocaleString() : 'Not specified'}`,
    `Location: ${report.location || 'Not specified'}`,
    report.landmark ? `Nearby landmark: ${report.landmark}` : '',
    report.observations ? `Observations: ${report.observations}` : '',
    report.photoName ? `Photo filenames: ${report.photoName}` : '',
    '',
    'Photos are not attached to this email draft. Please attach them yourself if appropriate.',
    'This message was prepared by me using DermaScan; it has not been sent automatically.'
  ].filter(Boolean).join('\n');
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function NearbyCare({ report }) {
  const [origin, setOrigin] = useState(null);
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchAt, setLastSearchAt] = useState(0);

  const findNearby = () => {
    setError('');
    if (isLocating || isSearching) return;
    if (!navigator.geolocation) {
      setError('Location is unavailable in this browser. You can search Google Maps for nearby care providers instead.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const center = { lat: Number(coords.latitude.toFixed(3)), lng: Number(coords.longitude.toFixed(3)) };
      const now = Date.now();
      if (nearbyCache && now - nearbyCache.savedAt < 15 * 60_000 && nearbyCache.center.lat === center.lat && nearbyCache.center.lng === center.lng) {
        setOrigin(center);
        setPlaces(nearbyCache.places);
        setHasSearched(true);
        setLastSearchAt(now);
        setIsLocating(false);
        return;
      }
      if (now - lastSearchAt < 10_000) {
        setError('Please wait a few seconds before searching again.');
        setIsLocating(false);
        return;
      }
      setOrigin(center);
      setIsSearching(true);
      setHasSearched(true);
      setLastSearchAt(now);
      try {
        const response = await fetch('/api/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: center.lat, longitude: center.lng }),
          signal: AbortSignal.timeout(22_000)
        });
        if (!response.ok) {
          const failure = await response.json().catch(() => ({}));
          throw new Error(failure.error || (response.status === 429
            ? 'Too many nearby searches. Wait a minute and try again.'
            : 'The nearby directory is temporarily unavailable. Try again later.'));
        }
        const result = await response.json();
        const unique = new Map();
        for (const element of result.elements || []) {
          const place = normalizePlace(element, center);
          if (!place) continue;
          const duplicateKey = `${place.type}:${place.name.toLowerCase()}:${place.lat.toFixed(3)}:${place.lng.toFixed(3)}`;
          if (!unique.has(duplicateKey)) unique.set(duplicateKey, place);
        }
        const nearbyPlaces = [...unique.values()].sort((a, b) => a.distanceKm - b.distanceKm);
        setPlaces(nearbyPlaces);
        nearbyCache = { center, places: nearbyPlaces, savedAt: Date.now() };
      } catch (searchError) {
        setError(searchError.name === 'TimeoutError' || searchError.name === 'AbortError'
          ? 'Nearby listings took too long to load. Try again shortly or use the map search links.'
          : searchError.message || 'Could not load nearby care providers.');
      } finally { setIsSearching(false); setIsLocating(false); }
    }, (locationError) => {
      setIsLocating(false);
      setError(locationError.code === locationError.PERMISSION_DENIED
        ? 'Location permission was not granted. Allow it in your browser to find places near you.'
        : 'Could not determine your location. Check your device settings and try again.');
    }, { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 });
  };

  const visiblePlaces = places.filter((place) => category === 'all' || place.type === category);
  const mapSearch = (query) => origin
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} near ${origin.lat},${origin.lng}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section className="page-wrap content-page nearby-page">
      <div className="page-intro"><span className="eyebrow">LOCAL CARE DIRECTORY</span><h1>Find nearby animal care</h1><p>View veterinary practices and animal-shelter listings from OpenStreetMap. Listings can be incomplete or out of date; confirm details directly before travelling.</p></div>
      <div className="nearby-search-panel panel">
        <div className="notice-box"><ShieldCheck size={17} /><p><strong>Location is used only when you ask for a search.</strong> DermaScan sends an approximate area (rounded to about 100 m) to OpenStreetMap’s Overpass service and keeps it in page memory for up to 15 minutes to avoid repeat requests. It is not saved to your account or browser storage.</p></div>
        <button type="button" className="button button-primary button-large" onClick={findNearby} disabled={isSearching || isLocating}><LocateFixed size={18} /> {isLocating ? 'Getting your location…' : isSearching ? 'Searching nearby…' : 'Find care near me'}</button>
        {error && <p className="form-message error-message" role="alert">{error}</p>}
        <div className="nearby-fallback-links"><span>Or open a broader map search:</span><a href={mapSearch('veterinarian pet hospital')} target="_blank" rel="noreferrer">Pet hospitals <ExternalLink size={14} /></a><a href={mapSearch('animal shelter animal rescue NGO')} target="_blank" rel="noreferrer">Animal shelters and rescue groups <ExternalLink size={14} /></a></div>
      </div>
      {hasSearched && !isSearching && !error && places.length === 0 && <p className="empty-state nearby-empty">No matching OpenStreetMap listings were found within {SEARCH_RADIUS_KM} km. Try the broader map search links above.</p>}
      {places.length > 0 && <>
        <div className="nearby-toolbar"><div className="nearby-filters" aria-label="Filter nearby places">{[['all', 'All places'], ['veterinary', 'Veterinary care'], ['shelter', 'Animal shelters']].map(([value, label]) => <button type="button" key={value} className={`filter-chip ${category === value ? 'active' : ''}`} aria-pressed={category === value} onClick={() => setCategory(value)}>{label}</button>)}</div><span className="record-count">{visiblePlaces.length} listing{visiblePlaces.length === 1 ? '' : 's'} · within {SEARCH_RADIUS_KM} km</span></div>
        <div className="nearby-layout">
          <div className="nearby-map-wrap panel"><MapContainer key={`${origin.lat}:${origin.lng}`} center={[origin.lat, origin.lng]} zoom={13} scrollWheelZoom={false} aria-label="Map of nearby veterinary practices and animal shelters"><TileLayer attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'} url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapCenter latitude={origin.lat} longitude={origin.lng} /><Circle center={[origin.lat, origin.lng]} radius={SEARCH_RADIUS_METERS} pathOptions={{ color: '#5d9878', fillColor: '#82b395', fillOpacity: 0.06 }} />{visiblePlaces.map((place) => <Marker key={place.id} position={[place.lat, place.lng]} icon={makeMarkerIcon(place.type)}><Popup><strong>{place.name}</strong><br />{place.type === 'veterinary' ? 'Veterinary practice listing' : 'Animal-shelter listing'}<br />{place.distanceKm.toFixed(1)} km away</Popup></Marker>)}</MapContainer><div className="map-attribution-note">Map tiles and listings © OpenStreetMap contributors · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">Report a map issue</a></div></div>
          <div className="nearby-results" aria-live="polite">{visiblePlaces.map((place) => <article className="panel nearby-place-card" key={place.id}><div className="nearby-card-heading"><span className={`nearby-type-icon ${place.type}`}>{place.type === 'veterinary' ? <Building2 size={18} /> : <HeartHandshake size={18} />}</span><div><span className="panel-kicker">{place.type === 'veterinary' ? 'VETERINARY CARE' : 'ANIMAL SHELTER'}</span><h2>{place.name}</h2></div><span className="nearby-distance">{place.distanceKm.toFixed(1)} km</span></div>{place.address && <p className="nearby-address"><MapPin size={15} /> {place.address}</p>}{place.email && <p className="nearby-email">Email listed: <a href={`mailto:${place.email}`}>{place.email}</a></p>}<p className="nearby-disclaimer">OpenStreetMap listing — contact the organization to confirm services and availability.</p><div className="nearby-contact-links">{place.phone && <a href={`tel:${place.phone.replace(/[^+\d]/g, '')}`}><Phone size={15} /> Call</a>}{place.email && <a href={report ? createEmailDraft(report, place.email, place.name) : `mailto:${place.email}`}><Mail size={15} /> {report ? 'Prepare report email' : 'Email'}</a>}{place.website && <a href={place.website} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Website</a>}<a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`} target="_blank" rel="noreferrer"><MapPin size={15} /> Directions</a></div></article>)}</div>
        </div>
      </>}
      <p className="osm-attribution">Directory data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> · Data available under the Open Database License (ODbL).</p>
    </section>
  );
}
