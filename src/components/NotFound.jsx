import React from 'react';
import { AlertCircle, ArrowLeft, Camera, FileText, Home } from 'lucide-react';

export default function NotFound({ setActiveTab }) {
  return (
    <section className="page-wrap content-page not-found-page" aria-labelledby="not-found-heading" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="panel" style={{ maxWidth: '640px', width: '100%', textAlign: 'center', padding: '48px 32px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(13, 148, 136, 0.12)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ccfbf1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0d9488',
          boxShadow: '0 8px 16px -4px rgba(13, 148, 136, 0.2)'
        }}>
          <AlertCircle size={42} strokeWidth={2} aria-hidden="true" />
        </div>

        <span className="eyebrow" style={{ color: '#0d9488', letterSpacing: '0.12em', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
          Error 404 — Page Not Found
        </span>

        <h1 id="not-found-heading" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 16px', lineHeight: 1.2 }}>
          We couldn't find that page
        </h1>

        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 32px' }}>
          The link you followed may be broken, outdated, or the page may have been moved. You can return home or choose one of our core care services below.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          <button
            type="button"
            className="button button-primary"
            onClick={() => setActiveTab('home')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px' }}
          >
            <Home size={16} aria-hidden="true" /> Return Home
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setActiveTab('detect')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px' }}
          >
            <Camera size={16} aria-hidden="true" /> AI Skin Scan
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setActiveTab('report')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px' }}
          >
            <FileText size={16} aria-hidden="true" /> Report Animal
          </button>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={15} aria-hidden="true" /> Go back to previous page
          </button>
        </div>
      </div>
    </section>
  );
}
