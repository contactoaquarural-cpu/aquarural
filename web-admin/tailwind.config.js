/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Paleta Hydro-Tech AquaRural ──────────────────────────────────────
        'background':               '#090D16', // Deep Slate / Obsidian Blue
        'surface':                  '#0F172A', // Slate 900
        'surface-dim':              '#0F172A',
        'surface-container-lowest': '#050913',
        'surface-container-low':    '#111827', // Gray 900
        'surface-container':        '#1E293B', // Slate 800
        'surface-container-high':   '#334155', // Slate 700
        'surface-container-highest':'#475569', // Slate 600
        'surface-bright':           '#38BDF8', // Cyan 400
        'surface-variant':          '#1E293B',
        'surface-tint':             '#0EA5E9',

        'primary':                  '#0EA5E9', // Cyan Hydro 500
        'primary-container':        '#0369A1', // Cyan 700
        'on-primary':               '#FFFFFF',
        'on-primary-container':     '#E0F2FE',

        'secondary':                '#10B981', // Emerald Fresh 500
        'secondary-container':      '#047857', // Emerald 700
        'on-secondary':             '#FFFFFF',
        'on-secondary-container':   '#D1FAE5',

        'tertiary':                 '#06B6D4', // Electric Aqua
        'tertiary-container':       '#0E7490',
        'on-tertiary':              '#FFFFFF',
        'on-tertiary-container':    '#CFFAFE',

        'error':                    '#F87171', // Red 400
        'error-container':          '#991B1B',
        'on-error':                 '#FFFFFF',
        'on-error-container':       '#FEE2E2',

        'on-surface':               '#F8FAFC', // Slate 50
        'on-surface-variant':       '#94A3B8', // Slate 400
        'on-background':            '#F8FAFC',
        'outline':                  '#334155',
        'outline-variant':          '#1E293B',

        // Estado del suscriptor / factura
        'alDia':    '#10B981',
        'enMora':   '#F59E0B',
        'inactivo': '#EF4444',

        'sidebar':                  '#0A1120', // Ultra Deep Hydro
      },
      fontFamily: {
        headline: ['Outfit', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        label:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        full:    '9999px',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // Entrada de contenido: corta y con leve desplazamiento para que
        // se sienta como "asentarse", no como un parpadeo de opacidad.
        'fade-in': 'fade-in 280ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      transitionTimingFunction: {
        // Reemplaza el 'ease' lineal-ish por defecto de transition-* en todo
        // el panel por una curva más orgánica para hover/estados rápidos.
        DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        DEFAULT: '160ms',
      },
    },
  },
  plugins: [],
};
