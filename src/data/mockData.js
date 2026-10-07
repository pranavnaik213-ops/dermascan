export const INITIAL_CASES = [
  {
    id: "DS-2026-00124",
    animalType: "Dog",
    reporterName: "Sanjay Kumar",
    locationName: "Nagarbhavi 2nd Stage, Bengaluru",
    coordinates: { lat: 12.9724, lng: 77.5098 },
    reportedAt: "2026-10-04 14:30",
    symptoms: ["Hair Loss", "Skin Redness", "Crusting", "Constant Scratching"],
    urgency: "High",
    priorityScore: 78,
    status: "ngo_assigned", // ngo_pending, ngo_assigned, rescued, vet_review, in_treatment, recovered
    aiPrediction: "Canine Mange",
    aiConfidence: 87,
    severity: "Moderate",
    assignedNGO: "CUPA (Compassion Unlimited Plus Action)",
    assignedVolunteer: "Rahul Sharma",
    veterinaryNotes: "Clinical evaluation confirms Demodectic Mange. Initiated oral ivermectin therapy and weekly medicated baths.",
    veterinarianConfirmed: true,
    photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    afterPhotoUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Report Created", date: "Oct 04, 14:30", done: true },
      { step: "AI Screened (87% Mange)", date: "Oct 04, 14:31", done: true },
      { step: "NGO Accepted (CUPA)", date: "Oct 04, 15:10", done: true },
      { step: "Animal Rescued", date: "Oct 04, 17:00", done: true },
      { step: "Veterinary Check", date: "Oct 04, 18:30", done: true },
      { step: "Treatment & Recovery", date: "In Progress", done: true }
    ]
  },
  {
    id: "DS-2026-00126",
    animalType: "Dog",
    reporterName: "Priya Venkatesh",
    locationName: "Kengeri Satellite Town, Bengaluru",
    coordinates: { lat: 12.9081, lng: 77.4842 },
    reportedAt: "2026-10-04 18:15",
    symptoms: ["Heavy Bleeding", "Unable to Move", "Open Wound", "Swelling"],
    urgency: "Emergency",
    priorityScore: 96,
    status: "ngo_pending",
    aiPrediction: "Severe Open Infection & Dermatitis",
    aiConfidence: 93,
    severity: "Critical",
    assignedNGO: null,
    assignedVolunteer: null,
    veterinaryNotes: null,
    veterinarianConfirmed: false,
    photoUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Report Created", date: "Oct 04, 18:15", done: true },
      { step: "AI Screened (93% Infection)", date: "Oct 04, 18:16", done: true },
      { step: "NGO Dispatch Pending", date: "Awaiting acceptance", done: false },
      { step: "Animal Rescued", date: "Pending", done: false },
      { step: "Veterinary Check", date: "Pending", done: false },
      { step: "Treatment & Recovery", date: "Pending", done: false }
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
    priorityScore: 54,
    status: "in_treatment",
    aiPrediction: "Fungal Ringworm",
    aiConfidence: 84,
    severity: "Moderate",
    assignedNGO: "CARE (Charlie's Animal Rescue Centre)",
    assignedVolunteer: "Anand Patel",
    veterinaryNotes: "Confirmed Microsporum infection via fungal culture swab. Topically treating with antifungal spray.",
    veterinarianConfirmed: true,
    photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Report Created", date: "Oct 03, 11:20", done: true },
      { step: "AI Screened (84% Fungal)", date: "Oct 03, 11:21", done: true },
      { step: "NGO Accepted (CARE)", date: "Oct 03, 12:00", done: true },
      { step: "Animal Rescued", date: "Oct 03, 14:30", done: true },
      { step: "Veterinary Check", date: "Oct 03, 16:00", done: true },
      { step: "Active Treatment", date: "Oct 04, 09:00", done: true }
    ]
  },
  {
    id: "DS-2026-00127",
    animalType: "Dog",
    reporterName: "Rohan Miller",
    locationName: "Rajajinagar 4th Block, Bengaluru",
    coordinates: { lat: 12.9915, lng: 77.5530 },
    reportedAt: "2026-09-10 09:00",
    symptoms: ["Severe Scab Formation", "Hair Loss", "Redness"],
    urgency: "Low",
    priorityScore: 30,
    status: "recovered",
    aiPrediction: "Canine Mange",
    aiConfidence: 89,
    severity: "Moderate",
    assignedNGO: "People For Animals (PFA Bengaluru)",
    assignedVolunteer: "Dr. Ananya Rao",
    veterinaryNotes: "28-day treatment course completed successfully. Full hair regrowth observed and skin scrapings cleared.",
    veterinarianConfirmed: true,
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    afterPhotoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Report Created", date: "Sep 10, 09:00", done: true },
      { step: "AI Screened", date: "Sep 10, 09:02", done: true },
      { step: "NGO Accepted (PFA)", date: "Sep 10, 10:15", done: true },
      { step: "Animal Rescued", date: "Sep 10, 12:00", done: true },
      { step: "Veterinary Check", date: "Sep 10, 14:00", done: true },
      { step: "Full Recovery", date: "Oct 02, 11:00", done: true }
    ]
  },
  {
    id: "DS-2026-00128",
    animalType: "Cattle",
    reporterName: "Mahesh Narayan",
    locationName: "Mallathahalli Main Road, Bengaluru",
    coordinates: { lat: 12.9610, lng: 77.4980 },
    reportedAt: "2026-10-04 16:45",
    symptoms: ["Skin Hives", "Swelling", "Flea Infestation"],
    urgency: "Medium",
    priorityScore: 48,
    status: "ngo_pending",
    aiPrediction: "Allergic Dermatitis",
    aiConfidence: 78,
    severity: "Low",
    assignedNGO: null,
    assignedVolunteer: null,
    veterinaryNotes: null,
    veterinarianConfirmed: false,
    photoUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80",
    timeline: [
      { step: "Report Created", date: "Oct 04, 16:45", done: true },
      { step: "AI Screened (78% Dermatitis)", date: "Oct 04, 16:46", done: true },
      { step: "NGO Acceptance Pending", date: "Waiting...", done: false },
      { step: "Animal Rescued", date: "Pending", done: false },
      { step: "Veterinary Check", date: "Pending", done: false },
      { step: "Treatment", date: "Pending", done: false }
    ]
  }
];

