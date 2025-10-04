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
          900: '#101215',
          950: '#07080a',
        },
        graphite: {
          600: '#26292e',
          700: '#1d2024',
          800: '#15181b',
        },
        aluminum: {
          100: '#e4e7ec',
          200: '#c5c8d0',
          300: '#9da1a9',
          400: '#787c84',
          500: '#5a5e65',
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
          "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnIHNoYXBlLXJlbmRlcmluZz0nY3Jpc3BFZGdlcyc+CjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyMxYTFjMWYnLz4KPHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzEnIGhlaWdodD0nMScgZmlsbD0nIzIzMjYyYScgb3BhY2l0eT0nMC44Jy8+CjxyZWN0IHg9JzInIHk9JzAnIHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMyYjJmMzQnIG9wYWNpdHk9JzAuNycvPgo8cmVjdCB4PScxJyB5PScxJyB3aWR0aD0nMScgaGVpZ2h0PScxJyBmaWxsPScjMjAyMzI3JyBvcGFjaXR5PScwLjknLz4KPHJlY3QgeD0nMycgeT0nMScgd2lkdGg9JzEnIGhlaWdodD0nMScgZmlsbD0nIzJlMzIzNycgb3BhY2l0eT0nMC42NScvPgo8cmVjdCB4PScwJyB5PScyJyB3aWR0aD0nMScgaGVpZ2h0PScxJyBmaWxsPScjMjgyYzMxJyBvcGFjaXR5PScwLjc1Jy8+CjxyZWN0IHg9JzInIHk9JzMnIHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMyMTI0MjgnIG9wYWNpdHk9JzAuODUnLz4KPC9zdmc+')",
      },
      boxShadow: {
        glow: '0 20px 40px -20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
