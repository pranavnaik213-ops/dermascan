import React from 'react';
import { ArrowRight, Camera, MapPin, ClipboardList, HeartHandshake, ShieldCheck } from 'lucide-react';

const actions = [
  {
    id: 'detect',
    icon: Camera,
    title: 'Review a skin photo',
    detail: 'Prepare a clear photo to share with a veterinarian.',
    link: 'Open photo review',
  },
  {
    id: 'report',
    icon: ClipboardList,
    title: 'Report an animal',
    detail: 'Write down what you noticed and where you saw them.',
    link: 'Start a report',
  },
  {
    id: 'help',
    icon: MapPin,
    title: 'Find local help',
    detail: 'Look for animal care and rescue contacts near you.',
    link: 'View the map',
  },
];

export default function Hero({ setActiveTab }) {
  return (
    <div className="home-page page-wrap">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-intro-copy">
          <span className="home-kicker"><HeartHandshake size={16} aria-hidden="true" /> Community animal care</span>
          <h1 id="home-title">A clearer next step for an animal in need.</h1>
          <p>
            Prepare a photo, share what you observed, or look for nearby help. DermaScan helps you organize the details so you can contact a veterinarian or rescue group.
          </p>
          <div className="home-note">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>Photo review is not a diagnosis. For urgent injuries or distress, contact a veterinarian or local emergency service.</span>
          </div>
        </div>
        <div className="home-illustration" aria-hidden="true">
          <div className="home-illustration-ring" />
          <HeartHandshake size={76} strokeWidth={1.15} />
          <span className="home-illustration-caption">Notice · Document · Connect</span>
        </div>
      </section>

      <section className="home-actions" aria-labelledby="home-actions-title">
        <div className="home-section-heading">
          <div>
            <span className="home-section-label">GET STARTED</span>
            <h2 id="home-actions-title">What would you like to do?</h2>
          </div>
          <p>Choose a place to start. You can come back to the other steps anytime.</p>
        </div>
        <div className="home-action-grid">
          {actions.map(({ id, icon: Icon, title, detail, link }) => (
            <button className="home-action-card" key={id} onClick={() => setActiveTab(id)}>
              <span className="home-action-icon"><Icon size={21} strokeWidth={1.8} aria-hidden="true" /></span>
              <span className="home-action-title">{title}</span>
              <span className="home-action-detail">{detail}</span>
              <span className="home-action-link">{link}<ArrowRight size={16} aria-hidden="true" /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-guidance" aria-label="A simple way to help">
        <span className="home-guidance-mark">A small guide</span>
        <p><strong>Keep a little distance.</strong> A frightened or injured animal may be in pain. Note the location and visible signs, and ask a local professional for advice.</p>
        <button className="home-guidance-link" onClick={() => setActiveTab('awareness')}>Read the care guide <ArrowRight size={15} aria-hidden="true" /></button>
      </section>
    </div>
  );
}
