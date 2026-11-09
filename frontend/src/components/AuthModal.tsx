/**
 * AgroScan AI - Ultra-Modern Glassmorphic Authentication Modal.
 *
 * Provides farmer account creation ("Register Farm") and authentication ("Sign In")
 * with dark glassmorphic styling, tab toggles, full validation, and JWT persistence.
 */

import React, { useState } from 'react';
import {
  X,
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
import { UserProfile } from '../types';
import { AuthSession } from '../models/AuthSession';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setFarmName('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPassword(false);
    onClose();
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both your email address and password.');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password,
            }),
          });

          if (!response.ok) {
            let errorDetail = 'Invalid email or password.';
            try {
              const data = await response.json();
              errorDetail = data.detail || errorDetail;
            } catch {
              // Ignore json parse error
            }
            throw new Error(errorDetail);
          }

          const authData = await response.json();
          const userProfile: UserProfile = {
            id: authData.user?.id || `usr-${Date.now()}`,
            email: authData.user?.email || email.trim().toLowerCase(),
            fullName: authData.user?.full_name || authData.user?.fullName || 'Registered Farmer',
            farmName: authData.user?.farm_name || authData.user?.farmName || 'Andean Highland Plot',
            municipality: authData.user?.municipality || 'Nariño Highlands',
            role: authData.user?.role || 'Smallholder Farmer',
            avatarUrl:
              authData.user?.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${email.trim().toLowerCase()}`,
            createdAt: authData.user?.created_at || new Date().toISOString(),
          };

          const token = authData.access_token || authData.token || `token-${Date.now()}`;
          AuthSession.saveSession(token, userProfile);
          setSuccessMsg('Authentication successful! Loading dashboard...');
          setTimeout(() => {
            onAuthSuccess(userProfile);
            onClose();
          }, 350);
        } catch (apiErr: any) {
          // Resilient demo identity check if backend is offline or credentials match demo
          const demoUser = AuthSession.DEMO_PROFILES.find(
            (p) => p.email.toLowerCase() === email.trim().toLowerCase()
          );

          if (demoUser) {
            const demoSession = AuthSession.loginAsDemo(demoUser.email);
            setSuccessMsg(`Welcome back, ${demoUser.fullName}!`);
            setTimeout(() => {
              onAuthSuccess(demoSession.user);
              onClose();
            }, 350);
            return;
          }

          throw apiErr;
        }
      } else {
        // Register Farm Mode
        if (!fullName.trim() || !farmName.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill out all required fields.');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password,
              full_name: fullName.trim(),
              farm_name: farmName.trim(),
              municipality: 'Nariño High Plateau',
              role: 'Smallholder Farmer',
            }),
          });

          if (!response.ok) {
            let errorDetail = 'Registration could not be completed.';
            try {
              const data = await response.json();
              errorDetail = data.detail || errorDetail;
            } catch {
              // Ignore json parse error
            }
            throw new Error(errorDetail);
          }

          const authData = await response.json();
          const userProfile: UserProfile = {
            id: authData.user?.id || `usr-${Date.now()}`,
            email: authData.user?.email || email.trim().toLowerCase(),
            fullName: authData.user?.full_name || fullName.trim(),
            farmName: authData.user?.farm_name || farmName.trim(),
            municipality: authData.user?.municipality || 'Nariño High Plateau',
            role: authData.user?.role || 'Smallholder Farmer',
            avatarUrl:
              authData.user?.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${email.trim().toLowerCase()}`,
            createdAt: authData.user?.created_at || new Date().toISOString(),
          };

          const token = authData.access_token || authData.token || `token-${Date.now()}`;
          AuthSession.saveSession(token, userProfile);
          setSuccessMsg('Farm account registered successfully!');
          setTimeout(() => {
            onAuthSuccess(userProfile);
            onClose();
          }, 350);
        } catch (apiErr: any) {
          // Offline fallback registration for demonstration resilience
          if (
            apiErr?.message?.includes('Failed to fetch') ||
            apiErr?.message?.includes('NetworkError') ||
            apiErr?.message?.includes('Load failed')
          ) {
            const fallbackUser: UserProfile = {
              id: `usr-${Date.now()}`,
              email: email.trim().toLowerCase(),
              fullName: fullName.trim(),
              farmName: farmName.trim(),
              municipality: 'Túquerres (Plateau - 3,100m)',
              role: 'Smallholder Farmer',
              avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email.trim().toLowerCase()}`,
              createdAt: new Date().toISOString(),
            };
            const fallbackToken = `offline-jwt-${Date.now()}`;
            AuthSession.saveSession(fallbackToken, fallbackUser);
            setSuccessMsg('Account registered locally! Offline mode active.');
            setTimeout(() => {
              onAuthSuccess(fallbackUser);
              onClose();
            }, 350);
            return;
          }

          throw apiErr;
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication request failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoProfile = (demoEmail: string) => {
    setErrorMsg(null);
    const session = AuthSession.loginAsDemo(demoEmail);
    setSuccessMsg(`Authenticated as ${session.user.fullName}`);
    setTimeout(() => {
      onAuthSuccess(session.user);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Glassmorphic Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Glassmorphic Modal Window */}
      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 z-10 my-auto transition-all overflow-hidden">
        {/* Ambient Glow Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                AgroScan<span className="text-emerald-400">.AI</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Farmer Session & Cloud Persistence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Sign In / Register Farm */}
        <div className="relative mt-6 p-1 rounded-2xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Register Farm</span>
          </button>
        </div>

        {/* Fast 1-Click Demo Profiles */}
        <div className="relative mt-4 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Instant Andean Demo Accounts</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectDemoProfile('carlos@agroscan.co')}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/40 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                Don Carlos Guancha
              </p>
              <p className="text-[10px] text-slate-400 truncate">Finca Bella Vista (Potato)</p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoProfile('elena@agrosavia.co')}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/40 text-left transition-all group"
            >
              <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                Dra. Elena Bastidas
              </p>
              <p className="text-[10px] text-slate-400 truncate">AGROSAVIA Extensionist</p>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {/* Interactive Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mateo Narváez"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Farm Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Farm Name *
                </label>
                <div className="relative">
                  <Trees className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Finca La Cumbre"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agroscan.co"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
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
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Contacting Cloud Service...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Farm' : 'Register Farm Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Secured with JWT Token Authentication & MongoDB Atlas</span>
        </div>
      </div>
    </div>
  );
};
