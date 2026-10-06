/**
 * AgroScan AI - Modern Authentication & Farmer Onboarding Dialog.
 *
 * Provides farmer account creation ("Register New Farm"), sign-in ("Farmer Sign In"),
 * and one-click demo profiles tailored to Andean smallholders and agronomists.
 */

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Trees,
  Leaf,
  ArrowRight
} from 'lucide-react';
import { FarmerRole, UserProfile } from '../types';
import { AuthSession } from '../models/AuthSession';
import { ApiService } from '../services/apiService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

const NARINO_MUNICIPALITIES = [
  'Túquerres (High Plateau - 3,100m)',
  'Pasto (Galeras Volcano Slopes - 2,527m)',
  'Ipiales (Southern Border Ridge - 2,898m)',
  'Sandoná (Western Canyon Coffee Belt - 1,848m)',
  'La Unión (Northern Highlands - 1,745m)',
  'Buesaco (Juanambú Valley - 1,959m)',
  'Consacá (Andean Piedmont - 1,663m)',
  'Chachagüí (High Valley - 1,975m)',
];

const ROLES: FarmerRole[] = [
  'Smallholder Farmer',
  'Agronomist / Extensionist',
  'Cooperative Producer',
  'Agricultural Researcher',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [municipality, setMunicipality] = useState<string>(NARINO_MUNICIPALITIES[0]);
  const [role, setRole] = useState<FarmerRole>(ROLES[0]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both your email and password.');
        }

        try {
          const res = await ApiService.login({ email, password });
          AuthSession.saveSession(res.token, res.user);
          onAuthSuccess(res.user);
          onClose();
        } catch (apiErr: any) {
          // If remote API is offline or returns error, check demo profiles
          const demo = AuthSession.DEMO_PROFILES.find(
            (p) => p.email.toLowerCase() === email.toLowerCase()
          );
          if (demo) {
            const session = AuthSession.loginAsDemo(demo.email);
            onAuthSuccess(session.user);
            onClose();
            return;
          }
          throw apiErr;
        }
      } else {
        // Register Mode
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill in all mandatory fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        try {
          const res = await ApiService.register({
            email,
            password,
            fullName,
            farmName: farmName || 'Finca La Cumbre',
            municipality,
            role,
          });
          AuthSession.saveSession(res.token, res.user);
          onAuthSuccess(res.user);
          onClose();
        } catch (apiErr: any) {
          // Offline fallback registration
          const fallbackUser: UserProfile = {
            id: `usr-${Date.now()}`,
            email: email.trim().toLowerCase(),
            fullName: fullName.trim(),
            farmName: farmName.trim() || 'Finca Bella Vista',
            municipality,
            role,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email.trim().toLowerCase()}`,
            createdAt: new Date().toISOString(),
          };
          const fallbackToken = `session-token-${Date.now()}`;
          AuthSession.saveSession(fallbackToken, fallbackUser);
          onAuthSuccess(fallbackUser);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string) => {
    const session = AuthSession.loginAsDemo(demoEmail);
    onAuthSuccess(session.user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 transition-all overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald-soft">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                AgroScan<span className="text-emerald-600">.AI</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Andean Farmer Authentication & Cloud Persistence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="relative mt-6 p-1 rounded-2xl bg-slate-100 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Farmer Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Register New Farm</span>
          </button>
        </div>

        {/* Quick Demo Access */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Fast 1-Click Demo Profiles</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectDemo('carlos@agroscan.co')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all text-xs shadow-sm"
            >
              <p className="font-bold text-slate-900 truncate">Don Carlos Guancha</p>
              <p className="text-[10px] text-slate-500 truncate">Farmer (Túquerres)</p>
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('elena@agrosavia.co')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all text-xs shadow-sm"
            >
              <p className="font-bold text-slate-900 truncate">Dra. Elena Bastidas</p>
              <p className="text-[10px] text-slate-500 truncate">Agronomist (Pasto)</p>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name / Legal Representative *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mateo Narváez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Farm or Estate Name *
                </label>
                <div className="relative">
                  <Trees className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Finca San Francisco"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Municipality (Nariño)
                  </label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                  >
                    {NARINO_MUNICIPALITIES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as FarmerRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agroscan.co"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-emerald-soft flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Farm Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
