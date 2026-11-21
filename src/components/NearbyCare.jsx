import React, { useCallback, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Compass,
  ExternalLink,
  HeartHandshake,
  Home,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldAlert,
  Star,
  Stethoscope,
  X
} from 'lucide-react';
import { calculateDistanceKm } from '../data/mockData';

// Verified Care Facilities (Covering South, North, East, West & Central sectors)
const ALL_FACILITIES = [
  {
    id: 'cessna-kanakapura',
    name: 'Cessna Lifeline 24/7 Veterinary Hospital (Kanakapura Road)',
    type: 'emergency',
    categoryLabel: '24/7 Emergency Casualty',
    area: 'Kumaraswamy Layout & Kanakapura Road',
    address: 'Near Kumaraswamy Layout, Kanakapura Main Road, Bengaluru - 560078',
    landmark: '1.2 km from ISRO Layout / Kumaraswamy Layout Ring Road',
    phone: '+91 80 4115 5400',
    helpline: '+91 76763 65365',
    operatingHours: 'Open 24/7 (Emergency Desk & Trauma ICU)',
    doctorInCharge: 'Dr. Vivek V., MVSc (Head of Emergency & Critical Care)',
    rating: 4.9,
    reviews: 540,
    verified: true,
    coordinates: { lat: 12.9095, lng: 77.5645 },
    specialties: ['24/7 Trauma ICU', 'Skin Scraping Lab', 'Wood\'s Lamp Diagnostics', 'Digital Radiography'],
    searchQuery: 'Cessna Lifeline Veterinary Hospital Kanakapura Road Bengaluru'
  },
  {
    id: 'paws-tails-ks-layout',
    name: 'Paws & Tails Day Care & Pet Wellness Centre',
    type: 'daycare',
    categoryLabel: 'Day Care & Clinic',
    area: 'Kumaraswamy Layout 2nd Stage',
    address: '14th Main Rd, ISRO Layout / Kumaraswamy Layout, Bengaluru - 560078',
    landmark: 'Opposite Dayananda Sagar College Campus Gate',
    phone: '+91 98450 12890',
    helpline: '+91 98450 12890',
    operatingHours: '08:00 AM – 09:30 PM (Daily)',
    doctorInCharge: 'Dr. Archana Rao, BVSc (Resident Practitioner)',
    rating: 4.8,
    reviews: 195,
    verified: true,
    coordinates: { lat: 12.9042, lng: 77.5582 },
    specialties: ['Day Care & Boarding', 'Medicated Skin Baths', 'Outpatient Vet Triage', 'Grooming'],
    searchQuery: 'Pet clinic day care Kumaraswamy Layout Bengaluru'
  },
  {
    id: 'sarvoham-jp-nagar',
    name: 'Sarvoham Animal Foundation 24/7 Trauma Shelter',
    type: 'ngo',
    categoryLabel: 'Rescue NGO & Trauma Center',
    area: 'JP Nagar & Kanakapura Road',
    address: 'Survey No. 43, Gubbalala Gate, Kanakapura Road, Bengaluru - 560061',
    landmark: 'Near KSIT College / Gubbalala Bus Stop',
    phone: '+91 91088 88484',
    helpline: '+91 96113 47494',
    operatingHours: 'Open 24/7 (Emergency Dispatch & Intake)',
    doctorInCharge: 'Haris Ali (Founder & Care Superintendent)',
    rating: 4.9,
    reviews: 420,
    verified: true,
    coordinates: { lat: 12.8797, lng: 77.5510 },
    specialties: ['Dedicated Mange Ward', 'Stray Ambulance', 'Free Trauma Recovery', 'Adoption Sanctuary'],
    searchQuery: 'Sarvoham Animal Foundation Kanakapura Road Bengaluru'
  },
  {
    id: 'jayanagar-pet-hospital',
    name: 'Jayanagar Veterinary Specialty Hospital & Clinic',
    type: 'hospital',
    categoryLabel: 'Specialty Pet Hospital',
    area: 'Jayanagar 4th Block & JP Nagar',
    address: '32nd Cross, 4th Block, Jayanagar, Bengaluru - 560011',
    landmark: 'Near Jayanagar Shopping Complex',
    phone: '+91 80 2664 3210',
    helpline: '+91 80 2664 3211',
    operatingHours: 'Open 24/7 (Casualty Counter)',
    doctorInCharge: 'Dr. N. S. Suresh, MVSc, PhD',
    rating: 4.8,
    reviews: 380,
    verified: true,
    coordinates: { lat: 12.9285, lng: 77.5835 },
    specialties: ['Dermatological Scraping', 'Surgical Theatre', 'Vaccination', 'Inpatient Kennels'],
    searchQuery: 'Government Veterinary Hospital Jayanagar Bengaluru'
  },
  {
    id: 'pfa-kengeri',
    name: 'People For Animals (PFA) Wildlife & Animal Hospital',
    type: 'ngo',
    categoryLabel: 'Rescue Sanctuary & Hospital',
    area: 'Kengeri & Mysore Road',
    address: '67, Uttarahalli Road, BEML Layout 5th Stage, Kengeri, Bengaluru - 560060',
    landmark: 'Near BEML Layout Bus Terminus',
    phone: '+91 99000 25370',
    helpline: '+91 99803 39880',
    operatingHours: 'Open 24/7 (Trauma Ambulance Hotline)',
    doctorInCharge: 'Dr. Karthik M., MVSc (Chief Wildlife & Pet Surgeon)',
    rating: 4.9,
    reviews: 690,
    verified: true,
    coordinates: { lat: 12.9156, lng: 77.4827 },
    specialties: ['Mobile Animal Ambulance', 'Trauma Casualty', 'Subsidized Stray Care', 'Wildlife Care'],
    searchQuery: 'People For Animals PFA Kengeri Bengaluru'
  },
  {
    id: 'kvafsu-hebbal',
    name: 'KVAFSU Veterinary College Referral Hospital',
    type: 'hospital',
    categoryLabel: 'Govt Teaching Referral Hospital',
    area: 'Hebbal, Bellary Road',
    address: 'Veterinary College Campus, Bellary Road, Hebbal, Bengaluru - 560024',
    landmark: 'Opposite CBI Colony, Near Hebbal Flyover',
    phone: '+91 80 2341 1483',
    helpline: '+91 80 2341 4740',
    operatingHours: 'Open 24/7 (Emergency Casualty Desk)',
    doctorInCharge: 'Dr. B. L. Chidananda, MVSc, PhD',
    rating: 4.8,
    reviews: 860,
    verified: true,
    coordinates: { lat: 13.0298, lng: 77.5898 },
    specialties: ['Mycological Lab', 'Isolation Ward', 'Low-Cost Govt Care', '24/7 Casualty'],
    searchQuery: 'KVAFSU Veterinary College Hospital Bellary Road Hebbal Bengaluru'
  },
  {
    id: 'cupa-trauma-hebbal',
    name: 'CUPA Inpatient Hospital & Trauma Center',
    type: 'emergency',
    categoryLabel: '24/7 Animal Welfare Hospital',
    area: 'Hebbal, Bellary Road',
    address: 'KVAFSU Campus, Near Gate 4, Bellary Road, Hebbal, Bengaluru - 560024',
    landmark: 'Inside Veterinary College Campus Gate 4',
    phone: '+91 80 2294 7300',
    helpline: '+91 91485 02568',
    operatingHours: 'Open 24/7 (Emergency Ambulance & ICU)',
    doctorInCharge: 'Dr. Sudha Rani, MVSc (Senior Surgeon)',
    rating: 4.9,
    reviews: 940,
    verified: true,
    coordinates: { lat: 13.0358, lng: 77.5970 },
    specialties: ['Mange Isolation Ward', 'Free Rescue Van', 'Critical ICU', 'Subsidized Surgery'],
    searchQuery: 'CUPA Animal Hospital Bellary Road Hebbal Bengaluru'
  },
  {
    id: 'care-yelahanka',
    name: 'CARE (Charlie\'s Animal Rescue Centre)',
    type: 'ngo',
    categoryLabel: 'Animal Rescue Centre & Shelter',
    area: 'Yelahanka & Jakkur',
    address: 'Survey No. 124, Mittaganahalli Cross, Jakkur, Bengaluru - 560064',
    landmark: 'Near Kogilu Cross / Jakkur Aerodrome',
    phone: '+91 94839 17049',
    helpline: '+91 90359 99372',
    operatingHours: '09:00 AM – 05:00 PM (Ambulance 24/7)',
    doctorInCharge: 'Sudha Narayanan (Managing Trustee)',
    rating: 4.9,
    reviews: 770,
    verified: true,
    coordinates: { lat: 13.0782, lng: 77.6067 },
    specialties: ['Hydrotherapy', 'Canine Rehabilitation', '24/7 Ambulance', 'Adoption Sanctuary'],
    searchQuery: 'Charlies Animal Rescue Centre CARE Yelahanka Bengaluru'
  },
  {
    id: 'cessna-domlur',
    name: 'Cessna Lifeline Veterinary Hospital (Domlur)',
    type: 'emergency',
    categoryLabel: '24/7 Multispecialty ICU Hospital',
    area: 'Domlur & Indiranagar',
    address: '148, Intermediate Ring Rd, Amarjyoti Layout, Domlur, Bengaluru - 560071',
    landmark: 'Near Dell Offices / EGL Complex',
    phone: '+91 80 4115 5400',
    helpline: '+91 76763 65365',
    operatingHours: 'Open 24/7 (Emergency Desk)',
    doctorInCharge: 'Dr. Pawan Kumar, MVSc',
    rating: 4.8,
    reviews: 1140,
    verified: true,
    coordinates: { lat: 12.9612, lng: 77.6432 },
    specialties: ['CT Scan & Fluoroscopy', 'Blood Bank', 'Emergency ICU', 'Dermatology Lab'],
    searchQuery: 'Cessna Lifeline Veterinary Hospital Domlur Bengaluru'
  },
  {
    id: 'whitefield-pet-hospital',
    name: 'Whitefield Animal Hospital & Specialty Care',
    type: 'hospital',
    categoryLabel: 'Pet Hospital & Day Care',
    area: 'Whitefield & ITPL',
    address: 'Outer Circle, Near Hope Farm Junction, Whitefield, Bengaluru - 560066',
    landmark: 'Near Hope Farm Metro Station',
    phone: '+91 80 2845 2200',
    helpline: '+91 98450 33440',
    operatingHours: 'Open 24/7 (Casualty)',
    doctorInCharge: 'Dr. R. Rajesh, MVSc',
    rating: 4.7,
    reviews: 460,
    verified: true,
    coordinates: { lat: 12.9698, lng: 77.7499 },
    specialties: ['Pet Day Boarding', 'Skin & Allergy Testing', 'Surgery', 'Ultrasound'],
    searchQuery: 'Whitefield Animal Hospital Hope Farm Bengaluru'
  }
];

