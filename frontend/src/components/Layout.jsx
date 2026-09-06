import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  LayoutDashboard, 
  History, 
  Eye, 
  BarChart3, 
  Settings as SettingsIcon, 
  Zap, 
  Compass, 
  Menu, 
  X,
  MapPin,
  Home,
  Radio
} from 'lucide-react';
import SimulationModal from './SimulationModal';

export default function Layout({ activeTab, setActiveTab, children, onRefreshData, onGoHome }) {
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLocationText, setCurrentLocationText] = useState('Fetching live coordinates...');

  // Fetch real browser location or fallback to drone telemetry
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          setCurrentLocationText(`Live Sector: ${lat}°N, ${lng}°E (Detected)`);
        },
        (err) => {
          // If permission denied or unavailable, display drone coordinates
          setCurrentLocationText('Field Sector: 17.3295°N, 76.8369°E (Drone Home)');
        },
        { timeout: 8000 }
      );
    } else {
      setCurrentLocationText('Field Sector: 17.3295°N, 76.8369°E (Drone Home)');
    }
  }, []);

  // Periodic health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.checkHealth();
        setBackendHealthy(res.status === 'ok');
      } catch (err) {
        setBackendHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Map', icon: LayoutDashboard },
    { id: 'history', label: 'Detection History', icon: History },
    { id: 'detail', label: 'Detection Detail', icon: Eye },
    { id: 'analytics', label: 'Nocturnal Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Alerts', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F2] text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#122418] text-white border-r border-[#1e3827] shadow-xl shrink-0 z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-forest-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-forest-950/40 text-white font-black text-xl">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                CropSentry
              </h1>
              <p className="text-[11px] text-forest-300 font-medium tracking-wide">UAV Night Patrol Console</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-forest-400/60 uppercase tracking-widest px-3 py-2">
            Single Drone: CropSentry-01
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-forest-700 to-forest-800 text-white shadow-md shadow-forest-950/30 border border-forest-600/40'
                    : 'text-forest-200/70 hover:bg-forest-900/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-forest-200' : 'text-forest-400/70'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-forest-300 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-forest-900/60 space-y-2.5">
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-600 text-white text-xs font-bold transition shadow-md border border-forest-600 active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-forest-200" />
            <span>Simulate Animal Detection</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-forest-950/70 hover:bg-forest-900 text-forest-300 hover:text-white text-xs font-semibold border border-forest-900 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </button>

          {/* System Status Card */}
          <div className="p-3 rounded-2xl bg-forest-950/60 border border-forest-900/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-300">Backend API</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
              <span className={backendHealthy ? 'text-emerald-400' : 'text-rose-400'}>
                {backendHealthy ? 'Connected' : 'Offline'}
              </span>
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                  {navItems.find(n => n.id === activeTab)?.label || 'Patrol Console'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  UAV-01 Online
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700 truncate max-w-xs sm:max-w-md">
                  {currentLocationText}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct Home Navigation for mobile */}
            <button
              onClick={onGoHome}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              title="Landing Page"
            >
              <Home className="w-4 h-4" />
            </button>

            {/* Quick Simulate Trigger */}
            <button
              onClick={() => setIsSimModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#122418] hover:bg-[#1c3826] text-white text-xs font-bold transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-forest-300" />
              <span>Simulate Detection</span>
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#122418] text-white p-4 border-b border-forest-900 space-y-1 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    activeTab === item.id ? 'bg-forest-800 text-white' : 'text-forest-200/80 hover:bg-forest-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onGoHome();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-300 hover:bg-forest-900"
            >
              <Home className="w-4 h-4" />
              <span>Exit to Landing Page</span>
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Simulator Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onIngested={() => {
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
}
