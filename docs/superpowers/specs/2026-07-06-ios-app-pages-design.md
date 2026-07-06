# iOS app pages — App-Store-style body + git-derived development log

**Date:** 2026-07-06
**Status:** Approved (design), pending implementation plan

## Problem

The iOS apps — **Peaking**, **Training**, **Squash Tracker** — appear on the site
only as cards in `src/data/app_projects.yml`. Unlike the AI projects, their cards
carry no `link`, so they dead-end: there is no full page behind them. The AI
projects each have a full case-study page in the `projects` content collection.

We want the iOS apps to have full pages too, but shaped differently from the
narrative case studies:

- The **page body** reads like an **App Store listing with a bit more** — a
  present-tense, product-first description of what the app is, who it's for, and the
  interesting parts under the hood.
- The **updates** section is the real point: an **ongoing development log** — a
  compressed changelog / release / decisions timeline covering the years each app
  has been worked on. These pages are framed as **learning + development case
  studies**, not marketing listings, so the timeline carries the weight.

## Constraints & context

- **Static, public site.** Astro 6 + React 19 + Tailwind v4, deployed to GitHub
  Pages on push. The app repos (Peaking, Training, SquashTrackerWatch) are separate,
  and Peaking is private. So the timeline content must be **authored at design time
  and committed as content** — never fetched at build time. This also keeps the CI
  budget untouched (per `~/GitHub/CLAUDE.md`).
- **The machinery already exists.** The `projects` collection
  (`src/content.config.ts`) already supports a full body plus an `updates` array
  (`date`, `id`, `title`, `summary`, `content`), rendered by
  `src/components/UpdateTimeline.astro` — a vertical timeline with an auto "Updates"
  entry in the sticky sub-nav (`src/layouts/ProjectLayout.astro`). The AI projects
  already use this (e.g. `claude-usage-pacer.mdx`).
- **Two content systems, glued by a link.** `app_projects.yml` is the source of
  truth for the homepage **cards** (`ProjectCard.tsx` via `appProjects` in
  `src/data/projects.ts`); the `projects` collection is the source of truth for
  **pages**. AI projects have both, joined by the card's `link`. iOS apps currently
  have only the card.
- **Theme is a manual toggle.** `data-theme="light"` on `<html>` (dark default),
  cookie-backed, applied pre-paint. Any imagery must honour the manual choice, not
  just `prefers-color-scheme` — reuse `resolveThemedPair` / `ThemedImage`
  (per the 2026-07-04 theme-aware imagery spec).
- **Repos are readable now.** All three are present under `~/GitHub`, and `gh` is
  authenticated (`liammday`), so PRs and tags are available at authoring time.
  Extent: Peaking 5,054 commits / 25 `v*` tags / Jun 2023→Jul 2026; Training 1,710
  commits / 1 external `v*` tag / Jul 2023→Jul 2026; Squash Tracker 198 commits /
  Feb 2025→May 2026.

## Non-goals (agreed out of scope)

- **Build-time or scheduled sync** from the app repos. The timeline is hand-curated
  content; going forward, new entries are added by hand as releases happen.
- **Rallying** (a 4th app, 19 commits) — not a listed project; excluded.
- **Exhaustive version-by-version changelogs.** The target is a compressed ~8–15
  entries per app, not one entry per tag/minor.
- **Re-styling the existing AI case-study pages.** `ProjectLayout` and the current
  `UpdateTimeline` default behaviour stay exactly as they are.
- **Producing the screenshot assets themselves.** The spec wires the gallery slots
  and schema; capturing/exporting device screenshots is a companion content task.

## Decisions locked during brainstorming

1. **Screenshots:** yes — a horizontal, scrollable, theme-aware gallery.
2. **Page approach:** a **dedicated App-Store-style layout**, with iOS apps joining
   the **same `projects` collection** and reusing the `updates`/sub-nav machinery.
3. **Changelog source:** **derived from real git history** (commits + PRs),
   compressed, major versions as anchors, pre-version work as dated development
   phases. Framing = learning/decisions.
4. **Timeline UX:** each entry **collapsed to its summary, expandable inline** for
   the full detail.
