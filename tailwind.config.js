/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'risk-safe': '#22c55e',
        'risk-caution': '#facc15',
        'risk-warning': '#f97316',
        'risk-danger': '#ef4444',
      },
    },
  },
  plugins: [],
}

