/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rosa da marca (fundo da logo)
        rosa: {
          50: '#fdf2f6',
          100: '#fce7ef',
          200: '#fbcfdf',
          300: '#f8a8c2',
          400: '#f37399',
          500: '#e02a5a', // primária — cor da logo
          600: '#cc1f4d',
          700: '#ab1740',
          800: '#8e1639',
          900: '#791635',
        },
        // Dourado da marca (letras da logo)
        dourado: {
          50: '#fefaf0',
          100: '#fdf2d9',
          200: '#fbe3ad',
          300: '#fbc471', // acento — cor das letras
          400: '#f7ad4d',
          500: '#f1902a',
          600: '#dd7020',
          700: '#b8531d',
          800: '#95421e',
          900: '#7a381c',
        },
        // Neutros quentes (off-white cremoso → carvão)
        creme: '#fdf8f3',
        carvao: '#1f1720',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(31, 23, 32, 0.12)',
        card: '0 8px 32px -12px rgba(224, 42, 90, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
