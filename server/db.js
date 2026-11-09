import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'dermascan_db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure data & uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial Seed Data
const SEED_CASES = [
  {
    id: "DS-2026-00124",
    animalType: "Dog",
    reporterName: "Sanjay Rao",
    locationName: "Nagarbhavi BDA Complex, Bengaluru",
    coordinates: { lat: 12.9724, lng: 77.5098 },
    reportedAt: "2026-10-04 14:30",
    symptoms: ["Hair Loss", "Skin Redness", "Thick Crusting", "Constant Scratching"],
    urgency: "High",
    priorityScore: 82,
    status: "ngo_assigned",
    aiPrediction: "Canine Sarcoptic Mange",
    aiConfidence: 89,
    severity: "High Priority",
    assignedNGO: "Sarvoham Animal Foundation",
    assignedVolunteer: "Chethan Sharma (Rescue Dispatcher)",
    veterinaryNotes: "Deep skin scrapings confirmed live Sarcoptes scabiei mites. Positive pinnal-pedal reflex. Initiated Fluralaner (Bravecto 25mg/kg) oral chewable and weekly 2% chlorhexidine antiseptic dips.",
    veterinarianConfirmed: true,
    photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Citizen Discovery & Photo Logged", date: "Oct 04, 14:30", done: true },
      { step: "Neural Triage (89% Sarcoptic Mange)", date: "Oct 04, 14:31", done: true },
      { step: "Sarvoham Foundation Accepted Dispatch", date: "Oct 04, 15:10", done: true },
      { step: "Field Rescue Team Deployed", date: "Oct 04, 16:45", done: true },
      { step: "Microscopic Scraping Confirmed Mites", date: "Oct 04, 18:20", done: true },
      { step: "Inpatient Medicated Bath Protocol", date: "Active", done: false }
    ]
  },
  {
    id: "DS-2026-00126",
    animalType: "Dog",
    reporterName: "Priya Venkatesh",
    locationName: "Kengeri Satellite Town, Bengaluru",
    coordinates: { lat: 12.9081, lng: 77.4842 },
    reportedAt: "2026-10-04 18:15",
    symptoms: ["Heavy Bleeding", "Unable to Move", "Open Wound", "Severe Swelling"],
    urgency: "Emergency",
    priorityScore: 96,
    status: "ngo_pending",
    aiPrediction: "Acute Trauma & Deep Pyoderma",
    aiConfidence: 94,
    severity: "Critical",
    assignedNGO: null,
    assignedVolunteer: null,
    veterinaryNotes: "Urgent emergency triage required: open laceration along dorsal cervical border with purulent exudate and active tissue hemorrhaging.",
    veterinarianConfirmed: false,
    photoUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Emergency Incident Logged", date: "Oct 04, 18:15", done: true },
      { step: "AI Triage (94% Critical Wound)", date: "Oct 04, 18:16", done: true },
      { step: "Broadcasting SOS to PFA & VoSD", date: "Broadcasting...", done: false },
      { step: "Ambulance Vehicle Dispatch", date: "Pending Acceptance", done: false }
    ]
  },
  {
    id: "DS-2026-00125",
    animalType: "Cat",
    reporterName: "Anita Roy",
    locationName: "Vijayanagar 2nd Stage, Bengaluru",
    coordinates: { lat: 12.9698, lng: 77.5358 },
    reportedAt: "2026-10-03 11:20",
    symptoms: ["Circular Hair Loss", "Flaky Skin", "Red Lesions"],
    urgency: "Medium",
    priorityScore: 58,
    status: "in_treatment",
    aiPrediction: "Microsporum Ringworm",
    aiConfidence: 86,
    severity: "Moderate",
    assignedNGO: "CARE (Charlie's Animal Rescue Centre)",
    assignedVolunteer: "Dr. Ananya Sen, MVSc",
    veterinaryNotes: "Wood's lamp examination exhibited classic apple-green pteridine fluorescence. DTM culture verified Microsporum canis. Commenced Itraconazole 5mg/kg oral suspension.",
    veterinarianConfirmed: true,
    photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Incident Geotagged by Citizen", date: "Oct 03, 11:20", done: true },
      { step: "AI Classification (86% Dermatophytosis)", date: "Oct 03, 11:21", done: true },
      { step: "CARE Jakkur Ambulance Assigned", date: "Oct 03, 12:15", done: true },
      { step: "Patient Admitted to Isolation Ward", date: "Oct 03, 14:00", done: true },
      { step: "Systemic Itraconazole Regimen", date: "Oct 04, 09:00", done: true }
    ]
  },
  {
    id: "DS-2026-00127",
    animalType: "Dog",
    reporterName: "Rohan Murthy",
    locationName: "Rajajinagar 4th Block, Bengaluru",
    coordinates: { lat: 12.9915, lng: 77.5530 },
    reportedAt: "2026-09-10 09:00",
    symptoms: ["Severe Scab Formation", "Hair Loss", "Bleeding Scabs"],
    urgency: "Low",
    priorityScore: 28,
    status: "recovered",
    aiPrediction: "Canine Sarcoptic Mange",
    aiConfidence: 89,
    severity: "Moderate",
    assignedNGO: "CUPA (Compassion Unlimited Plus Action)",
    assignedVolunteer: "Dr. Preeti Chandrasekhar, MVSc",
    veterinaryNotes: "Bruno completed full 28-day supervised rehabilitation. Monthly Sarolaner treatment combined with weekly keratolytic dips cleared all crusting. Full recovery.",
    veterinarianConfirmed: true,
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Report Created at Rajajinagar", date: "Sep 10, 09:00", done: true },
      { step: "CUPA Hebbal Rescue Unit Dispatched", date: "Sep 10, 10:15", done: true },
      { step: "Full Clinical Recovery & Discharged", date: "Oct 02, 11:00", done: true }
    ]
  },
  {
    id: "DS-2026-00128",
    animalType: "Cattle",
    reporterName: "Mahesh Naidu",
    locationName: "Mallathahalli Main Road, Bengaluru",
    coordinates: { lat: 12.9610, lng: 77.4980 },
    reportedAt: "2026-10-04 16:45",
    symptoms: ["Skin Hives", "Swelling", "Flea Infestation"],
    urgency: "Medium",
    priorityScore: 48,
    status: "ngo_pending",
    aiPrediction: "Allergic Dermatitis & Urticaria",
    aiConfidence: 79,
    severity: "Low",
    assignedNGO: null,
    assignedVolunteer: null,
    veterinaryNotes: "Bovine cutaneous hypersensitivity secondary to insect bite irritation. Advised antihistamine and topical repellent spray.",
    veterinarianConfirmed: false,
    photoUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Bovine Incident Geotagged", date: "Oct 04, 16:45", done: true },
      { step: "Triage Assessment Completed", date: "Oct 04, 16:50", done: true }
    ]
  }
];

