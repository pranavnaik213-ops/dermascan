import React from 'react';
import { BookOpen, Camera, MapPin, ShieldCheck } from 'lucide-react';

const guidance = [
  {
    number: '01',
    icon: ShieldCheck,
    title: 'Give the animal space',
    text: 'An animal that is frightened or hurt may react unpredictably. Do not try to handle or move them unless a trained professional tells you to.',
  },
  {
    number: '02',
    icon: Camera,
    title: 'Note only what you can see',
    text: 'If it is safe, take a clear photo from a distance. Describe visible changes in your own words; a photo cannot confirm a medical condition.',
  },
  {
    number: '03',
    icon: MapPin,
    title: 'Record where you saw them',
    text: 'Include a nearby street, landmark, or business name. A precise location can help a veterinarian or local animal-care group find the animal.',
  },
];

export default function Awareness({ setActiveTab }) {
  return (
    <section className="page-wrap content-page care-guide-page" aria-labelledby="care-guide-title">
      <header className="page-intro page-intro-left">
        <span className="eyebrow"><BookOpen size={15} aria-hidden="true" /> CARE GUIDE</span>
        <h1 id="care-guide-title">A few safe ways to help</h1>
        <p>Simple steps for sharing an observation about an animal who may need care.</p>
      </header>

      <div className="care-guide-list">
        {guidance.map(({ number, icon: Icon, title, text }) => (
          <article className="care-guide-item" key={number}>
            <span className="care-guide-number">{number}</span>
            <span className="care-guide-icon"><Icon size={20} aria-hidden="true" /></span>
            <div><h2>{title}</h2><p>{text}</p></div>
          </article>
        ))}
      </div>

      <aside className="care-guide-urgent">
        <strong>For an urgent injury or severe distress</strong>
        <p>Contact a veterinarian or local emergency service directly. DermaScan does not dispatch responders.</p>
      </aside>

      <div className="care-guide-actions">
        <button className="button button-primary" type="button" onClick={() => setActiveTab('report')}>Prepare a report</button>
        <button className="button button-secondary" type="button" onClick={() => setActiveTab('help')}>Find nearby care</button>
      </div>
    </section>
  );
}
