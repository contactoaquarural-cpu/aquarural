/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:        '#0EA5E9', // Cyan Hydro 500
        'primary-dark': '#0284C7', // Cyan 600
        'primary-light':'#38BDF8', // Cyan 400
        secondary:      '#10B981', // Emerald Fresh 500
        accent:         '#06B6D4', // Electric Aqua
        dark:           '#090D16', // Deep Slate
        'dark-card':    '#0F172A', // Slate 900
        'dark-border':  '#1E293B', // Slate 800
      },
      fontFamily: {
        sans:     ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
