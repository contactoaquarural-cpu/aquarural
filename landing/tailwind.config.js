/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:    '#5BB893',
        'primary-dark': '#3D9E78',
        'primary-light': '#a5d0b9',
        dark:       '#111414',
        'dark-card':'#1a2020',
        'dark-border': '#2a3530',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
