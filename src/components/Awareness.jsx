import React from 'react';
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  ShieldAlert, 
  Info,
  HelpCircle
} from 'lucide-react';

export default function Awareness() {

  const photoGuidelines = [
    {
      type: 'good',
      title: 'Optimal Assessment Quality',
      desc: 'Crisp daylight illumination, centered lesion framing, stabilized animal, clear skin margin contrast.',
      img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      tips: [
        '✓ Direct daylight or diffuse flashlight',
        '✓ Focused squarely on affected skin boundary',
        '✓ Distance between 30cm to 1 meter',
        '✓ High resolution with hair texture visible'
      ]
    },
    {
      type: 'bad',
      title: 'Insufficient Quality (Low AI Confidence)',
      desc: 'Obscured shadows, motion blur from moving animal, camera out of focus, lesion blocked by mud or debris.',
      img: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80&blur=10',
      tips: [
        '⚠️ Severe shadow or dark evening shot',
        '⚠️ Motion blur caused by rapid movement',
        '⚠️ Animal too far away in the frame',
        '⚠️ Heavy mud or dirt covering skin lesion'
      ]
    }
  ];

  const diseaseGuide = [
    {
      name: 'Canine Mange (Sarcoptic / Demodectic)',
      category: 'Parasitic Acariasis',
      zoonotic: true,
      symptoms: 'Intense pruritus (itching), periocular & pinnal hair loss, thick keratin crusts, hyperpigmentation.',
      treatment: 'Isoxazolines (Fluralaner/Afoxolaner) or oral ivermectin accompanied by weekly antiseptic/keratolytic baths.',
      risk: 'High Contagion: Rapidly spreads among street dog packs.'
    },
    {
      name: 'Ringworm (Microsporum Dermatophytosis)',
      category: 'Fungal Infection',
      zoonotic: true,
      symptoms: 'Circular circumscribed patches of hair loss, broken brittle hair stubs, cigarette ash-like scaling.',
      treatment: 'Topical miconazole / chlorhexidine dips; oral itraconazole in widespread or deep feline cases.',
      risk: 'Zoonotic Alert: Highly transmissible to humans, children, and domestic pets.'
    },
    {
      name: 'Flea Allergic & Atopic Dermatitis',
      category: 'Hypersensitivity Reaction',
      zoonotic: false,
      symptoms: 'Severe dorsal lumbosacral alopecia, erythema, excoriation, secondary hot spots from incessant chewing.',
      treatment: 'Comprehensive flea eradication on patient and resting area, soothing antihistamines, short-course corticosteroids.',
      risk: 'Secondary Pyoderma: Can lead to deep bacterial infection if left open.'
    },
    {
      name: 'Deep Pyoderma & Open Trauma',
      category: 'Bacterial / Traumatic',
      zoonotic: false,
      symptoms: 'Pustules, purulent exudate, foul odor, tissue sloughing, localized hyperthermia and lethargy.',
      treatment: 'Targeted veterinary systemic antibiotic regimen following cytology; wound debridement and sterile bandaging.',
      risk: 'High Sepsis Risk: Requires immediate emergency veterinary rescue dispatch.'
    }
  ];

  const faqs = [
    {
      q: "Can I catch skin diseases from street dogs or cats?",
      a: "Yes, both Sarcoptic Mange and Ringworm (Dermatophytosis) are zoonotic conditions that can infect humans. Always wear latex or nitrile gloves when touching affected animals, and wash your hands thoroughly with antibacterial soap."
    },
    {
      q: "What should I do if a stray dog is aggressive or frightened?",
      a: "Do not attempt to restrain or touch a frightened dog. Take a clear photograph from 1 to 2 meters away using your phone's zoom, note the landmark, and file an emergency report so a trained NGO rescue squad with nets and stretchers can respond safely."
    },
    {
      q: "How fast do rescue NGOs respond in Bengaluru?",
      a: "Emergency SOS cases (such as open bleeding or immobilized animals) have an average target dispatch window of 20 to 45 minutes across central zones, while non-emergency mange reports are batched for daily rescue rounds."
    }
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '36px' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <span className="badge badge-low" style={{ marginBottom: '8px' }}>
          <BookOpen size={14} /> FIELD PROTOCOLS & CLINICAL REFERENCE
        </span>
        <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', color: 'var(--text-main)', fontWeight: 800 }}>
          Photography & Clinical Pathology Guide
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.975rem', maxWidth: '640px', margin: '0 auto' }}>
          Guidelines for volunteers, community caregivers, and rescuers on capturing quality screening photos, identifying dermatological conditions, and handling street animals safely.
        </p>
      </div>

      {/* Photo Quality Guidelines */}
      <section className="glass-panel" style={{ padding: '26px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Camera size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>
              How to Capture High-Confidence Screening Photographs
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Optical clarity directly influences the neural model's diagnostic certainty.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {photoGuidelines.map((item, idx) => (
            <div 
              key={idx} 
              style={{
                background: item.type === 'good' ? 'var(--low-bg)' : 'var(--emergency-bg)',
                border: item.type === 'good' ? '1px solid var(--low-border)' : '1px solid var(--emergency-border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: item.type === 'good' ? 'var(--primary)' : 'var(--emergency)' }}>
                  {item.title}
                </h3>
                {item.type === 'good' ? <CheckCircle2 size={20} color="var(--primary)" /> : <XCircle size={20} color="var(--emergency)" />}
              </div>

              <img 
                src={item.img} 
                alt={item.title} 
                style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
              />

              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
                {item.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {item.tips.map((t, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: item.type === 'good' ? 'var(--primary)' : 'var(--emergency)', fontWeight: 700 }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disease Encyclopedia */}
      <section className="glass-panel" style={{ padding: '26px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={20} color="var(--secondary)" />
          Common Stray Animal Dermatological Pathologies
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {diseaseGuide.map((d, idx) => (
            <div 
              key={idx} 
              className="interactive-card" 
              style={{
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-low" style={{ fontSize: '0.675rem' }}>{d.category}</span>
                {d.zoonotic && (
                  <span className="badge badge-emergency" style={{ fontSize: '0.65rem' }}>
                    Zoonotic Alert
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800 }}>
                {d.name}
              </h3>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-main)' }}>Key Signs:</strong> {d.symptoms}
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--primary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: 'auto' }}>
                <strong style={{ color: 'var(--text-main)' }}>Clinical Protocol:</strong> {d.treatment}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--emergency)', fontWeight: 600 }}>
                ⚠️ {d.risk}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & First Aid Advice */}
      <section style={{
        background: 'var(--emergency-bg)',
        border: '1px solid var(--emergency-border)',
        borderRadius: 'var(--radius-md)',
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <ShieldAlert size={26} color="var(--emergency)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--emergency)', fontWeight: 800, marginBottom: '6px' }}>
            Volunteer Safety & Ethical Handling Protocol
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Never corner, pull, or abruptly seize an injured animal in pain, as trauma can trigger instinctive defensive bites. Maintain a respectful distance of at least 1 meter while taking photographic evidence. If an animal is immobilized or bleeding heavily, immediately switch to the <strong>Emergency SOS</strong> flow to dispatch an ambulance equipped with trained handlers.
          </p>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="glass-panel" style={{ padding: '26px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} color="var(--primary)" />
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((f, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px'
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Q: {f.q}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
