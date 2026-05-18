import { createContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { DARK, LIGHT, ThemeTokens } from './tokens';

type Ctx = { tokens: ThemeTokens; dark: boolean; toggle: () => void };
export const ThemeCtx = createContext<Ctx>({ tokens: DARK, dark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('appwork-theme') !== 'light'; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem('appwork-theme', dark ? 'dark' : 'light'); } catch {}
    document.documentElement.style.background = dark ? DARK.bg : LIGHT.bg;
  }, [dark]);
  const value = useMemo(() => ({ tokens: dark ? DARK : LIGHT, dark, toggle: () => setDark((d) => !d) }), [dark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
