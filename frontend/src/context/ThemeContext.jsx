import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('sg_theme');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('sg_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sg_theme', 'light');
    }
  }, [dark]);

  const value = useMemo(
    () => ({
      dark,
      toggle: () => setDark((d) => !d),
      setDark,
    }),
    [dark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