export const MOCK_NGOS = [
  {
    id: "ngo-1",
    name: "CUPA (Compassion Unlimited Plus Action)",
    area: "RT Nagar, Hebbal & Central Bengaluru",
    verified: true,
    phone: "080 2294 7352",
    email: "cupabglr@cupabangalore.org",
    activeCases: 4,
    resolvedCases: 128,
    operatingHours: "24/7 Emergency Helpline",
    coordinates: { lat: 12.9700, lng: 77.5100 }
  },
  {
    id: "ngo-2",
    name: "CARE (Charlie's Animal Rescue Centre)",
    area: "Yelahanka & Bengaluru North",
    verified: true,
    phone: "+91 94484 78908",
    email: "info@charliesare.org",
    activeCases: 6,
    resolvedCases: 215,
    operatingHours: "09:00 AM - 07:00 PM",
    coordinates: { lat: 12.9750, lng: 77.5300 }
  },
  {
    id: "ngo-3",
    name: "PFA Bengaluru (People For Animals)",
    area: "Kengeri & Mysore Road",
    verified: true,
    phone: "+91 99800 11228",
    email: "info@pfabangalore.org",
    activeCases: 3,
    resolvedCases: 94,
    operatingHours: "24/7 Animal Ambulance",
    coordinates: { lat: 12.9100, lng: 77.4800 }
  },
  {
    id: "ngo-4",
    name: "ALAI Rescue Trust (Animal Lives Matter)",
    area: "Kanakapura Road & Rajajinagar",
    verified: true,
    phone: "+91 97392 84405",
    email: "contact@alairescuetrust.org",
    activeCases: 5,
    resolvedCases: 310,
    operatingHours: "24/7 Trauma Unit",
    coordinates: { lat: 12.9880, lng: 77.5500 }
  }
];

