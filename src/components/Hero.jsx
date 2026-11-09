import React from 'react';
import { ArrowRight, Camera, MapPin, ClipboardList, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import Interactive3DCard from './Interactive3DCard';

const actions = [
  {
    id: 'detect',
    icon: Camera,
    badge: 'Deep Learning',
    title: 'AI Skin Disease Scan',
    detail: 'Screen animal fur and lesions with real-time neural vision across 6 dermatological conditions.',
    link: 'Scan an animal',
  },
  {
    id: 'report',
    icon: ClipboardList,
    badge: 'Rescue Intake',
    title: 'Report an animal',
    detail: 'Document observations, attach GPS location, and dispatch care details for local rescuers.',
    link: 'Start a report',
  },
  {
    id: 'help',
    icon: MapPin,
    badge: 'Live Map',
    title: 'Find local help',
    detail: 'Instantly connect with nearby emergency veterinary hospitals, shelters, and animal clinics.',
    link: 'View the map',
  },
];

export default function Hero({ setActiveTab }) {
  return (
    <div className="home-page page-wrap">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-intro-copy">
          <span className="home-kicker">
            <span className="pulse-dot" aria-hidden="true" />
            <Sparkles size={14} aria-hidden="true" />
            Community Animal Rescue & Care
          </span>
          <h1 id="home-title">A clearer next step for an animal in need.</h1>
          <p>
            Capture a photo for instant AI dermatological screening, document field observations, or find verified veterinary rescue clinics near you. DermaScan turns early notice into immediate, organized care.
          </p>
          <div className="home-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>AI photo review is a decision-support aid, not a veterinary prescription. For severe bleeding, trauma, or respiratory distress, contact emergency veterinary services immediately.</span>
          </div>
        </div>

        <div className="home-illustration-wrap" aria-hidden="true">
          <div className="home-illustration-3d">
            <div className="home-illustration-ambient-glow" />
            <div className="home-illustration-ring outer-ring" />
            <div className="home-illustration-ring inner-ring" />
            <div className="home-illustration-core">
              <HeartHandshake size={58} strokeWidth={1.4} />
            </div>
            <div className="home-float-pill pill-top">
              <Camera size={13} /> AI Vision Active
            </div>
            <div className="home-float-pill pill-bottom">
              <MapPin size={13} /> 24/7 Care Network
            </div>
          </div>
        </div>
      </section>

      <section className="home-actions" aria-labelledby="home-actions-title">
        <div className="home-section-heading">
          <div>
            <span className="home-section-label">SELECT WORKFLOW</span>
            <h2 id="home-actions-title">What would you like to do?</h2>
          </div>
          <p>Choose an action to begin. You can navigate between screening, reporting, and rescue care anytime.</p>
        </div>

        <div className="home-action-grid">
          {actions.map(({ id, icon: Icon, badge, title, detail, link }) => (
            <Interactive3DCard key={id} maxTilt={9} scale={1.03} className="home-action-card-wrapper">
              <button className="home-action-card" onClick={() => setActiveTab(id)}>
                <div className="home-action-top">
                  <span className="home-action-icon">
                    <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="home-action-badge">{badge}</span>
                </div>
                <span className="home-action-title">{title}</span>
                <span className="home-action-detail">{detail}</span>
                <span className="home-action-link">
                  {link} <ArrowRight size={15} aria-hidden="true" />
                </span>
              </button>
            </Interactive3DCard>
          ))}
        </div>
      </section>

      <section className="home-guidance" aria-label="A simple way to help">
        <div className="home-guidance-badge">Safety First</div>
        <p><strong>Keep a calm distance.</strong> A frightened, distressed, or injured stray animal may react defensively. Take a clear photo from several feet away, record the exact street or landmark, and alert local caregivers.</p>
        <button className="home-guidance-link" onClick={() => setActiveTab('awareness')}>
          Read the care guide <ArrowRight size={15} aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
