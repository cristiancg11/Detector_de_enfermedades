/**
 * AgroScan AI - Modern Glassmorphic Authentication & Farmer Onboarding Dialog.
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
  MapPin,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Trees,
  Briefcase,
  ShieldCheck,
  Leaf
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
            farmName: farmName || 'Finca La Esperanza',
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
            farmName: farmName.trim() || 'Finca La Esperanza',
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
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-950/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.18)] backdrop-blur-2xl z-10 transition-all overflow-hidden my-auto">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-emerald-500/20 via-teal-400/20 to-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                AgroScan<span className="text-emerald-400">.AI</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Andean Farmer Authentication & Cloud Persistence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle (Farmer Sign In vs Register New Farm) */}
        <div className="relative mt-6 p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
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
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Register New Farm</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Don Carlos Guancha"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors shadow-inner"
                  />
                </div>
              </div>

              {/* Farm Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Farm / Parcel Name
                </label>
                <div className="relative">
                  <Trees className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Finca Bella Vista - Sector 1"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors shadow-inner"
                  />
                </div>
              </div>

              {/* Municipality & Role Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Nariño Municipality
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400 transition-colors appearance-none shadow-inner"
                    >
                      {NARINO_MUNICIPALITIES.map((m) => (
                        <option key={m} value={m} className="bg-slate-900 text-white">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Role in Field
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as FarmerRole)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400 transition-colors appearance-none shadow-inner"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-slate-900 text-white">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agroscan.co"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password {mode === 'register' && <span className="text-slate-500">(Min. 6 chars)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors shadow-inner"
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

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : mode === 'login' ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to AgroScan Account</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Farm Account & Access Cloud</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Smallholder Fast-Track Picker */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fast-Track Demo Identities (One-Click Testing):</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {AuthSession.DEMO_PROFILES.map((dp) => (
              <button
                key={dp.id}
                type="button"
                onClick={() => handleSelectDemo(dp.email)}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={dp.avatarUrl}
                    alt={dp.fullName}
                    className="w-6 h-6 rounded-lg object-cover bg-slate-800"
                  />
                  <span className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {dp.fullName.split(' ')[0]}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  {dp.farmName}
                </span>
              </button>
            ))}
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-4 py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Explore Dashboard Directly →
          </button>
        </div>
      </div>
    </div>
  );
};
