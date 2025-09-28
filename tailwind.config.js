/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/**/*.{html,md}',
    './projects/**/*.{html,md}',
    './_data/**/*.{yml,json}',
    './*.{html,md}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-xl': '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
