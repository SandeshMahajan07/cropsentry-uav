import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Radio, 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Edit2, 
  Check, 
  X,
  Compass
} from 'lucide-react';

export default function FleetStatus() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDroneId, setEditingDroneId] = useState(null);
  const [editName, setEditName] = useState('');

  const loadDrones = async () => {
    try {
      setLoading(true);
      const res = await api.getDrones();
      setDrones(res.data || []);
    } catch (err) {
      console.error('Failed to fetch fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrones();
    const interval = setInterval(loadDrones, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartRename = (drone) => {
    setEditingDroneId(drone.drone_id);
    setEditName(drone.name || drone.drone_id);
  };

  const handleSaveRename = async (droneId) => {
    try {
      await api.updateDroneName(droneId, editName);
      setDrones(prev => prev.map(d => d.drone_id === droneId ? { ...d, name: editName } : d));
      setEditingDroneId(null);
    } catch (err) {
      console.error('Failed to update drone name:', err);
      alert('Failed to rename drone');
    }
  };

  const getBatteryColor = (percent) => {
    if (percent === null || percent === undefined) return 'bg-slate-300';
    if (percent > 60) return 'bg-emerald-500';
    if (percent > 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never connected';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now (<1 min ago)';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour(s) ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fleet Overview Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-forest-700" />
            <span>Active Patrol Fleet & Telemetry Health</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time status of all autonomous F450 UAVs registered in the sector
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-forest-100 text-forest-800">
            {drones.filter(d => d.is_online).length} of {drones.length} Units Online
          </span>
        </div>
      </div>

      {/* Drones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drones.map((drone) => {
          const isOnline = drone.is_online;
          const isEditing = editingDroneId === drone.drone_id;

          return (
            <div
              key={drone.drone_id}
              className={`bg-white rounded-3xl border transition-all duration-200 p-6 shadow-sm flex flex-col justify-between ${
                isOnline 
                  ? 'border-slate-200/80 hover:shadow-md' 
                  : 'border-rose-200/70 bg-rose-50/20'
              }`}
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-sm font-bold border border-forest-600 rounded-lg px-2 py-1 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(drone.drone_id)}
                          className="p-1 rounded bg-forest-900 text-white hover:bg-forest-800"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingDroneId(null)}
                          className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 truncate">
                          {drone.name || drone.drone_id}
                        </h4>
                        <button
                          onClick={() => handleStartRename(drone)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title="Rename drone"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs font-mono text-slate-500 font-semibold">{drone.drone_id}</p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Offline ({'>'}30m)
                      </span>
                    )}
                  </div>
                </div>

                {/* Battery Gauge */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Battery className="w-4 h-4 text-slate-500" />
                      LiPo Battery Level
                    </span>
                    <span className="font-bold text-slate-900">
                      {drone.last_battery_percent !== null ? `${drone.last_battery_percent}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${getBatteryColor(drone.last_battery_percent)}`}
                      style={{ width: `${drone.last_battery_percent || 0}%` }}
                    />
                  </div>
                </div>

                {/* Telemetry Summary */}
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Last Heartbeat:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatRelativeTime(drone.last_seen_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      Lifetime Scans:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {drone.total_detections} scans
                    </span>
                  </div>

                  <div className="py-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Last GPS Fix:
                      </span>
                      {drone.last_known_lat && drone.last_known_lng ? (
                        <a
                          href={`https://www.google.com/maps?q=${drone.last_known_lat},${drone.last_known_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest-700 hover:text-forest-900 font-semibold inline-flex items-center gap-1"
                        >
                          Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </div>
                    {drone.last_known_lat && drone.last_known_lng && (
                      <p className="font-mono text-[11px] text-slate-500 text-right mt-0.5">
                        {drone.last_known_lat.toFixed(5)}, {drone.last_known_lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Hardware: F450 + ESP32</span>
                <span>Firmware: v2.1.4</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
