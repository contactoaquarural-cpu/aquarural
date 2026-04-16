// Sistema de diseño — "Digital Agronomist" Dark Mode
// Mismos tokens que el panel web, adaptados para React Native

export const colors = {
  // Superficies
  background:               '#111414',
  surface:                  '#161A1A',
  surfaceContainerLow:      '#191c1c',
  surfaceContainer:         '#1d2020',
  surfaceContainerHigh:     '#282a2a',
  surfaceContainerHighest:  '#333535',

  // Primario (verde esmeralda)
  primary:            '#a5d0b9',
  primaryContainer:   '#1b4332',
  onPrimary:          '#00200f',
  onPrimaryContainer: '#c2e8d4',

  // Terciario (tierra/urgente)
  tertiary:            '#f7ba8b',
  tertiaryContainer:   '#59320e',
  onTertiary:          '#33180a',
  onTertiaryContainer: '#ffdcc2',

  // Texto
  onSurface:        '#e1e3e2',
  onSurfaceVariant: '#c1c8c2',

  // Error
  error:          '#ffb4ab',
  errorContainer: '#93000a',

  // Contornos
  outline:        '#8b9490',
  outlineVariant: '#414946',

  // Estados del asociado
  alDia:    '#4ade80',   // verde
  enMora:   '#f7ba8b',   // tierra/naranja
  inactivo: '#ffb4ab',   // rojo

  // Especiales
  sidebar: '#022c22',
  white:   '#ffffff',
  black:   '#000000',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const typography = {
  displayLg: { fontSize: 36, fontWeight: '800', color: colors.onSurface, letterSpacing: -1 },
  displayMd: { fontSize: 28, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5 },
  h1:        { fontSize: 24, fontWeight: '700', color: colors.onSurface },
  h2:        { fontSize: 20, fontWeight: '700', color: colors.onSurface },
  h3:        { fontSize: 17, fontWeight: '600', color: colors.onSurface },
  body:      { fontSize: 15, fontWeight: '400', color: colors.onSurfaceVariant },
  bodyBold:  { fontSize: 15, fontWeight: '600', color: colors.onSurface },
  small:     { fontSize: 13, fontWeight: '400', color: colors.onSurfaceVariant },
  smallBold: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
  label:     { fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase' },
  mono:      { fontSize: 14, fontFamily: 'monospace', color: colors.onSurfaceVariant },
};

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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};
