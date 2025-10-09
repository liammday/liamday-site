# Liam Day — Jekyll Site

This repository contains a Jekyll-powered portfolio site for product design leader Liam Day. It replaces the previous
Webflow implementation with a fully version-controlled static site.

## Getting started

1. Install Ruby dependencies with Bundler:
   ```bash
   bundle install
   ```
2. Install Node.js dependencies (Tailwind CSS build tooling):
   ```bash
   npm install
   ```
3. Generate the Tailwind CSS bundle:
   ```bash
   npm run build:css
   ```
4. Run the development server:
   ```bash
   bundle exec jekyll serve
   ```
5. Build the production site:
   ```bash
   bundle exec jekyll build
   ```

## Structure

- `_config.yml` — Site metadata, navigation, and plugin configuration.
- `_layouts/` — Page templates for the home page, case studies, and blog posts.
- `_data/cv.yml` — Structured data for the experience timeline and supporting copy.
- `projects/` — Case study content powered by a custom collection.
- `_posts/` — Articles listed in the Writing section.
- `assets/css/tailwind-source.css` — Tailwind entrypoint compiled via the Tailwind CLI.
- `assets/css/style.scss` — Global styles compiled by Jekyll’s Sass pipeline.
- `assets/js/gsap-animations.js` — Scroll-triggered animation hooks powered by GSAP.

## Animation hooks

- GSAP and the ScrollTrigger plugin load from the CDN in `_layouts/default.html`. The custom animation module initialises once the DOM is ready.
- Interactive elements opt in via `data-animate` attributes (e.g., `data-animate="hero-stat"`, `data-animate="experience-card"`). When adding new sections, reuse existing attribute names where possible or follow the same pattern to tap into shared behaviours.
- Motion respects both `prefers-reduced-motion: reduce` and a manual `data-motion="off"` attribute applied to either `<html>` or `<body>`, falling back to static end states when motion should be minimised.
- The sticky in-page navigation emits a `nav:active-change` event (from `assets/js/page-nav.js`) whenever the active section updates. The GSAP module listens for this to position the animated indicator; any future scripts can subscribe as well.

## Deployment

The generated site lives in the `_site` directory after running `jekyll build`. Deploy the contents of `_site` to any
static hosting provider (e.g. GitHub Pages, Netlify, Vercel).
