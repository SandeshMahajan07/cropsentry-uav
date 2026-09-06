import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DetectionHistory from './pages/DetectionHistory';
import DetectionDetail from './pages/DetectionDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  // View mode: 'landing' (Public Showcase & About Us) or 'console' (Live Patrol Dashboard)
  const [viewMode, setViewMode] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);
  const [previousTab, setPreviousTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectDetection = (id) => {
    setSelectedDetectionId(id);
    setPreviousTab(activeTab);
    setActiveTab('detail');
  };

  const handleBackFromDetail = () => {
    setActiveTab(previousTab || 'dashboard');
    setSelectedDetectionId(null);
  };

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // If on landing page, render gorgeous TerraElix-style showcase
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onEnterConsole={() => {
          setViewMode('console');
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Otherwise, render Live Patrol Console
  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab !== 'detail') setSelectedDetectionId(null);
      }}
      onRefreshData={handleRefreshData}
      onGoHome={() => setViewMode('landing')}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          key={refreshKey}
          onSelectDetection={handleSelectDetection}
        />
      )}

      {activeTab === 'history' && (
        <DetectionHistory
          key={refreshKey}
          onSelectDetection={handleSelectDetection}
        />
      )}

      {activeTab === 'detail' && (
        <DetectionDetail
          detectionId={selectedDetectionId || 1}
          onBack={handleBackFromDetail}
        />
      )}

      {activeTab === 'analytics' && (
        <Analytics key={refreshKey} />
      )}

      {activeTab === 'settings' && (
        <Settings key={refreshKey} />
      )}
    </Layout>
  );
}
