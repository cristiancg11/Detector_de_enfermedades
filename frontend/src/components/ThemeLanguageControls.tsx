/**
 * AgroScan AI - Unified Theme & Language Switcher Header Controls.
 *
 * Provides quick bilingual toggling (ES / EN) and adaptive theme mode switching
 * with a high-contrast segmented selector (Light / Dark) for intuitive, zero-ambiguity mode control.
 */

import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ThemeLanguageControlsProps {
  className?: string;
  showLabels?: boolean;
}

export const ThemeLanguageControls: React.FC<ThemeLanguageControlsProps> = ({
  className = '',
  showLabels = false,
}) => {
  const { setTheme, isDark } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-300 dark:border-slate-700/80 backdrop-blur-xl shadow-md transition-all duration-200 ${className}`}
      role="region"
      aria-label="Localization and Theme Controls"
    >
      {/* Bilingual Language Switcher Button */}
      <button
        type="button"
        onClick={toggleLanguage}
        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/40 active:scale-95"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-mono tracking-wider font-extrabold text-[11px]">
          {language === 'es' ? 'ES' : 'EN'}
        </span>
        {showLabels && (
          <span className="hidden md:inline text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {language === 'es' ? 'Español' : 'English'}
          </span>
        )}
      </button>

      {/* Segmented Light / Dark Theme Switcher (Zero-Ambiguity Active Highlighting) */}
      <div
        className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1 border border-slate-200 dark:border-slate-700"
        role="group"
        aria-label="Theme mode selector"
      >
        {/* Light Option Button */}
        <button
          type="button"
          onClick={() => setTheme('light')}
          title={language === 'es' ? 'Activar Modo Claro' : 'Switch to Light Mode'}
          aria-pressed={!isDark}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
            !isDark
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sun
            className={`w-3.5 h-3.5 transition-transform ${
              !isDark
                ? 'text-amber-500 fill-amber-500/30 scale-110'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span className="font-mono text-[11px] font-extrabold tracking-wide uppercase">
            {language === 'es' ? 'Claro' : 'Light'}
          </span>
        </button>

        {/* Dark Option Button */}
        <button
          type="button"
          onClick={() => setTheme('dark')}
          title={language === 'es' ? 'Activar Modo Oscuro' : 'Switch to Dark Mode'}
          aria-pressed={isDark}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
            isDark
              ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Moon
            className={`w-3.5 h-3.5 transition-transform ${
              isDark
                ? 'text-indigo-300 fill-indigo-300/30 scale-110'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span className="font-mono text-[11px] font-extrabold tracking-wide uppercase">
            {language === 'es' ? 'Oscuro' : 'Dark'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeLanguageControls;
