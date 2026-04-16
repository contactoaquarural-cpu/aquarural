/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode tokens (design system ASOGACENTRO)
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
        'primary-fixed':            '#c1ecd4',
        'primary-fixed-dim':        '#a5d0b9',
        'inverse-primary':          '#3f6653',

        'on-primary':               '#0e3727',
        'on-primary-container':     '#86af99',
        'on-primary-fixed':         '#002114',
        'on-primary-fixed-variant': '#274e3d',

        'secondary':                '#c4c9b1',
        'secondary-container':      '#444937',
        'secondary-fixed':          '#e0e5cc',
        'secondary-fixed-dim':      '#c4c9b1',
        'on-secondary':             '#2e3222',
        'on-secondary-container':   '#b3b8a1',
        'on-secondary-fixed':       '#191d0e',
        'on-secondary-fixed-variant':'#444937',

        'tertiary':                 '#f7ba8b',
        'tertiary-container':       '#59320e',
        'tertiary-fixed':           '#ffdcc3',
        'tertiary-fixed-dim':       '#f7ba8b',
        'on-tertiary':              '#4c2704',
        'on-tertiary-container':    '#d39a6e',
        'on-tertiary-fixed':        '#2f1500',
        'on-tertiary-fixed-variant':'#663d18',

        'error':                    '#ffb4ab',
        'error-container':          '#93000a',
        'on-error':                 '#690005',
        'on-error-container':       '#ffdad6',

        'on-surface':               '#e1e3e2',
        'on-surface-variant':       '#c1c8c2',
        'on-background':            '#e1e3e2',
        'inverse-surface':          '#e1e3e2',
        'inverse-on-surface':       '#2e3131',

        'outline':                  '#8b938d',
        'outline-variant':          '#414844',

        // Sidebar
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
