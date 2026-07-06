# iOS App Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the iOS apps (Peaking, Training, Squash Tracker) full pages with an App-Store-style body and a compressed, git-derived development-log timeline, reusing the existing `projects` content collection and `updates` machinery.

**Architecture:** Each iOS app becomes an MDX entry in the existing `projects` collection with `kind: 'app'`. `src/pages/projects/[...slug].astro` routes `kind:'app'` to a new `AppProjectLayout.astro` (the existing `ProjectLayout.astro` is untouched). The app layout joins back to the card metadata in `app_projects.yml` by `slug` (no duplication), renders a themed screenshot gallery, the MDX body, a feature grid, and the `updates` timeline — with `UpdateTimeline.astro` extended to a collapsible "Development log" mode. Timeline content is authored at design time by analysing each app repo's git history + PRs and committed as frontmatter.

**Tech Stack:** Astro 6, React 19 (islands), Tailwind CSS v4, MDX content collections, `marked` (already a dep, used by `UpdateTimeline`), Storybook (React atoms only), `gh` CLI + `git` (design-time history analysis).

## Global Constraints

- **Astro 6 + React 19 + Tailwind v4**; deployed to GitHub Pages on push. Follow existing file/patterns.
- **Static site, public repo.** NEVER fetch app-repo history at build time — the timeline is authored at design time and committed as content. (Peaking is private; keeping analysis at authoring time also spends zero CI budget.)
- **Manual theme toggle:** `data-theme="light"` on `<html>` (dark is default = no attribute), cookie-backed, applied pre-paint. All imagery must use `resolveThemedPair` + `ThemedImage`, never raw `<img>` for themed assets.
- **Routes need a trailing slash** in dev (`/projects/peaking/`), per repo convention.
- **British English** in all prose/copy (prioritise, behaviour, colour, …).
- **No unit-test runner** in this repo. Verify each task with: `npm run build` (validates content schema + renders every page), `npx astro check` (types), the preview MCP (`preview_start` → `preview_snapshot`/`preview_inspect`/`preview_screenshot`, append `?preview` to URLs to disable reveal motion so content paints), and Storybook only for React atoms.
- **CSS cascade-layer gotcha:** theme/a11y colour overrides must be UNLAYERED (Tailwind v4 puts typography/`prose-invert` + `hover:`/`aria-` utilities in the last `utilities` layer, so `@layer` overrides silently lose). Place new timeline/gallery colour rules alongside the existing `.update-timeline` rules in `src/styles/global.css` (same cascade context) and verify contrast in BOTH themes.
- **Join key is `slug`.** The app layout reads icon/technologies/features/audience/platform/status/dates from the matching `app_projects.yml` entry — the MDX file must not duplicate them.
- **Icon/screenshot fallback:** a missing `dark` variant falls back to `light` via `resolveThemedPair`; eager-load the icon and first gallery image, lazy-load the rest.

---

## Task 1: Extend the content schema + AppProject interface

**Files:**
- Modify: `src/content.config.ts` (the `projects` collection schema)
- Modify: `src/data/projects.ts` (the `AppProject` interface)

**Interfaces:**
- Produces: new optional frontmatter fields on the `projects` collection — `kind: 'app'`, `slug: string`, `subtitle: string`, `compatibility: string`, `app_store_url: string`, `testflight_url: string`, `github_url: string`, `screenshots: { light: string; light_webp?: string; dark?: string; dark_webp?: string; alt: string; caption?: string }[]`, and `updates[].version: string`. Adds `slug?: string` to `AppProject`.

- [ ] **Step 1: Add the app-listing fields to the `projects` schema**

In `src/content.config.ts`, inside the `projects` `schema: z.object({ ... })`, add these fields (place them just before the `updates:` field):

```ts
    kind: z.enum(['app']).optional(),
    slug: z.string().optional(),
    subtitle: z.string().optional(),
    compatibility: z.string().optional(),
    app_store_url: z.string().optional(),
    testflight_url: z.string().optional(),
    github_url: z.string().optional(),
    screenshots: z
      .array(
        z.object({
          light: z.string(),
          light_webp: z.string().optional(),
          dark: z.string().optional(),
          dark_webp: z.string().optional(),
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
```

- [ ] **Step 2: Add `version` to the `updates` item schema**

In the same file, in the `updates` array's `z.object({ ... })`, add one field after `content`:

```ts
          content: z.string().optional(),
          version: z.string().optional(),
```

- [ ] **Step 3: Add `slug` to the `AppProject` interface**

In `src/data/projects.ts`, add to the `AppProject` interface (after `order: number;`):

```ts
  slug?: string;
```

- [ ] **Step 4: Verify the build still passes**

Run: `npm run build`
Expected: build succeeds. No existing content uses the new fields, so this only proves the schema compiles and nothing regressed.

- [ ] **Step 5: Type check**

