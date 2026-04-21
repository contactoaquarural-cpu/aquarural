import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Paleta oscura (actual) ───────────────────────────────────────────────────
export const darkColors = {
  background:               '#111414',
  surface:                  '#161A1A',
  surfaceContainerLow:      '#191c1c',
  surfaceContainer:         '#1d2020',
  surfaceContainerHigh:     '#282a2a',
  surfaceContainerHighest:  '#333535',

  primary:            '#a5d0b9',
  primaryContainer:   '#1b4332',
  onPrimary:          '#00200f',
  onPrimaryContainer: '#c2e8d4',

  tertiary:            '#f7ba8b',
  tertiaryContainer:   '#59320e',
  onTertiary:          '#33180a',
  onTertiaryContainer: '#ffdcc2',

  onSurface:        '#e1e3e2',
  onSurfaceVariant: '#c1c8c2',

  error:          '#ffb4ab',
  errorContainer: '#93000a',

  outline:        '#8b9490',
  outlineVariant: '#414946',

  alDia:    '#4ade80',
  enMora:   '#f7ba8b',
  inactivo: '#ffb4ab',

  sidebar: '#022c22',
  white:   '#ffffff',
  black:   '#000000',
};

// ─── Paleta clara ─────────────────────────────────────────────────────────────
export const lightColors = {
  background:               '#f0f2f0',
  surface:                  '#ffffff',
  surfaceContainerLow:      '#f5f7f5',
  surfaceContainer:         '#eaeeeb',
  surfaceContainerHigh:     '#dde3de',
  surfaceContainerHighest:  '#d0d8d2',

  primary:            '#1b4332',
  primaryContainer:   '#d4ede2',
  onPrimary:          '#ffffff',
  onPrimaryContainer: '#00200f',

  tertiary:            '#8b4a1a',
  tertiaryContainer:   '#ffdcc2',
  onTertiary:          '#ffffff',
  onTertiaryContainer: '#33180a',

  onSurface:        '#111414',
  onSurfaceVariant: '#3d4a42',

  error:          '#ba1a1a',
  errorContainer: '#ffdad6',

  outline:        '#6f7970',
  outlineVariant: '#bec9c0',

  alDia:    '#1b6b3a',
  enMora:   '#8b4a1a',
  inactivo: '#ba1a1a',

  sidebar: '#022c22',
  white:   '#ffffff',
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
