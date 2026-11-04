import React from 'react';
import { User, Shield, Stethoscope, Settings } from 'lucide-react';

export default function RoleSwitcher({ currentRole, setRole, setActiveTab }) {
  const roles = [
    { 
      id: 'user', 
      label: 'Citizen Reporter', 
      icon: User, 
      desc: 'Report strays & screen lesions'
    },
    { 
      id: 'ngo', 
      label: 'Rescue NGO', 
      icon: Shield, 
      desc: 'Triage queue & volunteer dispatch'
    },
    { 
      id: 'vet', 
      label: 'Veterinarian', 
      icon: Stethoscope, 
      desc: 'Clinical verification & treatment'
    },
    { 
      id: 'admin', 
      label: 'System Admin', 
      icon: Settings, 
      desc: 'ML performance & case audit'
    }
  ];

  return (
    <aside 
      aria-label="Role Perspective Switcher"
      style={{
        background: 'var(--bg-card-subtle)',
        borderBottom: '1px solid var(--border-color)',
        padding: '6px 0',
        fontSize: '0.8rem',
        transition: 'all 0.2s ease'
      }}
    >
      <div 
        className="app-container" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '8px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: 'var(--primary)',
              boxShadow: '0 0 8px var(--primary)'
            }} 
          />
          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
            ACTIVE PERSPECTIVE:
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'none' }} className="role-subtext">
            {roles.find(r => r.id === currentRole)?.desc}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          {roles.map((r) => {
            const Icon = r.icon;
            const active = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  if (setActiveTab) {
                    if (r.id === 'admin') {
                      setActiveTab('analytics');
                    } else if (r.id === 'ngo') {
                      setActiveTab('ngo');
                    } else if (r.id === 'vet') {
                      setActiveTab('vet');
                    } else {
                      setActiveTab('home');
                    }
                  }
                }}
                title={r.desc}
                className={`btn-3d ${active ? 'btn-3d-primary' : 'btn-3d-ghost'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: active ? 700 : 500,
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={12} strokeWidth={active ? 2.5 : 2} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
