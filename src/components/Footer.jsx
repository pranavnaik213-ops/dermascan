import React from 'react';
import { HeartHandshake, Stethoscope } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="site-footer">
      <div className="page-wrap site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-brand-mark"><HeartHandshake size={18} aria-hidden="true" /></span>
          <span>DermaScan</span>
        </div>
        <p><Stethoscope size={15} aria-hidden="true" /> Photo review is not a veterinary diagnosis. Contact a veterinarian if you are concerned about an animal’s health.</p>
        <button type="button" onClick={() => setActiveTab('awareness')}>Read the care guide</button>
      </div>
    </footer>
  );
}