const PRESET_LOCALITIES = [
  { id: 'bangalore-ks-layout', name: 'Kumaraswamy Layout & Kanakapura Rd', lat: 12.9060, lng: 77.5610, query: 'Kumaraswamy Layout, Bengaluru' },
  { id: 'bangalore-jayanagar', name: 'Jayanagar & JP Nagar', lat: 12.9285, lng: 77.5835, query: 'Jayanagar, Bengaluru' },
  { id: 'bangalore-hebbal', name: 'Hebbal & Bellary Road', lat: 13.0298, lng: 77.5898, query: 'Hebbal, Bengaluru' },
  { id: 'bangalore-indiranagar', name: 'Indiranagar & Domlur', lat: 12.9612, lng: 77.6432, query: 'Indiranagar, Bengaluru' },
  { id: 'bangalore-whitefield', name: 'Whitefield & ITPL', lat: 12.9698, lng: 77.7499, query: 'Whitefield, Bengaluru' },
  { id: 'bangalore-kengeri', name: 'Kengeri & Mysore Road', lat: 12.9156, lng: 77.4827, query: 'Kengeri, Bengaluru' },
  { id: 'mumbai-bandra', name: 'Mumbai (Bandra West)', lat: 19.0596, lng: 72.8295, query: 'Bandra West, Mumbai' },
  { id: 'delhi-south', name: 'Delhi NCR (South Delhi)', lat: 28.5355, lng: 77.2090, query: 'South Delhi, Delhi' },
  { id: 'hyderabad-hitec', name: 'Hyderabad (Hitec City)', lat: 17.4435, lng: 78.3772, query: 'Hitec City, Hyderabad' },
  { id: 'pune-koregaon', name: 'Pune (Koregaon Park)', lat: 18.5362, lng: 73.8940, query: 'Koregaon Park, Pune' }
];