const SEED_NGOS = [
  {
    id: "ngo-cupa",
    name: "CUPA (Compassion Unlimited Plus Action)",
    area: "Hebbal & Bellary Road Corridor",
    address: "KVAFSU Campus, Bellary Road, Hebbal, Bengaluru - 560024",
    regNo: "Society Reg. No. 443/90-91 (AWBI Recognized)",
    verified: true,
    phone: "+91 80 2294 7300",
    helpline: "+91 91485 02568",
    email: "communications@cupaindia.org",
    ambulanceStatus: "Available",
    fieldVanCount: 4,
    availableBeds: 18,
    activeCases: 8,
    resolvedCases: 412,
    headVolunteer: "Dr. Preeti Chandrasekhar",
    specialties: ["24/7 Trauma Casualty", "Mange Recovery Ward", "Mobile Rescue Van"],
    operatingHours: "24/7 Trauma Emergency Unit",
    coordinates: { lat: 13.0358, lng: 77.5970 }
  },
  {
    id: "ngo-care",
    name: "CARE (Charlie's Animal Rescue Centre)",
    area: "Yelahanka, Jakkur & Kogilu Road",
    address: "Survey No. 124, Mittaganahalli Cross, Jakkur, Bengaluru - 560064",
    regNo: "Trust Reg. No. 467/2012-13",
    verified: true,
    phone: "+91 94839 17049",
    helpline: "+91 90359 99372",
    email: "support@charlies-care.com",
    ambulanceStatus: "On Dispatch",
    fieldVanCount: 6,
    availableBeds: 24,
    activeCases: 11,
    resolvedCases: 685,
    headVolunteer: "Sudha Narayanan",
    specialties: ["Canine Rehabilitation", "Wood's Lamp Diagnostics", "Canine Hydrotherapy"],
    operatingHours: "09:00 AM - 05:00 PM (Ambulance 24/7)",
    coordinates: { lat: 13.0782, lng: 77.6067 }
  },
  {
    id: "ngo-pfa",
    name: "People For Animals (PFA) Bengaluru",
    area: "Kengeri, Mysore Road & Rajarajeshwari Nagar",
    address: "67, Uttarahalli Road, BEML Layout 5th Stage, Kengeri, Bengaluru - 560060",
    regNo: "AWBI / CZA Recognized Sanctuary",
    verified: true,
    phone: "+91 99000 25370",
    helpline: "+91 99803 39880",
    email: "info@peopleforanimalsbangalore.org",
    ambulanceStatus: "Available",
    fieldVanCount: 5,
    availableBeds: 30,
    activeCases: 6,
    resolvedCases: 520,
    headVolunteer: "Dr. Nawaz Shariff",
    specialties: ["Stray Trauma Surgery", "Wildlife & Companion Wards", "Large Animal Rescue"],
    operatingHours: "24/7 Animal & Wildlife Hospital",
    coordinates: { lat: 12.9156, lng: 77.4827 }
  },
  {
    id: "ngo-sarvoham",
    name: "Sarvoham Animal Foundation",
    area: "Kanakapura Road, Banashankari & JP Nagar",
    address: "80/2, Doddakallasandra, Kanakapura Road, Bengaluru - 560062",
    regNo: "Trust Reg. No. BNG(U)JNR/1012/2017-18",
    verified: true,
    phone: "+91 96114 62412",
    helpline: "+91 76766 84898",
    email: "contact@sarvoham.org",
    ambulanceStatus: "Available",
    fieldVanCount: 3,
    availableBeds: 14,
    activeCases: 9,
    resolvedCases: 380,
    headVolunteer: "Haris Ali",
    specialties: ["Sarcoptic Mange Isolation", "Critical Rescue", "Parvovirus Quarantine"],
    operatingHours: "24/7 Stray Critical Rescue & Mange Center",
    coordinates: { lat: 12.8797, lng: 77.5510 }
  },
  {
    id: "ngo-karuna",
    name: "Karuna Animal Shelter",
    area: "Hebbal, RT Nagar & Central Bengaluru",
    address: "Gate 4, Veterinary College Campus, Hebbal, Bengaluru - 560024",
    regNo: "Registered Animal Welfare Charity Est. 2000",
    verified: true,
    phone: "+91 80 2341 1181",
    helpline: "+91 80 2341 4740",
    email: "karunabangalore@gmail.com",
    ambulanceStatus: "Standby",
    fieldVanCount: 2,
    availableBeds: 12,
    activeCases: 4,
    resolvedCases: 295,
    headVolunteer: "BC Ramakrishna",
    specialties: ["Subsidized Triage", "Ambulance Pickup", "Sterilization Clinic"],
    operatingHours: "09:30 AM - 04:30 PM",
    coordinates: { lat: 13.0298, lng: 77.5855 }
  },
  {
    id: "ngo-vosa",
    name: "Voice of Stray Animals (VOSA)",
    area: "Whitefield, Marathahalli & Mahadevapura",
    address: "Plot 89, EPIP Zone, Near ITPL, Whitefield, Bengaluru - 560066",
    regNo: "NGO Reg. 2019/KA/09918",
    verified: true,
    phone: "+91 97425 43210",
    helpline: "+91 98860 12345",
    email: "emergency@vosaindia.org",
    ambulanceStatus: "Available",
    fieldVanCount: 4,
    availableBeds: 16,
    activeCases: 7,
    resolvedCases: 340,
    headVolunteer: "Nisha Mathew",
    specialties: ["Emergency IT-Corridor Rescue", "Thermal Burns & Mange", "Adoption Outreach"],
    operatingHours: "24/7 Rapid Ambulance Network",
    coordinates: { lat: 12.9850, lng: 77.7290 }
  },
  {
    id: "ngo-secondchance",
    name: "Second Chance Animal Sanctuary",
    area: "Rajanukunte, Yelahanka & Doddaballapur",
    address: "Village Sonnapura, Rajanukunte Post, Bengaluru North - 560064",
    regNo: "Animal Welfare Trust Reg. 112/2018",
    verified: true,
    phone: "+91 98450 99881",
    helpline: "+91 94480 33441",
    email: "admissions@secondchanceblr.org",
    ambulanceStatus: "On Dispatch",
    fieldVanCount: 3,
    availableBeds: 22,
    activeCases: 8,
    resolvedCases: 260,
    headVolunteer: "Sanjjana Galrani",
    specialties: ["Geriatric Dog Care", "Paralytic Stray Rehabilitation", "Permanent Sanctuary"],
    operatingHours: "08:00 AM - 06:00 PM (Casualty 24/7)",
    coordinates: { lat: 13.1780, lng: 77.5610 }
  },
  {
    id: "ngo-sudha",
    name: "Sudha Animal Care Shelter",
    area: "Indiranagar, Halasuru & Domlur",
    address: "12, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038",
    regNo: "Registered Public Charitable Trust 2015",
    verified: true,
    phone: "+91 80 2520 4455",
    helpline: "+91 98801 77662",
    email: "help@sudhaanimalshelter.org",
    ambulanceStatus: "Available",
    fieldVanCount: 2,
    availableBeds: 10,
    activeCases: 5,
    resolvedCases: 190,
    headVolunteer: "Dr. Raghavendra Swamy",
    specialties: ["Urban Stray First Aid", "Puppy Intensive Care", "Cat Spay/Neuter"],
    operatingHours: "08:30 AM - 07:30 PM",
    coordinates: { lat: 12.9719, lng: 77.6412 }
  }
];

