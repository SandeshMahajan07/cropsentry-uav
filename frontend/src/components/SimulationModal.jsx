import React, { useState } from 'react';
import { api } from '../api/client';
import { X, Send, Radio, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function SimulationModal({ isOpen, onClose, onIngested }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    drone_id: 'CROPSENTRY_01',
    latitude: 17.329850,
    longitude: 76.837320,
    object_temp_celsius: 36.8,
    ambient_temp_celsius: 22.4,
    battery_percent: 82,
    include_image: true
  });

  if (!isOpen) return null;

  const presets = [
    {
      name: '🐗 Wild Boar Intrusion (Hot Body)',
      lat: 17.329850,
      lng: 76.837320,
      obj: 36.8,
      amb: 22.4,
      desc: 'High Delta (14.4°C) — Animal Detected, siren triggers, WhatsApp alert sent'
    },
    {
      name: '🦌 Spotted Deer in Crop Field',
      lat: 17.330200,
      lng: 76.837800,
      obj: 37.5,
      amb: 21.8,
      desc: 'High Delta (15.7°C) — Thermal spike triggers deterrence'
    },
    {
      name: '🪨 Cool Soil / Normal Field Sweep',
      lat: 17.329100,
      lng: 76.836200,
      obj: 23.5,
      amb: 22.0,
      desc: 'Low Delta (1.5°C) — Safe field, no alarm'
    }
  ];

  const applyPreset = (p) => {
    setFormData({
      ...formData,
      latitude: p.lat,
      longitude: p.lng,
      object_temp_celsius: p.obj,
      ambient_temp_celsius: p.amb
    });
    setResult(null);
    setError(null);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const payload = {
        drone_id: 'CROPSENTRY_01',
        timestamp: new Date().toISOString(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        object_temp_celsius: parseFloat(formData.object_temp_celsius),
        ambient_temp_celsius: parseFloat(formData.ambient_temp_celsius),
        battery_percent: parseInt(formData.battery_percent, 10)
      };

      if (formData.include_image) {
        payload.image_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';
      }

      const res = await api.ingestDetection(payload);
      setResult(res);
      if (onIngested) onIngested();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to simulate');
    } finally {
      setLoading(false);
    }
  };

  const delta = (parseFloat(formData.object_temp_celsius) - parseFloat(formData.ambient_temp_celsius)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-forest-100 text-forest-800 rounded-xl">
              <Zap className="w-5 h-5 text-forest-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">CropSentry-01 Telemetry Simulator</h3>
              <p className="text-xs text-slate-500">Test live ESP32 thermal sensor & GPS data packets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Scenarios</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-forest-600 hover:bg-forest-50/50 transition group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-forest-800 line-clamp-1">{p.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Δ {(p.obj - p.amb).toFixed(1)}°C</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSimulate} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patrol UAV</label>
              <input
                type="text"
                value="CropSentry-01"
                disabled
                className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-slate-100 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Battery Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.battery_percent}
                onChange={(e) => setFormData({ ...formData, battery_percent: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Animal/Target Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.object_temp_celsius}
                onChange={(e) => setFormData({ ...formData, object_temp_celsius: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil/Ambient Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.ambient_temp_celsius}
                onChange={(e) => setFormData({ ...formData, ambient_temp_celsius: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
            </div>

            <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-xs font-medium text-slate-600">Calculated Contrast:</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                delta >= 8 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Δ +{delta}°C ({delta >= 8 ? '🚨 Animal Spike' : 'Normal'})
              </span>
            </div>
          </div>

          {result && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Scan Ingested Successfully (ID #{result.id})
              </div>
              <p>Result: <span className="font-semibold uppercase">{result.status === 'confirmed_candidate' ? 'Animal Detected' : 'Safe Field'}</span> | Contrast: <span className="font-semibold">+{result.delta}°C</span></p>
              <p>WhatsApp Alert: <span className="font-semibold">{result.alert_sent ? '🚨 DISPATCHED to +91 8073222459' : 'SUPPRESSED'}</span> {result.dedup_applied ? '(Deduplicated - recent alert already sent nearby)' : ''}</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-forest-900 hover:bg-forest-800 active:scale-[0.98] rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Transmitting...' : 'Send Detection Telemetry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
