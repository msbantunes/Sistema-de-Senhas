import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { THEMES, ThemeName, Theme } from '../themes';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: Record<ThemeName, Theme>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): ThemeName => {
    if (typeof window === 'undefined') {
        return 'blue'; // Fallback for SSR
    }
    const storedTheme = localStorage.getItem('color-theme') as ThemeName;
    if (storedTheme && THEMES[storedTheme]) {
        return storedTheme;
    }
    return 'blue'; // Default to blue
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme);

  const applyTheme = useCallback((themeName: ThemeName) => {
    const root = window.document.documentElement;
    const newTheme = THEMES[themeName];

    if (!newTheme) {
        console.warn(`Theme "${themeName}" not found.`);
        return;
    }
    
    Object.entries(newTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-brand-${key}`, value);
    });
    
    // This is for dark mode compatibility. It checks the user's OS preference 
    // and applies a 'dark' or 'light' class to the html element, which works 
    // with Tailwind's `dark:` variants.
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');

  }, []);

  // Apply theme whenever the 'theme' state changes.
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('color-theme', theme);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: ThemeName) => {
    if (THEMES[newTheme]) {
        setThemeState(newTheme);
    }
  };
  
  // Effect for initial load and for listening to OS-level dark mode changes.
  useEffect(() => {
    applyTheme(theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Re-apply the theme to update the dark/light class if the OS preference changes.
    const handleChange = () => applyTheme(theme);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, theme]);


  const value = {
    theme,
    setTheme,
    availableThemes: THEMES,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};