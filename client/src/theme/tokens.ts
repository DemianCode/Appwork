export type ThemeTokens = {
  bg: string; surface: string; card: string; border: string;
  accent: string; accentDim: string; green: string; red: string;
  text: string; muted: string; dim: string;
};

export const DARK: ThemeTokens = {
  bg: '#0b0c14', surface: '#12131f', card: '#191a2a', border: '#252636',
  accent: '#818cf8', accentDim: '#818cf815', green: '#34d399', red: '#f87171',
  text: '#e2e4f0', muted: '#7a7fa3', dim: '#1e2030',
};

export const LIGHT: ThemeTokens = {
  bg: '#f0f2f8', surface: '#ffffff', card: '#ffffff', border: '#dde0ef',
  accent: '#6366f1', accentDim: '#6366f112', green: '#059669', red: '#dc2626',
  text: '#1a1c2e', muted: '#5a5e7a', dim: '#f4f5fb',
};
