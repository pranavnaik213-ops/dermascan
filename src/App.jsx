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
import NgoPortal from './components/NgoPortal';
import VetPortal from './components/VetPortal';
import NotificationDrawer from './components/NotificationDrawer';
import Footer from './components/Footer';
import Interactive3DScene from './components/Interactive3DScene';
import ThreeDClickManager from './components/ThreeDClickManager';
import FloatingEmergencyIsland from './components/FloatingEmergencyIsland';

import { INITIAL_CASES } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('light');
  const [currentRole, setCurrentRole] = useState('user'); // user, ngo, vet, admin
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('dermascan_clinical_cases_v3');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '🚨 Emergency SOS Dispatched',
      message: 'Acute traumatic wound and pyoderma reported in Kengeri Satellite Town (Priority 96/100). Broadcast sent to PFA Bengaluru.',
      time: '10m ago',
      type: 'emergency'
    },
    {
      id: 2,
      title: '🏥 Case Accepted by Sarvoham Foundation',
      message: 'Sarvoham Animal Foundation accepted Case DS-2026-00124 (Canine Sarcoptic Mange). Volunteer Chethan Sharma assigned.',
      time: '45m ago',
      type: 'info'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Sync cases to localStorage
  useEffect(() => {
    localStorage.setItem('dermascan_clinical_cases_v3', JSON.stringify(cases));
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
      title: newCase.urgency === 'Emergency' ? '🚨 Emergency SOS Created' : '📋 New Case Generated',
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
        title: '🏥 Case Accepted',
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

  const handleScanComplete = (scanResult) => {
    setLastScanResult(scanResult);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Real-time 3D Interactive Canvas Background */}
      <Interactive3DScene />

      {/* Global 3D Interactive Click Waves & Mechanical Haptic Feedback */}
      <ThreeDClickManager />

      {/* Top Role Switcher Header */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <RoleSwitcher currentRole={currentRole} setRole={setCurrentRole} setActiveTab={setActiveTab} />
      </div>

      {/* Main Navbar */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          unreadNotifications={notifications.length}
          setShowNotifications={setShowNotifications}
          currentRole={currentRole}
          casesCount={cases.length}
        />
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <NotificationDrawer 
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onClear={() => setNotifications([])}
        />
      )}

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingTop: '18px', paddingBottom: '36px', position: 'relative', zIndex: 2 }}>
        
        {activeTab === 'home' && (
          <Hero 
            setActiveTab={setActiveTab} 
            casesCount={cases.length} 
            onScanComplete={handleScanComplete}
          />
        )}

        {activeTab === 'detect' && (
          <AIDetection 
            setActiveTab={setActiveTab} 
            onScanComplete={handleScanComplete}
            initialScanResult={lastScanResult}
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
            theme={theme}
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

        {activeTab === 'ngo' && (
          <NgoPortal 
            cases={cases}
            onAcceptCase={handleAcceptCase}
            onUpdateStatus={handleUpdateStatus}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'vet' && (
          <VetPortal 
            cases={cases}
            onUpdateStatus={handleUpdateStatus}
            setCases={setCases}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalytics 
            cases={cases}
            setCases={setCases}
            casesCount={cases.length}
            onUpdateStatus={handleUpdateStatus}
            onAcceptCase={handleAcceptCase}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
          />
        )}

      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Persistent Floating Emergency Island */}
      <FloatingEmergencyIsland 
        activeEmergencyCase={cases.find(c => c.urgency === 'Emergency')} 
        setActiveTab={setActiveTab} 
      />

    </div>
  );
}
