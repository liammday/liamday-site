# Spec: Migrate liamday.co.uk from Jekyll → Astro + React

**Date:** 2026-06-20
**Status:** Approved (design), in implementation
**Author:** Liam Day (with Claude)

## Goal

Convert the Jekyll + Tailwind static site into an **Astro + React + Tailwind v4**
site so its UI becomes a **design-syncable React component library**, unlocking
the claude.ai/design workflow — while keeping the site fully static on GitHub
Pages and preserving the current look, content, behaviour, URLs and SEO exactly.

## Locked decisions

- **Hybrid architecture**: a React component library is the design system (every
  reusable UI piece, design-synced); Astro handles routing, content collections,
  and page assembly. Zero-JS static output by default; hydrate only interactive
  islands.
- **Tailwind v4** (`@tailwindcss/vite`, CSS-first `@theme`).
- **Storybook included** (one story per UI component) for design-sync's
  screenshot-verified preview path.
- **GitHub Pages, fully static.** No backend.
- **Faithful visual parity** — no redesign in this migration.

## Target stack

Astro 5 (SSG) · React 19 (UI library, rendered static, hydrated where needed) ·
Tailwind v4 · MDX (case studies) · `@astrojs/sitemap` + `@astrojs/rss` ·
Storybook 9 (React/Vite) · GSAP + `@gsap/react` · Vitest (unit). Ruby/Jekyll
removed; Node-only toolchain.

## Repo structure (in-place, same repo)

```
astro.config.mjs
src/
  components/ui/        # React design system (design-synced)
  components/diagrams/  # the 6 architecture SVGs as .astro components
  layouts/             # BaseLayout / ProjectLayout / PostLayout (.astro)
  pages/               # index, projects/[...slug], posts/[...slug],
                       # peaking, peaking-privacy, style-guide, 404, rss.xml.ts
  content/             # projects/*.mdx, posts/*.md  (typed collections)
  content.config.ts    # collection schemas
  data/                # cv.yml, app_projects.yml (typed)
  lib/                 # experience-years util, etc.
  scripts/             # scroll-animations.ts (GSAP), spotlight.ts (global vanilla)
  styles/global.css    # Tailwind v4 @theme tokens + ported custom CSS
.storybook/
public/                # favicons, webmanifest, images, CNAME
.github/workflows/     # astro deploy (replaces jekyll-gh-pages.yml)
```

## Component library (the design system)

Authored as `.tsx`, rendered static by Astro; interactive ones hydrate.

- **Atoms:** `Button` (primary ember+texture / secondary outline / link, optional
  icon), `Badge`, `Tag`, `SurfacePanel` (card primitive + hover ring + spotlight
  glow), `SectionHeading`, icon set.
- **Molecules:** `StatCard`, `ExperienceCard`, `CapabilityCard`, `EducationPanel`,
  `ProjectCard` (rich app card), `MetaList`, `UpdateTimeline`, `LinksPanel`.
- **Organisms:** `Hero`, `ProjectsShowcase` *(interactive)*, `PageNav`
  *(interactive)*, `ThemePicker` *(interactive)*, `ContactSection`, `SiteFooter`.

Interactive islands hydrate (`client:idle`/`client:visible`); the rest is
zero-JS static.

## Content & data

- `_projects/*.md` → `src/content/projects/*.mdx` (typed Zod schema: title,
  description, summary, role, year, client, outcome, order, type, image,
  hero_image*, nav[], links[], date_updated, updates[]). MDX so embedded SVG
  diagrams, `not-prose` figures, and heading IDs port cleanly.
- `_posts/*.md` → `src/content/posts/`.
- `_data/cv.yml` + `app_projects.yml` → typed data (cv imported as YAML;
  app_projects as a data collection with a Zod schema).
- 6 SVG includes → `src/components/diagrams/*.astro`, embedded in the MDX.
- Liquid experience-years math → a TS util; `[[experience_years]]`
  interpolation preserved.

## Theming & CSS (Tailwind v4)

`global.css`: `@import "tailwindcss"` + `@theme` defining the
charcoal/graphite/aluminum/ember tokens; `[data-theme="light"]` overrides the
CSS vars (same mechanism as today). Port custom CSS — `surface-panel` (+
spotlight `::after`), `texture-noise`, `update-timeline`, `.lifeos-architecture`
diagram styling, prose tweaks, `theme-seg`, `page-nav-bleed` — into v4
`@layer`/`@utility`. `@plugin "@tailwindcss/typography"` for prose. The
**anti-FOUC inline theme script stays in `<head>` (`is:inline`)**.

## Interactivity

- React islands: `ProjectsShowcase` (sort featured/newest/oldest + multi-tag
  OR-filter), `ThemePicker` (light/auto/dark + cookie), `PageNav` (active-section
  tracking, sticky).
- Global vanilla scripts (reused, minimal change): GSAP ScrollTrigger reveals via
  `data-animate`; surface-panel spotlight — both honouring
  `prefers-reduced-motion` + `data-motion="off"`. Showcase dispatches a refresh
  event after reorder so GSAP re-measures (mirrors today's `ScrollTrigger.refresh()`).

## SEO / RSS / infra parity

Replicate `head.html` exactly (title pattern, description, favicons, webmanifest,
theme-color, OG 1200×630, twitter `summary_large_image`) via a head component +
`@astrojs/sitemap`. `@astrojs/rss` at jekyll-feed's path (`/feed.xml`, redirect
if needed). GoSquared analytics preserved. `public/CNAME` = `www.liamday.co.uk`.
All pretty URLs preserved (`/projects/:name/`, `/style-guide/`, `/peaking/`).

## Deploy

New Actions workflow: checkout → setup-node 22 → `npm ci` → `astro build` →
upload `dist/` → deploy-pages. Drops Ruby + Tailwind-CLI steps. Remove
Gemfile(.lock), `_config.yml`, `_site`, old npm CSS scripts.

## Migration sequence (each phase verified in the dev-server preview)

1. Scaffold + `global.css` tokens + BaseLayout (head/anti-FOUC/analytics/global
   scripts) → blank themed page renders.
2. Build `ui/` library + Storybook → verify each component (dark+light).
3. Port data + content (projects MDX with diagrams, posts, pages).
4. Assemble pages from components; wire data + experience-years util.
5. Port interactivity + reduced-motion.
6. SEO/RSS/sitemap/favicons/CNAME parity.
7. Swap deploy workflow; remove Jekyll; full page-by-page visual QA (dark/light,
   desktop/mobile).
8. Run `/design-sync`.
9. PR → main.

## Testing

Vitest unit tests for pure logic (experience-years util, showcase sort/filter).
Dev-server preview visual QA per page in both themes + mobile. Build clean, zero
console errors, SEO-meta parity check.

## Risks & mitigations

- **v4 token rewrite** (alpha modifiers, `@theme` + `[data-theme]`) → port and
  visually diff early, before building on it.
- **GSAP ↔ React re-render** → custom refresh event (mirrors current behaviour).
- **MDX vs kramdown** (`{: #id .class}`, includes, `not-prose`) → Astro auto-IDs
  headings; convert attr-lists during port; SVGs become components.
- **Custom domain** (no CNAME file today) → `public/CNAME` + confirm Pages
  settings.
- **RSS path** → match jekyll-feed, redirect if changed.

## Out of scope (YAGNI)

No backend/CMS/serverless. No redesign — visual parity now; design changes come
later via the claude.ai/design loop. No content rewriting. Monorepo deferred
(single repo).
