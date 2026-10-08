export const INITIAL_CASES = [];

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
    photoUrl: "/samples/dog_mange.jpg",
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
    photoUrl: "/samples/cat_ringworm.jpg",
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
    title: "Dog with Allergic Dermatitis",
    animalType: "Dog",
    photoUrl: "/samples/dog_dermatitis.jpg",
    qualityCheck: { passed: true, brightness: 90, sharpness: 94, visibility: 93, message: "Optimal Image Quality" },
    prediction: "Allergic Dermatitis",
    confidence: 91,
    severity: "Moderate",
    indicators: ["Ventral Red Erythema", "Excoriation Marks", "Flea Infestation Signs"],
    description: "Allergic skin inflammation caused by flea bites or environmental contact allergens. Presents with localized redness and itching.",
    urgency: "Medium"
  },
  {
    id: "sample-4",
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
    id: "sample-5",
    title: "Blurry / Dark Image (Quality Failure)",
    animalType: "Dog",
    photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80&blur=10",
    qualityCheck: { passed: false, brightness: 34, sharpness: 28, visibility: 40, message: "Low Image Quality: Obstructed area or motion blur detected." },
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
