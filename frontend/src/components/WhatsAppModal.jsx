import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  X, 
  Send, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Key,
  ShieldCheck,
  Info,
  HelpCircle
} from 'lucide-react';

export default function WhatsAppModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('+91 6360911344');
  const [apiKey, setApiKey] = useState('');
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Load saved CallMeBot API key from config if available
      api.getConfig().then((res) => {
        if (res.data?.callmebot_api_key) {
          setApiKey(res.data.callmebot_api_key);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await api.testWhatsAppAlert(phoneNumber.trim(), apiKey.trim() || null);
      setResult(res);
      // Auto-open WhatsApp in a new tab if no push gateway key was provided
      if (!apiKey.trim() && res.direct_whatsapp_url) {
        window.open(res.direct_whatsapp_url, '_blank');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to dispatch alert');
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
              <h3 className="text-base font-bold text-slate-900">WhatsApp Emergency Alert Dispatcher</h3>
              <p className="text-xs text-slate-500">Test live wildlife intrusion dispatch to your mobile number</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close WhatsApp Dispatcher"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label htmlFor="sim-phone" className="block font-semibold text-slate-700 mb-1">
              Target WhatsApp Mobile Number
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
          </div>

          {/* CallMeBot API Key (Optional for Direct Automated Push) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="callmebot-key" className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>CallMeBot Free API Key (For Direct Phone Buzz)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowKeyHelp(!showKeyHelp)}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showKeyHelp ? 'Hide instructions' : 'How to get free key?'}</span>
              </button>
            </div>

            <input
              id="callmebot-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. 123456 (Leave empty for 1-Click WhatsApp link)"
              className="w-full bg-white text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />

            {showKeyHelp && (
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-[11px] text-slate-700 space-y-1.5 animate-fade-in">
                <p className="font-bold text-emerald-900">Why is this needed?</p>
                <p>
                  Meta/WhatsApp prevents spam by forbidding unknown servers from cold-messaging users. CallMeBot is a 100% free IoT gateway that sends alerts once you authorize it.
                </p>
                <p className="font-bold text-slate-900 pt-1">30-Second Free Setup:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>
                    Open WhatsApp and send message: <code className="bg-slate-100 px-1 rounded text-emerald-800 font-bold">I allow callmebot to send me messages</code> to <code className="font-bold">+34 644 59 71 67</code>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/34644597167?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 font-bold underline"
                    >
                      <span>Click here to open WhatsApp & authorize CallMeBot</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>CallMeBot will reply instantly with your 6-digit API key. Paste it above!</li>
                </ol>
              </div>
            )}
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

          {result && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{result.message}</span>
              </div>
              
              {result.details?.provider === 'callmebot' ? (
                <div className="text-[11px] text-emerald-800 bg-white/70 p-2.5 rounded-xl border border-emerald-200">
                  <p className="font-semibold">CallMeBot Gateway Response:</p>
                  <p className="font-mono text-[10px] text-slate-700 mt-0.5">{result.details.raw_response || result.details.status}</p>
                </div>
              ) : null}

              {result.direct_whatsapp_url && (
                <div className="pt-1 flex flex-col gap-1.5">
                  <p className="text-[11px] text-slate-600">
                    You can also open this alert immediately in WhatsApp:
                  </p>
                  <a
                    href={result.direct_whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-sm"
                  >
                    <span>Open Alert in WhatsApp Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
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
              <span>{loading ? 'Dispatching...' : (apiKey ? 'Send Push Alert to WhatsApp' : 'Dispatch & Open in WhatsApp')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
