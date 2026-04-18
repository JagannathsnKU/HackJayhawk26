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
const forestTheme: ThemeColors = {
  background: '#000000',
  surface: '#0A0A0A',
  surfaceElevated: '#151515',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#CFCFCF',
  textMuted: '#8A8A8A',
  accent: '#FFFFFF',
  accentMuted: 'rgba(255, 255, 255, 0.12)',
  success: '#BFBFBF',
  warning: '#9A9A9A',
  danger: '#7A7A7A',
  onAccent: '#000000',
};

export function getThemeColors(_scheme?: 'light' | 'dark' | null | undefined): ThemeColors {
  return forestTheme;
}

export function useAppTheme(): ThemeColors {
  return forestTheme;
}
