import React, { useState } from 'react';
import { HeartHandshake, MapPin, Menu, X } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'detect', label: 'AI Disease Scan' },
  { id: 'help', label: 'Find local care' },
  { id: 'awareness', label: 'Care guide' },
];

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <nav className="site-nav page-wrap" aria-label="Main navigation">
        <button className="site-brand" type="button" onClick={() => navigate('home')} aria-label="DermaScan home">
          <span className="site-brand-mark"><HeartHandshake size={20} aria-hidden="true" /></span>
          <span>DermaScan</span>
        </button>

        <div className="site-nav-links">
          {navItems.map(({ id, label }) => (
            <button
              className={`site-nav-link${activeTab === id ? ' is-active' : ''}`}
              type="button"
              key={id}
              onClick={() => navigate(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="button button-primary site-report-cta" type="button" onClick={() => navigate('report')}>
          <MapPin size={16} aria-hidden="true" /> Report an animal
        </button>

        <button
          className="site-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen(open => !open)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-nav" id="mobile-navigation">
          {navItems.map(({ id, label }) => (
            <button className={activeTab === id ? 'is-active' : ''} type="button" key={id} onClick={() => navigate(id)}>
              {label}
            </button>
          ))}
          <button type="button" onClick={() => navigate('report')}>Report an animal</button>
        </div>
      )}
    </header>
  );
}
