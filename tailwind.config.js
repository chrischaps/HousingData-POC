/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        'price-up': '#10B981',
        'price-down': '#EF4444',
      },
    },
  },
  plugins: [],
}
