export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

/** Horizontal inset aligned with welcome / hero for scroll screens. */
export const screenPaddingX = 24;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  success: string;
  warning: string;
  danger: string;
  onAccent: string;
};

/**
 * Unified black / white / gray palette so every screen matches the landing look.
 * System light/dark does not switch palettes — one consistent chrome.
 */
const monochrome: ThemeColors = {
  background: '#000000',
  surface: '#0a0a0a',
  surfaceElevated: '#111111',
  border: '#2a2a2a',
  text: '#fafafa',
  textSecondary: '#e5e5e5',
  textMuted: '#a3a3a3',
  accent: '#ffffff',
  accentMuted: 'rgba(255, 255, 255, 0.1)',
  success: '#86efac',
  warning: '#fcd34d',
  danger: '#fca5a5',
  onAccent: '#000000',
};

export function getThemeColors(_scheme?: 'light' | 'dark' | null | undefined): ThemeColors {
  return monochrome;
}

export function useAppTheme(): ThemeColors {
  return monochrome;
}
