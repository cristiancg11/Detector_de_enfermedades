/**
 * AgroScan AI - Authentication & Farmer Onboarding Modal.
 *
 * Provides farmer account creation, sign-in, and one-click demo profiles
 * tailored to smallholders and agronomists across Nariño municipalities.
 */

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  MapPin,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Trees,
  Briefcase
} from 'lucide-react';
import { FarmerRole, UserProfile } from '../types';
import { AuthSessionManager } from '../models/AuthSessionManager';
import { ApiService } from '../services/apiService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

const NARINO_MUNICIPALITIES = [
  'Túquerres (High Plateau)',
  'Pasto (Galeras Volcano Slopes)',
  'Ipiales (Southern Border Ridge)',
  'Sandoná (Western Canyon)',
  'La Unión (Northern Highlands)',
  'Buesaco (Juanambú Valley)',
  'Consacá (Coffee Belt)',
  'Chachagüí (Warm Valley)',
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
          throw new Error('Please enter both email and password.');
        }

        try {
          const res = await ApiService.login({ email, password });
          AuthSessionManager.saveSession(res.token, res.user);
          onAuthSuccess(res.user);
          onClose();
        } catch (apiErr: any) {
          // If remote API is offline or returns error, check if matches demo
          const demo = AuthSessionManager.DEMO_PROFILES.find(
            (p) => p.email.toLowerCase() === email.toLowerCase()
          );
          if (demo) {
            const session = AuthSessionManager.loginAsDemo(demo.email);
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
          throw new Error('Password must be at least 6 characters.');
        }

        try {
          const res = await ApiService.register({
            email,
            password,
            fullName,
            farmName: farmName || 'Finca La Esperanza',
            municipality,
            role,
          });
          AuthSessionManager.saveSession(res.token, res.user);
          onAuthSuccess(res.user);
          onClose();
        } catch (apiErr: any) {
          // Offline fallback registration
          const fallbackUser: UserProfile = {
            id: `usr-${Date.now()}`,
            email: email.trim().toLowerCase(),
            fullName: fullName.trim(),
            farmName: farmName.trim() || 'Finca Familiar',
            municipality,
            role,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
            createdAt: new Date().toISOString(),
          };
          const fallbackToken = `token-${Date.now()}`;
          AuthSessionManager.saveSession(fallbackToken, fallbackUser);
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
    const session = AuthSessionManager.loginAsDemo(demoEmail);
    onAuthSuccess(session.user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark Ambient Backdrop with Cyber Blur */}
      <div
        className="fixed inset-0 bg-obsidian-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-obsidian-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,245,155,0.12)] z-10 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-flora via-neon-sky to-neon-solar" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-flora/10 border border-neon-flora/30 text-neon-flora text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Farmer Identity Portal
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back to AgroScan' : 'Create Farmer Account'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Access customized phytosanitary records and parcel diagnostic histories in Nariño.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-obsidian-950 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-neon-flora to-emerald-400 text-obsidian-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-neon-flora to-emerald-400 text-obsidian-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Carlos Guancha"
                    className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-flora transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Farm / Lot Name
                  </label>
                  <div className="relative">
                    <Trees className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Finca Bella Vista"
                      className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-flora transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Municipality
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-neon-flora transition-colors appearance-none"
                    >
                      {NARINO_MUNICIPALITIES.map((m) => (
                        <option key={m} value={m} className="bg-obsidian-900 text-white">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Agronomic Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as FarmerRole)}
                    className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-neon-flora transition-colors appearance-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-obsidian-900 text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agroscan.co"
                className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-flora transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-flora transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-neon-flora via-emerald-400 to-neon-sky text-obsidian-950 shadow-[0_0_25px_rgba(0,245,155,0.3)] hover:shadow-[0_0_35px_rgba(0,245,155,0.5)] transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In & Access Plots' : 'Create Farmer Account'}
          </button>
        </form>

        {/* Quick Demo Identities Footer */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
            ⚡ Quick-Login with Andean Field Identities:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AuthSessionManager.DEMO_PROFILES.slice(0, 2).map((profile) => (
              <button
                key={profile.email}
                type="button"
                onClick={() => handleSelectDemo(profile.email)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-obsidian-950 hover:bg-slate-800 border border-slate-800 text-left transition-all active:scale-95"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-7 h-7 rounded-lg object-cover bg-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{profile.fullName}</p>
                  <p className="text-[10px] text-neon-flora truncate">{profile.farmName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
