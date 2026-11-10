import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AIDetection from './components/AIDetection';
import ReportAnimal from './components/ReportAnimal';
import NearbyCare from './components/NearbyCare';
import Awareness from './components/Awareness';
import Footer from './components/Footer';
import Interactive3DScene from './components/Interactive3DScene';
import { api } from './services/api';
import './App.css';

const VALID_TABS = ['home', 'detect', 'report', 'help', 'awareness'];

function getInitialTab() {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const stateTab = window.history.state?.tab;
  const tab = stateTab || hash;
  return VALID_TABS.includes(tab) ? tab : 'home';
}

export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [photoForReport, setPhotoForReport] = useState(null);
  const [latestReport, setLatestReport] = useState(null);

  // Navigate to tab with Browser History API support (enables mobile back button to return to home instead of exiting)
  const navigateToTab = (newTab, replace = false) => {
    const targetTab = VALID_TABS.includes(newTab) ? newTab : 'home';

    // Immediately reset scroll to top so user never lands at the bottom
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
      const valid = VALID_TABS.includes(targetTab) ? targetTab : 'home';
      setActiveTab(valid);

      // Scroll to top on back navigation as well
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
      </main>

      <Footer setActiveTab={navigateToTab} />
    </div>
  );
}
