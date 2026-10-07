import React from 'react';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicy({ setActiveTab }) {
  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span className="badge badge-low" style={{ marginBottom: '6px' }}>
          <Shield size={14} /> LEGAL & DATA PRIVACY
        </span>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: 800 }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Information on how DermaScan collects, processes, and protects geolocation and photo data for stray animal rescue operations.
        </p>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          Effective Date: October 7, 2026 | Domain: <strong>dermascan.org</strong>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary)" />
            1. Overview & Data Scope
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            DermaScan ("Platform") operates as a preliminary veterinary dermatological screening and emergency rescue dispatch system. This Privacy Policy details our technical data handling practices for citizens, rescue volunteers, non-governmental organizations (NGOs), and licensed veterinarians using the platform at <strong>dermascan.org</strong>.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--primary)" />
            2. Information Collected & Technical Purpose
          </h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Geospatial Location Data:</strong> Precise GPS coordinates (latitude and longitude) and landmark names submitted during rescue case reporting are processed strictly to calculate rescue dispatch proximity to registered animal welfare organizations.
              </li>
              <li>
                <strong>Photographic Data:</strong> Animal skin lesion photographs uploaded for preliminary dermatological screening are processed using feature extraction algorithms to generate quality check metrics and classification confidence scores.
              </li>
              <li>
                <strong>Reporter Identification:</strong> Reporter names or contact numbers provided during incident submission are shared exclusively with assigned rescue NGO dispatchers to facilitate field location verification.
              </li>
              <li>
                <strong>System Audit Telemetry:</strong> Anonymized dataset interaction metrics are recorded to evaluate classifier accuracy across regions.
              </li>
            </ul>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} color="var(--primary)" />
            3. Data Sharing & Third-Party Integrations
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            We do not sell, rent, or monetize personal or rescue reporting data. Case information is shared solely with verified partner rescue NGOs (such as CUPA, CARE, PFA Bengaluru) and licensed veterinary clinics for emergency treatment coordination.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--primary)" />
            4. Security Protocols & Retention
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            All transmissions between client devices and <strong>dermascan.org</strong> are encrypted using Standard TLS protocols. Case records remain active in local storage and system logs throughout the duration of animal medical treatment and recovery verification.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
            5. Contact Information
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            For privacy inquiries, data deletion requests, or NGO verification applications, contact the system administrator at: <br />
            <strong>privacy@dermascan.org</strong>
          </p>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('home')}
            style={{ padding: '10px 24px', borderRadius: '8px' }}
          >
            Back to Home
          </button>
        </div>

      </div>

    </div>
  );
}
