import React, { createContext, useContext, useState, useEffect } from 'react';

export const ACCENT_PRESETS = [
  { id: 'emerald', label: 'Emerald', color: '#34d399' },
  { id: 'lavender', label: 'Lavender', color: '#c084fc' },
  { id: 'cyan', label: 'Cyan', color: '#67e8f9' },
  { id: 'rose', label: 'Rose', color: '#fb7185' },
  { id: 'amber', label: 'Amber', color: '#fbbf24' },
  { id: 'indigo', label: 'Indigo', color: '#818cf8' },
  { id: 'peach', label: 'Peach', color: '#fdba74' },
  { id: 'mint', label: 'Mint', color: '#86efac' }
];

const THEME_STORAGE_KEY = 'sakukurata_theme_v1';

function hexToRgb(hex) {
  const clean = (hex || '#34d399').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return '52, 211, 153';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '{}');
      return saved.mode === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accentColor, setAccentColor] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '{}');
      return saved.accent || '#34d399';
    } catch {
      return '#34d399';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(themeMode);
    root.style.setProperty('--color-accent', accentColor);
    root.style.setProperty('--color-accent-rgb', hexToRgb(accentColor));

    try {
      localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ mode: themeMode, accent: accentColor })
      );
    } catch {
      // ignore storage errors
    }
  }, [themeMode, accentColor]);

  const toggleThemeMode = () => setThemeMode((m) => (m === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        toggleThemeMode,
        accentColor,
        setAccentColor,
        accentPresets: ACCENT_PRESETS
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