Run: `npx astro check`
Expected: 0 errors (warnings from pre-existing code are fine).

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/data/projects.ts
git commit -m "feat(schema): add iOS app-listing fields to projects collection"
```

---

## Task 2: Extend UpdateTimeline with a collapsible "Development log" mode

**Files:**
- Modify: `src/components/UpdateTimeline.astro`
- Modify: `src/styles/global.css` (add version-tag + disclosure styles beside the existing `.update-timeline` rules)

**Interfaces:**
- Consumes: `updates` items may now carry `version?: string` (Task 1).
- Produces: `UpdateTimeline` accepts `collapsible?: boolean` (default `false`) and `label?: string` (default `'Updates'`). Default behaviour is unchanged (existing case-study pages pass neither). The `id="updates"` anchor is unchanged so `href="#updates"` keeps working.

- [ ] **Step 1: Update the component's props and Update interface**

Replace the frontmatter of `src/components/UpdateTimeline.astro` (the `---` block) with:

```astro
---
import { marked } from 'marked';

interface Update {
  date?: Date;
  id?: string;
  title: string;
  summary?: string;
  content?: string;
  version?: string;
}

interface Props {
  updates: Update[];
  collapsible?: boolean;
  label?: string;
}

const { updates, collapsible = false, label = 'Updates' } = Astro.props;

// Oldest to newest, so updates read chronologically down the page after the main body.
const sorted = [...updates].sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));

function fmt(d?: Date): string {
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

const rendered = sorted.map((u) => ({
  ...u,
  html: u.content ? (marked.parse(u.content, { async: false }) as string) : '',
}));
---
```

- [ ] **Step 2: Update the template to render label, version tag, and the disclosure**

Replace the template (everything after the frontmatter) of `src/components/UpdateTimeline.astro` with:

```astro
<section id="updates" class="mx-auto max-w-5xl px-6 pb-16">
  <h2 class="text-2xl font-semibold text-aluminum-100">{label}</h2>
  <ol class="update-timeline mt-8">
    {
      rendered.map((u) => (
        <li id={u.id} class="relative scroll-mt-24">
          <span class="update-timeline__marker" aria-hidden="true" />
          {(u.date || u.version) && (
            <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-aluminum-400">
              {u.date && <span>{fmt(u.date)}</span>}
              {u.version && <span class="update-timeline__version">{u.version}</span>}
            </p>
          )}
          <h3 class="mt-2 text-xl font-semibold text-aluminum-100">
            {u.id ? (
              <a class="underline-offset-4 hover:text-ember-300 hover:underline" href={`#${u.id}`}>
                {u.title}
              </a>
            ) : (
              u.title
            )}
          </h3>
          {u.summary && <p class="mt-3 max-w-[65ch] leading-relaxed text-aluminum-300">{u.summary}</p>}
          {u.html &&
            (collapsible ? (
              <details class="update-timeline__details mt-3">
                <summary class="update-timeline__summary">Read more</summary>
                <div class="detail-content prose prose-invert mt-3 max-w-none" set:html={u.html} />
              </details>
            ) : (
              <div class="detail-content prose prose-invert mt-4 max-w-none" set:html={u.html} />
            ))}
        </li>
      ))
    }
  </ol>
</section>
```

- [ ] **Step 3: Add the version-tag + disclosure CSS**

In `src/styles/global.css`, find the existing `.update-timeline__marker` rule block (around line 383) and its closing `}` for the media query. Immediately AFTER that `.update-timeline__marker` media-query block (staying in the same cascade context as the other `.update-timeline` rules), add:

```css
  .update-timeline__version {
    color: rgb(var(--ember-200));
    background-color: rgb(var(--ember-500) / 0.14);
    border: 1px solid rgb(var(--ember-400) / 0.4);
    border-radius: 9999px;
    padding: 0.05rem 0.5rem;
    letter-spacing: 0.08em;
  }
  .update-timeline__summary {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--ember-300));
    list-style: none;
  }
  .update-timeline__summary::-webkit-details-marker {
    display: none;
  }
  .update-timeline__summary::after {
    content: "▸";
    transition: transform 0.2s ease;
  }
  .update-timeline__details[open] .update-timeline__summary::after {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .update-timeline__summary::after {
      transition: none;
    }
  }
```

- [ ] **Step 4: Verify existing case-study pages are unchanged**

Run: `npm run build`
Expected: build succeeds. Then preview one AI case study that uses `updates`:

```
preview_start (name: dev)   # astro dev
preview_snapshot on http://localhost:4321/projects/claude-usage-pacer/?preview
```

Expected: the "Updates" section still renders with its heading "Updates" and all entries expanded (collapsible defaults to false → old behaviour). No visual regression.

- [ ] **Step 5: Commit**

```bash
git add src/components/UpdateTimeline.astro src/styles/global.css
git commit -m "feat(timeline): add collapsible + label + version support to UpdateTimeline"
```

---

## Task 3: Build the themed screenshot gallery component

**Files:**
- Create: `src/components/ui/AppScreenshotGallery.astro`
- Modify: `src/styles/global.css` (gallery scroll styles)

**Interfaces:**
- Consumes: `resolveThemedPair` (`src/lib/themed-image.ts`) and `ThemedImage.astro`.
- Produces: `AppScreenshotGallery` with props `screenshots: { light; light_webp?; dark?; dark_webp?; alt; caption? }[]` and `title: string`. Renders a `<section id="screenshots">` with a horizontally scrollable strip of themed images. Caller is responsible for only rendering it when `screenshots.length > 0`.

- [ ] **Step 1: Create the gallery component**

Create `src/components/ui/AppScreenshotGallery.astro`:

```astro
---
import ThemedImage from './ThemedImage.astro';
import { resolveThemedPair } from '../../lib/themed-image';

