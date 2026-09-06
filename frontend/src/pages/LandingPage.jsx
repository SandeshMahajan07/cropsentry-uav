import React, { useState } from 'react';
import { 
  Compass, 
  ArrowUpRight, 
  ShieldCheck, 
  Radio, 
  Eye, 
  EyeOff,
  Zap, 
  MapPin, 
  Check, 
  Bell, 
  ChevronRight, 
  LogIn, 
  X,
  Volume2,
  Lock,
  User,
  Phone,
  Send,
  Cpu,
  Flame,
  Scale,
  Sparkles,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import LegalModal from '../components/LegalModal';
import CookieBanner from '../components/CookieBanner';
import WhatsAppModal from '../components/WhatsAppModal';

export default function LandingPage({ onEnterConsole }) {
  // Modals state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Auth Form State
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: 'Ramesh Patel',
    phone: '+91 6360911344',
    location: 'Karnataka Basin',
    username: 'farmer.ramesh',
    password: 'password123',
    consent: true
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    farmSize: '5-20 Acres',
    message: '',
    consent: false
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authForm.consent) {
      alert('Please check the consent box to proceed.');
      return;
    }
    setIsAuthOpen(false);
    onEnterConsole();
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.consent) {
      alert('Please agree to the privacy consent before submitting.');
      return;
    }
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', phone: '', farmSize: '5-20 Acres', message: '', consent: false });
      setContactSubmitted(false);
    }, 5000);
  };

  const openLegal = (tabName) => {
    setLegalTab(tabName);
    setIsLegalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F3F6F1] text-slate-900 font-sans selection:bg-emerald-200">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#142A1D]/95 backdrop-blur-md text-white border-b border-forest-900/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black shadow-md shadow-emerald-950/40">
              <Compass className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-lg tracking-tight">
              CropSentry
            </div>
          </div>

          {/* Nav links Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-emerald-100/80">
            <a href="#about" className="hover:text-white transition">About Us</a>
            <a href="#technology" className="hover:text-white transition">Technology</a>
            <a href="#deterrence" className="hover:text-white transition">Deterrence</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              title="Test WhatsApp Alert Simulation"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Simulate Alert</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white text-[#142A1D] hover:bg-emerald-50 text-xs font-bold transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

            <button
              onClick={onEnterConsole}
              className="hidden sm:flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              <span>Patrol Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#142A1D] via-[#1A3826] via-70% to-[#1E3F2B] text-white pt-12 pb-36 px-4 sm:px-6 overflow-hidden">
        {/* Soft atmospheric depth & gentle radial glows behind main content */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-16 left-0 w-[450px] h-[450px] bg-emerald-700/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-400/[0.06] rounded-full blur-[140px] pointer-events-none"></div>

        {/* Smooth dark-green-to-transparent dissolve fading toward the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-[#1A3826]/60 via-45% to-[#F3F6F1] pointer-events-none z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Left Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Autonomous Nocturnal UAV Patrol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              The Power of <br />
              <span className="text-emerald-300">Intelligent Patrol</span> <br />
              in Every Field.
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl font-normal leading-relaxed">
              Nighttime UAV surveillance engineered to detect nocturnal wild animals in pitch darkness through dual-temperature thermal contrast, deploying humane non-lethal acoustic and optical deterrence.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={onEnterConsole}
                className="px-6 py-3.5 rounded-xl bg-white text-[#142A1D] hover:bg-emerald-50 text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-black/20 group"
              >
                <span>Launch Live Patrol Console</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthOpen(true);
                }}
                className="px-6 py-3.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-white text-sm font-semibold border border-emerald-700/50 transition"
              >
                Register Farmer Account
              </button>
            </div>
          </div>

          {/* Hero Right: Modern Product Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950/80 to-[#142A1D] border border-emerald-700/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold">UAV ID: CROPSENTRY-01</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                  SYSTEM READY
                </span>
              </div>

              {/* Graphic Simulation Box */}
              <div className="aspect-[4/3] rounded-2xl bg-[#0b1710] border border-emerald-800/50 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                  <span>SWEEP: ACTIVE</span>
                  <span>ALTITUDE: 15M</span>
                </div>

                <div className="text-center space-y-2 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mx-auto text-emerald-300 animate-pulse">
                    <Radio className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-bold text-white">Dual-Temperature Infrared Core</div>
                  <div className="text-[11px] text-emerald-300/80">ΔT Contrast Engine Active</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-emerald-950/80 p-2 rounded-xl border border-emerald-800/50">
                  <div>T_OBJECT: 37.2°C</div>
                  <div>T_SOIL: 22.0°C</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-200/90 pt-2 border-t border-emerald-900/60">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Non-Lethal Defense</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Alerts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE-COLUMN FEATURE STRIP */}
      <section className="relative -mt-20 z-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-forest-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Automated Deterrence
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                High thermal contrasts automatically trigger an onboard acoustic siren and optical strobe burst to steer wildlife away from crops safely.
              </p>
            </div>
            <a href="#deterrence" className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 pt-2">
              <span>Explore Deterrent Specs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Non-Contact Thermal Sensing
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Utilizes calibrated dual-temperature MLX infrared sensing to compute thermal differential contrast against ambient ground temperatures.
              </p>
            </div>
            <a href="#technology" className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 pt-2">
              <span>Sensor Architecture</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-[#0e1b12] text-white rounded-3xl p-6 sm:p-8 border border-[#1e3827] shadow-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Humane Wildlife Strategy</div>
              <h3 className="text-base font-bold text-white mt-1">
                Field Defense Without Physical Harm
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1.5 leading-relaxed">
                Designed to humanely frighten wild boars and deer away using sensory triggers, avoiding dangerous electric fencing or chemical traps.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-emerald-400">
              NON-LETHAL • HUMANE DEFENSE
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            About Our Mission
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Mitigating Human-Wildlife Conflict on Farmlands
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In agricultural zones across India and the globe, nocturnal crop raids by wild boars, deer, and stray cattle cause catastrophic harvest loss.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="font-black text-xl text-rose-600">The Problem</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fences are costly to maintain, and night vigilance by farmers is exhausting and perilous. Nocturnal animals quickly memorize static scarecrows and bypass them.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="font-black text-xl text-emerald-700">The Engineering Solution</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              CropSentry flies above the field perimeter. Using dual-temperature infrared sensing, it detects warm body signatures against cool night grass.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="font-black text-xl text-forest-800">The Farmer's Assurance</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The drone sounds an alarm to deter the animal on the spot, while instantly dispatching a WhatsApp notification with an exact Google Maps location link.
            </p>
          </div>
        </div>
      </section>

      {/* 5. TECHNOLOGY SECTION */}
      <section id="technology" className="py-16 px-4 sm:px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Core Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Low-Cost Sensing & Embedded Avionics
            </h2>
            <p className="text-sm text-slate-600">
              High-accuracy differential thermal sensing implemented on a student and farmer-friendly budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">ESP32 Core Microcontroller</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Handles sensor sampling, telemetry transmission over Wi-Fi/cellular hotspot, and triggers the deterrent relay.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Dual-Temperature IR Sensor</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Measures target object temperature and ambient ground temperature simultaneously to compute differential contrast (&Delta;T).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">NEO-6M GPS Module</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Captures latitude and longitude coordinates with sub-meter accuracy to embed clickable Google Maps links in alerts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Haversine Anti-Spam</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates spatial distance between successive sightings to eliminate duplicate alert spam for the same hovering incident.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DETERRENCE SECTION */}
      <section id="deterrence" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
            Deterrent Mechanism
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Acoustic Siren & High-Lumen Strobe Pulse
          </h2>
          <p className="text-sm text-slate-600">
            Deterring crop-raiding wildlife humanely without relying on dangerous high-voltage electric shocks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-[#122418] text-white p-8 rounded-3xl border border-forest-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-600 text-white">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold">110dB High-Frequency Acoustic Siren</h4>
                <p className="text-xs text-forest-300">Auditory aversion trigger for nocturnal mammals</p>
              </div>
            </div>
            <p className="text-xs text-forest-200/80 leading-relaxed">
              Wild boars and deer possess acute auditory sensitivity. An elevated 110dB siren pulses across unpredictable intervals, disorienting intruders and prompting rapid retreat toward the forest perimeter.
            </p>
          </div>

          <div className="bg-[#122418] text-white p-8 rounded-3xl border border-forest-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold">High-Intensity Optical Strobe Burst</h4>
                <p className="text-xs text-forest-300">Targeted flash illumination</p>
              </div>
            </div>
            <p className="text-xs text-forest-200/80 leading-relaxed">
              Equipped with a solid-state LED strobe beneath the drone fuselage. Sudden intermittent light bursts ruin nocturnal night adaptation, startling intruders without inflicting corneal damage.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & INQUIRY SECTION */}
      <section id="contact" className="py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Request a Field Demonstration</h2>
            <p className="text-xs text-slate-500">
              Reach out to our engineering research team for farm trials or academic inquiries.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            {contactSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Thank You for Reaching Out!</h4>
                <p className="text-xs text-emerald-800">
                  Your demonstration inquiry has been received. Our project team will connect with you via WhatsApp / Phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Anand Kumar"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block font-semibold text-slate-700 mb-1">Mobile / WhatsApp Number</label>
                    <input
                      id="contact-phone"
                      type="text"
                      placeholder="+91 6360911344"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-farm" className="block font-semibold text-slate-700 mb-1">Agricultural Acreage / Location</label>
                  <input
                    id="contact-farm"
                    type="text"
                    placeholder="e.g. 15 Acres Sugarcane, Gulbarga District"
                    value={contactForm.farmSize}
                    onChange={(e) => setContactForm({ ...contactForm, farmSize: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block font-semibold text-slate-700 mb-1">Project Inquiry / Crop Raid History</label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    placeholder="Describe your nocturnal crop raiding challenges (wild boars, deer, elephants)..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Explicit Consent Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="contact-consent"
                    type="checkbox"
                    checked={contactForm.consent}
                    onChange={(e) => setContactForm({ ...contactForm, consent: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    required
                  />
                  <label htmlFor="contact-consent" className="text-[11px] text-slate-600 leading-tight">
                    I consent to CropSentry collecting my name and phone number for the sole purpose of organizing farm demonstration trials under our <button type="button" onClick={() => openLegal('privacy')} className="text-emerald-700 underline font-semibold">Privacy Policy</button>.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 8. COMPLIANT FOOTER */}
      <footer className="bg-[#122418] text-white py-12 px-4 sm:px-6 border-t border-forest-900 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-emerald-400" />
                <span className="font-extrabold text-base">CropSentry UAV</span>
              </div>
              <p className="text-forest-300/80 text-[11px]">
                Autonomous Nocturnal Wildlife Defense System • Engineering Final Year Capstone
              </p>
            </div>

            {/* Legal Navigation Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-forest-200/80 text-xs font-medium">
              <button onClick={() => openLegal('privacy')} className="hover:text-white underline">
                Privacy Policy
              </button>
              <button onClick={() => openLegal('terms')} className="hover:text-white underline">
                Terms of Use
              </button>
              <button onClick={() => openLegal('aviation')} className="hover:text-white underline">
                DGCA & Wildlife Laws
              </button>
              <button onClick={() => openLegal('cookies')} className="hover:text-white underline">
                Cookie Policy
              </button>
              <button onClick={() => openLegal('refund')} className="hover:text-white underline">
                Academic License
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-forest-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-forest-400">
            <p>© 2026 CropSentry Research Team. Non-commercial academic project.</p>
            <p>Built for agricultural protection in accordance with India Drone Rules 2021.</p>
          </div>
        </div>
      </footer>

      {/* 9. AUTH MODAL (LOGIN & REGISTER WITH EYE PASSWORD TOGGLE) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-forest-100 text-forest-800">
                  <Lock className="w-4 h-4 text-forest-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {authMode === 'login' ? 'Operator Sign In' : 'Register Farmer Account'}
                  </h3>
                  <p className="text-xs text-slate-500">Access the CropSentry Live Patrol Console</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthOpen(false)}
                aria-label="Close authentication modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Register New User
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              {authMode === 'register' && (
                <>
                  <div>
                    <label htmlFor="auth-name" className="block font-semibold text-slate-700 mb-1">Farmer Full Name</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <input
                        id="auth-name"
                        type="text"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full bg-transparent text-slate-800 font-medium focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-phone" className="block font-semibold text-slate-700 mb-1">WhatsApp Mobile Number</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <input
                        id="auth-phone"
                        type="text"
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        className="w-full bg-transparent text-slate-800 font-medium focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-loc" className="block font-semibold text-slate-700 mb-1">Farm / Field Sector Location</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <input
                        id="auth-loc"
                        type="text"
                        value={authForm.location}
                        onChange={(e) => setAuthForm({ ...authForm, location: e.target.value })}
                        className="w-full bg-transparent text-slate-800 font-medium focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="auth-user" className="block font-semibold text-slate-700 mb-1">Username / Operator ID</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    id="auth-user"
                    type="text"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="w-full bg-transparent text-slate-800 font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Field with Eye Icon Toggle */}
              <div>
                <label htmlFor="auth-pass" className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    id="auth-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-transparent text-slate-800 font-medium focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="auth-consent"
                  type="checkbox"
                  checked={authForm.consent}
                  onChange={(e) => setAuthForm({ ...authForm, consent: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <label htmlFor="auth-consent" className="text-[11px] text-slate-600 leading-tight">
                  I consent to storage of my farm coordinates and patrol preferences under the <button type="button" onClick={() => openLegal('privacy')} className="text-emerald-700 underline font-semibold">Privacy Policy</button>.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-md transition"
                >
                  {authMode === 'login' ? 'Enter Live Patrol Console' : 'Complete Registration & Launch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. LEGAL & PRIVACY MODAL */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* 11. INTERACTIVE WHATSAPP SIMULATOR MODAL */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      {/* 12. COOKIE CONSENT BANNER */}
      <CookieBanner onOpenLegal={openLegal} />
    </div>
  );
}
