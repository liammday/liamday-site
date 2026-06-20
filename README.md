# Liam Day — liamday.co.uk

Personal portfolio and case-study site for Liam Day, built with **Astro + React + Tailwind CSS v4** and deployed to GitHub Pages. (Migrated from Jekyll; the UI is a React component library so designs can be authored in claude.ai/design with the real components.)

## Develop

```bash
npm install
npm run dev      # astro dev → http://localhost:4321
```

## Build

```bash
npm run build    # → dist/
npm run preview  # preview the production build locally
```

## Structure

- `src/pages/` — routes: home (`index.astro`), `projects/[...slug]`, `posts/[...slug]`, `peaking`, `peaking/privacy`, `style-guide`, `404`, `feed.xml`
- `src/content/` — case studies (`projects/*.mdx`) and posts (`posts/*.md`), typed via `src/content.config.ts`
- `src/components/ui/` — the React component library (the design system)
- `src/components/diagrams/` — inline architecture SVGs (loaded via `Diagram.astro`)
- `src/data/` — `cv.yml`, `app_projects.yml`, `site.ts` (typed)
- `src/styles/global.css` — Tailwind v4 `@theme` tokens + custom CSS; light/dark via `[data-theme]`
- `src/scripts/` — GSAP scroll reveals + spotlight, sticky-nav scroll-spy, theme toggle
- `public/` — static assets, favicons, `site.webmanifest`, `CNAME`

## Deploy

Pushing/merging to `main` runs `.github/workflows/deploy.yml`: `npm ci` → `astro build` → GitHub Pages. Custom domain `www.liamday.co.uk` is set via `public/CNAME`.

## Content authoring

- **Case studies:** add `src/content/projects/<slug>.mdx` with frontmatter (see existing files); embed diagrams with `<Diagram name="..." />`.
- **CV / project cards:** edit `src/data/cv.yml` and `src/data/app_projects.yml`.
- **Theme:** colour tokens live in `src/styles/global.css` (dark defaults + `[data-theme="light"]` overrides).