interface Screenshot {
  light: string;
  light_webp?: string;
  dark?: string;
  dark_webp?: string;
  alt: string;
  caption?: string;
}

interface Props {
  screenshots: Screenshot[];
  title: string;
}

const { screenshots, title } = Astro.props;

const items = screenshots
  .map((s) => ({
    pair: resolveThemedPair(s.light, s.light_webp, undefined, undefined, s.dark, s.dark_webp),
    alt: s.alt,
    caption: s.caption,
  }))
  .filter((it) => it.pair);
---

<section id="screenshots" class="mx-auto max-w-5xl px-6 py-12">
  <h2 class="sr-only">Screenshots</h2>
  <ul class="app-gallery flex gap-4 overflow-x-auto pb-3" aria-label={`${title} screenshots`}>
    {
      items.map((it, i) => (
        <li class="app-gallery__item shrink-0">
          <figure class="m-0">
            <ThemedImage
              light={it.pair!.light}
              dark={it.pair!.dark}
              alt={it.alt}
              class="h-[440px] w-auto rounded-2xl border border-aluminum-500/20 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.9)]"
              pictureClass="block"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {it.caption && <figcaption class="mt-2 text-xs text-aluminum-400">{it.caption}</figcaption>}
          </figure>
        </li>
      ))
    }
  </ul>
</section>
```

- [ ] **Step 2: Add gallery scroll-snap CSS**

In `src/styles/global.css`, after the timeline CSS you added in Task 2, add:

```css
  .app-gallery {
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
  }
  .app-gallery__item {
    scroll-snap-align: start;
  }
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: build succeeds (no page renders the gallery yet — this proves the component + CSS compile). Full visual verification happens in Task 5 once Peaking references screenshots.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/AppScreenshotGallery.astro src/styles/global.css
git commit -m "feat(gallery): add themed AppScreenshotGallery component"
```

---

## Task 4: Create AppProjectLayout and route `kind:'app'` to it

**Files:**
- Create: `src/layouts/AppProjectLayout.astro`
- Modify: `src/pages/projects/[...slug].astro`

**Interfaces:**
- Consumes: `appProjects` (`src/data/projects.ts`) joined by `data.slug`; `UpdateTimeline` with `collapsible`/`label` (Task 2); `AppScreenshotGallery` (Task 3); `resolveThemedPair`, `ThemedImage`, `Button`, `formatMonth`.
- Produces: renders a full App-Store-style page. Selected by `[...slug].astro` when `project.data.kind === 'app'`.

- [ ] **Step 1: Create the app layout**

Create `src/layouts/AppProjectLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import UpdateTimeline from '../components/UpdateTimeline.astro';
import AppScreenshotGallery from '../components/ui/AppScreenshotGallery.astro';
import ThemedImage from '../components/ui/ThemedImage.astro';
import { Button } from '../components/ui/Button';
import { resolveThemedPair } from '../lib/themed-image';
import { appProjects } from '../data/projects';
import { formatMonth } from '../lib/format';

const { project } = Astro.props;
const data = project.data;

// Join back to the card metadata in app_projects.yml by slug — single source of truth.
const app = appProjects.find((p) => p.slug === data.slug);

const iconPair = app
  ? resolveThemedPair(app.icon, app.icon_webp, app.icon_light, app.icon_light_webp, app.icon_dark, app.icon_dark_webp)
  : null;

const technologies = app?.technologies ?? [];
const features = app?.features ?? [];
const platform = app?.platform;
const status = app?.status;
const audience = app?.audience;

const started = app?.date_started ? formatMonth(app.date_started) : '';
const finished = app?.date_finished ? formatMonth(app.date_finished) : '';

const screenshots = data.screenshots ?? [];
const hasScreenshots = screenshots.length > 0;
const hasFeatures = features.length > 0;
const hasUpdates = (data.updates?.length ?? 0) > 0;

const ctas = [
  data.testflight_url && { href: data.testflight_url, label: 'Beta test on TestFlight', variant: 'primary' as const },
  data.app_store_url && { href: data.app_store_url, label: 'View on the App Store', variant: 'primary' as const },
  data.github_url && { href: data.github_url, label: 'GitHub', variant: 'secondary' as const },
].filter(Boolean) as { href: string; label: string; variant: 'primary' | 'secondary' }[];

