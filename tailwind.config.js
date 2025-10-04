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
          "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImdyYWluIiB4PSItMjAlIiB5PSItMjAlIiB3aWR0aD0iMTQwJSIgaGVpZ2h0PSIxNDAlIj4KICAgICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iMyIgc2VlZD0iMTciIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz4KICAgICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgICAgPGZlRnVuY0EgdHlwZT0ibGluZWFyIiBzbG9wZT0iMC4yIi8+CiAgICAgIDwvZmVDb21wb25lbnRUcmFuc2Zlcj4KICAgIDwvZmlsdGVyPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJzaGVlbiIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMjMyNjJhIiBzdG9wLW9wYWNpdHk9IjAuNiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxNjE4MWMiIHN0b3Atb3BhY2l0eT0iMC44NSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMWExYzFmIi8+CiAgPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ1cmwoI3NoZWVuKSIvPgogIDxyZWN0IHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzFmMjEyNiIgZmlsdGVyPSJ1cmwoI2dyYWluKSIgb3BhY2l0eT0iMC40NSIvPgo8L3N2Zz4=')",
      },
      boxShadow: {
        glow: '0 20px 40px -20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
