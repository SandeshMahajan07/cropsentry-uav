import React, { useState } from 'react';
import { 
  Compass, 
  ArrowUpRight, 
  ShieldCheck, 
  Radio, 
  Eye, 
  Zap, 
  MapPin, 
  Check, 
  Bell, 
  ChevronRight, 
  LogIn, 
  X,
  Volume2,
  Lock,
  User
} from 'lucide-react';

export default function LandingPage({ onEnterConsole, onNavigateAbout }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('farmer.ramesh');
  const [password, setPassword] = useState('••••••••');
  const [role, setRole] = useState('Field Owner & Operator');

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoginOpen(false);
    onEnterConsole();
  };

  return (
    <div className="min-h-screen bg-[#F3F6F1] text-slate-900 font-sans selection:bg-emerald-200">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#142A1D]/90 backdrop-blur-md text-white border-b border-forest-900/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#142A1D] hover:bg-emerald-50 text-xs font-bold transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Operator Login</span>
            </button>
            <button
              onClick={onEnterConsole}
              className="hidden sm:flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
            >
              <span>Live Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Matched to uploaded image styling) */}
      <section className="relative bg-gradient-to-b from-[#142A1D] via-[#1A3826] to-[#244C34] text-white pt-12 pb-24 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-700/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Left Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Automated Nocturnal UAV Patrol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              The Power of <br />
              <span className="text-emerald-300">Intelligent Patrol</span> <br />
              in Every Field.
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl font-normal leading-relaxed">
              Autonomous nighttime UAV surveillance engineered to detect nocturnal wild animals in pitch darkness through dual-temperature thermal contrast, deploying non-harmful acoustic and optical deterrence.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onEnterConsole}
                className="px-6 py-3.5 rounded-xl bg-white text-[#142A1D] hover:bg-emerald-50 text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-black/20 group"
              >
                <span>Launch Live Patrol Console</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <a
                href="#about"
                className="px-6 py-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 text-white text-sm font-semibold border border-emerald-700/50 transition"
              >
                Learn How It Works
              </a>
            </div>
          </div>

          {/* Hero Right: Modern Product Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950/70 to-[#142A1D] border border-emerald-700/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              {/* Top tag */}
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
                  <div>T_AMBIENT: 22.0°C</div>
                </div>
              </div>

              {/* Specs pill row */}
              <div className="flex items-center justify-between text-xs text-emerald-200/90 pt-2 border-t border-emerald-900/60">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Non-Lethal Defense</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Instant WhatsApp Alerts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE-COLUMN FEATURE STRIP (Matched to reference image bottom cards) */}
      <section className="relative -mt-12 z-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Light Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-forest-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Automated Wildlife Deterrence
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                When a high thermal contrast is verified, the UAV triggers a high-decibel acoustic siren and strobe light to humanely redirect animals away from the crops.
              </p>
            </div>
            <button
              onClick={onEnterConsole}
              className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 pt-2"
            >
              <span>View Live Drone Telemetry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Medium Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Non-Contact Thermal Sensing
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Replaces high-cost thermal imaging with calibrated dual-temperature MLX infrared sensing, calculating differential contrast ΔT server-side.
              </p>
            </div>
            <a
              href="#technology"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 pt-2"
            >
              <span>Read Sensor Architecture</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3: Dark High-Contrast Card */}
          <div className="bg-[#0e1b12] text-white rounded-3xl p-6 sm:p-8 border border-[#1e3827] shadow-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-black text-emerald-400">+100%</div>
              <h3 className="text-base font-bold text-white mt-1">
                Harvest Protection Without Harm
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1.5 leading-relaxed">
                Zero lethal traps or electric shocks. Animals retreat naturally from strobe and ultrasound frequencies without suffering injuries.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-emerald-400">
              FIELD TESTED • SAFE & HUMANE
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US SECTION */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            About Our Project
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Solving Human-Wildlife Conflict on Farmlands
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In agricultural belts across India and the globe, nocturnal crop raids by wild boars, deer, elephants, and cattle lead to devastating harvest losses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="font-black text-xl text-rose-600">The Problem</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Traditional fencing is expensive to maintain, and manual night vigilance by farmers is exhausting and dangerous. Animals quickly adapt to stationary scarecrows.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="font-black text-xl text-emerald-700">The Engineering Solution</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              CropSentry takes flight above the fields. Utilizing non-contact infrared thermal sensing and an ESP32 microcontroller, it spots warm animal signatures against cool ground.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="font-black text-xl text-forest-800">The Farmer's Peace of Mind</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The drone sounds an alarm to deter the animal on the spot, while simultaneously sending the farmer a WhatsApp notification with an exact Google Maps location link.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer id="contact" className="bg-[#122418] text-white py-12 px-6 border-t border-forest-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            <span className="font-extrabold text-base">CropSentry UAV</span>
          </div>

          <p className="text-xs text-forest-300/80 text-center">
            Final Year Engineering Project • Autonomous Wildlife Detection & Deterrence System
          </p>

          <button
            onClick={onEnterConsole}
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-bold transition"
          >
            Launch Live Console
          </button>
        </div>
      </footer>

      {/* 6. OPERATOR LOGIN MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-forest-100 text-forest-800">
                  <Lock className="w-4 h-4 text-forest-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Field Operator Login</h3>
                  <p className="text-xs text-slate-500">Access the CropSentry Live Patrol Console</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operator Username / ID</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent text-slate-800 font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-800 font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Patrol Unit</label>
                <input
                  type="text"
                  value="CropSentry-01 (Primary Field UAV)"
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-md transition"
                >
                  Enter Live Patrol Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
