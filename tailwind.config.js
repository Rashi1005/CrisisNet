/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
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
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}