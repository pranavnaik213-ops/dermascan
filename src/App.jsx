import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoleSwitcher from './components/RoleSwitcher';
import Hero from './components/Hero';
import AIDetection from './components/AIDetection';
import ReportAnimal from './components/ReportAnimal';
import FindHelpMap from './components/FindHelpMap';
import CasesTracker from './components/CasesTracker';
import Awareness from './components/Awareness';
import AdminAnalytics from './components/AdminAnalytics';
import NotificationDrawer from './components/NotificationDrawer';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';

import { INITIAL_CASES } from './data/mockData';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');
  const [currentRole, setCurrentRole] = useState('user'); // user, ngo, vet, admin
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('dermascan_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Emergency SOS Reported',
      message: 'Severe bleeding wound stray reported in Kengeri Satellite Town (Priority 96/100)',
      time: '10m ago',
      type: 'emergency'
    },
    {
      id: 2,
      title: 'Case Accepted',
      message: 'ABC Animal Rescue accepted Case DS-2026-00124 (Canine Mange)',
      time: '45m ago',
      type: 'info'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Sync cases to localStorage
  useEffect(() => {
    localStorage.setItem('dermascan_cases', JSON.stringify(cases));
  }, [cases]);

  // Sync dataset theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Add new report handler
  const handleAddCase = (newCase) => {
    setCases(prev => [newCase, ...prev]);
    
    // Add real-time notification
    const newNotif = {
      id: Date.now(),
      title: newCase.urgency === 'Emergency' ? 'Emergency SOS Created' : 'New Case Generated',
      message: `Case ${newCase.id} created for ${newCase.animalType} in ${newCase.locationName}`,
      time: 'Just now',
      type: newCase.urgency === 'Emergency' ? 'emergency' : 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Accept case handler for NGOs
  const handleAcceptCase = (caseId, ngoName, volunteerName) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedTimeline = c.timeline.map(t => {
          if (t.step.includes('NGO') || t.step.includes('Dispatch')) {
            return { step: `NGO Accepted (${ngoName})`, date: 'Just now', done: true };
          }
          return t;
        });
        return {
          ...c,
          status: 'ngo_assigned',
          assignedNGO: ngoName,
          assignedVolunteer: volunteerName,
          timeline: updatedTimeline
        };
      }
      return c;
    }));

    setNotifications(prev => [
      {
        id: Date.now(),
        title: 'Case Accepted',
        message: `${ngoName} accepted ${caseId}. Volunteer ${volunteerName} assigned.`,
        time: 'Just now',
        type: 'info'
      },
      ...prev
    ]);
  };

  // Update status handler (e.g., mark recovered)
  const handleUpdateStatus = (caseId, newStatus) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedTimeline = c.timeline.map(t => {
          return { ...t, done: true, date: 'Completed' };
        });
        return {
          ...c,
          status: newStatus,
          timeline: updatedTimeline
        };
      }
      return c;
    }));
  };

  const [toastBanner, setToastBanner] = useState(null);

  const handleScanComplete = (scanResult) => {
    setLastScanResult(scanResult);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    let targetTab = 'home';
    let roleLabel = 'Citizen Reporter (Public View)';

    if (newRole === 'ngo') {
      targetTab = 'help';
      roleLabel = 'Rescue NGO (Dispatch View)';
    } else if (newRole === 'vet') {
      targetTab = 'cases';
      roleLabel = 'Veterinarian (Clinical Audit View)';
    } else if (newRole === 'admin') {
      targetTab = 'analytics';
      roleLabel = 'System Admin (Metrics & Data Control)';
    } else {
      targetTab = 'home';
      roleLabel = 'Citizen Reporter (Public View)';
    }

    setActiveTab(targetTab);

    setToastBanner(`Role Switched: Activated ${roleLabel}`);
    setTimeout(() => setToastBanner(null), 3500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      
      {/* Toast Notification Banner */}
      {toastBanner && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '24px',
          zIndex: 9999,
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'pageFadeIn 0.3s ease-out forwards'
        }}>
          <ShieldCheck size={16} />
          <span>{toastBanner}</span>
        </div>
      )}

      {/* Top Role Switcher Header */}
      <RoleSwitcher currentRole={currentRole} onRoleChange={handleRoleChange} />

      {/* Main Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        unreadNotifications={notifications.length}
        setShowNotifications={setShowNotifications}
        currentRole={currentRole}
        casesCount={cases.length}
        lang={lang}
        setLang={setLang}
      />

      {/* Notifications Drawer */}
      {showNotifications && (
        <NotificationDrawer 
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onClear={() => setNotifications([])}
        />
      )}

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingTop: '20px', paddingBottom: '30px' }}>
        
        {activeTab === 'home' && (
          <Hero setActiveTab={setActiveTab} cases={cases} />
        )}

        {activeTab === 'detect' && (
          <AIDetection 
            setActiveTab={setActiveTab} 
            onScanComplete={handleScanComplete}
          />
        )}

        {activeTab === 'report' && (
          <ReportAnimal 
            onAddCase={handleAddCase} 
            setActiveTab={setActiveTab}
            initialScanResult={lastScanResult}
          />
        )}

        {activeTab === 'help' && (
          <FindHelpMap 
            cases={cases}
            onAcceptCase={handleAcceptCase}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'cases' && (
          <CasesTracker 
            cases={cases}
            currentRole={currentRole}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'awareness' && (
          <Awareness />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalytics cases={cases} />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicy setActiveTab={setActiveTab} />
        )}

        {activeTab === 'terms' && (
          <TermsAndConditions setActiveTab={setActiveTab} />
        )}

      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}
