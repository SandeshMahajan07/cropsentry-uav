import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner({ onOpenLegal }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cropsentry_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cropsentry_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cropsentry_cookie_consent', 'essential_only');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#122418] text-white p-5 rounded-3xl shadow-2xl border border-forest-800 animate-slide-up text-xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
          <Cookie className="w-4 h-4 text-emerald-400" />
          <span>Essential Farm Telemetry Cookies</span>
        </div>
        <button
          onClick={handleDecline}
          aria-label="Dismiss cookie notice"
          className="text-forest-400 hover:text-white p-1 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-forest-200/90 leading-relaxed text-[11px]">
        We use strictly essential local cookies and storage to maintain your active UAV patrol session and save your thermal threshold settings. We never load advertising or third-party tracking pixels.
      </p>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onOpenLegal('cookies')}
          className="text-emerald-400 hover:text-emerald-300 underline text-[11px] font-medium"
        >
          Cookie & Privacy Details
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-forest-200 font-semibold text-[11px] transition"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
