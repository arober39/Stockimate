export const colors = {
  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  surfaceLight: '#2C2C2E',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',

  // Accent colors
  primary: '#007AFF',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',

  // Chart colors
  chartGreen: '#34C759',
  chartRed: '#FF3B30',
  chartLine: '#007AFF',

  // Border colors
  border: '#38383A',
  borderLight: '#48484A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
