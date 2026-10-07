import React from 'react';
import { User, Shield, Stethoscope, Settings, CheckCircle2 } from 'lucide-react';

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const roles = [
    { id: 'user', label: 'Citizen Reporter', icon: User, badge: 'Public View' },
    { id: 'ngo', label: 'Rescue NGO', icon: Shield, badge: 'Dispatch View' },
    { id: 'vet', label: 'Veterinarian', icon: Stethoscope, badge: 'Clinical View' },
    { id: 'admin', label: 'System Admin', icon: Settings, badge: 'Metrics & Data' }
  ];

  return (
    <div style={{
      background: 'var(--bg-main)',
      borderBottom: '1px solid var(--border-color)',
      padding: '8px 20px',
      fontSize: '0.825rem',
      position: 'relative',
      zIndex: 1001
    }}>
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary)' }}></span>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>ROLE PERSPECTIVE:</span>
          <span style={{ color: 'var(--text-muted)' }}>Switch system view & layout:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {roles.map((r) => {
            const Icon = r.icon;
            const active = currentRole === r.id;
            return (
              <button
                type="button"
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.2s ease',
                  background: active ? 'var(--primary)' : 'var(--bg-card)',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  boxShadow: active ? '0 2px 6px rgba(5, 150, 105, 0.25)' : 'none'
                }}
              >
                <Icon size={13} />
                <span>{r.label}</span>
                {active && <CheckCircle2 size={12} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
