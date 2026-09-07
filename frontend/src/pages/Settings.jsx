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
  MessageSquare,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sendingTestAlert, setSendingTestAlert] = useState(false);
  const [testAlertResult, setTestAlertResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showTwilioToken, setShowTwilioToken] = useState(false);

  // Config fields
  const [config, setConfig] = useState({
    alert_threshold_celsius: 8.0,
    dedup_radius_meters: 50.0,
    dedup_time_window_minutes: 10,
    callmebot_api_key: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_from_phone: 'whatsapp:+14155238886'
  });

  // Single Primary Recipient
  const [primaryContact, setPrimaryContact] = useState({
    name: 'Primary Field Owner',
    phone_number: '+91 6360911344'
  });
  const [savingContact, setSavingContact] = useState(false);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [recipientsRes, configRes] = await Promise.all([
        api.getRecipients(),
        api.getConfig()
      ]);

      if (recipientsRes.data && recipientsRes.data.length > 0) {
        setPrimaryContact({
          name: recipientsRes.data[0].name || 'Primary Field Owner',
          phone_number: recipientsRes.data[0].phone_number || '+91 6360911344'
        });
      }
      if (configRes.data) {
        setConfig({
          alert_threshold_celsius: configRes.data.alert_threshold_celsius,
          dedup_radius_meters: configRes.data.dedup_radius_meters,
          dedup_time_window_minutes: configRes.data.dedup_time_window_minutes,
          callmebot_api_key: configRes.data.callmebot_api_key || '',
          twilio_account_sid: configRes.data.twilio_account_sid || '',
          twilio_auth_token: configRes.data.twilio_auth_token || '',
          twilio_from_phone: configRes.data.twilio_from_phone || 'whatsapp:+14155238886'
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
        callmebot_api_key: config.callmebot_api_key?.trim() || null,
        twilio_account_sid: config.twilio_account_sid?.trim() || null,
        twilio_auth_token: config.twilio_auth_token?.trim() || null,
        twilio_from_phone: config.twilio_from_phone?.trim() || 'whatsapp:+14155238886'
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

  // Update Primary Emergency Contact
  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      setSavingContact(true);
      await api.updatePrimaryRecipient(primaryContact);
      setSuccessMsg(`Primary emergency alert number updated to ${primaryContact.phone_number}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update primary contact:', err);
      setErrorMsg('Failed to update primary emergency contact');
    } finally {
      setSavingContact(false);
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

          {/* Twilio WhatsApp Official Business Push Gateway */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Twilio WhatsApp Cloud Gateway (Official & Direct Push)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Recommended
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Industry standard provider. Uses Twilio's free WhatsApp Sandbox ($15.50 free trial credit, no credit card required).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  config.twilio_account_sid && config.twilio_auth_token
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {config.twilio_account_sid && config.twilio_auth_token ? '● Twilio Active' : '○ Not Configured'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={config.twilio_account_sid}
                  onChange={(e) => setConfig({ ...config, twilio_account_sid: e.target.value })}
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Twilio Auth Token
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                    className="text-[10px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    {showTwilioToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showTwilioToken ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showTwilioToken ? 'text' : 'password'}
                    placeholder="Enter Twilio Auth Token"
                    value={config.twilio_auth_token}
                    onChange={(e) => setConfig({ ...config, twilio_auth_token: e.target.value })}
                    className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Twilio Sender Phone / Sandbox
                </label>
                <input
                  type="text"
                  placeholder="whatsapp:+14155238886"
                  value={config.twilio_from_phone}
                  onChange={(e) => setConfig({ ...config, twilio_from_phone: e.target.value })}
                  className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 flex items-end">
                <a
                  href="https://console.twilio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Open Twilio Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">How to activate Twilio WhatsApp in 2 Minutes:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a free trial account at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">twilio.com</a> (free $15.50 balance, no card required).</li>
                <li>In your Twilio Console, navigate to <strong>Explore Products → Messaging → Try WhatsApp</strong>.</li>
                <li>Send the join text (e.g. <code className="bg-slate-100 px-1 rounded text-emerald-800 font-bold">join [your-sandbox-keyword]</code>) from your phone <strong>+91 6360911344</strong> to <strong>+1 415 523 8886</strong>.</li>
                <li>Copy your <strong>Account SID</strong> and <strong>Auth Token</strong> from the Twilio Console dashboard into the fields above, then click "Save Configuration Changes".</li>
              </ol>
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

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold">⚠️ CallMeBot Gateway Server Status:</p>
              <p>
                CallMeBot's public bot is currently at capacity on their website (<em>"The bot is currently full. Please check back in a few days"</em>). Because of this, their automated verification bot may delay or skip replies.
              </p>
              <p>
                <strong>Recommended:</strong> Use the <strong>"Launch Live WhatsApp Alert"</strong> button below — it immediately opens WhatsApp with the full alert, GPS coordinates, and Google Maps link pre-filled to +91 6360911344 with zero setup and zero delays!
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

      {/* Section 2: Primary Emergency WhatsApp Contact (Single Phone Scope) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-forest-700" />
              <span>Primary Emergency Contact (Single Operator Scope)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              All nocturnal intrusion alerts and live Google Maps telemetry links are routed exclusively to this number.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://api.whatsapp.com/send?phone=${primaryContact.phone_number.replace(/[^0-9]/g, '')}&text=%F0%9F%9A%A8%20*WILD%20ANIMAL%20DETECTED!*%20%E2%80%94%20CropSentry%20UAV%0A%0A%F0%9F%93%85%20*Time%3A*%20Live%20Patrol%20(IST)%0A%F0%9F%93%8D%20*Location%3A*%2017.329700%2C%2076.837100%0A%F0%9F%97%BA%EF%B8%8F%20*View%20on%20Google%20Maps%3A*%20https%3A%2F%2Fwww.google.com%2Fmaps%3Fq%3D17.329700%2C76.837100%0A%F0%9F%8C%A1%EF%B8%8F%20*Thermal%20Reading%3A*%2037.2%C2%B0C%20(Ambient%3A%2022.0%C2%B0C)%0A%E2%9A%A1%20*Contrast%20%CE%94T%3A*%20%2B15.2%C2%B0C%0A%0A%F0%9F%94%94%20*Status%3A*%20Deterrent%20strobe%20%26%20110dB%20acoustic%20siren%20triggered%20on%20drone.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Launch Live WhatsApp Alert</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => handleTestWhatsAppAlert(primaryContact.phone_number)}
              disabled={sendingTestAlert}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingTestAlert ? 'Testing...' : 'Test Ingestion'}</span>
            </button>
          </div>
        </div>

        {testAlertResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span>✅ {testAlertResult.message || `Alert Dispatched to ${testAlertResult.phone}`}</span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full uppercase text-[10px]">
                Status: {testAlertResult.status}
              </span>
            </div>
            {testAlertResult.details?.provider === 'twilio' && (
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px]">
                <p className="font-semibold text-emerald-900">Twilio Official Gateway Status:</p>
                <p className="font-mono text-[10px] text-slate-700">SID: {testAlertResult.details.sid} ({testAlertResult.details.status})</p>
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

        {/* Primary Contact Details & Edit Form */}
        <form onSubmit={handleSaveContact} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-forest-700" />
              <span className="text-xs font-bold text-slate-900">Configured Primary Alert Recipient</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ● Sole Active Destination
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Contact Name / Role
              </label>
              <input
                type="text"
                value={primaryContact.name}
                onChange={(e) => setPrimaryContact({ ...primaryContact, name: e.target.value })}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Emergency Mobile Number (with Country Code)
              </label>
              <input
                type="text"
                value={primaryContact.phone_number}
                onChange={(e) => setPrimaryContact({ ...primaryContact, phone_number: e.target.value })}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={savingContact}
                className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingContact ? 'Saving...' : 'Update'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
            🔒 <strong>Single Operator Scope:</strong> CropSentry is currently locked to this single verified mobile number to prevent unauthenticated alert broadcasting. Whenever scaling to farm clusters or multiple field guards, multi-recipient fleet routing can be expanded.
          </div>
        </form>
      </div>
    </div>
  );
}
