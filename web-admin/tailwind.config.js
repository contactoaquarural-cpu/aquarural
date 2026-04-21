/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Modo oscuro (clase .dark) ──────────────────────────────────────────
        'background':               '#111414',
        'surface':                  '#111414',
        'surface-dim':              '#111414',
        'surface-container-lowest': '#0c0f0e',
        'surface-container-low':    '#191c1c',
        'surface-container':        '#1d2020',
        'surface-container-high':   '#282a2a',
        'surface-container-highest':'#333535',
        'surface-bright':           '#373a39',
        'surface-variant':          '#333535',
        'surface-tint':             '#a5d0b9',

        'primary':                  '#a5d0b9',
        'primary-container':        '#1b4332',
        'on-primary':               '#0e3727',
        'on-primary-container':     '#86af99',

        'secondary':                '#c4c9b1',
        'secondary-container':      '#444937',
        'on-secondary':             '#2e3222',
        'on-secondary-container':   '#b3b8a1',

        'tertiary':                 '#f7ba8b',
        'tertiary-container':       '#59320e',
        'on-tertiary':              '#4c2704',
        'on-tertiary-container':    '#d39a6e',

        'error':                    '#ffb4ab',
        'error-container':          '#93000a',
        'on-error':                 '#690005',
        'on-error-container':       '#ffdad6',

        'on-surface':               '#e1e3e2',
        'on-surface-variant':       '#c1c8c2',
        'on-background':            '#e1e3e2',
        'outline':                  '#8b938d',
        'outline-variant':          '#414844',

        // Sidebar — igual en ambos modos
        'sidebar':                  '#022c22',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        label:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        full:    '9999px',
      },
    },
  },
  plugins: [],
};
