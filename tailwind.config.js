/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          450: '#f59e0b',
          550: '#d97706',
          950: '#170c03'
        },
        gold: {
          400: '#fbbf24',
          500: '#d4af37',
          600: '#b8860b'
        },
        dark: {
          900: '#0d0b09',
          800: '#14110e',
          700: '#1e1a15',
          600: '#2a241e'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
