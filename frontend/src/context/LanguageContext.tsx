/**
 * AgroScan AI - Language Context Provider.
 *
 * Manages bilingual localization state (English and Spanish) with local storage persistence
 * and provides typed translation lookup helpers. Defaults to Spanish ('es').
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SupportedLanguage,
  TranslationDictionary,
  translations,
} from '../locales/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: keyof TranslationDictionary) => string;
  isSpanish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'agroscan_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'es') {
        return stored;
      }
    } catch (err) {
      console.warn('Failed to read language preference from localStorage:', err);
    }
    return 'es'; // Default language: Spanish ('es')
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.setAttribute('lang', language);
    } catch (err) {
      console.warn('Failed to persist language preference to localStorage:', err);
    }
  }, [language]);

  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (key: keyof TranslationDictionary): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    const fallbackDict = translations['en'];
    return (fallbackDict && fallbackDict[key]) || (key as string);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isSpanish: language === 'es',
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
