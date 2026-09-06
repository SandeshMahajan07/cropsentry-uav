import React, { useState } from 'react';
import { api } from '../api/client';
import { 
  X, 
  Send, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';

export default function WhatsAppModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('+91 6360911344');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await api.testWhatsAppAlert(phoneNumber.trim());
      setResult(res);
      // Auto-open WhatsApp in a new tab if URL is present
      if (res.direct_whatsapp_url) {
        window.open(res.direct_whatsapp_url, '_blank');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to dispatch alert simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">WhatsApp Emergency Alert Simulator</h3>
              <p className="text-xs text-slate-500">Test live wildlife intrusion dispatch to any mobile number</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close WhatsApp Simulator"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label htmlFor="sim-phone" className="block font-semibold text-slate-700 mb-1">
              Enter Target Mobile Number (with Country Code)
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:ring-2 focus-within:ring-emerald-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <input
                id="sim-phone"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 6360911344"
                className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Example: <code>+91 6360911344</code> or <code>6360911344</code>.
            </p>
          </div>

          {/* Message Preview Box */}
          <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-300/80 shadow-inner space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Preview (WhatsApp Bubble)</span>
              <span className="text-emerald-700 font-bold">CropSentry Bot</span>
            </div>
            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-slate-800 text-[11px] font-sans leading-relaxed space-y-1">
              <p className="font-bold text-rose-600">🚨 *WILD ANIMAL DETECTED!* — CropSentry UAV</p>
              <p>📍 Location: 17.329700, 76.837100</p>
              <p className="text-emerald-700 underline font-mono text-[10px]">
                https://www.google.com/maps?q=17.329700,76.837100
              </p>
              <p>🌡️ Thermal Reading: 37.2°C (Surrounding: 22.0°C)</p>
              <p className="font-bold">⚡ Contrast ΔT: +15.2°C</p>
              <p className="text-slate-600 text-[10px]">🔔 Deterrent strobe & 110dB acoustic siren triggered.</p>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              WhatsApp anti-spam policy restricts unverified trial numbers from receiving unsolicited messages. Clicking below dispatches the backend event and opens the direct gateway link so you immediately receive and view it!
            </p>
          </div>

          {result && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Alert Dispatched & Logged to #{result.phone}
              </div>
              <p className="text-[11px] text-emerald-800">
                The alert was recorded in SQLite database `alerts_log` and dispatched to the gateway.
              </p>
              {result.direct_whatsapp_url && (
                <a
                  href={result.direct_whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-sm"
                >
                  <span>Open Alert in WhatsApp Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Dispatched...' : 'Send Simulated Alert to WhatsApp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