const navLink =
  'whitespace-nowrap rounded-full border border-transparent px-4 py-2 font-medium text-aluminum-300 transition hover:border-aluminum-500/40 hover:text-aluminum-100 aria-[current=page]:border-ember-400/50 aria-[current=page]:bg-ember-500/10 aria-[current=page]:text-ember-200 aria-[current=page]:texture-noise';
---

<BaseLayout title={data.title} description={data.description ?? data.summary} type="article" image={data.image}>
  <article class="bg-transparent text-aluminum-100">
    <section class="border-b border-aluminum-500/25 bg-transparent">
      <div class="mx-auto max-w-5xl px-6 py-20">
        <a
          class="text-sm text-aluminum-300 underline underline-offset-4 transition hover:text-ember-300 hover:underline"
          href="/#projects">← Back to Projects</a
        >

        <div class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          {
            iconPair && (
              <ThemedImage
                light={iconPair.light}
                dark={iconPair.dark}
                alt={`${data.title} app icon`}
                width={112}
                height={112}
                class="h-28 w-28 rounded-[1.35rem] object-cover"
                pictureClass="h-28 w-28 shrink-0"
                loading="eager"
              />
            )
          }
          <div>
            {
              (platform || status) && (
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">
                  {platform}
                  {status ? ` · ${status}` : ''}
                </p>
              )
            }
            <h1 class="mt-3 text-4xl font-semibold text-aluminum-100">{data.title}</h1>
            {data.subtitle && <p class="mt-3 text-lg leading-relaxed text-aluminum-300">{data.subtitle}</p>}
            {audience && <p class="mt-3 max-w-[60ch] text-sm leading-relaxed text-aluminum-400">{audience}</p>}
            {
              (started || data.compatibility) && (
                <p class="mt-4 text-xs font-medium text-aluminum-400">
                  {started && <span>{finished ? `${started} → ${finished}` : `${started} → Present`}</span>}
                  {started && data.compatibility && <span> · </span>}
                  {data.compatibility && <span>{data.compatibility}</span>}
                </p>
              )
            }
            {
              ctas.length > 0 && (
                <div class="mt-6 flex flex-wrap gap-3">
                  {ctas.map((c) => (
                    <Button variant={c.variant} href={c.href} target="_blank" rel="noopener noreferrer">
                      {c.label}
                    </Button>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </section>

    <nav
      class="sticky top-0 z-40 border-b border-aluminum-500/25 bg-charcoal-900/95 backdrop-blur"
      aria-label="Page sections"
      data-sticky-nav>
      <div class="page-nav-bleed flex gap-3 overflow-x-auto py-4 text-sm" data-nav-scroll>
        {hasScreenshots && <a class={navLink} href="#screenshots" data-nav-link>Screenshots</a>}
        <a class={navLink} href="#overview" data-nav-link>Overview</a>
        {hasFeatures && <a class={navLink} href="#features" data-nav-link>Features</a>}
        {hasUpdates && <a class={navLink} href="#updates" data-nav-link>Development log</a>}
      </div>
    </nav>

    {hasScreenshots && <AppScreenshotGallery screenshots={screenshots} title={data.title} />}

    <section id="overview" class="mx-auto max-w-5xl px-6 py-16">
      <div class="detail-content prose prose-invert">
        <slot />
      </div>
    </section>

    {
      hasFeatures && (
        <section id="features" class="mx-auto max-w-5xl px-6 pb-16">
          <h2 class="text-2xl font-semibold text-aluminum-100">Features</h2>
          <ul class="mt-6 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <li class="surface-panel p-5 text-sm leading-relaxed text-aluminum-300">{f}</li>
            ))}
          </ul>
          {technologies.length > 0 && (
            <div class="mt-8">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">Built with</p>
              <ul class="mt-3 flex flex-wrap gap-2">
                {technologies.map((t) => (
                  <li class="rounded-full border border-aluminum-500/25 bg-graphite-700/60 px-3 py-1 text-xs text-aluminum-300">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )
    }

    {hasUpdates && <UpdateTimeline updates={data.updates} collapsible label="Development log" />}
  </article>
</BaseLayout>
```

- [ ] **Step 2: Route `kind:'app'` to the new layout**

Replace `src/pages/projects/[...slug].astro` with:

```astro
---
import { getCollection, render } from 'astro:content';
import ProjectLayout from '../../layouts/ProjectLayout.astro';
import AppProjectLayout from '../../layouts/AppProjectLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
const Layout = project.data.kind === 'app' ? AppProjectLayout : ProjectLayout;
---

<Layout project={project}>
  <Content />
</Layout>
```

- [ ] **Step 3: Verify build + types (no app content yet)**

Run: `npm run build`
Expected: build succeeds. No project has `kind:'app'` yet, so `ProjectLayout` still handles every page — this proves the new layout and routing compile without touching existing pages.

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/AppProjectLayout.astro src/pages/projects/\[...slug\].astro
git commit -m "feat(layout): add AppProjectLayout and route kind:app projects to it"
```

---

## Task 5: Peaking page — structure, seed content, link, and end-to-end layout verification

This task proves the whole pipeline renders (Task 4's layout, Task 3's gallery, Task 2's timeline) with real Peaking data and a small seed timeline. The full development log is authored in Task 6.

**Files:**
- Create: `src/content/projects/peaking.mdx`
- Modify: `src/data/app_projects.yml` (Peaking entry: add `slug`, repoint `link`, adjust `link_label`)

**Interfaces:**
- Consumes: `AppProjectLayout` (Task 4) via `kind:'app'`; joins `app_projects.yml` by `slug: peaking`.

- [ ] **Step 1: Wire the Peaking card to the new page**

In `src/data/app_projects.yml`, in the `Peaking` entry, add `slug: peaking` and change the existing `link`/`link_label`. Peaking currently links its card straight to TestFlight — that URL moves onto the page as a CTA instead. Set:

```yaml
  slug: peaking
  link: /projects/peaking/
  link_label: Development log
```

(Remove the old `link: https://testflight.apple.com/join/2T6FwyZF` and `link_label: Beta test this app` lines — the TestFlight URL is re-added as `testflight_url` in the MDX below.)

- [ ] **Step 2: Create the Peaking page with a seed timeline**

Create `src/content/projects/peaking.mdx`. Use a stand-in screenshot (the app icon) so the gallery renders and can be verified now; replace `screenshots` with real captures when available.

```mdx
---
title: Peaking
kind: app
slug: peaking
subtitle: Discover peaks, verify summits from your own routes, and track iconic hiking lists — offline-first.
compatibility: iPhone · iOS 17+
testflight_url: https://testflight.apple.com/join/2T6FwyZF
description: A mountain companion for discovering peaks, verifying summits from route data, and tracking progress across iconic hiking lists, even with patchy signal.
screenshots:
  - light: /assets/images/projects/PeakingAppIcon-256.png
    light_webp: /assets/images/projects/PeakingAppIcon-256.webp
    dark: /assets/images/projects/PeakingAppIcon-256-dark.png
    dark_webp: /assets/images/projects/PeakingAppIcon-256-dark.webp
    alt: Peaking placeholder screenshot — replace with a device capture
updates:
  - date: 2023-06-09
    version: origin
    title: First commit — the idea
    summary: A map that knows which summits you have actually stood on.
    content: |
      Peaking began as a simple question: could an app confirm a summit from the
      route you walked, rather than trusting a manual check-in? The first commit
      laid down a SwiftUI shell and a MapKit view — no versioning, no sync, just
      the seed of the idea.
  - date: 2025-11-01
    version: v1.0
    title: First public TestFlight
    summary: The map, collections and summit matching reach a shippable whole.
    content: |
      The map, published collections (Munros, Wainwrights) and route-based summit
      matching came together into something worth handing to external testers for
      the first time.
---

Peaking is a mountain companion for hillwalkers and mountaineers. It maps the peaks
around you, confirms a summit from the route you actually walked, and tracks your
progress across the classic hiking lists — and it keeps working when the signal does
not.

The interesting part is the verification: instead of a manual check-in, Peaking
matches a summit against the GPS track from your Apple Watch or Strava activity, so
your list of completed peaks reflects where you genuinely stood.
```

- [ ] **Step 3: Verify the page renders end-to-end**

Run: `npm run build`
Expected: build succeeds; a `/projects/peaking/` route is emitted.

Then:

```
preview_start (name: dev)
preview_snapshot on http://localhost:4321/projects/peaking/?preview
preview_screenshot   # confirm header (icon, name, subtitle, TestFlight CTA), gallery strip, Overview body, Features grid, and the Development log
```

Expected: the header shows the Peaking icon + "iOS · Active development" + subtitle + a "Beta test on TestFlight" button; the screenshot strip renders; the sticky sub-nav shows Screenshots · Overview · Features · Development log; the Features grid lists the four features from `app_projects.yml`; the Development log shows both entries with version tags and a working "Read more" disclosure.

- [ ] **Step 4: Verify the collapsible disclosure + contrast in both themes**

- `preview_inspect` the `.update-timeline__summary` and `.update-timeline__version` — confirm legible colour in dark mode.
- Toggle theme: `preview_eval` → `document.cookie='theme=light;path=/';document.documentElement.setAttribute('data-theme','light')`, then `preview_screenshot`. Confirm the version tag, "Read more", timeline text and CTA are all clearly legible in light mode (watch the known cascade-layer contrast trap).
- Confirm `<details>` toggles open/closed on click and is keyboard-focusable (Tab to it, Enter toggles).

- [ ] **Step 5: Verify the homepage card now links through**

`preview_snapshot` on `http://localhost:4321/?preview` — the Peaking card shows a "Development log" button pointing at `/projects/peaking/` (no longer the external TestFlight link).

- [ ] **Step 6: Commit**

```bash
git add src/content/projects/peaking.mdx src/data/app_projects.yml
git commit -m "feat(peaking): add app page with seed development log and card link"
```

---

## Task 6: Peaking development log — full git-derived timeline

Author the compressed, real development history into Peaking's `updates`. This is a design-time analysis of `~/GitHub/Peaking` (5,054 commits, 25 `v*` tags, Jun 2023 → Jul 2026), committed as content. Target **~10–15 entries**: major-version anchors + dated development phases for the pre-versioning era; minor-version noise compressed into the nearest anchor.

**Files:**
- Modify: `src/content/projects/peaking.mdx` (replace the seed `updates` with the full set; swap the stand-in screenshot for real captures if available)

- [ ] **Step 1: Gather the version anchors and their dates**

```bash
git -C ~/GitHub/Peaking tag --sort=creatordate --format='%(creatordate:short)  %(refname:short)' | grep -E ' v[0-9]'
```

Expected: 25 rows of `YYYY-MM-DD  vX.Y.Z`. Note the first appearance of each **major/minor** anchor (e.g. first `v1.0`, first `v2.0`); patch tags fold into their parent.

- [ ] **Step 2: Gather the pre-versioning era (before the first `v*` tag)**

```bash
FIRST_TAG_DATE=$(git -C ~/GitHub/Peaking tag --sort=creatordate --format='%(creatordate:short) %(refname:short)' | grep -E ' v[0-9]' | head -1 | awk '{print $1}')
echo "first version tag: $FIRST_TAG_DATE"
git -C ~/GitHub/Peaking log --reverse --since=2023-06-01 --until="$FIRST_TAG_DATE" --pretty='%as  %s' | grep -iE 'swiftdata|cloudkit|migrat|rewrite|offline|healthkit|strava|map|collection|summit|first' | head -60
```

Expected: the themes of the unversioned early years — use them to define 2–4 dated **development phases** (e.g. "2023 · SwiftUI + MapKit shell", "2024 · SwiftData & CloudKit rewrite", "Early 2025 · offline cache + route matching").

- [ ] **Step 3: Gather merged PRs for milestone themes**

```bash
GH_REPO=$(git -C ~/GitHub/Peaking config --get remote.origin.url | sed -E 's#.*[:/]([^/]+/[^/]+?)(\.git)?$#\1#')
echo "repo: $GH_REPO"
gh pr list -R "$GH_REPO" --state merged --limit 400 --json number,title,mergedAt,labels \
  --jq 'sort_by(.mergedAt) | .[] | "\(.mergedAt[0:10])  #\(.number)  \(.title)"' | head -120
```

Expected: a chronological list of merged PR titles. Cluster them by theme against the version anchors to write each entry's `content`.

- [ ] **Step 4: Author the compressed `updates` set**

Replace the seed `updates:` in `peaking.mdx` with ~10–15 entries, each following this exact shape (oldest first; the component sorts chronologically). Anchor on major versions where they exist; render early phases with a phase word in place of a version. Give notable entries a stable `id` for deep-linking. Tone: decisions and learning, British English, not marketing.

```yaml
updates:
  - date: 2023-06-09
    version: origin
    id: origin
    title: First commit — the idea
    summary: A map that knows which summits you have actually stood on.
    content: |
      <2–5 sentences: what prompted it, what the first cut contained, what was
      deliberately left out. Written as a decision, not a changelog line.>
  - date: 2024-03-01
    title: Rewrite onto SwiftData & CloudKit
    summary: <one line>
    content: |
      <the phase: why the rewrite, what it unlocked, what it cost.>
  # …anchor entries for each major version (v1.0, v2.0, …) plus the offline-cache
  #   and route-matching milestones, ~10–15 total. Fold patch/minor tags into the
  #   nearest anchor rather than listing each.
```

Acceptance criteria for the set:
- 10–15 entries, oldest → newest.
- The true origin (Jun 2023) is present — it predates the card's `date_started: 2024-06`; leave the card date as-is (the timeline tells the fuller story).
- Every entry has `date`, `title`, `summary`; anchor entries carry a `version`; each has a `content` block of 2–6 sentences.
- No raw commit hashes or PR numbers in the prose; synthesise themes.

- [ ] **Step 5: (If real screenshots are available) replace the stand-in**

If device captures exist (e.g. from the iOS simulator via the `xcodebuildmcp` `screenshot` tool, or existing marketing captures), save them under `public/assets/images/projects/peaking/` and replace the single stand-in `screenshots` entry with the real set (each with `light`, optional `dark`, and `alt`). If not yet available, leave the stand-in and note it for a follow-up — the layout does not depend on it.

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: succeeds. Then `preview_snapshot` on `http://localhost:4321/projects/peaking/?preview` — confirm the full timeline renders oldest→newest, each entry collapses/expands, version tags show on anchor entries.

- [ ] **Step 7: Commit**

```bash
git add src/content/projects/peaking.mdx public/assets/images/projects/peaking 2>/dev/null; git add src/content/projects/peaking.mdx
git commit -m "content(peaking): full git-derived development log"
```

---

## Task 7: Training page + development log

**Files:**
- Create: `src/content/projects/training.mdx`
- Modify: `src/data/app_projects.yml` (Training entry: add `slug`, `link`, `link_label`)

**Interfaces:**
- Consumes: `AppProjectLayout` via `kind:'app'`; joins by `slug: training`. Training has **1,710 commits, only 1 external `v*` tag, Jul 2023 → Jul 2026** — so its timeline is derived mostly from commit/PR themes and internal tags, with development phases doing more of the work than version anchors.

- [ ] **Step 1: Wire the Training card**

In `src/data/app_projects.yml`, in the `Training` entry, add:

```yaml
  slug: training
  link: /projects/training/
  link_label: Development log
```

- [ ] **Step 2: Gather Training history**

```bash
git -C ~/GitHub/Training tag --sort=creatordate --format='%(creatordate:short)  %(refname:short)'
git -C ~/GitHub/Training log --reverse --pretty='%as  %s' | grep -iE 'healthkit|plan|goal|nutrition|notif|calendar|appintent|foundation ?models|natural language|timeline|first' | head -80
GH_REPO=$(git -C ~/GitHub/Training config --get remote.origin.url | sed -E 's#.*[:/]([^/]+/[^/]+?)(\.git)?$#\1#')
gh pr list -R "$GH_REPO" --state merged --limit 400 --json number,title,mergedAt \
  --jq 'sort_by(.mergedAt) | .[] | "\(.mergedAt[0:10])  \(.title)"' | head -120
```

Expected: enough theme signal (HealthKit comparison, goal system, natural-language parsing, calendar/notifications, Foundation Models) to define ~8–12 dated phases/milestones.

- [ ] **Step 3: Create the Training page**

Create `src/content/projects/training.mdx` following the exact structure of `peaking.mdx` from Task 6. Frontmatter:

```mdx
---
title: Training
kind: app
slug: training
subtitle: Turn weekly intentions into measurable progress by comparing planned sessions with what Apple Health actually recorded.
compatibility: iPhone · iOS 17+ (natural-language parsing on iOS 26+)
description: A planning-and-accountability app that compares planned workouts with real sessions recorded in Apple Health.
updates:
  # ~8–12 entries authored from Steps 2, oldest→newest, phases + the one v* anchor.
  # Same entry shape as Peaking: date, optional version, id (notable ones),
  # title, summary, content (2–6 sentences, decisions/learning, British English).
---

<2–3 short paragraphs, App-Store voice: what Training is, who it is for, and the
interesting mechanic — the plan-vs-actual comparison against Apple Health.>
```

Acceptance criteria: 8–12 `updates` entries; the origin (Jul 2023) present; phases carry no `version`, the single external release carries its `v*`; every entry has `date`/`title`/`summary`/`content`.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: succeeds; `/projects/training/` emitted. `preview_snapshot` on `http://localhost:4321/projects/training/?preview` — header (no screenshots yet → no Screenshots nav item), Overview, Features (from yml), Development log all render.

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/training.mdx src/data/app_projects.yml
git commit -m "content(training): add app page and development log"
```

---

## Task 8: Squash Tracker page + development log

**Files:**
- Create: `src/content/projects/squash-tracker.mdx`
- Modify: `src/data/app_projects.yml` (Squash Tracker entry: add `slug`, `link`, `link_label`)

**Interfaces:**
- Consumes: `AppProjectLayout` via `kind:'app'`; joins by `slug: squash-tracker`. Repo `~/GitHub/SquashTrackerWatch` — **198 commits, Feb 2025 → May 2026** — the lightest history; ~5–8 entries.

- [ ] **Step 1: Wire the Squash Tracker card**

In `src/data/app_projects.yml`, in the `Squash Tracker` entry, add:

```yaml
  slug: squash-tracker
  link: /projects/squash-tracker/
  link_label: Development log
```

- [ ] **Step 2: Gather Squash Tracker history**

```bash
git -C ~/GitHub/SquashTrackerWatch tag --sort=creatordate --format='%(creatordate:short)  %(refname:short)'
git -C ~/GitHub/SquashTrackerWatch log --reverse --pretty='%as  %s' | grep -iE 'watch|rally|score|heart|match|court|stat|cloudkit|first' | head -60
GH_REPO=$(git -C ~/GitHub/SquashTrackerWatch config --get remote.origin.url | sed -E 's#.*[:/]([^/]+/[^/]+?)(\.git)?$#\1#')
gh pr list -R "$GH_REPO" --state merged --limit 200 --json number,title,mergedAt \
  --jq 'sort_by(.mergedAt) | .[] | "\(.mergedAt[0:10])  \(.title)"'
```

- [ ] **Step 3: Create the Squash Tracker page**

Create `src/content/projects/squash-tracker.mdx` following the same structure. Frontmatter:

```mdx
---
title: Squash Tracker
kind: app
slug: squash-tracker
subtitle: Record live squash on Apple Watch — rally-by-rally scoring and heart-rate capture — then review your match history.
compatibility: Apple Watch + iPhone · watchOS 10+ / iOS 17+
description: A match companion for recording live squash on Apple Watch, capturing rally-by-rally scores and health metrics, and reviewing match statistics over time.
updates:
  # ~5–8 entries authored from Step 2, oldest→newest. Same entry shape.
---

<2–3 short paragraphs, App-Store voice: what it is, the on-watch rally scoring, and
the HealthKit workout capture during play.>
```

Acceptance criteria: 5–8 `updates` entries, oldest→newest, origin (Feb 2025) present, each with `date`/`title`/`summary`/`content`.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: succeeds; `/projects/squash-tracker/` emitted. `preview_snapshot` on `http://localhost:4321/projects/squash-tracker/?preview` — page renders.

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/squash-tracker.mdx src/data/app_projects.yml
git commit -m "content(squash-tracker): add app page and development log"
```

---

## Task 9: Final verification pass

**Files:** none (verification only; fix-forward if anything fails)

- [ ] **Step 1: Full build + type check**

Run: `npm run build && npx astro check`
Expected: build succeeds, all three `/projects/{peaking,training,squash-tracker}/` routes emitted; 0 type errors.

- [ ] **Step 2: Regression check on an AI case study**

`preview_snapshot` on `http://localhost:4321/projects/claude-usage-pacer/?preview` — confirm it still uses `ProjectLayout`, heading is "Updates", entries are expanded (no disclosure), i.e. `kind:'app'` routing did not affect non-app projects.

- [ ] **Step 3: Homepage cards**

`preview_snapshot` on `http://localhost:4321/?preview` — all three iOS cards now show a "Development log" button linking to their page; AI cards unchanged.

- [ ] **Step 4: Accessibility + contrast sweep (both themes)**

For each app page, in dark and light mode (toggle via cookie as in Task 5 Step 4):
- Sub-nav scroll-spy sets `aria-current="page"` as you scroll (`preview_eval` scroll + inspect).
- `<details>` disclosures are keyboard-operable with visible focus.
- Version tags, "Read more", timeline body, and CTAs meet contrast in light mode (the cascade-layer trap).
- Gallery images have non-empty `alt`.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(app-pages): final verification fixes"
```

(Skip if nothing needed fixing.)

---

## Optional Task 10 (deferred polish): screenshot lightbox

Not required for the feature. If desired later: wrap each `AppScreenshotGallery` image in a native `<dialog>` lightbox (Escape-closable and focus-trapped for free), opened by a small inline `<script>`. Gate any zoom transition behind `prefers-reduced-motion`. Keep it dependency-free.

---

## Self-Review

**Spec coverage** (against `docs/superpowers/specs/2026-07-06-ios-app-pages-design.md`):
- §1 content architecture (collection + yml join by slug, no duplication) → Tasks 1, 4, 5, 7, 8.
- §2 schema additions → Task 1.
- §3 routing & AppProjectLayout (Editorial product row: header/gallery/subnav/description/features/dev-log) → Task 4.
- §4 UpdateTimeline collapsible/label/version → Task 2.
- §5 git-history authoring process → Tasks 6, 7, 8 (Peaking gets a dedicated content task; Training/Squash fold structure+content).
- §6 imagery/theming (resolveThemedPair, eager-load, dark fallback) → Tasks 3, 4, 5.
- Testing/build sequence → Tasks 5–9. **Deviation noted:** the spec mentioned Storybook stories for the gallery/timeline, but both are Astro components (the repo's Storybook is React-only), so they are verified via `astro build` + preview instead. The gallery lightbox from §3/§testing is deferred to optional Task 10; the a11y sweep (Task 9 Step 4) covers `<details>` and gallery alt text accordingly.

**Placeholder scan:** No code step contains "TBD"/"add X later". The `updates` content in Tasks 6–8 is a *content-authoring* deliverable derived from live repos — those steps give exact gather commands, the exact frontmatter shape, a worked example, and numeric acceptance criteria rather than invented history (fabricating 30+ real historical entries in the plan would be worse than specifying the procedure).

**Type consistency:** `resolveThemedPair(base, baseWebp, light, lightWebp, dark, darkWebp)` used correctly in gallery (Task 3) and layout (Task 4). `UpdateTimeline` prop names `collapsible`/`label` and `Update.version` match between Task 2 (definition) and Tasks 4–8 (use). `AppProject.slug` defined in Task 1, consumed in Task 4's `appProjects.find((p) => p.slug === data.slug)`, produced by yml entries in Tasks 5/7/8. Section ids (`#screenshots`/`#overview`/`#features`/`#updates`) match between the sub-nav links and the section elements, in document order (required by the scroll-spy in `page-nav.ts`).
