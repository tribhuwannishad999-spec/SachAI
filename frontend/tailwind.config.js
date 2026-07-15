/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        bgdark: '#0F172A',
      },
      fontFamily: {
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
        display: ['"Baloo 2"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
