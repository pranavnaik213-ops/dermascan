import React, { useState } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [photoForReport, setPhotoForReport] = useState(null);
  const [latestReport, setLatestReport] = useState(null);

  const handlePhotoReady = (photo) => {
    setPhotoForReport(photo);
    setActiveTab('report');
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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main id="main-content" className="site-main" key={activeTab}>
        {activeTab === 'home' && <Hero setActiveTab={setActiveTab} />}
        {activeTab === 'detect' && <AIDetection onPhotoReady={handlePhotoReady} />}
        {activeTab === 'report' && (
          <ReportAnimal
            onAddCase={handleAddReport}
            setActiveTab={setActiveTab}
            initialPhoto={photoForReport}
          />
        )}
        {activeTab === 'help' && <NearbyCare report={latestReport} />}
        {activeTab === 'awareness' && <Awareness setActiveTab={setActiveTab} />}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
