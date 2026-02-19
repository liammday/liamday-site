/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/**/*.{html,md}',
    './_projects/**/*.{html,md}',
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
          200: '#f9b98b',
          300: '#f6a268',
          400: '#f08b4a',
          500: '#d87435',
          600: '#b75c29',
        },
      },
      backgroundImage: {
        'anodised-aluminum':
          "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc4MCcgaGVpZ2h0PSc4MCcgdmlld0JveD0nMCAwIDgwIDgwJz4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9J2dyYWluJyB4PSctMjAlJyB5PSctMjAlJyB3aWR0aD0nMTQwJScgaGVpZ2h0PScxNDAlJz4KICAgICAgPGZlVHVyYnVsZW5jZSB0eXBlPSdmcmFjdGFsTm9pc2UnIGJhc2VGcmVxdWVuY3k9JzAuOScgbnVtT2N0YXZlcz0nMycgc2VlZD0nMTcnIHN0aXRjaFRpbGVzPSdzdGl0Y2gnLz4KICAgICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgICAgPGZlRnVuY0EgdHlwZT0nbGluZWFyJyBzbG9wZT0nMC4yJy8+CiAgICAgIDwvZmVDb21wb25lbnRUcmFuc2Zlcj4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0nODAnIGhlaWdodD0nODAnIGZpbGw9JyMxYTFjMWYnLz4KICA8cmVjdCB3aWR0aD0nODAnIGhlaWdodD0nODAnIGZpbGw9JyMxZjIxMjYnIGZpbHRlcj0ndXJsKCNncmFpbiknIG9wYWNpdHk9JzAuNDUnLz4KPC9zdmc+Cg==')",
      },
      boxShadow: {
        glow: '0 20px 40px -20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
