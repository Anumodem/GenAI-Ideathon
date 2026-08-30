import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  BarChart3,
  CalendarCheck,
  Zap,
  Lock,
  Compass,
  CheckCircle2,
  BrainCircuit,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onOpenSecurity: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenSecurity }) => {
  const { loginWithGoogle, switchAccount, isLoading } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomLogin, setShowCustomLogin] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmail.trim()) {
      loginWithGoogle(customEmail.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Banner / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Gemini Growth Journal</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                AI Copilot
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="landing-security-btn"
              onClick={onOpenSecurity}
              className="text-xs text-slate-400 hover:text-emerald-300 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-700/50 bg-slate-900/50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security & Threat Model</span>
            </button>
            <button
              id="landing-signin-nav-btn"
              onClick={() => loginWithGoogle()}
              disabled={isLoading}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-md shadow-teal-500/20 transition-all font-medium flex items-center space-x-1.5"
            >
              <span>Sign In with Google</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-medium mb-8 shadow-inner">
          <BrainCircuit className="w-4 h-4 text-teal-400" />
          <span>Next-Generation AI Life & Career Reflection Copilot</span>
        </div>

        {/* Headline & Tagline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight sm:leading-tight">
          Reflect with depth.
          <br />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
            Execute with precision.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          Transform unstructured daily thoughts, engineering retrospectives, and leadership dilemmas into verified, measurable action plans powered by Google Gemini.
        </p>

        {/* Primary CTA Area */}
        <div className="mt-10 flex flex-col items-center w-full max-w-md space-y-4">
          {/* Main Google Sign-In button */}
          <button
            id="landing-google-signin-btn"
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-base shadow-xl shadow-teal-500/10 hover:shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 border border-slate-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Connecting Session...' : 'Sign in with Google'}</span>
          </button>

          {/* Quick Demo Personas (1-click exploration) */}
          <div className="w-full pt-2">
            <div className="text-xs text-slate-400 mb-2 font-medium">Or explore instantly with a pre-configured profile:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="demo-eng-login"
                onClick={() => switchAccount('demo-engineer')}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-colors text-xs flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                  AC
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-200 truncate">Alex Chen</div>
                  <div className="text-[10px] text-slate-400 truncate">Eng Lead (Seeded)</div>
                </div>
              </button>

              <button
                id="demo-fresh-login"
                onClick={() => switchAccount('fresh-user')}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-colors text-xs flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px]">
                  JT
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-200 truncate">Jordan Taylor</div>
                  <div className="text-[10px] text-slate-400 truncate">Fresh Clean Slate</div>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Email Toggle */}
          <div className="text-xs text-slate-500">
            <button
              onClick={() => setShowCustomLogin(!showCustomLogin)}
              className="hover:text-slate-300 underline"
            >
              {showCustomLogin ? 'Hide custom email' : 'Use a custom work email'}
            </button>
          </div>

          {showCustomLogin && (
            <form onSubmit={handleCustomSubmit} className="w-full flex space-x-2 pt-2 animate-in fade-in">
              <input
                type="email"
                placeholder="you@company.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                required
              />
              <button
                type="submit"
                className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg text-xs"
              >
                Enter
              </button>
            </form>
          )}
        </div>

        {/* 4 Core Features Bento Grid */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Reflection → Action Plan</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gemini analyzes multi-turn reflections, diagnoses root bottlenecks, and synthesizes 3-5 structured action items for instant execution.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Growth Dashboard</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time analytics across Leadership, Technical, Communication, and Productivity. Never fabricated—derived strictly from your logs.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Weekly AI Review</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              On-demand synthesis of historical reflections identifying top wins, recurring friction points, progressed goals, and focus for next week.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Smart Auto-Tagging</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automatic contextual taxonomy (#leadership, #deepwork, #architecture) to easily discover patterns across your career journey.
            </p>
          </div>
        </div>

        {/* Security & Isolation Architecture Card */}
        <div className="mt-12 w-full max-w-4xl p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between text-left gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Enterprise-Grade Privacy & Threat Mitigation</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero Credential Leakage
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Server-side Gemini proxying prevents key exposure. Strict per-user partitioning guarantees you can never access or leak another user&apos;s reflections.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSecurity}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold transition-colors flex items-center space-x-2"
          >
            <span>View Threat Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Gemini Growth Journal &copy; 2026. Powered by Google Gemini 2.5 Flash.</span>
          <div className="flex items-center space-x-4">
            <button onClick={onOpenSecurity} className="hover:text-slate-300">
              Security Architecture
            </button>
            <span>&bull;</span>
            <span>Reflect. Understand. Grow.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
