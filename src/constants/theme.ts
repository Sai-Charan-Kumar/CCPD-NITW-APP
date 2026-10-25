import { StyleSheet } from 'react-native';

export const COLORS = {
  // Brand Primary & Academic Navy
  primary: '#0F2552',
  primaryLight: '#1E3A8A',
  primaryAccent: '#2563EB',
  primarySoft: '#EFF6FF',

  // Secondary & Accents
  secondary: '#4F46E5',
  secondaryLight: '#EEF2FF',
  teal: '#0D9488',
  tealLight: '#F0FDFA',
  cyan: '#0284C7',

  // Status & Semantic Colors
  success: '#10B981',
  successDark: '#047857',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#F59E0B',
  warningDark: '#B45309',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',

  danger: '#EF4444',
  dangerDark: '#B91C1C',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',

  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  purpleBorder: '#DDD6FE',

  // Neutrals & Surface Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  surfaceHover: '#E2E8F0',

  // Borders & Dividers
  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Category Colors
  categorySoftware: '#2563EB',
  categoryCore: '#D97706',
  categoryData: '#7C3AED',
  categoryFinance: '#059669',
  categoryProduct: '#0891B2',
  categoryConsulting: '#4F46E5',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const TAB_BAR_RESERVED_HEIGHT = 160;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  h4: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
};

export const SHADOWS = StyleSheet.create({
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
});
