import React, { useState } from 'react';
import { X, ShieldCheck, Scale, Cookie, RefreshCw, FileText } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [tab, setTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Scale className="w-5 h-5 text-forest-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">CropSentry Compliance & Legal Information</h3>
              <p className="text-xs text-slate-500">Regulatory standards, privacy guarantees, and terms of service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close legal modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setTab('privacy')}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              tab === 'privacy' 
                ? 'border-forest-700 text-forest-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy Policy (DPDP 2023)
          </button>
          <button
            onClick={() => setTab('terms')}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              tab === 'terms' 
                ? 'border-forest-700 text-forest-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setTab('aviation')}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              tab === 'aviation' 
                ? 'border-forest-700 text-forest-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Drone Laws & Wildlife Safety
          </button>
          <button
            onClick={() => setTab('cookies')}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              tab === 'cookies' 
                ? 'border-forest-700 text-forest-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cookies & Tracking
          </button>
          <button
            onClick={() => setTab('refund')}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
              tab === 'refund' 
                ? 'border-forest-700 text-forest-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Academic License / Refund
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {tab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Privacy Policy & Minimal Data Collection</h4>
              <p>
                CropSentry operates on strict data-minimization principles compliant with the <strong>Digital Personal Data Protection Act (DPDP Act 2023)</strong> and modern global privacy guidelines.
              </p>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <p className="font-semibold text-slate-800">What data we collect:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Farmer Contact Number:</strong> Solely used for dispatching automated WhatsApp intrusion notifications. Never sold or shared.</li>
                  <li><strong>Field Coordinates:</strong> GPS location of the farm boundary to pinpoint wildlife sighting markers on the map.</li>
                  <li><strong>Thermal Readings:</strong> Numerical temperature readings (T-Object and T-Ambient) for intrusion classification.</li>
                </ul>
              </div>
              <p>
                <strong>No Invasive Tracking:</strong> We do not track personal user browsing, do not load third-party analytics pixels, and store all operational data locally on your dedicated ground station database.
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Terms & Conditions of Deployment</h4>
              <p>
                By utilizing CropSentry UAV software and connected flight telemetry, the operator agrees to standard agricultural UAV guidelines:
              </p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><strong>Designated Patrol Boundary:</strong> Flights must remain strictly above the designated agricultural property.</li>
                <li><strong>Nocturnal Flight Responsibility:</strong> Nighttime flight operations must maintain Line of Sight (LOS) or comply with agricultural micro-drone night exemption limits.</li>
                <li><strong>Non-Lethal Operations:</strong> The deterrent payload (strobe light and buzzer) must not be substituted with projectile, pyrotechnic, or toxic mechanisms.</li>
              </ul>
            </div>
          )}

          {tab === 'aviation' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">DGCA Drone Regulations & Wildlife Protection Act</h4>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1.5">
                <p className="font-bold">Indian Drone Rules 2021 (DGCA Compliant):</p>
                <p>
                  CropSentry F450 operates within the <strong>Micro Category (&lt;2 kg)</strong> in agricultural Green Zones up to 400 feet above ground level, adhering to airspace limits published on DigitalSky.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">Wildlife Protection Act, 1972 Compliance:</p>
                <p>
                  CropSentry utilizes humane acoustic frequencies (ultrasonic sirens) and focused visual strobe bursts to startle crop-raiders without inflicting physical trauma, electric burns, or permanent sensory damage.
                </p>
              </div>
            </div>
          )}

          {tab === 'cookies' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Cookies & Local Storage Policy</h4>
              <p>
                CropSentry uses strictly necessary local browser storage (such as your session credentials and map coordinate preferences).
              </p>
              <p>
                We <strong>do not</strong> use third-party advertising cookies, marketing pixels, or external user tracking software. OpenStreetMap map tiles are fetched directly to render GIS overlays.
              </p>
            </div>
          )}

          {tab === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Academic Project License & Refund Policy</h4>
              <p>
                CropSentry is an open-source engineering innovation prototype built as a final-year engineering capstone project.
              </p>
              <p>
                The software layer is provided under the <strong>MIT Open-Source Academic License</strong>. Because this system is provided free of charge for agricultural research and demonstration, financial refund provisions do not apply.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Compliance Review: September 2026</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800 transition"
          >
            Close & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
