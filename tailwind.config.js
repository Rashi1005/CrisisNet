/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crisis-navy': '#0B1426',
        'crisis-red': '#E24B4A',
        'triage-amber': '#EF9F27',
        'safe-teal': '#1D9E75',
        'transfer-blue': '#378ADD',
        'defer-gray': '#888780',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}