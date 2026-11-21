import React from 'react';
import { Camera, HeartHandshake, ShieldCheck, Stethoscope } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ setActiveTab }) {
  return (
    <footer className="site-footer">
      {/* Bottom CTA Banner (Item 20) */}
      <div className="footer-cta-banner" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', color: '#ffffff', padding: '24px 20px', textAlign: 'center' }}>
        <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ textAlign: 'left', maxWidth: '540px' }}>
            <strong style={{ fontSize: '1.15rem', display: 'block', fontWeight: 700 }}>Notice an animal with hair loss or skin lesions?</strong>
            <span style={{ fontSize: '0.92rem', opacity: 0.9 }}>Run a free, instant on-device neural scan or prepare an emergency dispatch intake.</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button"
              onClick={() => setActiveTab('detect')}
              style={{
                background: '#ffffff',
                color: '#0f766e',
                fontWeight: 700,
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '44px',
                cursor: 'pointer'
              }}
            >
              <Camera size={16} aria-hidden="true" /> Start AI Scan
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setActiveTab('report')}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '10px 18px',
                borderRadius: '10px',
                minHeight: '44px',
                cursor: 'pointer'
              }}
            >
              Report Animal
            </button>
          </div>
        </div>
      </div>

      <div className="page-wrap site-footer-inner" style={{ padding: '32px 20px' }}>
        <div className="site-footer-brand">
          <span className="site-brand-mark"><HeartHandshake size={20} aria-hidden="true" /></span>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>DermaScan</span>
        </div>

        <p style={{ maxWidth: '600px', lineHeight: 1.5, color: '#475569' }}>
          <Stethoscope size={15} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          DermaScan is an AI-assisted veterinary triage tool, not a prescription service. In life-threatening emergencies, consult a licensed veterinarian or local animal welfare emergency rescue immediately.
        </p>

        <nav aria-label="Footer legal and utility navigation" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <button type="button" onClick={() => setActiveTab('awareness')} style={{ minHeight: '44px', padding: '8px 4px', background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', fontWeight: 600 }}>
            Care Guide
          </button>
          <span style={{ opacity: 0.3 }} aria-hidden="true">•</span>
          <button type="button" onClick={() => setActiveTab('privacy')} style={{ minHeight: '44px', padding: '8px 4px', background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', fontWeight: 600 }}>
            Privacy Policy
          </button>
          <span style={{ opacity: 0.3 }} aria-hidden="true">•</span>
          <button type="button" onClick={() => setActiveTab('terms')} style={{ minHeight: '44px', padding: '8px 4px', background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', fontWeight: 600 }}>
            Terms & Conditions
          </button>
          <span style={{ opacity: 0.3 }} aria-hidden="true">•</span>
          <button type="button" onClick={() => setActiveTab('admin')} style={{ minHeight: '44px', padding: '8px 4px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            Admin Portal
          </button>
        </nav>

        <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem', color: '#64748b' }}>
          <span>© {CURRENT_YEAR} DermaScan. 100% Free & Open Source for Animal Welfare.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#0d9488" /> Zero Cloud Telemetry • On-Device Neural Vision
          </span>
        </div>
      </div>
    </footer>
  );
}
