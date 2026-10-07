import React from 'react';
import { Heart } from 'lucide-react';

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
          
          {/* Brand */}
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
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}>
                🐾
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                DERMA<span style={{ color: 'var(--primary)' }}>SCAN</span>
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
              Early Skin Disease Screening & Emergency Rescue Routing System for Stray Animals.
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              "Early Detection. Faster Response. Better Care."
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Platform Navigation</div>
            <button onClick={() => setActiveTab('detect')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem' }}>🔍 Skin Screening</button>
            <button onClick={() => setActiveTab('report')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem' }}>📍 Report Stray Animal</button>
            <button onClick={() => setActiveTab('help')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem' }}>🏥 Rescue Network & Map</button>
            <button onClick={() => setActiveTab('cases')} style={{ textAlign: 'left', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.825rem' }}>📋 Track Case Timelines</button>
          </div>

          {/* Technology Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Technical Architecture</div>
            <div style={{ fontSize: '0.825rem' }}>• Frontend: React 18, Vite, Leaflet</div>
            <div style={{ fontSize: '0.825rem' }}>• Model: PyTorch / EfficientNet-B2</div>
            <div style={{ fontSize: '0.825rem' }}>• Explainability: Grad-CAM Heatmaps</div>
            <div style={{ fontSize: '0.825rem' }}>• Database: MongoDB Atlas</div>
          </div>

          {/* Academic & Disclaimer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Project Note</div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
              Designed as an engineering project demonstration. Preliminary automated results assist rescue triage and do not replace professional veterinary examination.
            </p>
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
            © 2026 DermaScan Project • All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <span>Built for stray animal welfare</span>
            <Heart size={14} color="var(--emergency)" fill="var(--emergency)" />
          </div>
        </div>

      </div>
    </footer>
  );
}

