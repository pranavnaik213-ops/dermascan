import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AIDetection from './components/AIDetection';
import ReportAnimal from './components/ReportAnimal';
import NearbyCare from './components/NearbyCare';
import Awareness from './components/Awareness';
import AdminDashboard from './components/AdminDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import NotFound from './components/NotFound';
import CookieConsent from './components/CookieConsent';
import Footer from './components/Footer';
import Interactive3DScene from './components/Interactive3DScene';
import { api } from './services/api';
import { analytics } from './services/analytics';
import './App.css';

const VALID_TABS = ['home', 'detect', 'report', 'help', 'awareness', 'admin', 'privacy', 'terms', 'not-found'];

const TAB_META = {
  home: {
    title: 'DermaScan — Veterinary AI Skin Diagnosis & Community Animal Care',
    desc: 'Instant on-device AI skin disease screening for dogs and animals across 6 dermatological conditions. 94.23% accuracy, zero cloud telemetry, 100% free.'
  },
  detect: {
    title: 'AI Skin Disease Scan | DermaScan Neural Vision',
    desc: 'Analyze animal fur and skin lesions with real-time neural vision and Grad-CAM lesion attention maps directly in your browser.'
  },
  report: {
    title: 'Report an Animal in Need | DermaScan Field Intake',
    desc: 'Document observations, attach GPS location, and prepare an animal welfare intake case with downloadable clinical PDF.'
  },
  help: {
    title: 'Find Local Veterinary Care & Emergency Clinics | DermaScan',
    desc: 'Locate 24/7 verified veterinary hospitals, animal shelters, and community rescue ambulances near you.'
  },
  awareness: {
    title: 'Canine Dermatology Care Guide & Disease Directory | DermaScan',
    desc: 'Clinical guide to canine skin conditions: dermatitis, mange, fungal infections, hot spots, ringworm, and preventive care.'
  },
  admin: {
    title: 'Authorized Clinical Admin Portal | DermaScan',
    desc: 'Administrative case triage, hospital dispatch queue, and offline model telemetry audit logs.'
  },
  privacy: {
    title: 'Privacy Policy | DermaScan Animal Care',
    desc: 'Learn how DermaScan operates with privacy-by-design, client-side WebAssembly processing, and zero third-party tracking.'
  },
  terms: {
    title: 'Terms and Conditions of Use | DermaScan',
    desc: 'Clinical terms of service, AI decision-support disclaimers, humane animal handling standards, and limitation of liability.'
  },
  'not-found': {
    title: '404 Page Not Found | DermaScan',
    desc: 'The requested page or resource could not be found.'
  }
};

function getInitialTab() {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const stateTab = window.history.state?.tab;
  const tab = stateTab || hash;
  if (!tab) return 'home';
  return VALID_TABS.includes(tab) ? tab : 'not-found';
}

export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [photoForReport, setPhotoForReport] = useState(null);
  const [latestReport, setLatestReport] = useState(null);

  // Item 4: Force HTTPS in production (redirect unencrypted http: to https:)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      !['localhost', '127.0.0.1'].includes(window.location.hostname)
    ) {
      window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);
    }
  }, []);

  // Item 6 & 19: Dynamic document.title, meta descriptions, and zero-cookie analytics
  useEffect(() => {
    const meta = TAB_META[activeTab] || TAB_META.home;
    document.title = meta.title;

    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.setAttribute('name', 'description');
      document.head.appendChild(descEl);
    }
    descEl.setAttribute('content', meta.desc);

    // Track privacy-respecting client analytics pageView
    analytics.pageView(activeTab);
  }, [activeTab]);

  // Navigate to tab with Browser History API support (enables mobile back button to return to home instead of exiting)
  const navigateToTab = (newTab, replace = false) => {
    const targetTab = VALID_TABS.includes(newTab) ? newTab : 'home';

    // Immediately reset scroll to top so user never lands at the bottom
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTop = 0;

    if (targetTab === activeTab && !replace) {
      return;
    }

    const newHash = targetTab === 'home' ? '' : `#${targetTab}`;
    const newUrl = newHash ? `${window.location.pathname}${newHash}` : window.location.pathname;

    if (replace) {
      window.history.replaceState({ tab: targetTab }, '', newUrl);
    } else {
      window.history.pushState({ tab: targetTab }, '', newUrl);
    }

    setActiveTab(targetTab);
  };

  // Listen to popstate (mobile phone back/forward button or browser back button)
  useEffect(() => {
    const handlePopState = (event) => {
      const stateTab = event.state?.tab;
      const hashTab = window.location.hash.replace(/^#\/?/, '').trim();
      const targetTab = stateTab || hashTab || 'home';
      const valid = VALID_TABS.includes(targetTab) ? targetTab : (hashTab ? 'not-found' : 'home');
      setActiveTab(valid);

      // Scroll to top on back navigation as well
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Initialize root history state if missing so first back press returns to home
    if (!window.history.state?.tab) {
      const curTab = getInitialTab();
      const curHash = curTab === 'home' ? '' : `#${curTab}`;
      const curUrl = curHash ? `${window.location.pathname}${curHash}` : window.location.pathname;
      window.history.replaceState({ tab: curTab }, '', curUrl);
    }

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Guarantee scroll to top on every activeTab state change
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTop = 0;
  }, [activeTab]);

  const handlePhotoReady = (photo) => {
    setPhotoForReport(photo);
    navigateToTab('report');
  };

  const handleAddReport = async (report) => {
    const savedReport = await api.createCase(report);
    setLatestReport(savedReport);
    setPhotoForReport(null);
    return savedReport;
  };

  return (
    <div className="site-shell">
      <Interactive3DScene />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar activeTab={activeTab} setActiveTab={navigateToTab} />

      <main id="main-content" className="site-main" key={activeTab}>
        {activeTab === 'home' && <Hero setActiveTab={navigateToTab} />}
        {activeTab === 'detect' && <AIDetection onPhotoReady={handlePhotoReady} />}
        {activeTab === 'report' && (
          <ReportAnimal
            onAddCase={handleAddReport}
            setActiveTab={navigateToTab}
            initialPhoto={photoForReport}
          />
        )}
        {activeTab === 'help' && <NearbyCare report={latestReport} />}
        {activeTab === 'awareness' && <Awareness setActiveTab={navigateToTab} />}
        {activeTab === 'admin' && <AdminDashboard setActiveTab={navigateToTab} />}
        {activeTab === 'privacy' && <PrivacyPolicy setActiveTab={navigateToTab} />}
        {activeTab === 'terms' && <TermsConditions setActiveTab={navigateToTab} />}
        {activeTab === 'not-found' && <NotFound setActiveTab={navigateToTab} />}
      </main>

      {/* Item 5: Privacy-conscious Cookie Consent Banner */}
      <CookieConsent
        onOpenPrivacy={() => navigateToTab('privacy')}
        onOpenTerms={() => navigateToTab('terms')}
      />

      <Footer setActiveTab={navigateToTab} />
    </div>
  );
}
