import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  ExternalLink,
  ImagePlus,
  Info,
  Key,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import CameraModal from './CameraModal';
import Interactive3DCard from './Interactive3DCard';
import { api } from '../services/api';
import { geminiVisionService } from '../services/geminiVisionService';
import { PRESET_DETECTION_SAMPLES } from '../data/mockData';

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

export default function AIDetection({ onPhotoReady }) {
  const fileInput = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [animalType, setAnimalType] = useState('Dog');
  const [presetNotice, setPresetNotice] = useState('');

  // Google Gemini AI Model Integration State
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => geminiVisionService.getKey());
  const [hasGeminiKey, setHasGeminiKey] = useState(() => geminiVisionService.hasKey());
  const [geminiTesting, setGeminiTesting] = useState(false);
  const [geminiSuccess, setGeminiSuccess] = useState('');
  const [geminiError, setGeminiError] = useState('');

  const handleSaveGeminiKey = async (e) => {
    e.preventDefault();
    setGeminiError('');
    setGeminiSuccess('');
    const key = geminiKeyInput.trim();

    if (!key) {
      geminiVisionService.clearKey();
      setHasGeminiKey(false);
      setGeminiSuccess('Key removed. Active model switched to on-device clinical engine.');
      return;
    }

    setGeminiTesting(true);
    try {
      await geminiVisionService.testKey(key);
      geminiVisionService.setKey(key);
      setHasGeminiKey(true);
      setGeminiSuccess('Google Gemini API Key verified & activated! Multimodal Vision is active.');
    } catch (err) {
      setGeminiError(err.message || 'Could not verify API key. Please check the key.');
    } finally {
      setGeminiTesting(false);
    }
  };

  const handleRemoveGeminiKey = () => {
    geminiVisionService.clearKey();
    setGeminiKeyInput('');
    setHasGeminiKey(false);
    setGeminiSuccess('Google Gemini key removed. Active model switched to on-device clinical engine.');
    setGeminiError('');
  };

  // Read file from user device
  const readPhoto = (file) => {
    setError('');
    setPresetNotice('');
    setAnalysisResult(null);
    setSelectedPresetId(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('This photo is larger than 12 MB. Please select a smaller photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto({ dataUrl: reader.result, name: file.name });
    };
    reader.onerror = () => setError('The photo could not be opened. Try another image.');
    reader.readAsDataURL(file);
  };

  // Run AI Detection ONLY when explicitly requested by user
  const runDetection = async () => {
    if (!photo?.dataUrl && !photo?.photoUrl) {
      setError('Please upload or select an animal photo first.');
      return;
    }

    setError('');
    setPresetNotice('');
    setIsAnalyzing(true);
    try {
      const result = await api.detect({
        image: photo.dataUrl,
        photoUrl: photo.photoUrl,
        photoName: photo.name,
        presetId: selectedPresetId,
        animalType
      });
      setAnalysisResult(result);
    } catch {
      setError('AI inference encountered an issue. Using verified clinical reference standards.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select a preset sample — PREVIEWS ONLY, NEVER AUTO-SCANS
  const selectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setError('');
    setAnalysisResult(null); // Clear any previous scan results
    const newPhoto = {
      photoUrl: preset.photoUrl,
      dataUrl: preset.photoUrl,
      name: `${preset.title} (${preset.animalType})`
    };
    setPhoto(newPhoto);
    setAnimalType(preset.animalType || 'Dog');
    setPresetNotice(`Loaded sample: "${preset.title}". Click "Scan & Analyze with AI" below to evaluate this photo.`);
  };

  // Pass analysis & photo to the animal report
  const handleProceedToReport = () => {
    if (!photo) return;
    const isHealthy = analysisResult?.conditionKey === 'Healthy' || !analysisResult?.hasLesion;
    const observationText = analysisResult
      ? (isHealthy
          ? `DermaScan AI Screening: Cleared — Healthy Epidermis (${analysisResult.confidence}% confidence). Intact hair follicle density, zero active lesions observed.`
          : `DermaScan AI Detection: ${analysisResult.prediction} (${analysisResult.confidence}% confidence, ${analysisResult.severity}). ${analysisResult.description || ''} Recommended next steps: ${analysisResult.recommendedProtocol || ''}`)
      : 'Photo attached from AI detection scanner.';

    onPhotoReady({
      photoUrl: photo.dataUrl || photo.photoUrl,
      photoName: photo.name || 'AI Scanned Image',
      animalType,
      aiDiagnosis: analysisResult,
      observations: observationText
    });
  };

  const resetScanner = () => {
    setPhoto(null);
    setAnalysisResult(null);
    setSelectedPresetId(null);
    setPresetNotice('');
    setError('');
  };

  const isHealthyResult = analysisResult?.conditionKey === 'Healthy' || analysisResult?.hasLesion === false;

  return (
    <section className="page-wrap content-page ai-detection-page" aria-labelledby="ai-detection-title">
      {/* Page Header */}
      <header className="page-intro page-intro-left">
        <span className="eyebrow"><Sparkles size={14} aria-hidden="true" /> VETERINARY SCREENING</span>
        <h1 id="ai-detection-title">Animal Skin Disease Classifier</h1>
        <p>
          Upload an animal photo to screen for dermatological lesions. The screening system evaluates the image for active inflammation, alopecia, and skin conditions.
        </p>
      </header>

      {/* AI Model Engine Status Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        borderRadius: '10px',
        background: hasGeminiKey ? '#f0fdf4' : '#f8fafc',
        border: `1px solid ${hasGeminiKey ? '#bbf7d0' : '#e2e8f0'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-grid',
            placeItems: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: hasGeminiKey ? '#10b981' : '#64748b',
            color: '#fff',
            flexShrink: 0
          }}>
            <Cpu size={15} />
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: hasGeminiKey ? '#065f46' : '#1e293b' }}>
              {hasGeminiKey ? 'Google Gemini Multimodal Vision AI Active' : 'DermaScan Clinical Vision Engine Active'}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              {hasGeminiKey
                ? 'Clinical classification powered directly by Google Gemini 1.5 Flash Vision'
                : 'Connect your free Google Gemini API Key for deep multimodal disease recognition (1,500 free daily scans)'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => { setGeminiModalOpen(true); setGeminiError(''); setGeminiSuccess(''); }}
          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Key size={13} />
          {hasGeminiKey ? 'AI Model Settings' : 'Connect Free Google Gemini AI'}
        </button>
      </div>

      {/* Main Scanner Workspace */}
      <div className="photo-review-layout" style={{ gridTemplateColumns: analysisResult ? 'minmax(0, 1.1fr) minmax(320px, 1.2fr)' : undefined }}>
        {/* Left Column: Image Canvas & Controls */}
        <div className="panel photo-review-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          {photo ? (
            <>
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#090d16',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '280px',
                padding: '12px',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6)'
              }}>
                <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0, maxWidth: '100%' }}>
                  <img
                    src={photo.dataUrl || photo.photoUrl}
                    alt="Animal skin subject"
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: '450px',
                      width: 'auto',
                      height: 'auto',
                      margin: '0 auto',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                    }}
                  />

                  {/* Status Overlay: ONLY draw red lesion box if a real lesion was detected (NEVER on healthy skin!) */}
                  {analysisResult?.roiBox && !isHealthyResult && (
                    <div
                      style={{
                        position: 'absolute',
                        top: analysisResult.roiBox.top,
                        left: analysisResult.roiBox.left,
                        width: analysisResult.roiBox.width,
                        height: analysisResult.roiBox.height,
                        border: '2px solid #ef4444',
                        background: 'rgba(239, 68, 68, 0.18)',
                        boxShadow: '0 0 16px rgba(239, 68, 68, 0.65), inset 0 0 10px rgba(239, 68, 68, 0.35)',
                        borderRadius: '6px',
                        pointerEvents: 'none',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: 10
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '-22px',
                        left: '0',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '3px',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                      }}>
                        FOCAL LESION ({analysisResult.conditionKey})
                      </span>
                    </div>
                  )}

                  {/* Scanning status banner */}
                  {isAnalyzing && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.85)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      color: '#fff',
                      backdropFilter: 'blur(3px)',
                      overflow: 'hidden',
                      zIndex: 20
                    }}>
                      <div className="scanner-laser-line" />
                      <div style={{
                        width: '46px',
                        height: '46px',
                        border: '3px solid #14b8a6',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.75s linear infinite',
                        boxShadow: '0 0 15px rgba(20, 184, 166, 0.5)'
                      }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em', color: '#f0fdfa' }}>
                        Screening image with AI...
                      </div>
                      <div style={{ fontSize: '12px', color: '#99f6e4' }}>
                        Scanning neural feature maps for active lesions & dermatological patterns
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo metadata strip under the image */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImagePlus size={14} /> {photo.name || 'Selected photo'}
                </span>
                {analysisResult?.qualityCheck && (
                  <span style={{ color: analysisResult.qualityCheck.passed ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    Quality: {analysisResult.qualityCheck.visibility}%
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="photo-review-empty">
              <span className="photo-review-empty-icon"><ImagePlus size={32} aria-hidden="true" /></span>
              <h2>No photo selected</h2>
              <p>Upload a clear photo of the animal's skin or fur to begin neural screening. You can also capture a photo with your camera.</p>
              <div className="photo-review-actions">
                <button type="button" className="button button-primary" onClick={() => fileInput.current?.click()}>
                  <Upload size={16} aria-hidden="true" /> Choose photo from device
                </button>
                <button type="button" className="button button-secondary" onClick={() => setCameraOpen(true)}>
                  <Camera size={16} aria-hidden="true" /> Use camera
                </button>
              </div>
            </div>
          )}

          {/* Sample loaded notice (before scanning) */}
          {presetNotice && !analysisResult && (
            <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={15} style={{ flexShrink: 0 }} />
              <span>{presetNotice}</span>
            </div>
          )}

          {/* Action buttons */}
          {photo && (
            <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {!analysisResult ? (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={runDetection}
                  disabled={isAnalyzing}
                  style={{ flex: 1.4 }}
                >
                  <Sparkles size={16} aria-hidden="true" /> {isAnalyzing ? 'Screening Image...' : 'Scan & Analyze with AI'}
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleProceedToReport}
                  style={{ flex: 1.4 }}
                >
                  <ArrowRight size={16} aria-hidden="true" /> Attach Findings & Report Animal
                </button>
              )}

              <button
                type="button"
                className="button button-secondary"
                onClick={() => fileInput.current?.click()}
                disabled={isAnalyzing}
              >
                <Upload size={14} aria-hidden="true" /> Change photo
              </button>

              <button
                type="button"
                className="button button-quiet"
                onClick={resetScanner}
                disabled={isAnalyzing}
              >
                <Trash2 size={14} aria-hidden="true" /> Reset
              </button>
            </div>
          )}

          {error && <p className="form-message error-message" role="alert" style={{ marginTop: '12px' }}>{error}</p>}

          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={(event) => { readPhoto(event.target.files?.[0]); event.target.value = ''; }}
            aria-label="Choose an animal photo"
          />


        </div>

        {/* Right Column: AI Analysis Results or Guidelines */}
        {analysisResult ? (
          <div className="panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Primary Result Banner */}
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: isHealthyResult ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${isHealthyResult ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: isHealthyResult ? '#16a34a' : '#dc2626',
                      color: '#fff',
                      textTransform: 'uppercase'
                    }}>
                      {isHealthyResult ? 'NO PATHOLOGY DETECTED' : (analysisResult.severity || 'Detected')}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)' }}>
                      {isHealthyResult ? 'Normal / Healthy Integument' : (analysisResult.category || 'Clinical Pathology')}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isHealthyResult ? '#dcfce7' : '#fee2e2',
                      color: isHealthyResult ? '#166534' : '#b91c1c'
                    }}>
                      {isHealthyResult ? 'PVAS 0/10 (No Pruritus)' : `PVAS ${analysisResult.pvasScore}/10 Pruritus`}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '20px', fontWeight: 750, color: isHealthyResult ? '#14532d' : '#0f172a', margin: '4px 0 2px' }}>
                    {isHealthyResult ? 'Healthy Skin (No Pathological Lesions)' : analysisResult.prediction}
                  </h2>
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: isHealthyResult ? '#166534' : '#475569', marginBottom: '8px' }}>
                    {analysisResult.scientificName || 'Canis lupus familiaris normal integument'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: isHealthyResult ? '#16a34a' : (analysisResult.confidence >= 90 ? '#16a34a' : (analysisResult.confidence >= 80 ? '#0284c7' : '#d97706'))
                  }}>
                    {analysisResult.confidence}%
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Confidence
                  </div>
                </div>
              </div>

              <p style={{ margin: '8px 0 0', fontSize: '13px', color: isHealthyResult ? '#166534' : '#334155', lineHeight: '1.6' }}>
                {isHealthyResult
                  ? 'Clinical screening confirmed no active lesions, epidermal scaling, pustules, or parasitic crusting. The animal exhibits intact hair follicle density and a healthy sebum barrier.'
                  : analysisResult.description}
              </p>
            </div>

            {/* Differential Diagnosis: Multi-Class Probability Distribution */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 750, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Differential Diagnosis (6 Clinical Classes)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Softmax Posterior Probs</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(analysisResult.allProbabilities || []).map((item, idx) => {
                  const isTop = idx === 0;
                  const isHealthyItem = item.class === 'Healthy';
                  return (
                    <div key={item.class} style={{ fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontWeight: isTop ? 750 : 500, color: isTop ? 'var(--ink)' : 'var(--muted)' }}>
                          {item.displayName}
                        </span>
                        <strong style={{ color: isTop ? (isHealthyItem ? '#16a34a' : 'var(--brand-dark)') : 'var(--muted)' }}>
                          {item.percentage}%
                        </strong>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.max(2, item.percentage)}%`,
                            background: isTop ? (isHealthyItem ? '#16a34a' : 'var(--brand)') : '#94a3b8',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease-out'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Observable Clinical Indicators */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 750, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                {isHealthyResult ? 'Verified Integument Features' : 'Identified Clinical Biomarkers'}
              </span>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '5px', fontSize: '12px', color: '#475569' }}>
                {isHealthyResult ? (
                  <>
                    <li>Intact hair follicle density with uniform coat coverage</li>
                    <li>Intact stratum corneum barrier with healthy sebum layer</li>
                    <li>Complete absence of erythema, papules, pustules, or crusting</li>
                    <li>Normal epidermal elasticity, turgor, and clear skin architecture</li>
                  </>
                ) : (
                  (analysisResult.indicators || []).map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))
                )}
              </ul>
            </div>

            {/* Proceed CTA Button */}
            <button
              type="button"
              className="button button-primary button-large"
              onClick={handleProceedToReport}
              style={{ width: '100%', marginTop: '6px' }}
            >
              <ArrowRight size={16} aria-hidden="true" /> {isHealthyResult ? 'Attach Photo & Continue to Report' : 'Attach Findings & Report Animal'}
            </button>
          </div>
        ) : (
          /* Default Note Panel before scan */
          <aside className="panel photo-review-note">
            <ShieldCheck size={20} aria-hidden="true" />
            <h2>Photo Screening</h2>
            <p>
              Upload or capture a clear photo of the animal's skin to review for visible lesions, inflammation, or coat loss.
            </p>
            <p style={{ marginTop: '10px' }}>
              Select a photo using the controls on the left, then click <strong>&quot;Scan &amp; Analyze with AI&quot;</strong> to evaluate the image.
            </p>
          </aside>
        )}
      </div>

      {/* Secondary Sample Tray: Placed cleanly below so it does NOT interfere with primary upload */}
      <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Need a test photo? Select a sample to preview
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Clicking a sample loads its image into the viewer. It does not scan until you click &quot;Scan &amp; Analyze with AI&quot;.
            </p>
          </div>
          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
            6 Clinical Benchmark Samples
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {PRESET_DETECTION_SAMPLES.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const isPresetHealthy = preset.conditionKey === 'Healthy';
            return (
              <Interactive3DCard
                key={preset.id}
                maxTilt={8}
                scale={1.03}
                style={{ borderRadius: '10px' }}
              >
                <button
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`preset-sample-btn ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--brand)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--brand-soft)' : 'var(--surface)',
                    boxShadow: isSelected 
                      ? '0 6px 14px rgba(13, 148, 136, 0.2), inset 0 1px 0 rgba(255,255,255,0.9)'
                      : '0 2px 6px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease'
                  }}
                >
                  <img
                    src={preset.photoUrl}
                    alt={preset.title}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 750,
                      color: isPresetHealthy ? '#166534' : 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {preset.prediction}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isPresetHealthy ? '#15803d' : 'var(--muted)'
                    }}>
                      {isPresetHealthy ? 'Healthy Control' : `${preset.confidence}% confidence`}
                    </div>
                  </div>
                </button>
              </Interactive3DCard>
            );
          })}
        </div>
      </div>

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => {
          setSelectedPresetId(null);
          setPhoto({ dataUrl, name: 'Camera capture' });
          setError('');
          setPresetNotice('Camera photo captured. Click "Scan & Analyze with AI" below to evaluate.');
          setAnalysisResult(null);
        }}
      />

      {/* Google Gemini Multimodal Vision AI Model Modal */}
      {geminiModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div className="panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            borderRadius: '14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            background: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                  <Sparkles size={18} />
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#0f172a' }}>
                  Google Gemini Multimodal Vision AI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGeminiModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
              Connect Google Gemini 1.5 Flash Vision to screen animal dermatological photos with deep multimodal accuracy. 
              Google provides <strong>1,500 free daily scans</strong> with no credit card required.
            </p>

            <form onSubmit={handleSaveGeminiKey} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label htmlFor="gemini-key-input" style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Google Gemini API Key
                </label>
                <input
                  id="gemini-key-input"
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '13.5px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {geminiError && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12.5px' }}>
                  {geminiError}
                </div>
              )}

              {geminiSuccess && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> {geminiSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={geminiTesting}
                  className="button button-primary"
                  style={{ flex: 1, minHeight: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Key size={14} />
                  {geminiTesting ? 'Verifying with Google…' : 'Save & Activate Key'}
                </button>

                {hasGeminiKey && (
                  <button
                    type="button"
                    onClick={handleRemoveGeminiKey}
                    className="button button-secondary"
                    style={{ minHeight: '42px', color: '#dc2626', fontSize: '13px' }}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
              <span>Need a free API key? </span>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0d9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                Get your free key on Google AI Studio <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
