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
          900: 'rgb(var(--charcoal-900) / <alpha-value>)',
          950: 'rgb(var(--charcoal-950) / <alpha-value>)',
        },
        graphite: {
          600: 'rgb(var(--graphite-600) / <alpha-value>)',
          700: 'rgb(var(--graphite-700) / <alpha-value>)',
          800: 'rgb(var(--graphite-800) / <alpha-value>)',
        },
        aluminum: {
          100: 'rgb(var(--aluminum-100) / <alpha-value>)',
          200: 'rgb(var(--aluminum-200) / <alpha-value>)',
          300: 'rgb(var(--aluminum-300) / <alpha-value>)',
          400: 'rgb(var(--aluminum-400) / <alpha-value>)',
          500: 'rgb(var(--aluminum-500) / <alpha-value>)',
        },
        ember: {
          200: 'rgb(var(--ember-200) / <alpha-value>)',
          300: 'rgb(var(--ember-300) / <alpha-value>)',
          400: 'rgb(var(--ember-400) / <alpha-value>)',
          500: 'rgb(var(--ember-500) / <alpha-value>)',
          600: 'rgb(var(--ember-600) / <alpha-value>)',
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
