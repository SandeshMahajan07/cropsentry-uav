import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  ArrowLeft, 
  MapPin, 
  Thermometer, 
  Clock, 
  Radio, 
  ExternalLink, 
  Bell, 
  Image as ImageIcon,
  Check,
  X,
  HelpCircle,
  Send
} from 'lucide-react';

export default function DetectionDetail({ detectionId, onBack }) {
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const fetchDetail = async () => {
    if (!detectionId) return;
    try {
      setLoading(true);
      const data = await api.getDetectionById(detectionId);
      setDetection(data);
    } catch (err) {
      console.error('Failed to load detection detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [detectionId]);

  const handleUpdateReview = async (newStatus) => {
    try {
      setUpdating(true);
      await api.updateReviewedStatus(detectionId, newStatus);
      setDetection(prev => ({ ...prev, reviewed_status: newStatus }));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleResendAlert = async () => {
    try {
      setTestSent(true);
      const res = await api.testWhatsAppAlert('+91 8073222459');
      if (res.direct_whatsapp_url) {
        window.open(res.direct_whatsapp_url, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending alert');
    } finally {
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading sighting details...
      </div>
    );
  }

  if (!detection) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <p>Record not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isAnimal = detection.status === 'confirmed_candidate';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Verify This Sighting:</span>
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <button
              disabled={updating}
              onClick={() => handleUpdateReview('confirmed_real')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                detection.reviewed_status === 'confirmed_real'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Real Animal</span>
            </button>
            <button
              disabled={updating}
              onClick={() => handleUpdateReview('false_alarm')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                detection.reviewed_status === 'false_alarm'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>False Alarm</span>
            </button>
            <button
              disabled={updating}
              onClick={() => handleUpdateReview('unreviewed')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                detection.reviewed_status === 'unreviewed'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Unreviewed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Snapshot */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-forest-700" />
              <span>Camera Snapshot</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Scan #{detection.id}</span>
          </div>

          <div className="aspect-square w-full rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-200/80 relative shadow-inner">
            {detection.image_url ? (
              <img
                src={`http://localhost:5000${detection.image_url}`}
                alt="Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-xs font-medium">No Snapshot Transmitted</p>
                <p className="text-[11px] text-slate-600 max-w-xs">
                  The ESP32 sent thermal temperature contrast & GPS telemetry without an optical JPEG frame.
                </p>
              </div>
            )}

            {/* Status Overlay */}
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
                isAnimal
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-700 text-white'
              }`}>
                {isAnimal ? '🚨 Animal Detected' : 'Normal Field'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Captured via ESP32-CAM optical sensor / Infrared scan
          </p>
        </div>

        {/* Right Column: Telemetry & WhatsApp */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-forest-700" />
                <span>Thermal Sighting Telemetry</span>
              </h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800">
                UAV: CropSentry-01
              </span>
            </div>

            {/* Thermal Stats Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-forest-50 to-slate-50 border border-forest-100">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Target Temp</span>
                <div className="text-xl font-black text-slate-900">{detection.object_temp_celsius}°C</div>
                <span className="text-[10px] text-slate-400">Animal surface</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Soil/Ambient</span>
                <div className="text-xl font-black text-slate-700">{detection.ambient_temp_celsius}°C</div>
                <span className="text-[10px] text-slate-400">Surrounding ground</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-rose-600">Contrast (ΔT)</span>
                <div className="text-xl font-black text-rose-600">+{detection.delta}°C</div>
                <span className="text-[10px] text-rose-500/80 font-medium">Verified server-side</span>
              </div>
            </div>

            {/* Field Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time of Sighting</span>
                </div>
                <div className="font-bold text-slate-800">{new Date(detection.timestamp).toLocaleString()}</div>
                <div className="text-[10px] font-mono text-slate-400">{detection.timestamp} (UTC)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Field Coordinates</span>
                </div>
                <div className="font-mono font-bold text-slate-800">
                  {detection.latitude.toFixed(6)}, {detection.longitude.toFixed(6)}
                </div>
                <a
                  href={`https://www.google.com/maps?q=${detection.latitude},${detection.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
              <div>
                <span className="font-bold text-emerald-900">WhatsApp Alert Dispatch</span>
                <p className="text-emerald-800 text-[11px]">
                  Emergency alert with clickable Google Maps coordinates sent to +91 8073222459
                </p>
              </div>
              <button
                onClick={handleResendAlert}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testSent ? 'Sent to WhatsApp!' : 'Send WhatsApp Alert'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Notification Dispatch Log */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-forest-700" />
                <span>WhatsApp Notification Delivery Log</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {detection.alerts?.length || 0} record(s)
              </span>
            </div>

            {detection.alerts && detection.alerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Sent Time</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Log Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detection.alerts.map((al) => (
                      <tr key={al.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{al.recipient_phone}</td>
                        <td className="py-2.5 px-3 text-slate-600">{new Date(al.sent_at).toLocaleTimeString()}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {al.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                          {al.provider_response || 'Delivered'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-2xl text-center">
                {detection.alert_sent 
                  ? 'Alert was dispatched to registered farmer contacts.' 
                  : 'No WhatsApp notification was sent (safe scan or deduplicated).'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
