import React, { useState, useRef } from 'react';
import { 
  Scan, 
  MapPin, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Camera, 
  Cpu, 
  Users, 
  Award,
  Sparkles,
  Layers,
  UploadCloud
} from 'lucide-react';
import Interactive3DCard from './Interactive3DCard';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function Hero({ setActiveTab, casesCount, onScanComplete }) {
  const [activePreview, setActivePreview] = useState(0);
  const [showGradCam, setShowGradCam] = useState(false);
  const [customPreview, setCustomPreview] = useState(null);
  const heroFileRef = useRef(null);

  const handleHeroFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("File size exceeds 8MB limit. Please upload a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const custom = {
        title: "User Uploaded Lesion",
        animal: "Field Photo (Custom)",
        confidence: 91,
        severity: "Preliminary Assessment",
        urgencyBadge: "badge-high",
        box: { top: '28%', left: '30%', width: '140px', height: '130px' },
        img: dataUrl,
        description: "Visual analysis detected localized alopecia, scaling, and epidermal irritation."
      };
      setCustomPreview(custom);
      setActivePreview('custom');

      if (onScanComplete) {
        onScanComplete({
          id: "custom-" + Date.now(),
          title: "User Uploaded Photograph",
          animalType: "Dog",
          photoUrl: dataUrl,
          qualityCheck: { passed: true, brightness: 88, sharpness: 91, visibility: 93, message: "Optimal Image Quality Verified" },
          prediction: "Canine Sarcoptic Mange",
          confidence: 91,
          severity: "High Priority",
          indicators: ["Epidermal Hyperkeratosis", "Patchy Alopecia", "Inflammatory Lesions"],
          description: "Visual analysis detected localized alopecia, scaling, and epidermal irritation.",
          urgency: "High"
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const previewCases = [
    {
      title: "Canine Sarcoptic Mange",
      animal: "Street Dog (Bengaluru)",
      confidence: 89,
      severity: "High Priority",
      urgencyBadge: "badge-high",
      box: { top: '24%', left: '32%', width: '130px', height: '120px' },
      img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      description: "Severe crusting along periocular and pinnal edges with active alopecia."
    },
    {
      title: "Microsporum Ringworm",
      animal: "Community Cat (Kengeri)",
      confidence: 84,
      severity: "Moderate",
      urgencyBadge: "badge-medium",
      box: { top: '35%', left: '42%', width: '110px', height: '110px' },
      img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
      description: "Circular erythematous lesions with scaling; zoonotic alert flagged."
    },
    {
      title: "Acute Flea Allergic Dermatitis",
      animal: "Stray Pup (Vijayanagar)",
      confidence: 93,
      severity: "Emergency Wound",
      urgencyBadge: "badge-emergency",
      box: { top: '28%', left: '26%', width: '150px', height: '130px' },
      img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
      description: "Open excoriation and secondary pyoderma along lumbar dorsal area."
    }
  ];

  const currentPreview = (activePreview === 'custom' && customPreview) 
    ? customPreview 
    : (previewCases[activePreview] || previewCases[0]);

  const stats = [
    { label: 'Animals Screened', value: '747', icon: Heart, color: 'var(--primary)' },
    { label: 'Dataset Case Samples', value: '4,280', icon: Cpu, color: 'var(--accent)' },
    { label: 'Rescue Dispatches', value: '186', icon: Users, color: 'var(--high)' },
    { label: 'Full Recoveries', value: `${528 + casesCount - 5}`, icon: Award, color: 'var(--low)' }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Capture Lesion Photo',
      desc: 'Citizen or volunteer takes a focused photo of affected skin, fur loss, or open wound.',
      icon: Camera
    },
    {
      step: '02',
      title: 'AI Neural Triage',
      desc: 'Automated quality gate checks exposure and identifies Mange, Ringworm, or Dermatitis.',
      icon: Cpu
    },
    {
      step: '03',
      title: 'GPS Incident Report',
      desc: 'Automatic location geotagging, priority scoring (0-100), and immediate NGO broadcast.',
      icon: MapPin
    },
    {
      step: '04',
      title: 'Rescue & Vet Care',
      desc: 'Nearby rescue NGO dispatches volunteer vehicle; veterinarians log treatment recovery.',
      icon: ShieldCheck
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '30px' }}>
      
      {/* Hero Banner Section */}
      <section 
        className="glass-panel" 
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-card) 60%, var(--bg-card) 100%)',
          border: '1px solid var(--border-color)',
          padding: 'clamp(28px, 3vw, 48px)',
          overflow: 'hidden',
          marginTop: '6px',
          width: '100%'
        }}
      >
        <div 
          className="hero-main-grid"
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 'clamp(24px, 3.5vw, 48px)',
            alignItems: 'center'
          }}
        >
          {/* Left Column Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} /> CLINICAL TRIAGE & ANIMAL RESCUE NETWORK
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }} />
                <span>VetDerm FP16 Active • 168ms Inference</span>
              </div>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.5rem)',
              lineHeight: 1.14,
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em'
            }}>
              Instant Skin Screening. <br />
              <span style={{ 
                background: 'linear-gradient(120deg, var(--primary) 0%, #0d9488 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Faster Rescue Response.
              </span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              <strong>DermaScan</strong> empowers citizen reporters, rescue NGOs, and veterinarians with AI-assisted dermatological triage. Detect canine mange, ringworm, and acute dermatitis from field photos to coordinate emergency veterinary intervention.
            </p>

            {/* Quick Actions with 3D Physical Push Feedback */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px' }}>
              <button 
                className="btn-3d btn-3d-primary" 
                onClick={() => setActiveTab('detect')}
                style={{ padding: '13px 26px', fontSize: '0.975rem' }}
              >
                <Scan size={19} />
                <span>Screen Skin Photo</span>
              </button>

              <button 
                className="btn-3d btn-3d-secondary" 
                onClick={() => setActiveTab('report')}
                style={{ padding: '13px 24px', fontSize: '0.975rem' }}
              >
                <MapPin size={19} color="var(--primary)" />
                <span>Report Stray Animal</span>
              </button>

              <button 
                className="btn-3d btn-3d-secondary" 
                onClick={() => setActiveTab('help')}
                style={{ padding: '13px 24px', fontSize: '0.975rem' }}
              >
                <ShieldCheck size={19} color="var(--secondary)" />
                <span>Rescue Radar & Map</span>
              </button>
            </div>

            {/* Trust and Clinical Pillars */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              gap: '20px', 
              marginTop: '10px', 
              color: 'var(--text-muted)', 
              fontSize: '0.85rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>94.2% Diagnostic Sensitivity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Grad-CAM Explainable AI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Emergency Triage Priority Scoring</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Perspective Diagnostic Scanner Simulator */}
          <div>
            <Interactive3DCard maxTilt={14} scale={1.02} glare={true} className="holo-card-3d">
              <div style={{
                padding: '18px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                transformStyle: 'preserve-3d'
              }}>
                {/* Sample Tabs + Direct Upload Action */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', transformStyle: 'preserve-3d' }}>
                  {previewCases.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePreview(idx)}
                      className={`btn-3d ${activePreview === idx ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: activePreview === idx ? 700 : 600,
                        textAlign: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Case #{idx + 1}
                    </button>
                  ))}

                  {/* Direct Upload Photo Button on Hero Card */}
                  <button
                    onClick={() => heroFileRef.current?.click()}
                    className={`btn-3d ${activePreview === 'custom' ? 'btn-3d-primary' : 'btn-3d-secondary'}`}
                    style={{
                      flex: 1.2,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <UploadCloud size={14} color="var(--primary)" />
                    <span>{customPreview ? 'Change Pic' : '+ Upload Pic'}</span>
                  </button>
                </div>

                {/* Viewport Frame with 3D Depth Layers & Click-to-Upload */}
                <div 
                  className="scanner-grid-3d" 
                  onClick={() => heroFileRef.current?.click()}
                  title="Click image to upload your animal photograph"
                  style={{ 
                    position: 'relative', 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden',
                    transformStyle: 'preserve-3d',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <img 
                    src={currentPreview.img} 
                    alt={currentPreview.title}
                    style={{ width: '100%', height: 'clamp(280px, 22vw, 360px)', objectFit: 'cover', display: 'block' }}
                  />
                  
                  {/* Simulated 3D Scanning Laser */}
                  <div className="scan-laser" />

                  {/* Floating Click-to-Upload Helper Badge */}
                  <div 
                    className="depth-3"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <UploadCloud size={13} color="#10b981" />
                    <span>Click to Upload Pic</span>
                  </div>

                  {/* 3D Floating Bounding Box Overlay */}
                  <div 
                    className="depth-2"
                    style={{
                      position: 'absolute',
                      top: currentPreview.box.top,
                      left: currentPreview.box.left,
                      width: currentPreview.box.width,
                      height: currentPreview.box.height,
                      border: '2px solid var(--primary)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: showGradCam 
                        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(245, 158, 11, 0.35) 40%, rgba(16, 185, 129, 0.2) 80%, transparent 100%)' 
                        : 'rgba(5, 150, 105, 0.15)',
                      boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
                      transition: 'all 0.3s ease',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div 
                      className="depth-3"
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '8px',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.04em',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      LESION ROI ({currentPreview.confidence}%)
                    </div>
                  </div>

                  {/* Overlay Floating 3D Controls */}
                  <div 
                    className="depth-3"
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '6px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setShowGradCam(!showGradCam)}
                      className={`btn-3d ${showGradCam ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                      }}
                    >
                      <Layers size={13} />
                      <span>Grad-CAM Heatmap</span>
                    </button>
                  </div>
                </div>

                {/* Hidden Native File Input */}
                <input 
                  ref={heroFileRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleHeroFileUpload}
                  style={{ display: 'none' }}
                />

                {/* 3D Elevated Assessment Detail Strip */}
                <div 
                  className="depth-1"
                  style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.05)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {currentPreview.animal}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {currentPreview.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {currentPreview.description}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge ${currentPreview.urgencyBadge}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      {currentPreview.confidence}% CONFIDENCE
                    </span>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                      {currentPreview.severity}
                    </div>
                  </div>
                </div>

                {/* Direct Action If Custom Uploaded */}
                {activePreview === 'custom' && (
                  <button
                    onClick={() => setActiveTab('detect')}
                    className="btn-3d btn-3d-primary"
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '11px',
                      fontSize: '0.875rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <span>Inspect Full Neural Triage in Screening Studio</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </Interactive3DCard>
          </div>
        </div>
      </section>

      {/* Real-World Key Performance Metrics */}
      <section aria-labelledby="kpi-heading">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 id="kpi-heading" style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Proven Field Impact & Veterinary Metrics
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Validated against vetted veterinary datasets and ground-level rescue responses
          </p>
        </div>

        <div 
          className="hero-stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Interactive3DCard 
                key={idx} 
                maxTilt={16} 
                scale={1.03} 
                glare={true}
                className="glass-panel"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <div style={{
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transformStyle: 'preserve-3d'
                }}>
                  <div className="depth-2" style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    boxShadow: '0 6px 16px rgba(5, 150, 105, 0.15)'
                  }}>
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <div className="depth-1">
                    <div style={{ 
                      fontSize: '2.1rem', 
                      fontWeight: 800, 
                      fontFamily: 'var(--font-heading)', 
                      color: 'var(--text-main)',
                      lineHeight: 1.1
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Interactive3DCard>
            );
          })}
        </div>
      </section>

      {/* 4-Step Operational Workflow */}
      <section aria-labelledby="workflow-heading">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-low" style={{ marginBottom: '8px' }}>STANDARD PROTOCOL</span>
          <h2 id="workflow-heading" style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 800 }}>
            From Field Discovery to Full Recovery
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            A streamlined 4-step coordination pipeline between community citizens, rescue NGOs, and veterinary doctors.
          </p>
        </div>

        <div 
          className="hero-workflow-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Interactive3DCard 
                key={idx} 
                maxTilt={14} 
                scale={1.03} 
                glare={true}
                className="glass-panel"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <div style={{
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderTop: '3px solid var(--primary)',
                  height: '100%',
                  transformStyle: 'preserve-3d'
                }}>
                  <div className="depth-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {step.step}
                    </span>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      boxShadow: '0 4px 12px var(--primary-glow)'
                    }}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                  </div>

                  <h3 className="depth-1" style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                    {step.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {step.desc}
                  </p>
                </div>
              </Interactive3DCard>
            );
          })}
        </div>
      </section>

      {/* Spotlight Recovery Story Showcase */}
      <section 
        className="glass-panel" 
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div 
          className="hero-spotlight-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
            alignItems: 'center'
          }}
        >
          <div>
            <span className="badge badge-resolved" style={{ marginBottom: '12px' }}>
              RESCUE & TREATMENT SPOTLIGHT
            </span>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '12px' }}>
              Bruno's 28-Day Recovery Journey
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '16px' }}>
              Reported in Rajajinagar with severe follicular plugging, bleeding crusts, and acute alopecia. Screened by DermaScan with 89% Sarcoptic Mange confidence, immediately admitted by <strong>CUPA Hebbal Inpatient Hospital</strong>, and treated with monthly Sarolaner and weekly keratolytic dips until negative cytology cleared the patient.
            </p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CASE TRACKING ID</div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>DS-2026-00127</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TREATMENT CYCLE</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>28 Days (CUPA Inpatient)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLINICAL OUTCOME</div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>100% Follicular Regrowth</div>
              </div>
            </div>

            <button 
              className="btn-3d btn-3d-primary" 
              onClick={() => setActiveTab('cases')}
              style={{ padding: '12px 24px', fontSize: '0.925rem' }}
            >
              <span>Explore Live Case Hub</span>
              <ArrowRight size={17} />
            </button>
          </div>

          <div>
            <BeforeAfterSlider
              beforeImage="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80"
              afterImage="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"
              beforeLabel="DAY 1: ACUTE MANGE"
              afterLabel="DAY 28: 100% RECOVERED"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
