/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f3',
          100: '#e1ede3',
          200: '#c5dcc9',
          300: '#9bc2a2',
          400: '#6ea377',
          500: '#4d8757',
          600: '#3a6c43',
          700: '#2f5636',
          800: '#27452d',
          900: '#1e3825',
          950: '#0e1d13',
        },
        nature: {
          dark: '#0f1c14',
          card: '#ffffff',
          surface: '#f5f7f5',
          accent: '#3e6b48',
          sage: '#8cae8d',
          sand: '#e8efe8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
