import React, { useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

const CONSENT_KEY = 'dermascan_cookie_consent';

export default function CookieConsent({ onOpenPrivacy, onOpenTerms }) {
  const [showBanner, setShowBanner] = useState(() => {
    try {
      return !localStorage.getItem(CONSENT_KEY);
    } catch {
      return false;
    }
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  const savePreferences = (analyticsAllowed) => {
    try {
      const preference = {
        essential: true,
        analytics: analyticsAllowed,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(preference));
    } catch {
      // Storage unavailable
    }
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => savePreferences(true);
  const handleRejectAll = () => savePreferences(false);

  if (!showBanner) return null;

  return (
    <aside
      className="cookie-consent-banner"
      role="region"
      aria-label="Cookie and Storage Preferences"
      aria-live="polite"
    >
      <div className="cookie-consent-inner page-wrap">
        <div className="cookie-consent-content">
          <div className="cookie-consent-icon-wrap" aria-hidden="true">
            <Cookie size={22} />
          </div>
          <div className="cookie-consent-text">
            <strong className="cookie-consent-title">Privacy & Storage Preferences</strong>
            <p>
              DermaScan uses essential on-device browser storage (IndexedDB & LocalStorage) to keep your animal reports, draft notes, and neural model weights cached locally. We do not sell data or use third-party advertising cookies.
            </p>
            <div className="cookie-consent-links">
              <button
                type="button"
                className="cookie-link-button"
                onClick={() => { setShowBanner(false); if (onOpenPrivacy) onOpenPrivacy(); }}
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                className="cookie-link-button"
                onClick={() => { setShowBanner(false); if (onOpenTerms) onOpenTerms(); }}
              >
                Terms of Use
              </button>
            </div>
          </div>
        </div>

        {showPreferences ? (
          <div className="cookie-preferences-dialog">
            <div className="cookie-pref-row">
              <div>
                <strong>Essential Storage</strong>
                <p>Required for case report drafts, PDF generation, and on-device neural inference weights.</p>
              </div>
              <span className="badge badge-success">Always Active</span>
            </div>
            <div className="cookie-pref-row">
              <div>
                <strong>Anonymous Analytics</strong>
                <p>Helps us understand model inference latency and feature usage with zero personal data.</p>
              </div>
              <label className="cookie-toggle-label">
                <input
                  type="checkbox"
                  checked={analyticsOptIn}
                  onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                />
                <span className="cookie-toggle-text">{analyticsOptIn ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
            <div className="cookie-consent-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => savePreferences(analyticsOptIn)}
              >
                Save Preferences
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-consent-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={handleAcceptAll}
            >
              <ShieldCheck size={16} aria-hidden="true" /> Accept All
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleRejectAll}
            >
              Essential Only
            </button>
            <button
              type="button"
              className="button button-quiet cookie-settings-btn"
              onClick={() => setShowPreferences(true)}
            >
              Preferences
            </button>
          </div>
        )}

        <button
          type="button"
          className="cookie-consent-close"
          aria-label="Dismiss cookie notice"
          onClick={handleRejectAll}
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
