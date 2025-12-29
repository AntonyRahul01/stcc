/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#dc2626',
          orange: '#f97316',
          gold: '#fbbf24',
          darkGold: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['MuktaVaani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
