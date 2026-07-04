# Theme-aware project icons & hero images

**Date:** 2026-07-04
**Status:** Approved (design), pending implementation plan

## Problem

The site supports a light and a dark theme, but every project icon and case-study
hero image is a single asset tuned for the dark theme. In light mode the warm-dark
AI hero SVGs and the app-icon tiles sit against a light page, and the iOS apps have
no dark-appearance icon at all. We want each project icon and hero image to present
a light and a dark variant that tracks the active theme.

Two cohorts, handled differently:

- **AI projects** (Career Pivot Navigator, Open Defence Radar, PodForge, LifeOS,
  Claude Usage Pacer) — icons and heroes are authorable SVGs (plus one raster icon,
  LifeOS). Light variants are produced in-repo.
- **iOS apps** (Peaking, Training, Squash Tracker) — raster app-icon tiles only, no
  heroes. A correct dark-appearance icon must be exported from Apple's **Icon
  Composer** on the desktop. This spec wires the slots; the export is a later
  handoff.

## Constraints & context

- The theme is a **manual toggle**: `theme-toggle.ts` sets `data-theme="light"` on
  `<html>` (dark is the default — no attribute). It is cookie-backed, and an
  anti-FOUC inline script in `BaseLayout.astro` applies the attribute before first
  paint. Any image solution must follow this *manual* choice, not merely the OS
  `prefers-color-scheme`.
- Data lives in two places: `src/data/app_projects.yml` (`icon` / `icon_webp`,
  consumed by `ProjectCard.tsx` via `<picture>`), and per-project MDX frontmatter
  (`hero_image` / `hero_image_webp`, consumed by `ProjectLayout.astro`). The MDX
  schema is validated in `src/content.config.ts`.
- Assets are small: AI icons/heroes are SVG (a few KB, vector); app tiles are
  ≤256px raster with `.webp` + `.png`.

## Non-goals (agreed out of scope)

- OG / social-share cards (rendered by external platforms that cannot read the site
  theme — one canonical variant per link regardless).
- Inline product screenshots (e.g. Open Defence Radar console / trust dashboard) —
  real UI captures; a light version means re-capturing the app, a separate job.
- Homepage hero / profile photo.

## Design

### 1. Resolution model (data)

Symmetric and backwards-compatible. Each image slot keeps its current field as the
**default** and gains two optional theme overrides:

| Slot   | Default        | Light override            | Dark override            |
|--------|----------------|---------------------------|--------------------------|
| Icon   | `icon` (+`_webp`) | `icon_light` (+`_webp`) | `icon_dark` (+`_webp`)   |
| Hero   | `hero_image` (+`_webp`) | `hero_image_light` (+`_webp`) | `hero_image_dark` (+`_webp`) |

**Resolver:**

- Dark theme (default) → `*_dark ?? default`
- Light theme → `*_light ?? default`

Consequences:

- **Nothing breaks before new assets land.** A missing variant resolves to today's
  asset on both themes — current behaviour exactly.
- **Both cohorts fit without polarity confusion.** AI projects keep today's
  warm-dark asset as `default` and add `*_light`. iOS apps keep today's tile as
  `default` and add `icon_dark`.

Schema/typing changes:

- `src/content.config.ts`: add `hero_image_light`, `hero_image_light_webp`,
  `hero_image_dark`, `hero_image_dark_webp` (all `z.string().optional()`).
- `src/data/projects.ts` (`AppProject` interface): add `icon_light`,
  `icon_light_webp`, `icon_dark`, `icon_dark_webp` (all `string?`).

### 2. Swap mechanism (rendering)

Render **both** the light and the dark `<picture>` and toggle visibility with CSS
keyed on `:root[data-theme="light"]`. This was chosen over two rejected
alternatives:

- **A. Dual `<picture>` + CSS `data-theme` toggle** — chosen.
- B. `<picture media="(prefers-color-scheme…)">` — follows the OS, ignores the
  manual toggle, images desync from the page. Rejected.
- C. JS swap on toggle — reintroduces FOUC risk and complexity. Rejected.

Rationale for A: no JS; no flash (the anti-FOUC inline script sets `data-theme`
before first paint, so the correct variant is visible immediately); the extra fetch
is negligible for these asset sizes, and when a variant is absent both `<picture>`s
point at the same file, which the browser dedupes.

Two utility classes in `src/styles/global.css`:

```css
/* dark is the default theme (no data-theme attribute) */
.theme-light-only { display: none; }
:root[data-theme='light'] .theme-dark-only { display: none; }
:root[data-theme='light'] .theme-light-only { display: revert; }
```

