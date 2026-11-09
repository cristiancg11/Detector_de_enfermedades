/**
 * AgroScan AI - Fullscreen Mandatory Auth Gate / Route Guard Component.
 *
 * Prevents unauthenticated access to the phytosanitary dashboard, diagnostic scanner,
 * and parcel history. Renders an undismissable glassmorphic authentication gateway.
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Trees,
  Sprout,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AuthSession } from '../models/AuthSession';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    AuthSession.isAuthenticated()
  );
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Subscribe to reactive auth session events
  useEffect(() => {
    const unsubscribe = AuthSession.onAuthStateChange((authed) => {
      setIsAuthenticated(authed);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // If farmer is authenticated, render protected dashboard application
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Handle fast Andean demo profile selection
  const handleSelectDemo = (demoEmail: string) => {
    setErrorMessage(null);
    const session = AuthSession.loginAsDemo(demoEmail);
    setSuccessMessage(`Welcome back, ${session.user.fullName}! Entering dashboard...`);
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Initial placeholder submit for step 2 base component
    setTimeout(() => {
      if (mode === 'login' && !email.trim()) {
        setErrorMessage('Please enter your email address.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* High-End Dark Landing Hero Backdrop with Ambient Gradient Blur Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Centered Auth Container - Backdrop Dismissal Disabled */}
      <div className="relative w-full max-w-xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl z-10 my-auto transition-all">
        {/* Brand Emblem & Headline */}
        <div className="text-center pb-6 border-b border-slate-800/80">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 mb-4 shadow-xl shadow-emerald-950/60 ring-8 ring-emerald-500/5">
            <Sprout className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AgroScan<span className="text-emerald-400">.AI</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
              Mandatory Gate
            </span>
          </div>

          <p className="text-sm font-semibold text-emerald-400/90 tracking-wide">
            Andean Phytosanitary Intelligence
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Authentication is required to access crop health diagnostics, 20L backpack sprayer dosage calibration, and parcel history.
          </p>
        </div>

        {/* Tabbed Switcher: Sign In / Register Farm */}
        <div className="mt-6 p-1 rounded-2xl bg-slate-950/70 border border-slate-800/90 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Register Farm</span>
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>1-Click Andean Demo Accounts</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectDemo('carlos@agroscan.co')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/40 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                Don Carlos Guancha
              </p>
              <p className="text-[10px] text-slate-400 truncate">Finca Bella Vista (Potato)</p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('elena@agrosavia.co')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/40 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                Dra. Elena Bastidas
              </p>
              <p className="text-[10px] text-slate-400 truncate">AGROSAVIA Extensionist</p>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Skeleton */}
        <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name / Legal Representative *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mateo Narváez"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Farm or Estate Name *
                </label>
                <div className="relative">
                  <Trees className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Finca La Cumbre"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agroscan.co"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Farm' : 'Register Farm Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected Route • Requires Active JWT Session & Farmer Credential</span>
        </div>
      </div>
    </div>
  );
};