const SEED_HOSPITALS = [
  {
    id: "hosp-vet-college",
    name: "Veterinary College Hospital & Casualty (KVAFSU)",
    area: "Hebbal / Bellary Road",
    address: "Veterinary College Campus, Bellary Road, Hebbal, Bengaluru - 560024",
    phone: "+91 80 2341 4384",
    emergencyLine: "+91 80 2341 0509",
    rating: 4.8,
    reviews: 840,
    open24x7: true,
    traumaICU: true,
    dermatologyDept: true,
    coordinates: { lat: 13.0304, lng: 77.5898 },
    specialties: ["Dermatopathology", "Wood's Lamp Fluorescence", "Skin Cytology & Biopsy", "24/7 Surgical ICU"]
  },
  {
    id: "hosp-cupa-rtnagar",
    name: "CUPA Small Animal Hospital & Trauma Casualty",
    area: "RT Nagar / Hebbal",
    address: "KVAFSU Campus, Bellary Road, Near Ganga Nagar, RT Nagar, Bengaluru - 560032",
    phone: "+91 80 2294 7300",
    emergencyLine: "+91 91485 02568",
    rating: 4.7,
    reviews: 620,
    open24x7: true,
    traumaICU: true,
    dermatologyDept: true,
    coordinates: { lat: 13.0238, lng: 77.5932 },
    specialties: ["Emergency Triage", "Stray Sterilization & Wound Care", "Canine Mange Recovery Units"]
  },
  {
    id: "hosp-cessna-domlur",
    name: "Cessna Lifeline Veterinary Hospital (24/7)",
    area: "Domlur / Indiranagar",
    address: "148, Embassy Golf Links Access Road, Domlur, Bengaluru - 560071",
    phone: "+91 80 4115 0090",
    emergencyLine: "+91 76763 65365",
    rating: 4.9,
    reviews: 1450,
    open24x7: true,
    traumaICU: true,
    dermatologyDept: true,
    coordinates: { lat: 12.9554, lng: 77.6482 },
    specialties: ["Laser Dermatology", "Allergy Desensitization", "Advanced Diagnostics", "ICU Isolation Wards"]
  },
  {
    id: "hosp-alina-indiranagar",
    name: "Alina Pet Hospital & Critical Care",
    area: "Indiranagar",
    address: "298, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038",
    phone: "+91 80 4126 1234",
    emergencyLine: "+91 99000 88221",
    rating: 4.7,
    reviews: 580,
    open24x7: true,
    traumaICU: true,
    dermatologyDept: true,
    coordinates: { lat: 12.9782, lng: 77.6409 },
    specialties: ["Cutaneous Cytology", "Ectoparasitic Diagnostics", "Oxygenation Therapy"]
  },
  {
    id: "hosp-jeeva-jpnagar",
    name: "Jeeva Pet Hospital & Trauma Care",
    area: "JP Nagar 2nd Phase",
    address: "412, 24th Main, 9th Cross, JP Nagar 2nd Phase, Bengaluru - 560078",
    phone: "+91 80 2659 1199",
    emergencyLine: "+91 98450 21345",
    rating: 4.6,
    reviews: 490,
    open24x7: true,
    traumaICU: true,
    dermatologyDept: true,
    coordinates: { lat: 12.9120, lng: 77.5890 },
    specialties: ["Fungal Culture Labs", "Emergency Wound Debridement", "Blood Transfusions"]
  },
  {
    id: "hosp-kartic-yelahanka",
    name: "Dr. K.A. Karthik Veterinary Specialty Clinic",
    area: "Yelahanka New Town",
    address: "HIG 728, 1st Stage, Yelahanka New Town, Bengaluru - 560064",
    phone: "+91 80 2856 7890",
    emergencyLine: "+91 98800 45678",
    rating: 4.7,
    reviews: 430,
    open24x7: false,
    traumaICU: false,
    dermatologyDept: true,
    coordinates: { lat: 13.0984, lng: 77.5934 },
    specialties: ["Chronic Dermatitis Management", "Allergy Testing", "Microscopic Mite Exams"]
  },
  {
    id: "hosp-prerana-kengeri",
    name: "Prerana Pet Clinic & Surgery Centre",
    area: "Kengeri Satellite Town",
    address: "51, Kommaghatta Main Road, Kengeri Satellite Town, Bengaluru - 560060",
    phone: "+91 94801 22334",
    emergencyLine: "+91 99001 55667",
    rating: 4.5,
    reviews: 310,
    open24x7: false,
    traumaICU: true,
    dermatologyDept: true,
    coordinates: { lat: 12.9192, lng: 77.4789 },
    specialties: ["Trauma Stabilization", "Wound Dressings", "Microscopic Skin Scrapings"]
  },
  {
    id: "hosp-vcare-whitefield",
    name: "V-Care 24/7 Multi-Specialty Pet Hospital",
    area: "Whitefield",
    address: "Opp. Prestige Ozone, Varthur Main Road, Whitefield, Bengaluru - 560066",
    phone: "+91 80 2845 8899",
    emergencyLine: "+91 99800 11223",
    rating: 4.8,
    reviews: 990,
    open24x7: true,
    traumaICU: true,
    dermatologyDept: true,
    coordinates: { lat: 12.9592, lng: 77.7460 },
    specialties: ["24/7 ICU & High-Dependency Care", "Automated Bio-Chemistry", "Dermatology Specialist"]
  }
];

