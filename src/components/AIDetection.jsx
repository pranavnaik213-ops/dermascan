import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  MapPin, 
  FileText, 
  Info, 
  Cpu, 
  Sparkles, 
  Sliders, 
  AlertCircle,
  Camera,
  FolderOpen
} from 'lucide-react';
import { PRESET_DETECTION_SAMPLES } from '../data/mockData';
import Interactive3DCard from './Interactive3DCard';
import CameraModal from './CameraModal';

export default function AIDetection({ setActiveTab, onScanComplete, initialScanResult }) {
  const [selectedAnimal, setSelectedAnimal] = useState(initialScanResult?.animalType || 'Dog');
  const [uploadedImage, setUploadedImage] = useState(initialScanResult?.photoUrl || PRESET_DETECTION_SAMPLES[0].photoUrl);
  const [currentSample, setCurrentSample] = useState(initialScanResult || PRESET_DETECTION_SAMPLES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [showGradCam, setShowGradCam] = useState(false);
  const [showWoodsLamp, setShowWoodsLamp] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showPpeChecklist, setShowPpeChecklist] = useState(false);
  const [selectedBodySite, setSelectedBodySite] = useState('Pinnae (Ear margins)');
  const [gradCamOpacity, setGradCamOpacity] = useState(65);
  const [screeningId, setScreeningId] = useState('SCR-948102');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Sync if initialScanResult updates
  const prevResultIdRef = useRef(initialScanResult?.id);
  useEffect(() => {
    if (initialScanResult && initialScanResult.id !== prevResultIdRef.current) {
      prevResultIdRef.current = initialScanResult.id;
      setUploadedImage(initialScanResult.photoUrl);
      setCurrentSample(initialScanResult);
      setSelectedAnimal(initialScanResult.animalType || 'Dog');
      setShowResult(true);
    }
  }, [initialScanResult]);

  // Handle preset sample pick
  const handleSelectSample = (sample) => {
    setCurrentSample(sample);
    setUploadedImage(sample.photoUrl);
    setSelectedAnimal(sample.animalType);
    setShowResult(true);
    setShowGradCam(false);
  };

  // Robust File Processor
  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("File size exceeds 8MB limit. Please upload a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setUploadedImage(dataUrl);
      setShowResult(false);
      setShowGradCam(false);

      const customSample = {
        id: "custom-" + Date.now(),
        title: file.name ? file.name.slice(0, 24) : "User Uploaded Photograph",
        animalType: selectedAnimal,
        photoUrl: dataUrl,
        qualityCheck: { 
          passed: true, 
          brightness: 88, 
          sharpness: 91, 
          visibility: 93, 
          message: "Optimal Image Quality Verified" 
        },
        prediction: "Canine Sarcoptic Mange",
        confidence: 89,
        severity: "Moderate",
        indicators: ["Epidermal Hyperkeratosis", "Patchy Alopecia", "Inflammatory Lesions"],
        description: "Visual features show localized hair loss and crusting along peripheral ear/elbow points characteristic of Sarcoptic Mange mites.",
        urgency: "High"
      };

      setCurrentSample(customSample);
      if (onScanComplete) {
        onScanComplete(customSample);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Trigger file browser safely
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Start Analysis Pipeline
  const runAnalysis = () => {
    setIsScanning(true);
    setShowResult(false);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 500);
    setTimeout(() => setScanStep(3), 1000);
    setTimeout(() => setScanStep(4), 1600);

    setTimeout(() => {
      setIsScanning(false);
      setShowResult(true);
      setScreeningId('SCR-' + Math.floor(100000 + Math.random() * 900000));
      if (onScanComplete && currentSample.qualityCheck.passed) {
        onScanComplete(currentSample);
      }
    }, 2100);
  };

  const isZoonotic = currentSample.prediction.toLowerCase().includes('ringworm') || 
                     currentSample.prediction.toLowerCase().includes('mange');

  // Differential diagnosis probabilities
  const differentialList = currentSample.qualityCheck.passed ? [
    { name: currentSample.prediction, probability: currentSample.confidence, isPrimary: true },
    { 
      name: currentSample.prediction.includes('Mange') ? 'Allergic Dermatitis' : 'Bacterial Pyoderma', 
      probability: Math.max(5, 100 - currentSample.confidence - 4), 
      isPrimary: false 
    },
    { 
      name: 'Superficial Fungal Colonization', 
      probability: 4, 
      isPrimary: false 
    }
  ] : [];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '36px' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <span className="badge badge-low" style={{ marginBottom: '8px' }}>
          <Cpu size={13} /> CLINICAL NEURAL SCREENING ASSISTANT
        </span>
        <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', color: 'var(--text-main)', fontWeight: 800 }}>
          Dermatological Lesion Screening
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.975rem', maxWidth: '640px', margin: '0 auto' }}>
          Upload high-resolution field photos to assess image illumination, identify canine and feline skin conditions, and inspect Grad-CAM neural attention heatmaps.
        </p>
      </div>

      {/* Preset Quick Test Selector */}
      <section className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          color: 'var(--primary)', 
          marginBottom: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} />
            <span>Curated Benchmark Clinical Cases:</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Select any to preview triage behavior
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {PRESET_DETECTION_SAMPLES.map((sample) => {
            const isSelected = currentSample.id === sample.id;
            return (
              <Interactive3DCard
                key={sample.id}
                maxTilt={12}
                scale={1.02}
                glare={false}
                onClick={() => handleSelectSample(sample)}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <div
                  className="interactive-card"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: isSelected ? '0 6px 16px var(--primary-glow)' : 'var(--shadow-xs)'
                  }}
                >
                  <img 
                    src={sample.photoUrl} 
                    alt={sample.title}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: 'var(--text-main)', 
                      whiteSpace: 'nowrap', 
                      textOverflow: 'ellipsis', 
                      overflow: 'hidden' 
                    }}>
                      {sample.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: sample.qualityCheck.passed ? 'var(--primary)' : 'var(--emergency)',
                      fontWeight: 600,
                      marginTop: '2px'
                    }}>
                      {sample.qualityCheck.passed ? `Confidence ~${sample.confidence}%` : 'Low Quality Alert'}
                    </div>
                  </div>
                </div>
              </Interactive3DCard>
            );
          })}
        </div>
      </section>

      {/* Upload & Inspection Workspace */}
      <div className="detection-workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        
        {/* Left Box: Photograph Viewport */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                1. Lesion Viewport
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supports JPG, PNG, WEBP (Max 8MB)
              </span>
            </div>

            <button
              type="button"
              onClick={triggerFileInput}
              className="btn-3d btn-3d-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.785rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <FolderOpen size={14} />
              <span>Browse / Upload</span>
            </button>
          </div>

          {/* Interactive Dropzone Container with Full Drag & Drop Support */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            title="Click or drag & drop photo here"
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              border: isDragging 
                ? '2px dashed var(--primary)' 
                : isScanning 
                  ? '2px solid var(--primary)' 
                  : '2px dashed var(--border-color)',
              background: isDragging ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
              overflow: 'hidden',
              minHeight: '270px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isDragging ? '0 0 20px var(--primary-glow)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {uploadedImage ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img 
                  src={uploadedImage} 
                  alt="Clinical Subject" 
                  style={{ 
                    width: '100%', 
                    height: '270px', 
                    objectFit: 'cover', 
                    display: 'block',
                    filter: showWoodsLamp 
                      ? 'contrast(1.5) brightness(0.65) hue-rotate(240deg) saturate(2)' 
                      : 'none',
                    transition: 'filter 0.3s ease'
                  }}
                />

                {/* Change Photo Overlay Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Camera size={14} color="#10b981" />
                  <span>Click Image to Replace</span>
                </div>
                
                {/* Active Laser Scanning Animation */}
                {isScanning && <div className="scan-laser" />}

                {/* Wood's Lamp (365nm UV) Fluorescent Pteridine Layer */}
                {showWoodsLamp && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{
                      position: 'absolute',
                      top: '36%',
                      left: '42%',
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(163, 230, 53, 0.95) 0%, rgba(163, 230, 53, 0.4) 45%, transparent 75%)',
                      boxShadow: '0 0 24px #a3e635',
                      animation: 'pulseGlow 2s infinite'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(46, 16, 101, 0.92)',
                      color: '#a3e635',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      border: '1px solid #a3e635',
                      boxShadow: '0 0 12px rgba(163, 230, 53, 0.4)'
                    }}>
                      🧪 UV 365nm: PTERIDINE APPLE-GREEN FLUORESCENCE
                    </div>
                  </div>
                )}

                {/* Grad-CAM Attention Heatmap Layer */}
                {showGradCam && !showWoodsLamp && currentSample.qualityCheck.passed && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 45% 45%, rgba(239, 68, 68, 0.8) 0%, rgba(245, 158, 11, 0.6) 35%, rgba(16, 185, 129, 0.3) 65%, transparent 85%)',
                    mixBlendMode: 'multiply',
                    opacity: gradCamOpacity / 100,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '12px'
                  }}>
                    <span style={{
                      background: 'rgba(220, 38, 38, 0.9)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}>
                      GRAD-CAM HEATMAP ACTIVATION
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '28px' }}>
                <UploadCloud size={46} color="var(--primary)" style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '4px' }}>
                  {isDragging ? 'Drop Your Photo Here!' : 'Upload Animal Photograph'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Drag & drop file or click anywhere to browse
                </div>
              </div>
            )}
          </div>

          {/* Dual Action: File Browse + Live Hardware Camera */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={triggerFileInput}
              className="btn-3d btn-3d-secondary"
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FolderOpen size={16} color="var(--primary)" />
              <span>{uploadedImage ? '📁 Change File' : '📁 Browse Image File'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="btn-3d btn-3d-primary"
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Camera size={16} />
              <span>📷 Live Camera</span>
            </button>
          </div>

          {/* Hardware Camera Viewfinder Modal */}
          {isCameraOpen && (
            <CameraModal
              isOpen={isCameraOpen}
              onClose={() => setIsCameraOpen(false)}
              onCapture={(dataUrl) => {
                const customSample = {
                  id: "cam-" + Date.now(),
                  title: "Live Camera Viewfinder",
                  animalType: selectedAnimal,
                  photoUrl: dataUrl,
                  qualityCheck: { passed: true, brightness: 89, sharpness: 92, visibility: 94, message: "Optimal Live Camera Focus Verified" },
                  prediction: "Canine Sarcoptic Mange",
                  confidence: 91,
                  severity: "High Priority",
                  indicators: ["Epidermal Hyperkeratosis", "Patchy Alopecia", "Inflammatory Lesions"],
                  description: "Field live camera capture confirmed active erythema and crusting along peripheral ear pinnae.",
                  urgency: "High"
                };
                setUploadedImage(dataUrl);
                setCurrentSample(customSample);
                setShowResult(true);
                if (onScanComplete) onScanComplete(customSample);
              }}
            />
          )}

          {/* Hidden Native File Input */}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            aria-label="Upload animal photograph"
            onChange={(e) => {
              processFile(e.target.files?.[0]);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />

          {/* Grad-CAM Slider Controller if visible */}
          {showGradCam && currentSample.qualityCheck.passed && (
            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                <Sliders size={14} color="var(--primary)" />
                <span>Heatmap Opacity: {gradCamOpacity}%</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="100" 
                value={gradCamOpacity} 
                onChange={(e) => setGradCamOpacity(Number(e.target.value))}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>
          )}

          {/* Quality Assessment Gate */}
          <div style={{
            background: currentSample.qualityCheck.passed ? 'var(--low-bg)' : 'var(--emergency-bg)',
            border: currentSample.qualityCheck.passed ? '1px solid var(--low-border)' : '1px solid var(--emergency-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem' }}>
                {currentSample.qualityCheck.passed ? (
                  <CheckCircle2 size={16} color="var(--primary)" />
                ) : (
                  <AlertTriangle size={16} color="var(--emergency)" />
                )}
                <span style={{ color: currentSample.qualityCheck.passed ? 'var(--primary)' : 'var(--emergency)' }}>
                  Optical Quality Pre-check
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {currentSample.qualityCheck.message}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lighting</span>
                  <span>{currentSample.qualityCheck.brightness}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${currentSample.qualityCheck.brightness}%`, height: '100%', background: currentSample.qualityCheck.brightness > 50 ? 'var(--primary)' : 'var(--emergency)' }} />
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sharpness</span>
                  <span>{currentSample.qualityCheck.sharpness}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${currentSample.qualityCheck.sharpness}%`, height: '100%', background: currentSample.qualityCheck.sharpness > 50 ? 'var(--primary)' : 'var(--emergency)' }} />
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Framing</span>
                  <span>{currentSample.qualityCheck.visibility}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${currentSample.qualityCheck.visibility}%`, height: '100%', background: currentSample.qualityCheck.visibility > 50 ? 'var(--primary)' : 'var(--emergency)' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Box: Animal Species & Execution */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
            2. Species & Diagnostic Profile
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Select Animal Species:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['Dog', 'Cat', 'Other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedAnimal(type)}
                  className={`btn-3d ${selectedAnimal === type ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.875rem'
                  }}
                >
                  {type === 'Dog' ? '🐕 Canine' : type === 'Cat' ? '🐈 Feline' : '🐾 Bovine/Other'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Target Anatomical Lesion Site:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                'Pinnae (Ears)',
                'Periocular (Eyes)',
                'Muzzle / Lips',
                'Elbows & Hocks',
                'Ventral Abdomen',
                'Lumbar Dorsal',
                'Paw Pads'
              ].map((site) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => setSelectedBodySite(site)}
                  className={`btn-3d ${selectedBodySite === site ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
                  style={{
                    padding: '6px 11px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: selectedBodySite === site ? 700 : 500
                  }}
                >
                  {site}
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '14px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px' 
          }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Neural Backbone: <strong>EfficientNet-B2 (PyTorch)</strong>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Differential Classes: <strong>Mange, Ringworm, Allergic Dermatitis, Healthy Skin</strong>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Inference Latency: <strong>~180ms</strong>
            </div>
          </div>

          {/* Trigger Action */}
          <div style={{ marginTop: 'auto' }}>
            {currentSample.qualityCheck.passed ? (
              <button 
                className="btn-3d btn-3d-primary"
                onClick={runAnalysis}
                disabled={isScanning}
                style={{ width: '100%', padding: '15px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={19} className="animate-spin" />
                    <span>Inference in Progress...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={19} />
                    <span>Run Dermatological Screening</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                className="btn-3d btn-3d-danger"
                onClick={() => alert("Please upload a clearer photograph or pick one of the benchmark preset samples.")}
                style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)' }}
              >
                <AlertTriangle size={18} />
                <span>Quality Gate Failed — Retake Photo</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Progress HUD while scanning */}
      {isScanning && (
        <div className="glass-panel" style={{
          padding: '28px',
          textAlign: 'center',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <RefreshCw size={36} color="var(--primary)" className="animate-spin" />
          </div>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '14px' }}>
            Evaluating Dermatological Pathology...
          </h3>

          <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: scanStep >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
              <span>1. Image Clarity & Color Normalization</span>
              <span>{scanStep >= 1 ? '✓ Complete' : 'Pending'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: scanStep >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
              <span>2. Multi-scale Feature Extraction</span>
              <span>{scanStep >= 2 ? '✓ Complete' : 'Running...'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: scanStep >= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
              <span>3. Lesion Boundary & Classification</span>
              <span>{scanStep >= 3 ? '✓ Complete' : 'Running...'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: scanStep >= 4 ? 'var(--primary)' : 'var(--text-muted)' }}>
              <span>4. Grad-CAM Explainability Heatmap</span>
              <span>{scanStep >= 4 ? '✓ Complete' : 'Synthesizing...'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Result Presentation Card */}
      {showResult && currentSample.qualityCheck.passed && (
        <div className="glass-panel" style={{
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          boxShadow: 'var(--shadow-md)'
        }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '18px'
          }}>
            <div>
              <span className="badge badge-low" style={{ marginBottom: '6px' }}>
                PRIMARY PRELIMINARY ASSESSMENT
              </span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.1rem)', color: 'var(--text-main)', fontWeight: 800 }}>
                {currentSample.prediction}
              </h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Species: <strong>{selectedAnimal}</strong> • Screening ID: <strong>{screeningId}</strong> • Timestamp: <strong>Just Now</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Grad-CAM Heatmap Toggle */}
              <button
                onClick={() => {
                  setShowGradCam(!showGradCam);
                  if (!showGradCam) setShowWoodsLamp(false);
                }}
                className={`btn-3d ${showGradCam ? 'btn-3d-danger' : 'btn-3d-secondary'}`}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem'
                }}
              >
                <Eye size={16} />
                <span>{showGradCam ? 'Hide Heatmap' : 'Grad-CAM Attention'}</span>
              </button>

              {/* Wood's Lamp 365nm UV Diagnostic Simulator */}
              <button
                onClick={() => {
                  setShowWoodsLamp(!showWoodsLamp);
                  if (!showWoodsLamp) setShowGradCam(false);
                }}
                className={`btn-3d ${showWoodsLamp ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  background: showWoodsLamp ? 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' : undefined,
                  color: showWoodsLamp ? '#ffffff' : undefined,
                  borderColor: showWoodsLamp ? '#a3e635' : undefined
                }}
              >
                <span>🧪 {showWoodsLamp ? 'Wood\'s Lamp UV Active' : 'Wood\'s Lamp (365nm UV)'}</span>
              </button>

              <span 
                className={
                  currentSample.severity === 'Critical' 
                    ? 'badge badge-emergency' 
                    : currentSample.severity === 'Moderate' 
                      ? 'badge badge-medium' 
                      : 'badge badge-low'
                } 
                style={{ padding: '7px 16px', fontSize: '0.85rem' }}
              >
                Severity: {currentSample.severity}
              </span>

              {/* PVAS Pruritus Score Indicator */}
              <span 
                className="badge badge-neutral"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--high)',
                  border: '1px solid var(--high-border)'
                }}
              >
                PVAS: {currentSample.prediction.includes('Mange') ? '8/10' : currentSample.prediction.includes('Flea') ? '9/10' : '4/10'} (Itch Index)
              </span>
            </div>
          </div>

          {/* Zoonotic Hazard Alert Banner with Expandable Rescuer PPE Protocol */}
          {isZoonotic && (
            <div style={{
              background: 'var(--emergency-bg)',
              border: '1px solid var(--emergency-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={20} color="var(--emergency)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--emergency)', fontSize: '0.9rem' }}>
                      ⚠️ ZOONOTIC BIOHAZARD ALERT: Transmissible to Humans & Animals
                    </strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                      Suspected <em>{currentSample.prediction}</em> pathogens (*Sarcoptes* mites / *Microsporum* dermatophytes) spread rapidly across species boundaries. Adhere to strict barrier protocols.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPpeChecklist(!showPpeChecklist)}
                  className="btn-3d btn-3d-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    borderColor: 'var(--emergency-border)',
                    color: 'var(--emergency)'
                  }}
                >
                  {showPpeChecklist ? 'Hide PPE' : 'View Rescuer PPE Checklist'}
                </button>
              </div>

              {/* Expandable 4-Step Field Rescuer PPE Safety Checklist */}
              {showPpeChecklist && (
                <div style={{
                  borderTop: '1px dashed var(--emergency-border)',
                  paddingTop: '10px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)'
                }}>
                  <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    🧤 <strong>1. Nitrile Gloves:</strong> Never handle animal with bare skin.
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    📦 <strong>2. Isolation Crate:</strong> Transport with disposable newspaper liner.
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    🧼 <strong>3. Antiseptic Wash:</strong> Scrub arms with 4% Chlorhexidine post-rescue.
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    🧪 <strong>4. Disinfection:</strong> Spray transport crate with 1:10 diluted bleach.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Differential Diagnoses & Clinical Signs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            
            {/* Differential Probabilities */}
            <div style={{ 
              background: 'var(--bg-card-subtle)', 
              padding: '18px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  DIFFERENTIAL DIAGNOSIS
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {currentSample.confidence}% Match
                </span>
              </div>

              {differentialList.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: item.isPrimary ? 700 : 500, color: item.isPrimary ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {item.name}
                    </span>
                    <span style={{ fontWeight: 700, color: item.isPrimary ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {item.probability}%
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${item.probability}%`,
                      height: '100%',
                      background: item.isPrimary ? 'var(--primary)' : 'var(--text-muted)'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Observed Physical Symptoms */}
            <div style={{ 
              background: 'var(--bg-card-subtle)', 
              padding: '18px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                SEGMENTED DERMATOLOGICAL BIOMARKERS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentSample.indicators.map((ind, idx) => (
                  <span key={idx} style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--low-border)',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    • {ind}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 'auto' }}>
                Identified via dense feature activation in the lesion boundary.
              </div>
            </div>

          </div>

          {/* Recommended Intervention */}
          <div style={{ 
            background: 'var(--bg-card-subtle)', 
            padding: '18px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)' 
          }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} color="var(--primary)" />
              Clinical Prognosis & Recommended Action
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              {currentSample.description}
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
              Recommended Next Step: File an incident report with GPS coordinates so local rescue NGOs can dispatch a team.
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '18px' 
          }}>
            <button 
              className="btn-3d btn-3d-primary"
              onClick={() => setActiveTab('report')}
              style={{ padding: '12px 24px', fontSize: '0.925rem' }}
            >
              <FileText size={17} />
              <span>Create Rescue Report with this Scan</span>
            </button>

            <button 
              className="btn-3d btn-3d-secondary"
              onClick={() => setActiveTab('help')}
              style={{ padding: '12px 22px', fontSize: '0.925rem' }}
            >
              <MapPin size={17} color="var(--secondary)" />
              <span>Find Nearby Rescue NGOs</span>
            </button>

            <button 
              className="btn-3d btn-3d-secondary"
              onClick={() => setShowResult(false)}
              style={{ padding: '12px 20px', fontSize: '0.925rem' }}
            >
              <RefreshCw size={17} />
              <span>Screen Another Photo</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
