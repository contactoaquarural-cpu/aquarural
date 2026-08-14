import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Paleta oscura Hydro-Tech (AquaRural) ──────────────────────────────────────
export const darkColors = {
  background:               '#090D16', // Deep Slate
  surface:                  '#0F172A', // Slate 900
  surfaceContainerLow:      '#111827',
  surfaceContainer:         '#1E293B', // Slate 800
  surfaceContainerHigh:     '#334155', // Slate 700
  surfaceContainerHighest:  '#475569', // Slate 600

  primary:            '#0EA5E9', // Cyan Hydro 500
  primaryContainer:   '#0369A1', // Cyan 700
  onPrimary:          '#FFFFFF',
  onPrimaryContainer: '#E0F2FE',

  tertiary:            '#06B6D4', // Electric Aqua
  tertiaryContainer:   '#0E7490',
  onTertiary:          '#FFFFFF',
  onTertiaryContainer: '#CFFAFE',

  secondary:           '#10B981', // Emerald Fresh

  onSurface:        '#F8FAFC', // Slate 50
  onSurfaceVariant: '#94A3B8', // Slate 400

  error:          '#F87171',
  errorContainer: '#991B1B',

  outline:        '#334155',
  outlineVariant: '#1E293B',

  alDia:    '#10B981',
  enMora:   '#F59E0B',
  inactivo: '#EF4444',

  sidebar: '#0A1120',
  white:   '#FFFFFF',
  black:   '#000000',
};

// ─── Paleta clara Hydro-Tech (AquaRural) ──────────────────────────────────────
export const lightColors = {
  background:               '#F0F9FF', // Ice Blue Mist
  surface:                  '#FFFFFF',
  surfaceContainerLow:      '#F8FAFC',
  surfaceContainer:         '#E2E8F0',
  surfaceContainerHigh:     '#CBD5E1',
  surfaceContainerHighest:  '#94A3B8',

  primary:            '#0284C7', // Cyan 600
  primaryContainer:   '#E0F2FE', // Cyan 100
  onPrimary:          '#FFFFFF',
  onPrimaryContainer: '#0369A1',

  tertiary:            '#0891B2', // Cyan 600
  tertiaryContainer:   '#CFFAFE',
  onTertiary:          '#FFFFFF',
  onTertiaryContainer: '#0E7490',

  secondary:           '#059669', // Emerald 600

  onSurface:        '#0F172A', // Slate 900
  onSurfaceVariant: '#475569', // Slate 600

  error:          '#DC2626',
  errorContainer: '#FEE2E2',

  outline:        '#CBD5E1',
  outlineVariant: '#E2E8F0',

  alDia:    '#059669',
  enMora:   '#D97706',
  inactivo: '#DC2626',

  sidebar: '#0F172A',
  white:   '#FFFFFF',
  black:   '#000000',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
export const getColors = (isDark) => isDark ? darkColors : lightColors;

// Por defecto exporta oscuro para compatibilidad con imports existentes
export const colors = darkColors;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const makeTypography = (c) => ({
  displayLg: { fontSize: 36, fontWeight: '800', color: c.onSurface, letterSpacing: -1 },
  displayMd: { fontSize: 28, fontWeight: '800', color: c.onSurface, letterSpacing: -0.5 },
  h1:        { fontSize: 24, fontWeight: '700', color: c.onSurface },
  h2:        { fontSize: 20, fontWeight: '700', color: c.onSurface },
  h3:        { fontSize: 17, fontWeight: '600', color: c.onSurface },
  body:      { fontSize: 15, fontWeight: '400', color: c.onSurfaceVariant },
  bodyBold:  { fontSize: 15, fontWeight: '600', color: c.onSurface },
  small:     { fontSize: 13, fontWeight: '400', color: c.onSurfaceVariant },
  smallBold: { fontSize: 13, fontWeight: '600', color: c.onSurface },
  label:     { fontSize: 11, fontWeight: '700', color: c.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase' },
  mono:      { fontSize: 14, fontFamily: 'monospace', color: c.onSurfaceVariant },
});

// Tipografía por defecto (oscuro)
export const typography = makeTypography(darkColors);

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: darkColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: darkColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const THEME_KEY = '@asoga_theme';