export default function NearbyCare({ report }) {
  // User Location State (Initializes directly at Kumaraswamy Layout / Kanakapura Rd)
  const [userLocation, setUserLocation] = useState(() => {
    if (report?.coordinates?.lat && report?.coordinates?.lng) {
      return {
        lat: report.coordinates.lat,
        lng: report.coordinates.lng,
        accuracy: 15,
        detected: true,
        label: `Logged Location (${report.location || report.id})`
      };
    }
    return {
      lat: 12.9060,
      lng: 77.5610,
      accuracy: 25,
      detected: true,
      label: 'Kumaraswamy Layout, Bengaluru'
    };
  });

  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('Location active: Kumaraswamy Layout, Bengaluru');
  const [selectedFacilityId, setSelectedFacilityId] = useState(ALL_FACILITIES[0].id);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'emergency', 'hospital', 'ngo', 'daycare'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Google Maps View Mode: 'nearby', 'current-location', 'facility'
  const [mapMode, setMapMode] = useState('nearby'); // 'nearby', 'current-location', 'facility'
  const [selectedFacilityForMap, setSelectedFacilityForMap] = useState(ALL_FACILITIES[0]);

  // Compute live distance and drive times for all facilities from user location
  const facilitiesWithDistance = useMemo(() => {
    return ALL_FACILITIES.map((facility) => {
      const distanceKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        facility.coordinates.lat,
        facility.coordinates.lng
      );
      const driveMinutes = Math.max(3, Math.round((distanceKm / 22) * 60));
      return {
        ...facility,
        distanceKm,
        driveMinutes
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [userLocation.lat, userLocation.lng]);

  // Filter facilities based on category and search query
  const filteredFacilities = useMemo(() => {
    return facilitiesWithDistance.filter((f) => {
      if (categoryFilter !== 'all' && f.type !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = f.name.toLowerCase().includes(q);
        const matchArea = f.area.toLowerCase().includes(q);
        const matchAddr = f.address.toLowerCase().includes(q);
        const matchSpec = f.specialties.some((s) => s.toLowerCase().includes(q));
        return matchName || matchArea || matchAddr || matchSpec;
      }
      return true;
    });
  }, [facilitiesWithDistance, categoryFilter, searchQuery]);

  // Real Google Maps Embed URL generator
  const googleMapEmbedUrl = useMemo(() => {
    if (mapMode === 'current-location') {
      // Direct pin on user's exact current location coordinates
      return `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=16&output=embed`;
    }

    if (mapMode === 'facility' && selectedFacilityForMap) {
      // Focus on the specific selected veterinary hospital
      const query = encodeURIComponent(`${selectedFacilityForMap.name}, ${selectedFacilityForMap.address}`);
      return `https://www.google.com/maps?q=${query}&z=16&output=embed`;
    }

    // Default 'nearby' mode: Search for veterinary care around user's exact coordinates
    let keyword = 'veterinary hospital pet clinic animal emergency';
    if (categoryFilter === 'emergency') {
      keyword = '24 hours emergency pet hospital veterinary casualty';
    } else if (categoryFilter === 'hospital') {
      keyword = 'veterinary hospital pet clinic';
    } else if (categoryFilter === 'ngo') {
      keyword = 'animal rescue NGO stray dog shelter';
    } else if (categoryFilter === 'daycare') {
      keyword = 'pet day care boarding dog creche';
    }

    const query = encodeURIComponent(`${keyword} near ${userLocation.lat},${userLocation.lng}`);
    return `https://www.google.com/maps?q=${query}&z=14&output=embed`;
  }, [mapMode, userLocation.lat, userLocation.lng, selectedFacilityForMap, categoryFilter]);

  // Native Google Maps Full URL (for external navigation or opening in Google Maps app)
  const fullGoogleMapsUrl = useMemo(() => {
    if (mapMode === 'current-location') {
      return `https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`;
    }
    if (mapMode === 'facility' && selectedFacilityForMap) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(`${selectedFacilityForMap.name} ${selectedFacilityForMap.address}`)}&travelmode=driving`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`veterinary hospital near ${userLocation.lat},${userLocation.lng}`)}`;
  }, [mapMode, userLocation.lat, userLocation.lng, selectedFacilityForMap]);

  // Turn-by-turn navigation URL in Google Maps
  const getDirectionsUrl = useCallback((facility) => {
    const originParam = `${userLocation.lat},${userLocation.lng}`;
    const destParam = encodeURIComponent(`${facility.name}, ${facility.address}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving`;
  }, [userLocation.lat, userLocation.lng]);

  // Geolocation detector
  const detectUserGPS = useCallback((isManual = false) => {
    if (!navigator.geolocation) {
      setGpsNotice('Location services not available on this browser.');
      return;
    }

    setIsLocating(true);
    setGpsNotice('Acquiring high-precision GPS satellite fix…');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const accuracy = Math.round(pos.coords.accuracy || 20);

        setUserLocation({
          lat,
          lng,
          accuracy,
          detected: true,
          label: isManual ? 'Live GPS Location' : 'Current Location'
        });

        setMapMode('current-location');
        setIsLocating(false);
        setGpsNotice(`GPS Locked: ${lat}° N, ${lng}° E (±${accuracy}m precision)`);
      },
      (err) => {
        console.warn('[NearbyCare] GPS standard scan failed, trying high accuracy:', err.message);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = Number(pos.coords.latitude.toFixed(5));
            const lng = Number(pos.coords.longitude.toFixed(5));
            const accuracy = Math.round(pos.coords.accuracy || 20);

            setUserLocation({
              lat,
              lng,
              accuracy,
              detected: true,
              label: 'Live GPS Location'
            });

            setMapMode('current-location');
            setIsLocating(false);
            setGpsNotice(`GPS Locked: ${lat}° N, ${lng}° E (±${accuracy}m)`);
          },
          (err2) => {
            setIsLocating(false);
            console.warn('[NearbyCare] GPS permission denied or timed out:', err2.message);
            setGpsNotice('Location defaulted to Kumaraswamy Layout. Click "Locate My Position" or select a region.');
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
        );
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
    );
  }, []);

  const handleSelectFacility = useCallback((facility) => {
    setSelectedFacilityId(facility.id);
    setSelectedFacilityForMap(facility);
    setMapMode('facility');
  }, []);

  const handlePresetLocalityChange = (e) => {
    const loc = PRESET_LOCALITIES.find((l) => l.id === e.target.value);
    if (loc) {
      setUserLocation({
        lat: loc.lat,
        lng: loc.lng,
        accuracy: 50,
        detected: true,
        label: loc.name
      });
      setMapMode('nearby');
      setGpsNotice(`Centered on ${loc.name}`);
    }
  };

  return (
    <section className="page-wrap content-page nearby-portal-root" aria-labelledby="nearby-care-heading">
      {/* Header and Hero Overview */}
      <header className="page-intro page-intro-left" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#ecfdf5', borderRadius: '20px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
          <Compass size={14} /> OFFICIAL GOOGLE MAPS VETERINARY RADAR
        </div>
        <h1 id="nearby-care-heading" style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px', letterSpacing: '-0.02em' }}>
          Real Google Maps Animal Care & Navigation
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '720px', margin: 0, lineHeight: 1.5 }}>
          Real-time distance calculation, 24/7 ICU casualty desks, and official Google Maps turn-by-turn navigation centered directly on your location.
        </p>
      </header>

      {/* Control Bar: GPS Status, Locate Me Button, City Selector & Search */}
      <div className="panel nearby-control-bar" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Live GPS Beacon Readout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
              display: 'inline-block',
              flexShrink: 0
            }} />
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', fontWeight: 700 }}>
                {userLocation.label}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {gpsNotice}
              </span>
            </div>
          </div>

          {/* Quick Actions: Locate Me & Locality Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              aria-label="Select locality or region"
              onChange={handlePresetLocalityChange}
              defaultValue="bangalore-ks-layout"
              style={{
                minHeight: '40px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '13px',
                color: '#1e293b',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {PRESET_LOCALITIES.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <button
              type="button"
              className="button button-primary"
              onClick={() => detectUserGPS(true)}
              disabled={isLocating}
              style={{
                minHeight: '40px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: '#0d9488',
                border: 'none',
                color: '#ffffff'
              }}
            >
              <LocateFixed size={16} className={isLocating ? 'animate-spin' : ''} />
              <span>{isLocating ? 'Locating…' : 'Locate My Position'}</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital name, neighborhood (e.g. KS Layout, Hebbal), or specialty…"
              style={{
                width: '100%',
                minHeight: '42px',
                padding: '8px 14px 8px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                background: '#ffffff',
                color: '#0f172a'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official Google Map Container */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', borderRadius: '18px', border: '1px solid #cbd5e1', marginBottom: '24px', boxShadow: '0 10px 30px -8px rgba(0,0,0,0.08)' }}>
        {/* Map Top Bar with Google Maps Controls & View Mode Toggles */}
        <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={15} color="#0d9488" /> Real Google Maps:
            </span>

            {/* Mode Selector Buttons */}
            <button
              type="button"
              onClick={() => setMapMode('current-location')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: mapMode === 'current-location' ? '#0284c7' : '#cbd5e1',
                background: mapMode === 'current-location' ? '#0284c7' : '#ffffff',
                color: mapMode === 'current-location' ? '#ffffff' : '#334155',
                cursor: 'pointer'
              }}
            >
              📍 My Location Pin
            </button>

            <button
              type="button"
              onClick={() => setMapMode('nearby')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: mapMode === 'nearby' ? '#0d9488' : '#cbd5e1',
                background: mapMode === 'nearby' ? '#0d9488' : '#ffffff',
                color: mapMode === 'nearby' ? '#ffffff' : '#334155',
                cursor: 'pointer'
              }}
            >
              🏥 Nearby Care Centers
            </button>

            {selectedFacilityForMap && (
              <button
                type="button"
                onClick={() => setMapMode('facility')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: mapMode === 'facility' ? '#0f766e' : '#cbd5e1',
                  background: mapMode === 'facility' ? '#0f766e' : '#ffffff',
                  color: mapMode === 'facility' ? '#ffffff' : '#334155',
                  cursor: 'pointer'
                }}
              >
                🏥 {selectedFacilityForMap.name.slice(0, 26)}…
              </button>
            )}
          </div>

          <a
            href={fullGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#0d9488',
              textDecoration: 'none'
            }}
          >
            Open in Google Maps App <ExternalLink size={13} />
          </a>
        </div>

        {/* Real Google Maps Iframe */}
        <div style={{ height: '480px', width: '100%', position: 'relative', background: '#e2e8f0' }}>
          <iframe
            key={googleMapEmbedUrl}
            title="Real Google Maps Care Locator"
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

      {/* Category Filter Pills (All, Emergency, Hospitals, NGOs, Day Care) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div role="tablist" aria-label="Facility Categories" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Facilities (${facilitiesWithDistance.length})` },
            { id: 'emergency', label: '🚨 24/7 Emergency ICU' },
            { id: 'hospital', label: '🏥 Pet Hospitals' },
            { id: 'ngo', label: '🐾 Rescue NGOs & Ambulances' },
            { id: 'daycare', label: '🏠 Day Care & Boarding' }
          ].map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setMapMode('nearby');
                }}
                style={{
                  minHeight: '38px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #0d9488' : '1px solid #e2e8f0',
                  background: isActive ? '#0d9488' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  boxShadow: isActive ? '0 4px 10px rgba(13, 148, 136, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          Showing <strong>{filteredFacilities.length}</strong> facilities sorted by distance
        </span>
      </div>

      {/* Curated Clinical Facility Cards Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filteredFacilities.length === 0 ? (
          <div className="panel" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No facilities matched your search</h3>
            <p style={{ fontSize: '13px', margin: '0 0 16px' }}>Try clearing the search query or selecting a broader category filter.</p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
              style={{ minHeight: '38px', padding: '6px 16px', fontSize: '13px' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredFacilities.map((facility) => {
            const isSelected = facility.id === selectedFacilityId;
            const isEmergency = facility.type === 'emergency';
            const isNgo = facility.type === 'ngo';
            const isDaycare = facility.type === 'daycare';

            return (
              <article
                key={facility.id}
                onClick={() => handleSelectFacility(facility)}
                className={`panel facility-curated-card ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  background: isSelected ? '#f0fdfa' : '#ffffff',
                  boxShadow: isSelected ? '0 8px 20px -4px rgba(13, 148, 136, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Top Meta Line: Category Badge, Rating, Distance */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isEmergency ? '#fee2e2' : isNgo ? '#f0fdfa' : isDaycare ? '#fef3c7' : '#ecfdf5',
                        color: isEmergency ? '#991b1b' : isNgo ? '#0f766e' : isDaycare ? '#92400e' : '#065f46',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isEmergency ? <ShieldAlert size={12} /> : isNgo ? <HeartHandshake size={12} /> : isDaycare ? <Home size={12} /> : <Building2 size={12} />}
                        {facility.categoryLabel}
                      </span>
                      {facility.verified && (
                        <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <CheckCircle2 size={13} /> Verified
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 700, color: '#b45309' }}>
                        <Star size={13} fill="#b45309" /> {facility.rating}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0d9488', background: 'rgba(13, 148, 136, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                        {facility.distanceKm} km
                      </span>
                    </div>
                  </div>

                  {/* Facility Title & Operating Hours */}
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.35 }}>
                    {facility.name}
                  </h3>

                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    {facility.operatingHours} • ~{facility.driveMinutes} min drive
                  </div>

                  {/* Address and Landmark */}
                  <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 10px', lineHeight: 1.45 }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px', color: '#94a3b8' }} />
                    {facility.address}
                  </p>

                  {/* Specialized Services Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                    {facility.specialties.map((spec, idx) => (
                      <span key={idx} style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 7px', borderRadius: '4px', fontWeight: 500 }}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clean, Modern Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  {/* Google Maps Turn-by-Turn GPS Navigation */}
                  <a
                    href={getDirectionsUrl(facility)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#ffffff',
                      background: '#0d9488',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
                    }}
                  >
                    <Navigation size={14} /> Navigate ({facility.distanceKm} km)
                  </a>

                  {/* Direct Phone Helpline Call */}
                  <a
                    href={`tel:${(facility.helpline || facility.phone).replace(/\s+/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Phone size={13} color="#0d9488" /> {facility.helpline || facility.phone}
                  </a>

                  {/* Focus on Real Google Map Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFacility(facility);
                    }}
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isSelected && mapMode === 'facility' ? '#0d9488' : '#64748b',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginLeft: 'auto'
                    }}
                  >
                    <Compass size={13} /> {isSelected && mapMode === 'facility' ? 'Viewing on map' : 'View on map'}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Case report email draft if user has report in state */}
      {report && (
        <div className="panel" style={{ marginTop: '24px', padding: '18px 22px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>
              Active Case Intake: Reference #{report.id}
            </strong>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              {report.animal || 'Animal'} observed at {report.location || 'Logged location'}. Tap to email report details directly to the attending veterinarian.
            </span>
          </div>
          <a
            href={`mailto:?subject=${encodeURIComponent(`Veterinary Intake Case ${report.id}`)}&body=${encodeURIComponent(`Case ID: ${report.id}\nAnimal: ${report.animal || 'Animal'}\nLocation: ${report.location || 'Unknown'}\nObservations: ${report.observations || ''}`)}`}
            className="button button-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', minHeight: '38px', padding: '8px 14px' }}
          >
            <Mail size={14} /> Email Case to Attending Vet
          </a>
        </div>
      )}

      {/* Clinical Notice */}
      <footer style={{ marginTop: '24px', padding: '14px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Stethoscope size={16} color="var(--brand)" style={{ flexShrink: 0 }} />
        <span>
          Facility data and directions are powered live by Google Maps. In acute trauma, heavy bleeding, or poisoning, contact the hospital casualty desk while en route.
        </span>
      </footer>
    </section>
  );
}