(Applied to the wrapper `<picture>` elements; `display: revert` restores the
element's natural display so layout/sizing classes are unaffected.)

Shared components, same markup contract, one per rendering context:

- `src/components/ui/ThemedImage.tsx` — React, used by `ProjectCard.tsx`.
- `src/components/ui/ThemedImage.astro` — Astro, used by `ProjectLayout.astro` for
  the hero.

Each takes resolved `light`/`dark` sources (each optionally with a `webp` sibling),
plus `alt`, `width`, `height`, `className`, and `loading`. It renders two
`<picture>` wrappers with the toggle classes. When light and dark resolve to the
same src, it may still render both (browser dedupes) to keep the component simple.

Wiring:

- `ProjectCard.tsx`: replace the single icon `<picture>` block with `ThemedImage`,
  passing `light = { src: icon_light ?? icon, webp: icon_light_webp ?? icon_webp }`
  and `dark = { src: icon_dark ?? icon, webp: icon_dark_webp ?? icon_webp }`.
  Preserve the existing placeholder branch for projects with no `icon`.
- `ProjectLayout.astro`: replace the hero `<picture>` inside the `<figure>` with
  `ThemedImage.astro`, resolving `hero_image_light/dark` against `hero_image` and
  their `_webp` siblings. Caption/figure markup unchanged.

### 3. AI-project assets (authored in-repo, this feature)

Author **light SVG variants**: light field, retuned gradient stops, preserved
composition and ember accents. Naming appends `-light` before the extension.

Heroes (5) → `*-hero-light.svg`:

- `career-pivot-navigator-hero.svg`
- `open-defence-radar-hero.svg`
- `podforge-hero.svg`
- `lifeos-hero.svg`
- `claude-usage-pacer-hero.svg`

Icons (4 SVG) → `*-icon-light.svg`:

- `career-pivot-navigator-icon.svg`
- `open-defence-radar-icon.svg`
- `podforge-icon.svg`
- `claude-usage-pacer-icon.svg`

LifeOS icon (raster special case): the current icon is `LifeOSAppIcon-256.png`, a
raster app-tile, not an SVG. Author a fresh **light SVG mark** consistent with the
LifeOS constellation motif (central ember spine + eight nodes) → `lifeos-icon-light.svg`,
wired via `icon_light`. The dark/default icon stays the existing raster.

Each MDX file gains `hero_image_light` (+ `_webp` if a webp is produced; heroes are
SVG so a webp sibling is optional and can be omitted). Each AI entry in
`app_projects.yml` gains `icon_light`.

### 4. iOS app assets (slots now, desktop export later)

Add `icon_dark` / `icon_dark_webp` for Peaking, Training, Squash Tracker in
`app_projects.yml`. File naming: `<App>AppIcon-256-dark.png` (+ `.webp`, generated
from the PNG during implementation once the PNG exists).

Handoff document committed at `docs/handoff/ios-dark-app-icons.md`:

1. In **Icon Composer**, open the app's icon and export the **Dark** appearance at
   1024×1024 PNG.
2. Downscale to 256×256 and save as
   `public/assets/images/projects/<App>AppIcon-256-dark.png` (`<App>` ∈
   `Peaking`, `Training`, `SquashTracker`).
3. Notify / re-run the build step: the `.webp` sibling is generated from the PNG and
   the `icon_dark` / `icon_dark_webp` fields are filled in `app_projects.yml`.

Until each PNG lands, `icon_dark` is unset and the current tile shows on both themes
(no regression).

### 5. Verification

- `npm run dev`, open the projects showcase and each case-study page.
- Toggle light ↔ dark via the theme picker; confirm icons and heroes swap **in sync
  with the page**, with no flash on load (test both a fresh dark load and a
  cookie-set light load).
- Confirm a project with no light variant still renders (fallback to default).
- Refresh any `__examples__` / Storybook story assets that reference these icons if
  they visibly diverge.

## Files touched (summary)

- `src/content.config.ts` — hero light/dark schema fields.
- `src/data/projects.ts` — `AppProject` icon light/dark fields.
- `src/data/app_projects.yml` — `icon_light` (AI), `icon_dark` (iOS).
- `src/content/projects/*.mdx` (5 AI) — `hero_image_light`.
- `src/components/ui/ThemedImage.tsx`, `ThemedImage.astro` — new shared components.
- `src/components/ui/ProjectCard.tsx` — use `ThemedImage`.
- `src/layouts/ProjectLayout.astro` — use `ThemedImage.astro` for hero.
- `src/styles/global.css` — `.theme-light-only` / `.theme-dark-only` utilities.
- `public/assets/images/projects/*-hero-light.svg`, `*-icon-light.svg`,
  `lifeos-icon-light.svg` — new light AI assets.
- `docs/handoff/ios-dark-app-icons.md` — Icon Composer export handoff.
