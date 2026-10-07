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
  X
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  unreadNotifications, 
  setShowNotifications,
  casesCount,
  lang,
  setLang
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Scan },
    { id: 'detect', label: 'Dermatological Screening', icon: Activity },
    { id: 'report', label: 'Report Animal', icon: MapPin },
    { id: 'help', label: 'Rescue Map', icon: MapPin },
    { id: 'cases', label: 'Cases Tracker', icon: FileText, count: casesCount },
    { id: 'awareness', label: 'Guide & Awareness', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 28px', gap: '16px' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            🐾
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: 'var(--text-main)' }}>
              DERMA<span className="gradient-text">SCAN</span>
            </span>
            <span className="badge badge-low" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              v1.2 AI
            </span>
          </div>
        </div>

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
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 800 : 600,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.22s ease',
                  background: isActive 
                    ? 'var(--primary-light)' 
                    : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  border: isActive 
                    ? '1.5px solid var(--primary)' 
                    : '1.5px solid transparent',
                  boxShadow: isActive ? '0 2px 10px var(--primary-glow)' : 'none'
                }}
              >
                <Icon size={15} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    padding: '2px 7px',
                    marginLeft: '2px'
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          
          {/* Emergency Quick Button */}
          <button 
            className="btn-danger"
            onClick={() => setActiveTab('report')}
            style={{ padding: '7px 14px', fontSize: '0.775rem', borderRadius: '20px', whiteSpace: 'nowrap' }}
          >
            <AlertTriangle size={14} className="animate-beacon" />
            <span>EMERGENCY REPORT</span>
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: 'var(--emergency)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(220, 38, 38, 0.5)'
              }}>
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Language Selector */}
          <select
            value={lang || 'en'}
            onChange={(e) => setLang && setLang(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
            title="Switch Platform Language"
          >
            <option value="en">🌐 English</option>
            <option value="kn">🌐 ಕನ್ನಡ</option>
            <option value="hi">🌐 हिन्दी</option>
          </select>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#0284c7" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-main)'
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          padding: '12px 20px',
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
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 500
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} />
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
        @media (min-width: 980px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
