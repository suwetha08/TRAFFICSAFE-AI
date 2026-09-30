/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg1: '#07111F',
        bg2: '#0B1728',
        bg3: '#101D30',
        card1: '#111F33',
        card2: '#14243A',
        primary: '#22D3EE',
        secondary: '#3B82F6',
        success: '#22C55E',
        warning: '#F59E0B',
        highrisk: '#F97316',
        critical: '#EF4444',
      }
    },
  },
  plugins: [],
}
