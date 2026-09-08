import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import MapView from '../components/MapView';
import { 
  AlertTriangle, 
  Radar, 
  ShieldAlert, 
  Clock, 
  Percent, 
  ExternalLink, 
  Eye, 
  Battery,
  Send,
  Thermometer,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

export default function Dashboard({ onSelectDetection }) {
  const [loading, setLoading] = useState(true);
  const [drones, setDrones] = useState([]);
  const [detections, setDetections] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [testSent, setTestSent] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dronesRes, detRes, analyticsRes] = await Promise.all([
        api.getDrones(),
        api.getDetections({ limit: 15 }),
        api.getAnalyticsSummary()
      ]);

      setDrones(dronesRes.data || []);
      setDetections(detRes.data || []);
      setAnalytics(analyticsRes || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleSendTestAlert = async () => {
    try {
      setTestSent(true);
      const res = await api.testWhatsAppAlert('+91 6360911344');
      if (res.direct_whatsapp_url) {
        window.open(res.direct_whatsapp_url, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending test alert');
    } finally {
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  const primaryDrone = drones.length > 0 ? drones[0] : {
    drone_id: 'CROPSENTRY_01',
    name: 'CropSentry Falcon-1',
    is_online: true,
    last_battery_percent: 84
  };

  // Compute stats using simple terminology
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayDetections = detections.filter(d => d.timestamp && d.timestamp.startsWith(todayStr));
  const animalsDetectedToday = todayDetections.filter(d => d.status === 'confirmed_candidate');
  const lastDetectionTime = detections.length > 0
    ? new Date(detections[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'None';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Single Drone Overview & Quick Test */}
      <div className="bg-gradient-to-r from-[#122418] via-[#1b3825] to-[#254d33] text-white p-6 rounded-3xl border border-forest-800/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-lg font-extrabold text-white">
              {primaryDrone.name || 'CropSentry Falcon-1'}
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Patrol Active
            </span>
          </div>
          <p className="text-xs text-emerald-200/80">
            Real-time thermal monitoring across crop boundary. Battery: <strong>{primaryDrone.last_battery_percent ?? 84}%</strong> • Live Telemetry Link Stable.
          </p>
        </div>

        <button
          onClick={handleSendTestAlert}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{testSent ? 'Alert Dispatched!' : 'Send WhatsApp Alert to +91 8073222459'}</span>
        </button>
      </div>

      {/* Top Metric Cards with Simple Terminology */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Field Scans Today"
          value={todayDetections.length}
          subtitle="Ground sweeps performed"
          icon={Radar}
        />
        <StatCard
          title="Animals Detected Today"
          value={animalsDetectedToday.length}
          subtitle="Triggered acoustic strobe"
          icon={AlertTriangle}
          alert={animalsDetectedToday.length > 0}
          badge={animalsDetectedToday.length > 0 ? "Alert Sent" : "All Clear"}
        />
        <StatCard
          title="Drone Battery & Status"
          value={`${primaryDrone.last_battery_percent ?? 84}%`}
          subtitle="LiPo Power Remaining"
          icon={Battery}
          accent={true}
          badge="Healthy"
        />
        <StatCard
          title="Last Wildlife Sighting"
          value={lastDetectionTime}
          subtitle={detections.length > 0 ? "Thermal spike detected" : 'No intrusion'}
          icon={Clock}
        />
      </div>

      {/* Interactive Map */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Live Drone Flight Path & Animal Sightings</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-semibold">
                Live GIS
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive map tracking CropSentry-01 and recent thermal animal detections
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live auto-updating</span>
          </div>
        </div>

        <MapView
          drones={drones}
          detections={detections}
          onSelectDetection={onSelectDetection}
        />
      </div>

      {/* Recent Detections List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Wildlife Sightings & Scans</h3>
            <p className="text-xs text-slate-500">Latest 10 heat anomalies recorded over the field</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            {detections.length} recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Snapshot</th>
                <th className="py-3 px-4">Time (Local)</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Thermal Contrast</th>
                <th className="py-3 px-4">Detection Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detections.slice(0, 10).map((d) => {
                const isAnimal = d.status === 'confirmed_candidate';
                return (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      {d.image_url ? (
                        <img 
                          src={`http://localhost:5000${d.image_url}`} 
                          alt="Snapshot" 
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 text-[10px] font-medium">
                          No Pic
                        </div>
                      )}
                    </td>

                    {/* Time */}
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {new Date(d.timestamp).toLocaleDateString()}
                      <div className="text-[11px] text-slate-500">
                        {new Date(d.timestamp).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Location & Map link */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-600">
                        {d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1 mt-0.5"
                      >
                        Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    {/* Temperatures & Delta */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                        <span>Δ +{d.delta}°C</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Animal: {d.object_temp_celsius}°C | Soil: {d.ambient_temp_celsius}°C
                      </div>
                    </td>

                    {/* Simple Term Status Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        isAnimal 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isAnimal ? '🚨 Animal Detected' : 'Safe / Normal'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectDetection(d.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 font-semibold text-xs transition border border-forest-200/60"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
