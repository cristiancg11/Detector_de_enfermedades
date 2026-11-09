/**
 * AgroScan AI - Fullscreen Desktop SaaS Authentication Experience (Split-Layout).
 *
 * Implements a high-end desktop web authentication gate with Andean agricultural branding,
 * high-altitude crop intelligence showcases, bilingual localization (EN/ES),
 * adaptive light/dark theme switching, and tabbed Sign In / Register Farm flows.
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
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  CloudSun,
  FlaskConical,
  Activity,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { AuthSession } from '../models/AuthSession';
import { UserProfile } from '../types';
import { registerUser, API_BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ThemeLanguageControls } from './ThemeLanguageControls';

interface AuthGateProps {
  children?: React.ReactNode;
  onLoginSuccess?: (user: UserProfile) => void;
}

const ANDEAN_CROPS = [
  {
    nameKey: 'cropPotato' as const,
    varietyKey: 'cropPotatoVariety' as const,
    scientific: 'Solanum tuberosum',
    icon: '🥔',
    altitude: '2,900m – 3,200m',
    region: 'Túquerres Plateau',
  },
  {
    nameKey: 'cropCoffee' as const,
    varietyKey: 'cropCoffeeVariety' as const,
    scientific: 'Coffea arabica',
    icon: '☕',
    altitude: '1,650m – 2,100m',
    region: 'Sandoná Canyons',
  },
  {
    nameKey: 'cropCorn' as const,
    varietyKey: 'cropCornVariety' as const,
    scientific: 'Zea mays',
    icon: '🌽',
    altitude: '2,200m – 2,800m',
    region: 'Pasto Slopes',
  },
  {
    nameKey: 'cropTomato' as const,
    varietyKey: 'cropTomatoVariety' as const,
    scientific: 'Solanum lycopersicum',
    icon: '🍅',
    altitude: '1,800m – 2,400m',
    region: 'Juanambú Valley',
  },
];

export const AuthGate: React.FC<AuthGateProps> = ({ children, onLoginSuccess }) => {
  const { t } = useLanguage();
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
      if (authed && onLoginSuccess) {
        const user = AuthSession.getUser();
        if (user) {
          onLoginSuccess(user);
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [onLoginSuccess]);

  // If farmer is authenticated and children exist, render protected view
  if (isAuthenticated && children) {
    return <>{children}</>;
  }

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (mode === 'login') {
        if (!cleanEmail || !cleanPassword) {
          throw new Error('Please enter both your work email address and password.');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              email: cleanEmail,
              password: cleanPassword,
            }),
          });

          if (!response.ok) {
            let errorText = 'Invalid email or password.';
            try {
              const resJson = await response.json();
              errorText = resJson.detail || errorText;
            } catch {
              // Ignore json parse error
            }
            throw new Error(errorText);
          }

          const authData = await response.json();
          const userProfile: UserProfile = {
            id: authData.user?.id || `usr-${Date.now()}`,
            email: authData.user?.email || cleanEmail,
            fullName: authData.user?.full_name || authData.user?.fullName || 'Registered Farmer',
            farmName: authData.user?.farm_name || authData.user?.farmName || 'Andean Highland Plot',
            municipality: authData.user?.municipality || 'Túquerres (Plateau - 3,100m)',
            role: authData.user?.role || 'Smallholder Farmer',
            avatarUrl:
              authData.user?.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
            createdAt: authData.user?.created_at || new Date().toISOString(),
          };

          const token = authData.access_token || authData.token || `token-${Date.now()}`;
          setSuccessMessage('Authentication successful! Entering dashboard...');

          AuthSession.saveSession(token, userProfile);
          if (onLoginSuccess) {
            onLoginSuccess(userProfile);
          }
        } catch (apiErr: any) {
          const isConnectionError =
            apiErr?.message?.includes('Failed to fetch') ||
            apiErr?.message?.includes('NetworkError') ||
            apiErr?.message?.includes('Load failed');
          if (isConnectionError) {
            throw new Error(
              `Cannot connect to authentication service at ${API_BASE_URL}/auth/login. Please verify backend is running.`
            );
          }
          throw apiErr;
        }
      } else {
        // Register Farm Mode
        if (!fullName.trim() || !farmName.trim() || !cleanEmail || !cleanPassword) {
          throw new Error('Please fill in all mandatory registration fields.');
        }

        if (cleanPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        try {
          await registerUser({
            email: cleanEmail,
            password: cleanPassword,
            full_name: fullName.trim(),
            farm_name: farmName.trim(),
          });

          setSuccessMessage('Farm registered successfully! Access granted.');
          const user = AuthSession.getUser();
          if (user && onLoginSuccess) {
            onLoginSuccess(user);
          }
        } catch (apiErr: any) {
          const isConnectionError =
            apiErr?.message?.includes('Failed to fetch') ||
            apiErr?.message?.includes('NetworkError') ||
            apiErr?.message?.includes('Load failed');
          if (isConnectionError) {
            throw new Error(
              `Cannot connect to registration service at ${API_BASE_URL}/auth/register. Please verify backend is running.`
            );
          }
          throw apiErr;
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row relative overflow-hidden select-none transition-colors duration-200">
      {/* Floating Top-Right Theme and Language Switcher Controls strictly in the corner */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50">
        <ThemeLanguageControls showLabels />
      </div>

      {/* LEFT / HERO PANEL (Hidden on small screens, 50% width on desktop lg:flex) */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-br from-emerald-50/80 via-slate-50 to-teal-50/60 dark:from-slate-950 dark:via-emerald-950/60 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        {/* Agricultural Ambient Lighting Circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 dark:bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Subtle Grid Texture Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none opacity-60" />

        {/* Top Branding Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-950/20 ring-4 ring-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  AgroScan<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase border border-emerald-500/20 dark:border-emerald-500/30">
                  Atlas v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {t('andeanHighlands')}
              </p>
            </div>
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('heroBadge')}</span>
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {t('heroHeadline')}
            </h1>

            <p className="text-sm xl:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {t('heroDescription')}
            </p>
          </div>

          {/* Andean Precision Crops Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {ANDEAN_CROPS.map((crop) => (
              <div
                key={crop.nameKey}
                className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/40 transition-all shadow-xs backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl" role="img" aria-label={t(crop.nameKey)}>
                    {crop.icon}
                  </span>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white">{t(crop.nameKey)}</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">{crop.scientific}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                  <span>{crop.altitude}</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                    {crop.region}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Highlighted Feature Pills */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t('pillGeminiVision')}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-sky-500/30 text-sky-800 dark:text-sky-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <FlaskConical className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {t('pillDosageEngine')}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <CloudSun className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {t('pillWeatherRisk')}
            </span>
          </div>
        </div>

        {/* Bottom Hero Trust Indicators */}
        <div className="relative z-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('heroTrustNotice')}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">{t('heroLocation')}</span>
        </div>
      </section>

      {/* RIGHT / FORM PANEL (Full width on mobile, 50% width on desktop) */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 xl:p-16 relative overflow-y-auto min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/5 dark:bg-emerald-950/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Spacious Glassmorphic Form Card */}
        <div className="max-w-xl mx-auto w-full p-8 sm:p-10 lg:p-12 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-xl dark:shadow-2xl space-y-6 relative z-10 transition-colors duration-200">
          {/* Header on Form Panel */}
          <div>
            {/* Mobile-Only Brand Emblem */}
            <div className="lg:hidden flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  AgroScan<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('brandTagline')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {mode === 'login' ? t('signInTitle') : t('registerFarmTitle')}
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                {t('protectedRouteBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {mode === 'login' ? t('authSubtitleSignIn') : t('authSubtitleRegister')}
            </p>
          </div>

          {/* Tab Switch: Sign In vs Register Farm */}
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('tabSignIn')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('tabRegisterFarm')}</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-900 dark:text-rose-200">{t('authAlertTitle')}</p>
                <p className="leading-relaxed text-rose-700 dark:text-rose-300/90">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium leading-tight">{successMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    {t('fieldFullName')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('placeholderFullName')}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    {t('fieldFarmName')}
                  </label>
                  <div className="relative">
                    <Trees className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder={t('placeholderFarmName')}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {t('fieldEmail')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('placeholderEmail')}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {t('fieldPassword')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === 'register'
                      ? t('placeholderPasswordRegister')
                      : t('placeholderPasswordLogin')
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-emerald-600/30 dark:shadow-emerald-950/60 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('btnAuthenticating')}</span>
                </span>
              ) : (
                <>
                  <span>
                    {mode === 'login' ? t('btnEnterDashboard') : t('btnRegisterFarm')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Endpoint Status Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('jwtSecurityNotice')}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
              API: http://localhost:8000/api/v1/auth
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthGate;
