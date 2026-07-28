import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '../types/chat';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => undefined,
});

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('wa-reader-theme');
    return (stored as Theme) || 'dark';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('wa-reader-theme', t);
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
