/**
 * AgroScan AI - Modern Streamlined Top Navigation Header Component.
 *
 * Implements an uncluttered 3-zone layout:
 * - Left: AgroScan.AI branding & Andean region badge
 * - Center: Compact telemetry pill (Gemini 2.5 Flash + MongoDB status)
 * - Right: Unified consultation history, language toggle, theme selector, and user profile with logout.
 */

import React from 'react';
import {
  Leaf,
  MapPin,
  Database,
  LogOut,
  Sun,
  Moon,
  Globe,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export interface NavbarProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  backendStatus: {
    status: string;
    gemini_configured: boolean;
    mongodb_connected: boolean;
    model: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  historyCount,
  onOpenHistory,
  backendStatus,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { setTheme, isDark } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* =========================================================================
            ZONE 1 (LEFT): AgroScan.AI Logo + Andean Regional Subtitle
           ========================================================================= */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-emerald-soft shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                AgroScan<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold tracking-wider uppercase border border-emerald-200 dark:border-emerald-500/30">
                Atlas v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'es' ? 'Altiplano de Nariño' : 'Nariño High Plateau'}</span>
            </p>
          </div>
        </div>

        {/* =========================================================================
            ZONE 2 (CENTER): Minimalist Telemetry Pill (Gemini + DB Cloud Status)
           ========================================================================= */}
        <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-200 font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus.gemini_configured !== false ? 'bg-emerald-500' : 'bg-amber-500'
              } animate-pulse`}
            />
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{backendStatus.model || 'Gemini 2.5 Flash'}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-600">|</span>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              MongoDB Atlas{' '}
              {backendStatus.mongodb_connected
                ? `(${t('systemStatusLive')})`
                : `(${t('systemStatusSynced')})`}
            </span>
          </div>
        </div>

        {/* =========================================================================
            ZONE 3 (RIGHT): Unified User Tools & Controls
           ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Single Unified History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-xs"
            title={language === 'es' ? 'Abrir Historial de Consultas Fitosanitarias' : 'Open Phytosanitary Consultation History'}
          >
            <span className="text-base">📋</span>
            <span className="hidden sm:inline">
              {language === 'es' ? 'Historial' : 'History'}
            </span>
            {historyCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[11px] leading-tight">
                {historyCount}
              </span>
            )}
          </button>

          {/* 2. Bilingual Language Switcher Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs active:scale-95 transition-all"
          >
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-mono font-extrabold text-xs">
              {language === 'es' ? 'ES' : 'EN'}
            </span>
          </button>

          {/* 3. Theme Switcher (Light / Dark Segmented Pill) */}
          <div
            className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
            role="group"
            aria-label="Theme mode selector"
          >
            <button
              type="button"
              onClick={() => setTheme('light')}
              title={language === 'es' ? 'Modo Claro' : 'Light Mode'}
              aria-pressed={!isDark}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                !isDark
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun
                className={`w-3.5 h-3.5 ${
                  !isDark ? 'text-amber-500 fill-amber-500/30' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline font-mono text-[11px] font-extrabold uppercase">
                {language === 'es' ? 'Claro' : 'Light'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              title={language === 'es' ? 'Modo Oscuro' : 'Dark Mode'}
              aria-pressed={isDark}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isDark
                  ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon
                className={`w-3.5 h-3.5 ${
                  isDark ? 'text-indigo-300 fill-indigo-300/30' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline font-mono text-[11px] font-extrabold uppercase">
                {language === 'es' ? 'Oscuro' : 'Dark'}
              </span>
            </button>
          </div>

          {/* 4. User Profile & Logout Action */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/40 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs shrink-0 overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.fullName.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="hidden xl:block text-left leading-tight pr-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate max-w-[110px]">
                    {currentUser.farmName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  title={t('logOut')}
                  className="px-2.5 py-1.5 rounded-xl text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 transition-all flex items-center gap-1 font-bold text-xs active:scale-95 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="hidden md:inline">{t('logOut')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

