import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readRaw, writeRaw } from '../utils/storage.js';

// Theme — Spec Sec. 11.4. The stored preference is 'light' | 'dark' |
// 'system' (default 'system' until the user toggles once). The resolved
// theme is applied as <html data-theme>; index.html runs the same logic
// inline before first paint so there is no flash.
const ThemeContext = createContext(null);
const THEME_KEY = 'shop.theme';

function systemTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => readRaw(THEME_KEY) || 'system');
  const [resolved, setResolved] = useState(() =>
    preference === 'system' ? systemTheme() : preference
  );

  useEffect(() => {
    const next = preference === 'system' ? systemTheme() : preference;
    setResolved(next);
    document.documentElement.setAttribute('data-theme', next);
    writeRaw(THEME_KEY, preference);
  }, [preference]);

  // Follow the OS while the preference is 'system'.
  useEffect(() => {
    if (preference !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(systemTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      const current = prev === 'system' ? systemTheme() : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ theme: resolved, preference, toggleTheme }),
    [resolved, preference, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
