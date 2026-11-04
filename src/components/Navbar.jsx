import React, { useState } from 'react';
import {
  Scan,
  MapPin,
  Activity,
  BookOpen,
  BarChart2,
  Bell,
  Sun,
  Moon,
  AlertTriangle,
  FileText,
  Menu,
  X,
  ShieldAlert,
  Truck,
  Stethoscope
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  unreadNotifications,
  setShowNotifications,
  currentRole,
  casesCount
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    if (currentRole === 'ngo') {
      return [
        { id: 'ngo', label: 'NGO Dispatch Hub', icon: Truck },
        { id: 'help', label: 'Rescue Radar', icon: MapPin },
        { id: 'cases', label: 'Case Hub', icon: FileText, count: casesCount },
        { id: 'home', label: 'Overview', icon: Scan },
        { id: 'awareness', label: 'Clinical Guide', icon: BookOpen }
      ];
    }
    if (currentRole === 'vet') {
      return [
        { id: 'vet', label: 'Vet Clinical Desk', icon: Stethoscope },
        { id: 'cases', label: 'Case Hub', icon: FileText, count: casesCount },
        { id: 'detect', label: 'AI Lesion Studio', icon: Activity },
        { id: 'home', label: 'Overview', icon: Scan },
        { id: 'awareness', label: 'Clinical Guide', icon: BookOpen },
        { id: 'analytics', label: 'Model Metrics', icon: BarChart2 }
      ];
    }
    if (currentRole === 'admin') {
      return [
        { id: 'analytics', label: 'Admin Dashboard', icon: ShieldAlert },
        { id: 'help', label: 'Rescue Radar', icon: MapPin },
        { id: 'cases', label: 'Case Hub', icon: FileText, count: casesCount },
        { id: 'home', label: 'Overview', icon: Scan },
        { id: 'awareness', label: 'Clinical Guide', icon: BookOpen }
      ];
    }
    return [
      { id: 'home', label: 'Overview', icon: Scan },
      { id: 'detect', label: 'Screen Lesion', icon: Activity },
      { id: 'report', label: 'Report Stray', icon: MapPin },
      { id: 'help', label: 'Rescue Radar', icon: MapPin },
      { id: 'cases', label: 'Case Hub', icon: FileText, count: casesCount },
      { id: 'awareness', label: 'Clinical Guide', icon: BookOpen },
      { id: 'analytics', label: 'Model Metrics', icon: BarChart2 }
    ];
  };

  const navItems = getNavItems();

  return (
    <nav
      aria-label="Main Navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          paddingBottom: '10px',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Brand Identity */}
        <button
          onClick={() => setActiveTab('home')}
          aria-label="DermaScan Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'transparent',
            padding: 0,
            textAlign: 'left',
            flexShrink: 0
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #047857 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)',
            flexShrink: 0
          }}>
            <ShieldAlert size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.03em',
                color: 'var(--text-main)',
                whiteSpace: 'nowrap'
              }}>
                DERMA<span style={{ color: 'var(--primary)' }}>SCAN</span>
              </span>
              <span className="badge badge-low" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                AI V2.0
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Veterinary Triage & Rescue • <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{currentRole}</span>
            </div>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <div style={{ display: 'none', gap: '4px', alignItems: 'center' }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  border: isActive
                    ? '1px solid rgba(5, 150, 105, 0.28)'
                    : '1px solid transparent'
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.3 : 1.9} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 6px',
                    marginLeft: '2px'
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Quick Emergency SOS button */}
          <button
            className="btn-3d btn-3d-danger"
            onClick={() => setActiveTab('report')}
            style={{
              padding: '8px 14px',
              fontSize: '0.785rem',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.03em',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={15} className="pulse-emergency" />
            <span className="emergency-label-full">EMERGENCY SOS</span>
            <span className="emergency-label-short">SOS</span>
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            aria-label="Toggle notifications"
            className="btn-3d btn-3d-ghost"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            <Bell size={18} strokeWidth={1.9} />
            {unreadNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--emergency)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px var(--emergency-glow)'
              }}>
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark mode"
            className="btn-3d btn-3d-ghost"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" strokeWidth={2} /> : <Moon size={18} color="#0284c7" strokeWidth={2} />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="btn-3d btn-3d-ghost mobile-toggle"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              padding: 0
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="badge badge-low">{item.count} Cases</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        .emergency-label-short { display: none; }
        @media (min-width: 1360px) {
          .desktop-nav { 
            display: flex !important; 
            flex: 1;
            justify-content: center;
            margin: 0 16px;
            gap: 5px;
          }
          .desktop-nav button {
            padding: 7px 12px !important;
            font-size: 0.84rem !important;
          }
          .mobile-toggle { display: none !important; }
        }
        @media (min-width: 1040px) and (max-width: 1359px) {
          .desktop-nav { 
            display: flex !important; 
            flex: 1;
            justify-content: center;
            margin: 0 8px;
            gap: 2px;
          }
          .desktop-nav button {
            padding: 6px 7px !important;
            font-size: 0.77rem !important;
            gap: 4px !important;
          }
          .emergency-label-full { display: none; }
          .emergency-label-short { display: inline; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 1039px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