const SEED_AUDIT_LOGS = [
  {
    id: "LOG-8910",
    timestamp: "2 mins ago",
    actor: "Dr. Vikram Hegde (CSO)",
    type: "Triage Override",
    details: "Urgency upgraded to EMERGENCY for Case DS-2026-00125 (Canine Trauma & Pyoderma)",
    severity: "high"
  },
  {
    id: "LOG-8909",
    timestamp: "14 mins ago",
    actor: "Dispatcher (CUPA Unit 2)",
    type: "Fleet Dispatch",
    details: "Mobile Rescue Van #3 dispatched to Hebbal Flyover junction",
    severity: "medium"
  },
  {
    id: "LOG-8908",
    timestamp: "42 mins ago",
    actor: "System Daemon",
    type: "Model Telemetry",
    details: "ONNX runtime latency verified at 168ms (Edge CDN Cache Hit: 99.4%)",
    severity: "low"
  },
  {
    id: "LOG-8907",
    timestamp: "1 hour ago",
    actor: "Dr. Preeti Chandrasekhar",
    type: "Case Verified",
    details: "Case DS-2026-00124 verified as Canine Sarcoptic Mange; Ivermectin protocol initiated",
    severity: "low"
  },
  {
    id: "LOG-8906",
    timestamp: "2 hours ago",
    actor: "Security Gateway",
    type: "Admin Login",
    details: "Successful Level 4 biometric passkey authentication from Node BNG-CENTRAL-01",
    severity: "info"
  }
];

