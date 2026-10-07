import React from 'react';
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  ShieldAlert, 
  Info
} from 'lucide-react';

export default function Awareness() {
  const photoGuidelines = [
    {
      type: 'good',
      title: 'Optimal Photograph Quality',
      desc: 'Clear natural lighting, affected skin area centered, animal still, crisp camera focus.',
      img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      tips: ['✓ Sufficient daylight / torch lighting', '✓ Camera focused on affected skin lesion', '✓ Distance between 30cm to 1 meter', '✓ Clear contrast fur vs skin boundary']
    },
    {
      type: 'bad',
      title: 'Insufficient Quality Photo',
      desc: 'Extremely dark, severe blur, animal too far away, obstructed lesion view.',
      img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80&blur=10',
      tips: ['⚠️ Too dark / heavy shadows', '⚠️ Severe motion blur', '⚠️ Animal hidden behind obstacles', '⚠️ Affected region not visible']
    }
  ];

  const diseaseGuide = [
    {
      name: 'Canine Mange (Sarcoptic / Demodectic)',
      type: 'Parasitic Mites',
      symptoms: 'Intense itching, hair loss starting around face/elbows, thick crusty skin scabs.',
      treatment: 'Ivermectin / Isoxazoline oral treatments and medicated baths. High recovery rate.'
    },
    {
      name: 'Ringworm (Dermatophytosis)',
      type: 'Fungal Microsporum',
      symptoms: 'Circular scaly lesions, brittle broken fur, localized skin flaking.',
      treatment: 'Topical antifungal sprays, miconazole dips, oral antifungal therapy.'
    },
    {
      name: 'Allergic & Flea Dermatitis',
      type: 'Environmental / Parasitic',
      symptoms: 'Redness, hives, frequent biting of hindquarters, hot spots.',
      treatment: 'Flea eradication, antihistamines, soothing topical creams.'
    }
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span className="badge badge-low" style={{ marginBottom: '6px' }}>
          <BookOpen size={14} /> WELFARE & EDUCATIONAL GUIDE
        </span>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: 800 }}>
          Photography & Disease Guide
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Learn how to capture clear photographs for image screening and safely assist injured stray animals.
        </p>
      </div>

      {/* Photo Quality Guide */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Camera size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 800 }}>
              How to Capture Optimal Assessment Photographs
            </h2>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Clear photographs significantly improve assessment accuracy and confidence scores.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {photoGuidelines.map((item, idx) => (
            <div key={idx} style={{
              background: item.type === 'good' ? 'var(--low-bg)' : 'var(--emergency-bg)',
              border: item.type === 'good' ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: item.type === 'good' ? 'var(--primary)' : 'var(--emergency)' }}>
                  {item.title}
                </h3>
                {item.type === 'good' ? <CheckCircle2 size={18} color="var(--primary)" /> : <XCircle size={18} color="var(--emergency)" />}
              </div>

              <img src={item.img} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />

              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {item.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {item.tips.map((t, i) => (
                  <div key={i} style={{ fontSize: '0.775rem', color: item.type === 'good' ? 'var(--primary)' : 'var(--emergency)', fontWeight: 600 }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disease Library */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} color="var(--secondary)" />
          Common Stray Animal Dermatological Conditions
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {diseaseGuide.map((d, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span className="badge badge-low" style={{ fontSize: '0.675rem' }}>{d.type}</span>
              <h3 style={{ fontSize: '0.975rem', color: 'var(--text-main)', fontWeight: 700 }}>{d.name}</h3>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Key Visible Signs:</strong> {d.symptoms}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '2px' }}>
                <strong>Standard Treatment:</strong> {d.treatment}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & First Aid Advice */}
      <div style={{
        background: 'var(--emergency-bg)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        borderRadius: '14px',
        padding: '18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldAlert size={22} color="var(--emergency)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3 style={{ fontSize: '0.975rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>
            Safe Interaction Rules with Injured Strays
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Never corner or abruptly touch a frightened or injured stray animal. Keep a safe distance while taking photographs. For severe emergency trauma, submit an emergency report to dispatch a mobile animal ambulance.
          </p>
        </div>
      </div>

    </div>
  );
}

