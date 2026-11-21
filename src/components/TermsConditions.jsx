import React from 'react';
import { ArrowLeft, Scale, ShieldAlert } from 'lucide-react';

export default function TermsConditions({ setActiveTab }) {
  return (
    <section className="page-wrap content-page legal-page" aria-labelledby="terms-conditions-title">
      <header className="page-intro page-intro-left">
        <button
          type="button"
          className="button button-quiet"
          onClick={() => setActiveTab('home')}
          style={{ marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Return to Home
        </button>
        <span className="eyebrow"><Scale size={15} aria-hidden="true" /> CLINICAL TRIAGE PROTOCOL & TERMS</span>
        <h1 id="terms-conditions-title">Terms &amp; Conditions</h1>
        <p>
          Effective Date: November 21, 2026. Please review these clinical usage terms before utilizing DermaScan.
        </p>
      </header>

      <div className="legal-content panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <aside style={{
          padding: '16px 20px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          <ShieldAlert size={24} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#991b1b', fontSize: '15px', display: 'block', marginBottom: '4px' }}>
              CRITICAL VETERINARY CLINICAL DISCLAIMER
            </strong>
            <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: 1.6 }}>
              DermaScan is an artificial-intelligence screening and triage decision-support tool. It is <strong>NOT a licensed veterinarian and does NOT provide medical diagnoses, prescriptions, or veterinary surgical treatment advice</strong>. If an animal exhibits hemorrhage, severe pain, respiratory difficulty, or systemic trauma, transport the animal immediately to an emergency 24/7 veterinary clinic.
            </p>
          </div>
        </aside>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            1. Purpose of the Platform
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            DermaScan provides triage assistance for animal rescue workers, volunteers, pet guardians, and community caregivers. It evaluates photographic evidence against 6 common dermatological patterns (demodicosis/mange, dermatophytosis/ringworm, deep pyoderma/dermatitis, Malassezia/fungal, atopic dermatitis, and healthy control epidermis).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            2. Responsible Animal Handling
          </h2>
          <ul style={{ paddingLeft: '20px', color: '#334155', lineHeight: 1.7, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Maintain Safe Distance:</strong> Do not corner, physically restrain, or force an unfamiliar or distressed stray animal into an enclosed space without professional capture equipment.</li>
            <li><strong>Accuracy of Reports:</strong> Users agree to submit truthful, accurate descriptions of animal conditions and verified street landmarks to optimize responder dispatch.</li>
            <li><strong>No Autonomous Dispatch Guarantee:</strong> Submitting a report does not guarantee immediate physical ambulance deployment. Community rescue groups operate based on bed and volunteer availability.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            3. Limitation of Liability
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            Under no circumstances shall the DermaScan project maintainers, developers, or affiliated veterinary volunteers be liable for any medical complications, misidentifications, adverse drug reactions, or animal outcomes resulting from actions taken or omitted based on AI screening findings.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            4. Permitted Use &amp; Intellectual Property
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            DermaScan is made available for humane rescue and community pet health purposes. Automated scraping, malicious bot submissions, or commercial repackaging of our trained weights without attribution is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            5. Modifications &amp; Governing Law
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            We reserve the right to revise these terms to reflect advancements in veterinary clinical guidelines and model retraining checkpoints. Continued use of DermaScan constitutes acceptance of revised terms.
          </p>
        </section>
      </div>
    </section>
  );
}
