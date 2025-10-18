import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'luxury-gold-light';
  });

  const themes = {
    'luxury-gold': {
      name: 'Luxury Gold',
      colors: 'Gold & Navy',
      light: 'luxury-gold-light',
      dark: 'luxury-gold-dark'
    },
    'corporate-blue': {
      name: 'Corporate Blue',
      colors: 'Blue & Silver', 
      light: 'corporate-blue-light',
      dark: 'corporate-blue-dark'
    },
    'emerald-luxury': {
      name: 'Emerald Luxury',
      colors: 'Green & Bronze',
      light: 'emerald-luxury-light',
      dark: 'emerald-luxury-dark'
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const switchTheme = (themeBase) => {
    // Always use current dark mode state when switching themes
    const currentIsDark = theme.includes('dark');
    const themeKey = currentIsDark ? themes[themeBase].dark : themes[themeBase].light;
    setTheme(themeKey);
  };

  const toggleDarkMode = () => {
    const currentBase = theme.replace(/(-light|-dark)$/, '');
    const currentIsDark = theme.includes('dark');
    const newThemeKey = currentIsDark ? themes[currentBase].light : themes[currentBase].dark;
    setTheme(newThemeKey);
  };

  const isThemeActive = (themeBase) => {
    const themeBaseName = theme.replace(/(-light|-dark)$/, '');
    return themeBaseName === themeBase;
  };

  const isDarkMode = () => {
    return theme.includes('dark');
  };

  const value = {
    theme,
    isDarkMode: isDarkMode(),
    themes: Object.keys(themes),
    themeInfo: themes,
    switchTheme,
    toggleDarkMode,
    isThemeActive,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};