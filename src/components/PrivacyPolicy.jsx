import React from 'react';
import { ArrowLeft, Lock, Shield } from 'lucide-react';

export default function PrivacyPolicy({ setActiveTab }) {
  return (
    <section className="page-wrap content-page legal-page" aria-labelledby="privacy-policy-title">
      <header className="page-intro page-intro-left">
        <button
          type="button"
          className="button button-quiet"
          onClick={() => setActiveTab('home')}
          style={{ marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Return to Home
        </button>
        <span className="eyebrow"><Shield size={15} aria-hidden="true" /> LEGAL COMPLIANCE & DATA PROTECTION</span>
        <h1 id="privacy-policy-title">Privacy Policy</h1>
        <p>
          Last Updated: November 21, 2026. DermaScan is engineered with an on-device privacy-first architecture designed to safeguard animal reporting data and user privacy.
        </p>
      </header>

      <div className="legal-content panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: 'var(--brand)' }} /> 1. On-Device & Edge Processing Philosophy
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            DermaScan operates primarily as a client-side WebAssembly neural application. When you upload or photograph an animal’s skin for dermatological screening, the image is evaluated locally in your browser using our quantized ConvNeXt-Tiny neural network. <strong>Your photograph does not leave your device</strong> unless you explicitly choose to submit an intake report to an assigned rescue group or clinic.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            2. Information We Collect
          </h2>
          <ul style={{ paddingLeft: '20px', color: '#334155', lineHeight: 1.7, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Photographic Data:</strong> Animal skin photos selected for screening or report attachment.</li>
            <li><strong>Approximate Geolocation:</strong> Latitude and longitude coordinates, provided only when you click &quot;Add current location&quot; in the Report form or &quot;Find care near me&quot; in Nearby Care.</li>
            <li><strong>Clinical Observations:</strong> User-authored notes regarding animal behavior, apparent distress, or physical lesion visibility.</li>
            <li><strong>Device Telemetry:</strong> Anonymized runtime diagnostics (e.g. WebAssembly SIMD support, inference latency) without IP address tracking.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            3. Local Storage and Data Persistence
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            Reports and case drafts are stored permanently on your device using IndexedDB and LocalStorage APIs (key: <code>dermascan_clinical_cases_v3</code>). You can clear this data at any time using your browser&apos;s storage controls or via the &quot;Clear Data&quot; option in the Admin Portal.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            4. Third-Party Integrations
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px', marginBottom: '10px' }}>
            DermaScan integrates with a limited number of mission-critical open infrastructure providers:
          </p>
          <ul style={{ paddingLeft: '20px', color: '#334155', lineHeight: 1.7, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>OpenStreetMap &amp; Leaflet:</strong> Interactive maps and veterinary care location directory. Coordinates are sent only during active proximity searches.</li>
            <li><strong>Kaggle Canine Dermatology Dataset:</strong> Pre-trained open-access clinical weights; no personal data is transmitted to Kaggle during inference.</li>
            <li><strong>Zero Commercial Trackers:</strong> We do not include Google Analytics, Facebook Pixel, tracking beacons, or cross-site fingerprinting scripts.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            5. Your Data Rights
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            Under GDPR, CCPA, and applicable veterinary informatics standards, you have the right to access, export, or permanently delete any case records you generate. DermaScan provides an instant one-click PDF export and local data erasure mechanism on all reported cases.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 750, color: 'var(--ink)', marginBottom: '8px' }}>
            6. Contact Our Data Protection Officer
          </h2>
          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '14px' }}>
            For privacy inquiries or clinical data questions, contact: <br />
            <strong>DermaScan Clinical Data Group</strong> &bull; <code>privacy@dermascan.org</code> &bull; Open Source Initiative.
          </p>
        </section>
      </div>
    </section>
  );
}
