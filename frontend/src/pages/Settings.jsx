import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  AlertCircle, 
  Phone, 
  Radio, 
  Send,
  ExternalLink,
  ShieldCheck,
  Key,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sendingTestAlert, setSendingTestAlert] = useState(false);
  const [testAlertResult, setTestAlertResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Config fields
  const [config, setConfig] = useState({
    alert_threshold_celsius: 8.0,
    dedup_radius_meters: 50.0,
    dedup_time_window_minutes: 10,
    callmebot_api_key: ''
  });

  // Recipients
  const [recipients, setRecipients] = useState([]);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [addingRecipient, setAddingRecipient] = useState(false);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [recipientsRes, configRes] = await Promise.all([
        api.getRecipients(),
        api.getConfig()
      ]);

      setRecipients(recipientsRes.data || []);
      if (configRes.data) {
        setConfig({
          alert_threshold_celsius: configRes.data.alert_threshold_celsius,
          dedup_radius_meters: configRes.data.dedup_radius_meters,
          dedup_time_window_minutes: configRes.data.dedup_time_window_minutes,
          callmebot_api_key: configRes.data.callmebot_api_key || ''
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Save Threshold & Gateway Configuration
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        drone_id: null, // Global / Single Drone
        alert_threshold_celsius: parseFloat(config.alert_threshold_celsius),
        dedup_radius_meters: parseFloat(config.dedup_radius_meters),
        dedup_time_window_minutes: parseInt(config.dedup_time_window_minutes, 10),
        callmebot_api_key: config.callmebot_api_key?.trim() || null
      };

      await api.updateConfig(payload);
      setSuccessMsg('Settings saved! Thermal thresholds and WhatsApp gateway config updated in database.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to save config:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // Trigger Instant Test WhatsApp Alert
  const handleTestWhatsAppAlert = async (phoneNumber) => {
    try {
      setSendingTestAlert(true);
      setTestAlertResult(null);
      const res = await api.testWhatsAppAlert(
        phoneNumber || '+91 6360911344', 
        config.callmebot_api_key?.trim() || null
      );
      setTestAlertResult(res);
    } catch (err) {
      console.error('Failed to trigger test alert:', err);
      alert('Failed to send test alert');
    } finally {
      setSendingTestAlert(false);
    }
  };

  // Add Alert Recipient
  const handleAddRecipient = async (e) => {
    e.preventDefault();
    if (!newRecipientName || !newRecipientPhone) return;

    try {
      setAddingRecipient(true);
      const res = await api.addRecipient({
        name: newRecipientName.trim(),
        phone_number: newRecipientPhone.trim(),
        active: 1
      });

      setRecipients([...recipients, res.data]);
      setNewRecipientName('');
      setNewRecipientPhone('');
    } catch (err) {
      console.error('Failed to add recipient:', err);
      alert(err.response?.data?.error || 'Failed to add recipient');
    } finally {
      setAddingRecipient(false);
    }
  };

  // Delete Alert Recipient
  const handleDeleteRecipient = async (id) => {
    if (!confirm('Remove this alert recipient?')) return;
    try {
      await api.deleteRecipient(id);
      setRecipients(recipients.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete recipient:', err);
      alert('Failed to delete recipient');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-forest-700" />
            <span>CropSentry Patrol Configuration & Emergency Alerts</span>
          </h3>
          <p className="text-xs text-slate-500">
            Configure thermal contrast sensitivity, spatial anti-spam filters, and WhatsApp alert contacts.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-forest-100 text-forest-800">
          UAV: CropSentry-01
        </span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Dynamic Decision Engine Thresholds */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-forest-700" />
            <span>Thermal Detection Sensitivity (CropSentry-01)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Parameters stored dynamically in the backend database and evaluated on every field scan.
          </p>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Alert Threshold Delta */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Alert Contrast Δ (°C)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                  Target Heat
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="30.0"
                value={config.alert_threshold_celsius}
                onChange={(e) => setConfig({ ...config, alert_threshold_celsius: e.target.value })}
                className="w-full text-lg font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Minimum temperature difference between animal and soil to trigger strobe light & buzzer.
              </p>
            </div>

            {/* Deduplication Radius */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Anti-Spam Radius (Meters)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Geo Filter
                </span>
              </div>
              <input
                type="number"
                step="1"
                min="5"
                max="500"
                value={config.dedup_radius_meters}
                onChange={(e) => setConfig({ ...config, dedup_radius_meters: e.target.value })}
                className="w-full text-lg font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Prevents spamming the farmer if the drone spots the same animal within this distance.
              </p>
            </div>

            {/* Deduplication Time Window */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Cooldown Window (Minutes)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Timer
                </span>
              </div>
              <input
                type="number"
                step="1"
                min="1"
                max="120"
                value={config.dedup_time_window_minutes}
                onChange={(e) => setConfig({ ...config, dedup_time_window_minutes: e.target.value })}
                className="w-full text-lg font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Duration before sending a second alert for the same patch of field.
              </p>
            </div>
          </div>

          {/* CallMeBot WhatsApp Gateway Configuration */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Key className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">
                    CallMeBot WhatsApp Push Gateway (100% Free)
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Enables the backend to push real-time WhatsApp alerts directly to your phone when an animal is detected.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  config.callmebot_api_key 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {config.callmebot_api_key ? '● Live Push Active' : '○ 1-Click Link Mode'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <label htmlFor="callmebot-input" className="block text-[11px] font-semibold text-slate-700 mb-1">
                  CallMeBot API Key
                </label>
                <input
                  id="callmebot-input"
                  type="text"
                  placeholder="e.g. 123456 (Leave blank for 1-Click WhatsApp links)"
                  value={config.callmebot_api_key}
                  onChange={(e) => setConfig({ ...config, callmebot_api_key: e.target.value })}
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 flex items-end">
                <a
                  href="https://wa.me/34644597167?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>1-Tap Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">How to get your free CallMeBot key (takes 20 seconds):</p>
              <p>
                1. Click the button above to send <code className="bg-slate-100 px-1 rounded text-emerald-800 font-bold">I allow callmebot to send me messages</code> to <code className="font-bold">+34 644 59 71 67</code> from your phone.
              </p>
              <p>
                2. CallMeBot will reply immediately on WhatsApp with your personal 6-digit API key. Paste it above and click "Save Configuration Changes".
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Saving Settings...' : 'Save Configuration Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: WhatsApp Emergency Contacts */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-forest-700" />
              <span>WhatsApp Emergency Notification Contacts</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered numbers receive automated WhatsApp alerts with live Google Maps links when an animal is spotted.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleTestWhatsAppAlert('+91 6360911344')}
            disabled={sendingTestAlert}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTestAlert ? 'Sending Alert...' : 'Send Test Alert to +91 6360911344'}</span>
          </button>
        </div>

        {testAlertResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span>✅ {testAlertResult.message || `Alert Dispatched to ${testAlertResult.phone}`}</span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full uppercase text-[10px]">
                Status: {testAlertResult.status}
              </span>
            </div>
            {testAlertResult.details?.provider === 'callmebot' && (
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px]">
                <p className="font-semibold text-emerald-900">CallMeBot Response:</p>
                <p className="font-mono text-[10px] text-slate-700">{testAlertResult.details.raw_response || testAlertResult.details.status}</p>
              </div>
            )}
            <p className="text-slate-600">
              The automated alert has been processed and logged in SQLite database `alerts_log`.
            </p>
            {testAlertResult.direct_whatsapp_url && (
              <div className="pt-2">
                <a
                  href={testAlertResult.direct_whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                >
                  <span>Open Alert in WhatsApp Web / App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Add Recipient Form */}
        <form onSubmit={handleAddRecipient} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Name / Role</label>
            <input
              type="text"
              placeholder="e.g. Primary Field Owner"
              value={newRecipientName}
              onChange={(e) => setNewRecipientName(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-forest-600 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number (with Country Code)</label>
            <input
              type="text"
              placeholder="+91 6360911344"
              value={newRecipientPhone}
              onChange={(e) => setNewRecipientPhone(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-forest-600 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={addingRecipient}
              className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Recipients Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Contact Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Test & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.phone_number}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTestWhatsAppAlert(r.phone_number)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1"
                        title="Send Test Alert"
                      >
                        <Send className="w-3 h-3" />
                        <span>Test Alert</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRecipient(r.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Recipient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
