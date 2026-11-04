import React, { useState } from 'react';
import { ChevronRight, PhoneCall, X } from 'lucide-react';

export default function FloatingEmergencyIsland({ activeEmergencyCase, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!activeEmergencyCase || dismissed) return null;

  return (
    <aside
      aria-label="Active Emergency SOS Dispatch Island"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1100,
        maxWidth: collapsed ? '190px' : '380px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid rgba(239, 68, 68, 0.45)',
          background: 'rgba(15, 23, 42, 0.94)',
          color: '#ffffff',
          boxShadow: '0 12px 32px rgba(239, 68, 68, 0.28), 0 4px 12px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden'
        }}
      >
        {/* Top Emergency Indicator Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(239, 68, 68, 0.18)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 10px #ef4444',
                animation: 'pulseGlow 1.4s infinite'
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fca5a5' }}>
              ACTIVE RESCUE DISPATCH
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand" : "Collapse"}
              style={{
                background: 'transparent',
                color: '#cbd5e1',
                padding: '2px 6px',
                fontSize: '0.7rem',
                borderRadius: '4px'
              }}
            >
              {collapsed ? "Expand" : "Minimize"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              title="Dismiss"
              style={{
                background: 'transparent',
                color: '#cbd5e1',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!collapsed && (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                {activeEmergencyCase.id} • {activeEmergencyCase.animalType}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                {activeEmergencyCase.locationName} • {activeEmergencyCase.assignedNGO || 'CUPA Bengaluru Dispatched'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('cases')}
                className="btn-3d btn-3d-danger"
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span>Track Rescue Hub</span>
                <ChevronRight size={14} />
              </button>

              <a
                href="tel:+918022947300"
                className="btn-3d btn-3d-secondary"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <PhoneCall size={13} color="#4ade80" />
                <span>Call Hotline</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}