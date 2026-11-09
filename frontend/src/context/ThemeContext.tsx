/**
 * AgroScan AI - Theme Context Provider.
 *
 * Manages client-side dark/light theme switching, synchronizes with browser localStorage,
 * and toggles the root document HTML and body classes ('dark' / 'light') for Tailwind CSS styling.
 */

import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'agroscan_theme';

/**
 * Directly and synchronously mutates the HTML root and body classes
 * to ensure immediate visual updates without waiting for React re-render passes.
 */
export const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    if (body) {
      body.classList.add('dark');
      body.classList.remove('light');
    }
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    if (body) {
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        applyThemeToDOM(storedTheme);
        return storedTheme;
      }
    } catch (err) {
      console.warn('Failed to read theme from localStorage:', err);
    }
    applyThemeToDOM('dark');
    return 'dark';
  });

  // Synchronous DOM mutation on state change
  useLayoutEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      console.warn('Failed to persist theme to localStorage:', err);
    }
  }, [theme]);

  // Secondary effect to guarantee persistence across hydration
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const nextTheme: Theme = prevTheme === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(nextTheme);
      return nextTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    applyThemeToDOM(newTheme);
    setThemeState(newTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      isDark: theme === 'dark',
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
