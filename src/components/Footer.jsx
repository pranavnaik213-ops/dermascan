import React from 'react';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      padding: '36px 20px 20px',
      marginTop: 'auto',
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }}>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          
          {/* Brand & Custom Domain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                DERMA<span style={{ color: 'var(--primary)' }}>SCAN</span>
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
              Veterinary Dermatology Screening & Emergency Rescue Routing System for Stray Animals.
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
              Official Domain: <a href="https://dermascan.org" style={{ textDecoration: 'underline' }}>dermascan.org</a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Platform Navigation</div>
            <button onClick={() => setActiveTab('detect')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', cursor: 'pointer' }}>Skin Screening</button>
            <button onClick={() => setActiveTab('report')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', cursor: 'pointer' }}>Report Stray Animal</button>
            <button onClick={() => setActiveTab('help')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', cursor: 'pointer' }}>Rescue Network & Map</button>
            <button onClick={() => setActiveTab('cases')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', cursor: 'pointer' }}>Track Case Timelines</button>
          </div>

          {/* Legal & Compliance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Legal & Compliance</div>
            <button onClick={() => setActiveTab('privacy')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Lock size={13} color="var(--primary)" /> Privacy Policy
            </button>
            <button onClick={() => setActiveTab('terms')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileText size={13} color="var(--primary)" /> Terms and Conditions
            </button>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Domain Status: Connected (dermascan.org)
            </div>
          </div>

          {/* Technical Architecture */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Technical Architecture</div>
            <div style={{ fontSize: '0.825rem' }}>• Frontend: React 18, Vite, Leaflet</div>
            <div style={{ fontSize: '0.825rem' }}>• Classifier: PyTorch EfficientNet-B2</div>
            <div style={{ fontSize: '0.825rem' }}>• Explainability: Grad-CAM Heatmaps</div>
            <div style={{ fontSize: '0.825rem' }}>• Database: MongoDB Atlas</div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem'
        }}>
          <div>
            © 2026 DermaScan Project • dermascan.org • All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
            <button onClick={() => setActiveTab('privacy')} style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
              Privacy Policy
            </button>
            <button onClick={() => setActiveTab('terms')} style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
              Terms & Conditions
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
