/**
 * AgroScan AI - Unified Theme & Language Switcher Header Controls.
 *
 * Provides quick bilingual toggling (ES / EN) and adaptive theme mode switching
 * (Light / Dark) with fluid transitions, SVG icons, and reactive Context hooks.
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
  const { toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-300 dark:border-slate-700/80 backdrop-blur-xl shadow-md transition-all duration-200 ${className}`}
      role="region"
      aria-label="Localization and Theme Controls"
    >
      {/* Bilingual Language Switcher Button */}
      <button
        type="button"
        onClick={toggleLanguage}
        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/40 active:scale-95"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-mono tracking-wider font-extrabold text-[11px]">
          {language === 'es' ? 'ES' : 'EN'}
        </span>
        {showLabels && (
          <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {language === 'es' ? 'Español' : 'English'}
          </span>
        )}
      </button>

      {/* Theme Switcher Button (Light / Dark) */}
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? t('themeLight') : t('themeDark')}
        aria-label={isDark ? t('themeLight') : t('themeDark')}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95 text-xs font-bold"
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wide">
              {t('themeLight')}
            </span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wide">
              {t('themeDark')}
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default ThemeLanguageControls;
