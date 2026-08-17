/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c'
        },
        neutral: {
          100: '#f5f5f5',
          600: '#525252',
          800: '#262626'
        }
      }
    },
  },
  plugins: [],
}

