import React from 'react';
import { 
  Scan, 
  MapPin, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Camera,
  Cpu,
  Users,
  Award,
  Activity
} from 'lucide-react';

export default function Hero({ setActiveTab, cases = [] }) {
  const activeDispatches = cases.filter(c => c.status !== 'ngo_pending').length;
  const totalRecoveries = cases.filter(c => c.status === 'recovered').length;

  const stats = [
    { label: 'Total Tracked Cases', value: cases.length, icon: Heart, gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#059669' },
    { label: 'Dataset Benchmark Images', value: '4,280', icon: Cpu, gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', color: '#0284c7' },
    { label: 'Active NGO Dispatches', value: activeDispatches, icon: Users, gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', color: '#ea580c' },
    { label: 'Verified Full Recoveries', value: totalRecoveries, icon: Award, gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', color: '#0f766e' }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Capture Photograph',
      desc: 'Take or upload a well-lit photograph of the affected animal skin region.',
      icon: Camera
    },
    {
      step: '02',
      title: 'Automated Screening',
      desc: 'Image quality check and dermatological classification (Mange, Fungal, Dermatitis).',
      icon: Cpu
    },
    {
      step: '03',
      title: 'GPS Incident Report',
      desc: 'Record exact location, visible symptoms, and auto-calculated priority triage score.',
      icon: MapPin
    },
    {
      step: '04',
      title: 'Vet & NGO Dispatch',
      desc: 'Verified local rescue teams dispatch volunteers and coordinate veterinary care.',
      icon: ShieldCheck
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '30px' }}>
      
      {/* Hero Banner Section */}
      <section className="glass-panel" style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(2, 132, 199, 0.04) 50%, var(--bg-card) 100%)',
        border: '1px solid rgba(5, 150, 105, 0.2)',
        padding: '48px 36px',
        overflow: 'hidden',
        marginTop: '10px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Ambient Glow Orbs */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* Left Column Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span className="badge badge-low" style={{ boxShadow: '0 0 12px rgba(5, 150, 105, 0.2)' }}>
                <Sparkles size={13} /> STRAY ANIMAL HEALTH & RESCUE PLATFORM
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.1rem, 4vw, 3.3rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              color: 'var(--text-main)'
            }}>
              Early Skin Screening. <br />
              <span className="gradient-text">
                Faster Rescue Response.
              </span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              <strong>DermaScan</strong> assists community volunteers and animal welfare NGOs with dermatological preliminary screening. Quickly assess mange, ringworm, and dermatitis in street and farm animals, then coordinate directly with verified rescue teams and veterinarians.
            </p>

            {/* Hero CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '4px' }}>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('detect')}
                style={{ padding: '14px 24px', fontSize: '0.975rem', borderRadius: '12px' }}
              >
                <Scan size={19} />
                <span>Screen Skin Photo</span>
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => setActiveTab('report')}
                style={{ padding: '14px 22px', fontSize: '0.975rem', borderRadius: '12px' }}
              >
                <MapPin size={19} color="var(--primary)" />
                <span>Report Stray Animal</span>
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => setActiveTab('help')}
                style={{ padding: '14px 22px', fontSize: '0.975rem', borderRadius: '12px' }}
              >
                <ShieldCheck size={19} color="var(--secondary)" />
                <span>Find Nearby NGOs & Map</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Clinical Triage Support</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Grad-CAM Explainability</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>GPS Rescue Routing</span>
              </div>
            </div>
          </div>

          {/* Right Column Visual Showcase */}
          <div style={{ position: 'relative' }}>
            <div className="glass-panel animate-pulse-glow" style={{
              padding: '18px',
              borderRadius: '24px',
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid rgba(5, 150, 105, 0.3)'
            }}>
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                <img 
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80" 
                  alt="Stray Animal Preliminary Assessment"
                  style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                />
                
                {/* Laser scan line overlay */}
                <div className="laser-beam"></div>

                {/* Clinical Bounding Box Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '22%',
                  left: '28%',
                  width: '140px',
                  height: '140px',
                  border: '2px solid var(--primary)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(5, 150, 105, 0.18)',
                  boxShadow: '0 0 15px rgba(5, 150, 105, 0.5)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    Lesion Region (87%)
                  </div>
                </div>
              </div>

              {/* Floating AI Screening Result Card */}
              <div style={{
                position: 'relative',
                marginTop: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                    PRELIMINARY AI ASSESSMENT
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    Canine Mange
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-low" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                    87% Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-world Metrics Section */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-low" style={{ marginBottom: '6px' }}>
            <Activity size={13} /> LIVE DASHBOARD METRICS
          </span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Impact & Field Metrics
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Verified dataset stats and real-time community rescue track record
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-panel interactive-card" style={{
                padding: '24px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '18px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: stat.gradient,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 16px ${stat.color}35`
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={{ 
                    fontSize: '2.2rem', 
                    fontWeight: 800, 
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-main)'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '2px' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How DermaScan Works */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="badge badge-low" style={{ marginBottom: '6px' }}>WORKFLOW</span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 800 }}>
            How DermaScan Helps Strays
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '560px', margin: '0 auto' }}>
            From photograph screening to veterinary recovery
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '22px'
        }}>
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="glass-panel interactive-card" style={{
                padding: '26px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderRadius: '18px',
                borderTop: '4px solid var(--primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-heading)',
                    opacity: 0.85
                  }}>
                    {step.step}
                  </span>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Icon size={20} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>
                  {step.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recovery Spotlight */}
      <section className="glass-panel" style={{
        padding: '32px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--primary-light) 100%)',
        border: '1px solid rgba(5, 150, 105, 0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '28px',
          alignItems: 'center'
        }}>
          <div>
            <span className="badge badge-resolved" style={{ marginBottom: '12px' }}>RESCUE CASE SPOTLIGHT</span>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '12px' }}>
              Bruno's Recovery Journey
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '18px' }}>
              Reported in Rajajinagar with severe scab formation and hair loss. Screened by DermaScan with 89% confidence, accepted by People For Animals (PFA Bengaluru), and treated with medicated baths.
            </p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CASE ID</div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>DS-2026-00127</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TREATMENT DURATION</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>28 Days</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STATUS</div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>Full Hair Regrowth</div>
              </div>
            </div>

            <button 
              className="btn-secondary" 
              onClick={() => setActiveTab('cases')}
              style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '10px' }}
            >
              <span>View Case Timelines</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <img 
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80" 
                alt="Before Rescue" 
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'var(--emergency)',
                color: '#fff',
                fontSize: '0.725rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                DAY 1: BEFORE
              </div>
            </div>

            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <img 
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80" 
                alt="After Recovery" 
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.725rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                DAY 28: RECOVERED ❤️
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
