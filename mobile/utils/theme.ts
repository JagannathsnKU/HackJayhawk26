import { useColorScheme } from 'react-native';

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

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

const light: ThemeColors = {
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFC',
  border: '#E2E6EA',
  text: '#0F1720',
  textSecondary: '#3D4F5F',
  textMuted: '#6B7C8C',
  accent: '#1E4D8C',
  accentMuted: '#D6E4F5',
  success: '#1F7A4C',
  warning: '#B86B00',
  danger: '#B42318',
  onAccent: '#FFFFFF',
};

const dark: ThemeColors = {
  background: '#0C1014',
  surface: '#141A21',
  surfaceElevated: '#1A222C',
  border: '#2A3440',
  text: '#F1F5F9',
  textSecondary: '#C7D2DD',
  textMuted: '#8B9AAB',
  accent: '#6BA3E8',
  accentMuted: '#1E3A5C',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  onAccent: '#0B1220',
};

export function getThemeColors(scheme: 'light' | 'dark' | null | undefined): ThemeColors {
  return scheme === 'dark' ? dark : light;
}

export function useAppTheme(): ThemeColors {
  const scheme = useColorScheme();
  return getThemeColors(scheme);
}
