import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ mode: 'light', isDark: false, toggle: () => {} });

const applyTheme = (mode) => {
  document.documentElement.setAttribute('data-theme', mode);
};

const getInitial = () => {
  try {
    const saved = localStorage.getItem('hc-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitial);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      try {
        if (!localStorage.getItem('hc-theme')) setMode(e.matches ? 'dark' : 'light');
      } catch {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try { localStorage.setItem('hc-theme', next); } catch {}
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
