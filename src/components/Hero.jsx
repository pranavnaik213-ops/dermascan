import React from 'react';
import { 
  Scan, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Camera,
  Cpu
} from 'lucide-react';

export default function Hero({ setActiveTab }) {

  const workflowSteps = [
    {
      step: '01',
      title: 'Capture Photograph',
      desc: 'Take or upload a clear, well-lit photograph of the affected animal skin region.',
      icon: Camera
    },
    {
      step: '02',
      title: 'Automated Screening',
      desc: 'Image quality verification and dermatological classification (Mange, Fungal, Dermatitis).',
      icon: Cpu
    },
    {
      step: '03',
      title: 'GPS Incident Report',
      desc: 'Record exact location coordinates, visible symptoms, and calculated priority triage score.',
      icon: MapPin
    },
    {
      step: '04',
      title: 'Vet & NGO Dispatch',
      desc: 'Verified local rescue teams dispatch volunteers and coordinate veterinary treatment.',
      icon: ShieldCheck
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '30px' }}>
      
      {/* Hero Banner Section */}
      <section className="glass-panel" style={{
        position: 'relative',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '44px 32px',
        overflow: 'hidden',
        marginTop: '10px',
        boxShadow: 'var(--shadow-md)'
      }}>

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
              <span className="badge badge-low">
                <ShieldCheck size={13} /> VETERINARY DERMATOLOGY & RESCUE DISPATCH
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.1rem, 4vw, 3.1rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              color: 'var(--text-main)'
            }}>
              Veterinary Dermatology Screening & Case Management System
            </h1>

            <p style={{ fontSize: '1.025rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              <strong>DermaScan</strong> provides preliminary dermatological screening for stray animals, facilitating rapid triage of mange, ringworm, and dermatitis. Incident reports route directly to verified rescue organizations and clinics.
            </p>

            {/* Hero CTA Buttons (Strictly 8px borderRadius, NO pill shapes) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('detect')}
                style={{ padding: '12px 22px', fontSize: '0.925rem', borderRadius: '8px' }}
              >
                <Scan size={18} />
                <span>Screen Skin Photo</span>
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => setActiveTab('report')}
                style={{ padding: '12px 20px', fontSize: '0.925rem', borderRadius: '8px' }}
              >
                <MapPin size={18} color="var(--primary)" />
                <span>Report Stray Animal</span>
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => setActiveTab('help')}
                style={{ padding: '12px 20px', fontSize: '0.925rem', borderRadius: '8px' }}
              >
                <ShieldCheck size={18} color="var(--secondary)" />
                <span>Rescue NGO Map</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Clinical Triage Protocol</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Grad-CAM Visual Attention</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>GPS Rescue Routing</span>
              </div>
            </div>
          </div>

          {/* Right Column Visual Showcase */}
          <div style={{ position: 'relative' }}>
            <div className="glass-panel" style={{
              padding: '16px',
              borderRadius: '16px',
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                <img 
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80" 
                  alt="Stray Animal Dermatological Assessment"
                  style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }}
                />
                
                {/* Laser scan line overlay */}
                <div className="laser-beam"></div>

                {/* Bounding Box Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '22%',
                  left: '28%',
                  width: '140px',
                  height: '140px',
                  border: '2px solid var(--primary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(5, 150, 105, 0.15)',
                  boxShadow: '0 0 12px rgba(5, 150, 105, 0.4)'
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
                    borderRadius: '4px'
                  }}>
                    Lesion Area (87%)
                  </div>
                </div>
              </div>

              {/* Assessment Result Card */}
              <div style={{
                position: 'relative',
                marginTop: '14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                    PRELIMINARY ASSESSMENT
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    Canine Mange
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-low" style={{ fontSize: '0.775rem', padding: '4px 10px', borderRadius: '4px' }}>
                    87% Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How DermaScan Works */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-low" style={{ marginBottom: '6px' }}>WORKFLOW</span>
          <h2 style={{ fontSize: '1.65rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Platform Workflow
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '560px', margin: '0 auto' }}>
            From photographic screening to veterinary recovery
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '18px'
        }}>
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="glass-panel interactive-card" style={{
                padding: '22px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderRadius: '12px',
                borderTop: '3px solid var(--primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-heading)',
                    opacity: 0.9
                  }}>
                    {step.step}
                  </span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Icon size={18} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800 }}>
                  {step.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
