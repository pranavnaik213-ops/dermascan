/**
 * Privacy-First, Zero-Cookie Telemetry & Analytics Service
 * Compliant with GDPR, CCPA, and ePrivacy Directive.
 * Collects zero PII (no IP addresses, no user IDs, no canvas fingerprinting).
 * Respects Do Not Track (DNT) and user cookie consent choices.
 */

const STORAGE_KEY = 'dermascan_local_analytics_v1';
const CONSENT_KEY = 'dermascan_cookie_consent';

function hasConsent() {
  if (typeof window === 'undefined') return false;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return false;
  try {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

function getStoredStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { events: {}, pageViews: {}, firstSeen: Date.now() };
  } catch {
    return { events: {}, pageViews: {}, firstSeen: Date.now() };
  }
}

export const analytics = {
  /**
   * Track a page view / tab transition
   */
  pageView(tab) {
    if (!hasConsent()) return;
    try {
      const stats = getStoredStats();
      stats.pageViews = stats.pageViews || {};
      stats.pageViews[tab] = (stats.pageViews[tab] || 0) + 1;
      stats.lastActive = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore local storage errors
    }
  },

  /**
   * Track an anonymous action (e.g., 'scan_completed', 'report_submitted')
   */
  track(eventName, properties = {}) {
    if (!hasConsent()) return;
    try {
      const stats = getStoredStats();
      stats.events = stats.events || {};
      const current = stats.events[eventName] || { count: 0, lastOccurred: 0, recentSample: null };
      current.count += 1;
      current.lastOccurred = Date.now();
      // Store non-identifying categorical metadata only
      if (properties.condition) current.recentCondition = properties.condition;
      if (properties.engineMode) current.lastEngine = properties.engineMode;
      stats.events[eventName] = current;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  },

  /**
   * Get aggregate anonymous summary for the admin analytics view
   */
  getSummary() {
    return getStoredStats();
  },

  /**
   * Clear telemetry history completely
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
};