export const PRESET_DETECTION_SAMPLES = [
  {
    id: "sample-1",
    title: "Stray Dog with Mange",
    animalType: "Dog",
    photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    qualityCheck: { passed: true, brightness: 88, sharpness: 92, visibility: 95, message: "Optimal Image Quality" },
    prediction: "Canine Mange",
    confidence: 88,
    severity: "Moderate",
    indicators: ["Epidermal Scabbing", "Patchy Alopecia (Hair Loss)", "Inflammatory Erythema"],
    description: "Mange is a contagious skin disease caused by microscopic mites (Sarcoptes scabiei / Demodex). Early diagnosis and antiparasitic treatment result in complete recovery.",
    urgency: "High"
  },
  {
    id: "sample-2",
    title: "Cat with Ringworm (Fungal)",
    animalType: "Cat",
    photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    qualityCheck: { passed: true, brightness: 82, sharpness: 89, visibility: 91, message: "Optimal Image Quality" },
    prediction: "Fungal Ringworm",
    confidence: 84,
    severity: "Moderate",
    indicators: ["Circular Lesion Boundary", "Desquamation (Scaling)", "Localized Hair Loss"],
    description: "Fungal ringworm (Dermatophytosis) produces characteristic circular scaly patches. Treated with systemic and topical antifungal agents.",
    urgency: "Medium"
  },
  {
    id: "sample-3",
    title: "Healthy Stray Dog",
    animalType: "Dog",
    photoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
    qualityCheck: { passed: true, brightness: 94, sharpness: 96, visibility: 98, message: "Optimal Image Quality" },
    prediction: "Healthy Skin",
    confidence: 94,
    severity: "Low",
    indicators: ["Intact Coat Density", "No Visible Erythema", "Healthy Epidermis"],
    description: "No clinical skin lesions detected. Animal coat and underlying epidermis are intact.",
    urgency: "Low"
  },
  {
    id: "sample-4",
    title: "Blurry / Dark Image (Quality Failure)",
    animalType: "Dog",
    photoUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80&blur=10",
    qualityCheck: { passed: false, brightness: 34, sharpness: 28, visibility: 40, message: "⚠️ Low Image Quality: Obstructed area or motion blur detected." },
    prediction: "Unknown / Low Confidence",
    confidence: 42,
    severity: "Unknown",
    indicators: ["Insufficient Focus", "Low Lighting Contrast"],
    description: "The AI system cannot provide a trustworthy screening result because lighting contrast or image resolution is below clinical safety threshold.",
    urgency: "Unknown"
  }
];

export const AI_MODEL_METRICS = {
  version: "DermaScan EfficientNet-B2 Classifier",
  lastUpdated: "2026-10-04",
  datasetCount: 4280,
  accuracy: 91.4,
  precision: 89.8,
  recall: 90.2,
  f1Score: 90.0,
  confusionMatrix: [
    { class: "Mange", predictedMange: 92, predictedFungal: 4, predictedDermatitis: 3, predictedHealthy: 1 },
    { class: "Fungal", predictedMange: 3, predictedFungal: 88, predictedDermatitis: 7, predictedHealthy: 2 },
    { class: "Dermatitis", predictedMange: 4, predictedFungal: 5, predictedDermatitis: 89, predictedHealthy: 2 },
    { class: "Healthy", predictedMange: 1, predictedFungal: 2, predictedDermatitis: 2, predictedHealthy: 95 }
  ],
  diseaseDistribution: [
    { name: "Mange", count: 485, percentage: 41 },
    { name: "Fungal Ringworm", count: 320, percentage: 27 },
    { name: "Allergic Dermatitis", count: 210, percentage: 18 },
    { name: "Healthy / Cleared", count: 120, percentage: 10 },
    { name: "Other / Unknown", count: 49, percentage: 4 }
  ],
  casesByArea: [
    { area: "Nagarbhavi", count: 142 },
    { area: "Vijayanagar", count: 118 },
    { area: "Kengeri", count: 95 },
    { area: "Rajajinagar", count: 86 },
    { area: "Mallathahalli", count: 64 }
  ]
};
