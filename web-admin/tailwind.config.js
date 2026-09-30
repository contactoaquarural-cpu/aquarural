/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
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