// In-Memory Database Cached from Disk
class DatabaseManager {
  constructor() {
    this.data = {
      cases: [],
      ngos: [],
      hospitals: [],
      auditLogs: [],
      analyses: []
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        console.log(`[Database] Loaded persistent data from ${DB_FILE}`);
      } catch (err) {
        console.error('[Database] Failed to parse existing DB file, re-seeding:', err.message);
        this.seed();
      }
    } else {
      console.log('[Database] No database found, seeding initial data...');
      this.seed();
    }
  }

  seed() {
    this.data = {
      cases: [...SEED_CASES],
      ngos: [...SEED_NGOS],
      hospitals: [...SEED_HOSPITALS],
      auditLogs: [...SEED_AUDIT_LOGS],
      analyses: []
    };
    this.save();
  }

  save() {
    try {
      const tempPath = DB_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[Database] Error persisting to disk:', err.message);
    }
  }

  // --- CASES CRUD ---
  getCases(filters = {}) {
    let result = [...this.data.cases];
    if (filters.urgency && filters.urgency !== 'all') {
      result = result.filter(c => c.urgency && c.urgency.toLowerCase() === filters.urgency.toLowerCase());
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(c => 
        (c.id && c.id.toLowerCase().includes(s)) ||
        (c.animalType && c.animalType.toLowerCase().includes(s)) ||
        (c.locationName && c.locationName.toLowerCase().includes(s)) ||
        (c.aiPrediction && c.aiPrediction.toLowerCase().includes(s))
      );
    }
    return result;
  }

  getCaseById(id) {
    return this.data.cases.find(c => c.id === id) || null;
  }

  createCase(casePayload) {
    const id = casePayload.id || `DS-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    
    const newCase = {
      id,
      animalType: casePayload.animalType || 'Other or not sure',
      reporterName: casePayload.reporterName || '',
      reporterPhone: casePayload.reporterPhone || '',
      locationName: casePayload.locationName || '',
      landmark: casePayload.landmark || '',
      coordinates: casePayload.coordinates || null,
      reportedAt: casePayload.reportedAt || nowStr,
      observedAt: casePayload.observedAt || casePayload.reportedAt || nowStr,
      observations: casePayload.observations || casePayload.notes || '',
      photoName: casePayload.photoName || '',
      status: casePayload.status || "received",
      assignedNGO: casePayload.assignedNGO || null,
      assignedVolunteer: casePayload.assignedVolunteer || null,
      veterinaryNotes: casePayload.veterinaryNotes || '',
      veterinarianConfirmed: casePayload.veterinarianConfirmed || false,
      photoUrl: casePayload.photoUrl || null
    };

    this.data.cases.unshift(newCase);
    
    this.addAuditLog({
      actor: newCase.reporterName,
      type: "Case Created",
      details: `New report ${newCase.id} created for ${newCase.animalType} in ${newCase.locationName}`,
      severity: 'low'
    });

    this.save();
    return newCase;
  }

  updateCaseStatus(id, newStatus, actor = 'Staff') {
    const target = this.data.cases.find(c => c.id === id);
    if (!target) return null;
    target.status = newStatus;
    
    const statusLabels = {
      'ngo_assigned': 'NGO Rescue Assigned',
      'in_treatment': 'Inpatient Treatment Started',
      'recovered': 'Fully Recovered & Discharged'
    };

    target.timeline = target.timeline.map(t => {
      if (newStatus === 'recovered') return { ...t, done: true, date: t.date === 'Pending' || t.date === 'Active' ? 'Completed' : t.date };
      return t;
    });

    target.timeline.push({
      step: statusLabels[newStatus] || `Status updated to ${newStatus}`,
      date: 'Just now',
      done: true
    });

    this.addAuditLog({
      actor,
      type: "Status Changed",
      details: `Case ${id} status set to ${newStatus}`,
      severity: "low"
    });

    this.save();
    return target;
  }

  assignCase(id, ngoName, volunteerName = 'Field Van #1') {
    const target = this.data.cases.find(c => c.id === id);
    if (!target) return null;
    target.status = 'ngo_assigned';
    target.assignedNGO = ngoName;
    target.assignedVolunteer = volunteerName;

    target.timeline.push({
      step: `Ambulance Dispatched by ${ngoName} (${volunteerName})`,
      date: 'Just now',
      done: true
    });

    this.addAuditLog({
      actor: `${ngoName} Dispatcher`,
      type: "Ambulance Dispatched",
      details: `Case ${id} assigned to ${ngoName} - Driver: ${volunteerName}`,
      severity: "medium"
    });

    this.save();
    return target;
  }

  vetVerifyCase(id, { notes, tests, doctorName = 'Dr. Preeti Chandrasekhar, MVSc' }) {
    const target = this.data.cases.find(c => c.id === id);
    if (!target) return null;
    target.veterinarianConfirmed = true;
    if (notes) target.veterinaryNotes = notes;
    if (tests) target.cytologyTests = tests;

    target.timeline.push({
      step: `Clinically Verified by ${doctorName}`,
      date: 'Just now',
      done: true
    });

    this.addAuditLog({
      actor: doctorName,
      type: "Clinical Verification",
      details: `Case ${id} certified by veterinarian. Notes & prescription logged.`,
      severity: "low"
    });

    this.save();
    return target;
  }

  deleteCase(id) {
    const idx = this.data.cases.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.cases.splice(idx, 1);
    
    this.addAuditLog({
      actor: "System Administrator",
      type: "Case Archived",
      details: `Case ${id} dismissed/archived from live incident queue`,
      severity: "medium"
    });

    this.save();
    return true;
  }

  // --- NGOS ---
  getNgos() {
    return this.data.ngos;
  }

  updateNgoAmbulance(ngoId, status) {
    const target = this.data.ngos.find(n => n.id === ngoId);
    if (!target) return null;
    target.ambulanceStatus = status;

    this.addAuditLog({
      actor: target.name,
      type: "Fleet Status Update",
      details: `Ambulance fleet status toggled to "${status}"`,
      severity: status === 'On Dispatch' ? 'medium' : 'low'
    });

    this.save();
    return target;
  }

  updateNgoBeds(ngoId, availableBeds) {
    const target = this.data.ngos.find(n => n.id === ngoId);
    if (!target) return null;
    target.availableBeds = Math.max(0, parseInt(availableBeds, 10));
    this.save();
    return target;
  }

  // --- HOSPITALS ---
  getHospitals() {
    return this.data.hospitals;
  }

  // --- AUDIT LOGS ---
  getAuditLogs() {
    return this.data.auditLogs;
  }

  addAuditLog({ actor = "System", type = "Event", details = "", severity = "low" }) {
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: "Just now",
      actor,
      type,
      details,
      severity
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 100) this.data.auditLogs.pop();
    this.save();
    return newLog;
  }

  // --- STATS ---
  getStats() {
    const totalCases = this.data.cases.length;
    const resolvedCount = this.data.cases.filter(c => c.status === 'recovered').length;
    const emergencyCount = this.data.cases.filter(c => c.urgency === 'Emergency').length;
    const activeDispatches = this.data.cases.filter(c => c.status === 'ngo_assigned').length;
    const totalBeds = this.data.ngos.reduce((acc, n) => acc + (n.availableBeds || 0), 0);
    const availableAmbulances = this.data.ngos.filter(n => n.ambulanceStatus === 'Available').length;

    return {
      totalCases,
      screenedImpact: 747 + totalCases - 5,
      recoveries: 528 + resolvedCount,
      emergencyCount,
      activeDispatches,
      totalBeds,
      availableAmbulances,
      ngosCount: this.data.ngos.length,
      hospitalsCount: this.data.hospitals.length,
      modelAccuracy: 94.2
    };
  }

  reset() {
    this.seed();
    return true;
  }
}

export const db = new DatabaseManager();
export { UPLOADS_DIR, DATA_DIR, DB_FILE };
