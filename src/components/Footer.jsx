import React from 'react';
import { ShieldAlert, Heart, Activity, MapPin, BookOpen, ShieldCheck } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer 
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        padding: '40px 20px 24px',
        marginTop: 'auto',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}
    >
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px' }}>
          
          {/* Brand & Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--primary-glow)'
              }}>
                <ShieldAlert size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                DERMA<span style={{ color: 'var(--primary)' }}>SCAN</span>
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.55 }}>
              AI-assisted dermatological preliminary triage and geospatial emergency rescue routing system for stray and rescue animals.
            </p>
            <div style={{ 
              fontSize: '0.775rem', 
              color: 'var(--primary)', 
              fontWeight: 700, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <Heart size={14} fill="var(--primary)" />
              <span>Compassionate Tech for Stray Animal Welfare</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', fontSize: '0.9rem' }}>
              Platform Navigation
            </div>
            <button onClick={() => setActiveTab('detect')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color="var(--primary)" />
              <span>Skin Lesion Screening</span>
            </button>
            <button onClick={() => setActiveTab('report')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="var(--primary)" />
              <span>Report Stray Animal</span>
            </button>
            <button onClick={() => setActiveTab('help')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--primary)" />
              <span>Rescue Radar & NGO Map</span>
            </button>
            <button onClick={() => setActiveTab('awareness')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} color="var(--primary)" />
              <span>Disease Guide & Guidelines</span>
            </button>
          </div>

          {/* Technical Architecture */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', fontSize: '0.9rem' }}>
              Clinical AI Architecture
            </div>
            <div style={{ fontSize: '0.8rem' }}>• Backbone: EfficientNet-B2 (PyTorch)</div>
            <div style={{ fontSize: '0.8rem' }}>• Explainability: Grad-CAM Activation Maps</div>
            <div style={{ fontSize: '0.8rem' }}>• Triage: Dynamic Multi-factor Risk Matrix</div>
            <div style={{ fontSize: '0.8rem' }}>• Geolocation: Leaflet OpenStreetMap Engine</div>
          </div>

          {/* Medical Notice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', fontSize: '0.9rem' }}>
              Veterinary Notice
            </div>
            <p style={{ fontSize: '0.775rem', lineHeight: 1.5 }}>
              DermaScan is engineered solely for triage prioritization and rescue volunteer dispatch. It is not an automated prescriber; all medical regimens require veterinary inspection.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '18px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px',
          fontSize: '0.75rem' 
        }}>
          <div>
            © 2026 DermaScan Animal Health Initiative. Open Access Public Welfare Project.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy & Data Policy</span>
            <span>•</span>
            <span>Veterinary Ethics Standards</span>
            <span>•</span>
            <span>NGO Partnership Program</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