5. **Header/gallery styling:** **"Editorial product row"** — icon-left header,
   left-aligned gallery strip, in the same visual rhythm as the existing case
   studies (chosen over a centred hero band).

## Design

### 1. Content architecture — iOS apps join the `projects` collection

Each app gets a new MDX file: `src/content/projects/peaking.mdx`,
`training.mdx`, `squash-tracker.mdx`. Each carries:

- `kind: 'app'` (the layout discriminator — see §3)
- the App-Store-style **body** (MDX prose + optional feature callouts)
- the `updates` array = the development log (see §5)
- app-listing frontmatter (see §2)

The **card stays in `app_projects.yml`** and gains, per iOS entry:

- `slug: peaking` — explicit join key to the page
- `link: /projects/peaking/`
- `link_label: 'Development log'` (final wording at author's discretion)

**No content duplication.** `AppProjectLayout` joins back to the matching
`appProjects` entry by `slug` and reuses the **icon, technologies, features,
audience, platform, status, dates** already defined there. The MDX file only holds
what is genuinely new (body, screenshots, store links, compatibility, timeline).
This keeps `app_projects.yml` the single source of truth for card-level metadata
and avoids drift.

### 2. Schema additions (`src/content.config.ts`, `projects` collection)

All optional, additive, backwards-compatible (existing case studies set none of
them):

| Field            | Type                                             | Purpose                                    |
|------------------|--------------------------------------------------|--------------------------------------------|
| `kind`           | `z.enum(['app']).optional()`                     | Route to `AppProjectLayout` when `'app'`   |
| `slug`           | `z.string().optional()`                          | Join key back to `app_projects.yml`        |
| `subtitle`       | `z.string().optional()`                          | One-liner under the app name               |
| `screenshots`    | `array({ light, dark?, alt, caption? })`         | Themed gallery images                      |
| `app_store_url`  | `z.string().optional()`                          | Header CTA                                  |
| `testflight_url` | `z.string().optional()`                          | Header CTA                                  |
| `github_url`     | `z.string().optional()`                          | Header CTA (public repos only)             |
| `compatibility`  | `z.string().optional()`                          | e.g. "iPhone · iOS 17+"                     |

Extend the existing `updates[]` object schema with one optional field:

- `version: z.string().optional()` — e.g. `"v2.3"`, rendered as a tag on the entry.

`app_projects.yml` (and the `AppProject` interface in `src/data/projects.ts`) gain
optional `slug`, and the three iOS entries gain `slug` / `link` / `link_label`.

### 3. Routing & layout

- `src/pages/projects/[...slug].astro` inspects `project.data.kind`. When
  `'app'`, it renders a new **`src/layouts/AppProjectLayout.astro`**; otherwise the
  existing `ProjectLayout.astro` (unchanged).
- **`AppProjectLayout.astro`** wraps `BaseLayout` and lays the page out as the
  approved "Editorial product row":
  1. **Header** — themed icon (from the joined yml entry), `platform · status`
     kicker with the live dot, name, `subtitle`, one-line `audience`, and CTA
     buttons for the present store links (`testflight_url` / `app_store_url` /
     `github_url`).
  2. **Gallery** — the themed `screenshots` in a left-aligned, horizontally
     scrollable strip (`ThemedImage`), each optionally captioned; tap/click to
     enlarge (lightweight — a native `<dialog>` or CSS target, no new heavy dep).
  3. **Sticky sub-nav** — reuse the existing pattern: Overview · Screenshots ·
     Features · Development log.
  4. **Description** — the MDX `<slot />` body, in the existing `.prose` styling.
  5. **Feature highlights** — the joined `features` as a small card grid (reuse
     `ProjectCard`'s feature styling / a shared piece).
  6. **Development log** — `UpdateTimeline` in collapsible mode (see §4/§5).
- Shared chrome (back link, sticky nav, `MetaList`, "Further reading") is factored
  so both layouts use it rather than copy-paste where practical.

### 4. Timeline component — extend, don't fork

Add **opt-in props** to `UpdateTimeline.astro`; defaults preserve today's
behaviour so AI case studies are untouched:

- `collapsible?: boolean` (default `false`) — when `true`, each entry renders its
  `summary` visible with the `content` inside a native **`<details>`** disclosure
  ("Read more"/chevron). Native `<details>` is keyboard-accessible and needs no JS
  or hydration.
- `label?: string` (default `'Updates'`) — apps pass `'Development log'`; the
  visible section heading and the sub-nav link text follow it. The anchor `id`
  stays the stable `updates` regardless, so the sub-nav `href="#updates"` never
  breaks.
- `version` rendering — when an entry has `version`, show it as a tag beside the
  date.

Sort order stays oldest→newest (chronological development story). For apps,
`AppProjectLayout` passes `collapsible label="Development log"`.

### 5. The git-history authoring process (design-time, per app)

A one-off analysis run locally per repo, its output committed as `updates`
frontmatter. Repeatable and documented so future entries follow the same shape.

1. **Gather:** `git tag` (v-tags), `gh pr list --state merged`, and the commit log
   with dates. Cross-reference tags→dates and PRs→themes.
2. **Cluster into ~8–15 entries** per app:
   - **Major versions as anchors** where they exist (Peaking's 25 tags compress to
     its majors; minors fold into the nearest entry).
   - **Pre-versioning era → dated development phases** (e.g. "2024 · Rewrite onto
     SwiftData & CloudKit", "Jun 2023 · First commit — the idea"). This is how the
     early, unversioned learning work is surfaced.
   - Compress minor-version and routine-maintenance noise.
3. **Write each entry** as: `date`, optional `version`, `title`, a one-line
   `summary` (the collapsed line) and a fuller markdown `content` (the expanded
   detail) — tone tuned to **decisions and learning**, not release-note marketing.
   Give notable entries a stable `id` for deep-linking.
4. **Author review:** the drafted threads are reviewed/edited before they land.

Per-app notes: **Peaking** is the deep one (25 tags, Jun 2023 origin — its first
commit predates the card's `date_started: 2024-06`; keep the card date, let the
timeline reveal the true origin). **Training** has almost no external tags despite
1,710 commits, so its timeline is derived mostly from commit/PR themes and internal
tags. **Squash Tracker** is the lightest.

### 6. Imagery & theming

- Icons come from the joined yml entry via `resolveThemedPair` (already themed
  light/dark for the iOS apps as of the 2026-07-04 spec).
- `screenshots` are themed via the same `{ light, dark? }` pattern and rendered with
  `ThemedImage`; a missing `dark` falls back to `light`. Assets live under
  `public/assets/images/projects/<app>/` (or a `screenshots/` subfolder).
- Eager-load the first gallery image and the icon (consistent with the eager-load
  fix for themed variants on the toggle); lazy-load the rest of the strip.

## Testing & verification

- **Storybook** stories for: the collapsible timeline (`UpdateTimeline` with
  `collapsible`/`label`/`version`), the gallery strip, and the app header. The repo
  already uses Storybook + design-sync and every UI component has a `.stories.tsx`.
- **Build check:** `npm run build` passes; the three new routes render; the AI
  case-study pages are byte-for-byte unaffected (snapshot/visual check on at least
  one, e.g. `claude-usage-pacer`).
- **Accessibility pass** on the new bits: `<details>` keyboard operability and
  visible focus; the gallery lightbox is focus-trapped and Escape-closable; and a
  **contrast check** on the timeline labels/version tags in *both* themes — light
  mode especially, given the prior Tailwind-v4 cascade-layer contrast regression
  (unlayered theme/a11y overrides).
- **Routing:** `kind:'app'` → `AppProjectLayout`; everything else →
  `ProjectLayout`.

## Build sequence

1. Schema + `AppProject`/yml `slug` plumbing.
2. Extend `UpdateTimeline` (collapsible/label/version), with stories.
3. `AppProjectLayout` + gallery + routing switch, with stories.
4. **Peaking** as the reference implementation: run the §5 process, write
   `peaking.mdx` (body + timeline), wire its card link, add screenshots.
5. Replicate content for **Training** and **Squash Tracker**.
6. Build, a11y and contrast verification.

## Open questions (non-blocking; author's call during implementation)

- Final `link_label` wording ("Development log" vs "See the build" vs …).
- Whether to correct Peaking's card `date_started` or leave it (default: leave).
- Screenshot count per app and whether captions are used.
