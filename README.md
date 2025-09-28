# Liam Day — Jekyll Site

This repository contains a Jekyll-powered portfolio site for product design leader Liam Day. It replaces the previous
Webflow implementation with a fully version-controlled static site.

## Getting started

1. Install dependencies with Bundler:
   ```bash
   bundle install
   ```
2. Run the development server:
   ```bash
   bundle exec jekyll serve
   ```
3. Build the production site:
   ```bash
   bundle exec jekyll build
   ```

## Structure

- `_config.yml` — Site metadata, navigation, and plugin configuration.
- `_layouts/` — Page templates for the home page, case studies, and blog posts.
- `_data/experience.yml` — Structured data for the experience timeline.
- `projects/` — Case study content powered by a custom collection.
- `_posts/` — Articles listed in the Writing section.
- `assets/css/style.scss` — Global styles compiled by Jekyll’s Sass pipeline.

## Deployment

The generated site lives in the `_site` directory after running `jekyll build`. Deploy the contents of `_site` to any
static hosting provider (e.g. GitHub Pages, Netlify, Vercel).
