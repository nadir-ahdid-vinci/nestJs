/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Activation du mode sombre via la classe
  important: '#root',
  theme: {
    extend: {
      backgroundColor: {
        'dark': '#1a1a1a',
        'dark-paper': '#2d2d2d',
      },
    },
  },
  plugins: [],
}