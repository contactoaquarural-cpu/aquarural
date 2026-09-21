/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── "Prueba, no ambiente" (ref. CropSync) ────────────────────────
        trust:          '#1D4ED8', // Azul de confianza — acción principal
        'trust-dark':   '#1E3A8A',
        'tint-blue':    '#EFF6FF',
        'tint-mint':    '#ECFDF5',
        'tint-violet':  '#F5F3FF',
      },
      fontFamily: {
        sans:     ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
