/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/**/*.{html,md}',
    './projects/**/*.{html,md}',
    './_experiences/**/*.{html,md}',
    './_data/**/*.{yml,json}',
    './*.{html,md}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: '#141619',
          950: '#0b0d0f',
        },
        graphite: {
          600: '#2d3036',
          700: '#23262b',
          800: '#1b1e22',
        },
        aluminum: {
          100: '#f1f3f6',
          200: '#d7d9df',
          300: '#b1b4bb',
          400: '#8c9098',
          500: '#6f737a',
        },
        ember: {
          200: '#f7a76b',
          300: '#f28a45',
          400: '#d8742f',
          500: '#bb5f24',
          600: '#9d4b1b',
        },
      },
      backgroundImage: {
        'anodised-aluminum':
          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(18,19,22,0.08) 35%, rgba(255,255,255,0.05) 60%, rgba(5,6,8,0.15) 100%), radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 55%)',
      },
      boxShadow: {
        glow: '0 20px 40px -20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
