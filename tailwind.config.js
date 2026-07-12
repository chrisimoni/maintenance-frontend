/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef3fb',
          100: '#d5e2f5',
          200: '#abc5eb',
          300: '#81a8e1',
          400: '#578bd7',
          500: '#2B5BA8',
          600: '#244e91',
          700: '#1d3f76',
          800: '#16305b',
          900: '#0f2040',
        },
        accent: {
          50:  '#fef2f2',
          100: '#fde0df',
          200: '#fbbfbd',
          300: '#f89e9b',
          400: '#f57d79',
          500: '#E84234',
          600: '#c4372b',
          700: '#a02d23',
          800: '#7c221b',
          900: '#581813',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
