# Theme-aware Project Icons & Hero Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every project icon and case-study hero image a light and a dark variant that tracks the site's active theme.

**Architecture:** A symmetric, backwards-compatible data model (`default` + optional `*_light`/`*_dark`) resolved by one pure helper, rendered as two sibling `<picture>` elements toggled by CSS keyed on `:root[data-theme="light"]`. AI-project light SVGs are authored in-repo; iOS dark-appearance tiles get data slots + a desktop-export handoff doc.

**Tech Stack:** Astro 6, React 19, Tailwind v4 (CSS-first `@theme`), MDX content collections, Storybook 10.

## Global Constraints

- **No new dependencies.** Use what's already in `package.json`.
- **Dark is the default theme** — it has *no* `data-theme` attribute on `<html>`. Light is `:root[data-theme="light"]`. The swap must follow the site's **manual** toggle (`src/scripts/theme-toggle.ts`), never `prefers-color-scheme` alone.
- **Backwards compatible:** a project with no light/dark override must render exactly as it does today (fall back to the existing `default` asset on both themes). Main must stay green at every commit.
- **British spelling** in any prose/comments (colour, behaviour, etc.).
- **No test runner exists.** Verification gates are: `npm run build` (validates the content-collection schema and compiles Astro/TSX), `npm run storybook` (component isolation under both themes), and `npm run dev` preview with the theme picker. Do **not** add vitest/jest.
- **Light-SVG treatment palette** (matches `:root[data-theme="light"]` in `src/styles/global.css`):
  - Field/background: warm light, `#faf6f0 → #f3ede3 → #ece2d4` (keeps the warm identity while sitting on the light `charcoal-900` = `rgb(248 249 251)` page).
  - Primary/neutral marks that were light-on-dark (e.g. `#f3ebde`, `#f3ede3` text bars) → deep warm neutral `#2a2622` / `#1a1d23` for ≥ 3:1 contrast on the light field.
  - Ember accents: keep the ember hue but use the **light-theme ember** so it reads on light — `--ember-200` becomes `#a04400`, `--ember-300` `#b34d09`; mid/strong ember `#cc785c`/`#d87435` stay. Avoid near-white ember stops on a light field.
  - Glow: reduce additive glow opacity (it reads as haze on light); prefer a soft low-opacity shadow (`rgba(0,0,0,0.06)`) over a bright radial bloom.
  - Preserve geometry, `viewBox`, and `role`/`<title>`/`<desc>` a11y markup from the dark source. Suffix internal gradient/`id`s with `-l` to avoid any collision.

---

## File Structure

**New files**
- `src/lib/themed-image.ts` — pure resolver `resolveThemedPair(...)` + shared types.
- `src/components/ui/ThemedImage.tsx` — React dual-`<picture>` renderer.
- `src/components/ui/ThemedImage.astro` — Astro dual-`<picture>` renderer (heroes).
- `src/components/ui/ThemedImage.stories.tsx` — Storybook, both themes.
- `public/assets/images/projects/*-icon-light.svg` (4) + `lifeos-icon-light.svg`.
- `public/assets/images/projects/*-hero-light.svg` (5).
- `docs/handoff/ios-dark-app-icons.md` — Icon Composer export handoff.

**Modified files**
- `src/content.config.ts` — hero light/dark schema fields.
- `src/data/projects.ts` — `AppProject` icon light/dark fields.
- `src/data/app_projects.yml` — `icon_light` (AI entries).
- `src/content/projects/{career-pivot-navigator,open-defence-radar,podforge,lifeos,claude-usage-pacer}.mdx` — `hero_image_light`.
- `src/components/ui/ProjectCard.tsx` — render icon via `ThemedImage`.
- `src/components/ui/ProjectCard.stories.tsx` — add a themed example.
- `src/layouts/ProjectLayout.astro` — render hero via `ThemedImage.astro`.
- `src/styles/global.css` — `.theme-light-only` / `.theme-dark-only` utilities.

---

## Task 1: Foundations — schema fields, types, resolver, CSS utilities

**Files:**
- Create: `src/lib/themed-image.ts`
- Modify: `src/content.config.ts` (projects schema)
- Modify: `src/data/projects.ts` (`AppProject` interface)
- Modify: `src/styles/global.css` (add utilities)

**Interfaces:**
- Produces: `resolveThemedPair(base?, baseWebp?, light?, lightWebp?, dark?, darkWebp?): ThemedPair | null`, plus `interface ThemedSource { src: string; webp?: string }` and `interface ThemedPair { light: ThemedSource; dark: ThemedSource }`. Later tasks import these from `../../lib/themed-image` (React) / `../lib/themed-image` (Astro).

- [ ] **Step 1: Create the resolver helper**

Create `src/lib/themed-image.ts`:

```ts
// Resolves a base image plus optional light/dark overrides into a concrete
// pair. Dark theme (site default) prefers the dark override; light theme
// prefers the light override; both fall back to the base, then to each other,
// so a project with no overrides renders exactly as before on both themes.
export interface ThemedSource {
  src: string;
  webp?: string;
}

export interface ThemedPair {
  light: ThemedSource;
  dark: ThemedSource;
}

export function resolveThemedPair(
  base?: string,
  baseWebp?: string,
  light?: string,
  lightWebp?: string,
  dark?: string,
  darkWebp?: string,
): ThemedPair | null {
  const darkSrc = dark ?? base ?? light;
  const lightSrc = light ?? base ?? dark;
  if (!darkSrc || !lightSrc) return null;
  return {
    dark: { src: darkSrc, webp: darkWebp ?? baseWebp },
    light: { src: lightSrc, webp: lightWebp ?? baseWebp },
  };
}
```

- [ ] **Step 2: Verify the resolver's fallback logic with a one-off run**

Run:
```bash
node --input-type=module -e "
import { resolveThemedPair } from './src/lib/themed-image.ts';
" 2>/dev/null || npx tsx -e "
import { resolveThemedPair } from './src/lib/themed-image.ts';
const onlyBase = resolveThemedPair('a.svg', 'a.webp');
const withLight = resolveThemedPair('a.svg', 'a.webp', 'a-light.svg');
const iosDark = resolveThemedPair('t.png', 't.webp', undefined, undefined, 't-dark.png', 't-dark.webp');
const none = resolveThemedPair();
console.log(JSON.stringify({ onlyBase, withLight, iosDark, none }, null, 2));
"
```
Expected (tsx path): `onlyBase` has `dark.src === light.src === 'a.svg'`; `withLight.light.src === 'a-light.svg'` and `withLight.dark.src === 'a.svg'`; `iosDark.dark.src === 't-dark.png'` and `iosDark.light.src === 't.png'`; `none === null`.

> If neither `node` (with TS loader) nor `tsx` is available, skip this step — Task 2's `npm run build` compiles and exercises the helper; the assertions above are still the acceptance criteria for the code you wrote.

- [ ] **Step 3: Add hero light/dark fields to the content schema**

In `src/content.config.ts`, inside the `projects` collection `schema`, immediately after the existing `hero_image_webp: z.string().optional(),` line, add:

```ts
    hero_image_light: z.string().optional(),
    hero_image_light_webp: z.string().optional(),
    hero_image_dark: z.string().optional(),
    hero_image_dark_webp: z.string().optional(),
```

- [ ] **Step 4: Add icon light/dark fields to the AppProject type**

In `src/data/projects.ts`, inside the `AppProject` interface, immediately after `icon_webp?: string;`, add:

```ts
  icon_light?: string;
  icon_light_webp?: string;
  icon_dark?: string;
  icon_dark_webp?: string;
```

- [ ] **Step 5: Add the visibility utilities to global.css**

In `src/styles/global.css`, append (top level, unlayered — matching the file's existing unlayered override convention noted in project memory):

```css
/* ──────────────────────────────────────────────────────────────────────────
   Theme-aware image swap. Dark is the default theme (no data-theme attribute):
   the dark variant shows, the light variant is hidden. Under the manual light
   toggle, the pair flips. `revert` restores <picture>'s natural inline display.
   ────────────────────────────────────────────────────────────────────────── */
.theme-light-only { display: none; }
:root[data-theme="light"] .theme-dark-only { display: none; }
:root[data-theme="light"] .theme-light-only { display: revert; }
```

- [ ] **Step 6: Verify the build accepts the schema/type changes**

Run: `npm run build`
Expected: build completes with no schema or TypeScript errors, and generates the same pages as before (10 project pages).

- [ ] **Step 7: Commit**

```bash
git add src/lib/themed-image.ts src/content.config.ts src/data/projects.ts src/styles/global.css
git commit -m "feat: theme-image foundations — resolver, schema/type slots, CSS utilities"
```

---

## Task 2: ThemedImage components (React + Astro) + Storybook

**Files:**
- Create: `src/components/ui/ThemedImage.tsx`
- Create: `src/components/ui/ThemedImage.astro`
- Create: `src/components/ui/ThemedImage.stories.tsx`
- Modify: `src/components/ui/index.ts` (export the React component)

**Interfaces:**
- Consumes: `ThemedSource` from `../../lib/themed-image`.
- Produces (React): `ThemedImage(props: ThemedImageProps)` where
  `interface ThemedImageProps { light: ThemedSource; dark: ThemedSource; alt: string; width?: number; height?: number; className?: string; pictureClassName?: string; loading?: 'lazy' | 'eager' }`.
- Produces (Astro): same prop names, with `class`/`pictureClass` instead of `className`/`pictureClassName`.

- [ ] **Step 1: Create the React component**

Create `src/components/ui/ThemedImage.tsx`:

```tsx
import type { ThemedSource } from '../../lib/themed-image';

export interface ThemedImageProps {
  light: ThemedSource;
  dark: ThemedSource;
  alt: string;
  width?: number;
  height?: number;
  /** Applied to each <img>. */
  className?: string;
  /** Applied to each <picture> wrapper (sizing/layout). */
  pictureClassName?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Renders both a dark and a light variant of an image; CSS
 * (.theme-dark-only / .theme-light-only) shows the one matching the active
 * theme. When both variants resolve to the same file the browser dedupes the
 * request, so a variant-less image costs nothing extra.
 */
export function ThemedImage({
  light,
  dark,
  alt,
  width,
  height,
  className,
  pictureClassName,
  loading = 'lazy',
}: ThemedImageProps) {
  const pic = (variant: ThemedSource, themeClass: string) => (
    <picture className={[themeClass, pictureClassName].filter(Boolean).join(' ')}>
      {variant.webp && <source srcSet={variant.webp} type="image/webp" />}
      <img className={className} src={variant.src} alt={alt} loading={loading} width={width} height={height} />
    </picture>
  );
  return (
    <>
      {pic(dark, 'theme-dark-only')}
      {pic(light, 'theme-light-only')}
    </>
  );
}

export default ThemedImage;
```

- [ ] **Step 2: Create the Astro component**

Create `src/components/ui/ThemedImage.astro`:

```astro
---
import type { ThemedSource } from '../../lib/themed-image';

interface Props {
  light: ThemedSource;
  dark: ThemedSource;
  alt: string;
  width?: number;
  height?: number;
  class?: string;
  pictureClass?: string;
  loading?: 'lazy' | 'eager';
}

const { light, dark, alt, width, height, class: klass, pictureClass, loading = 'eager' } = Astro.props;
---

<picture class:list={['theme-dark-only', pictureClass]}>
  {dark.webp && <source srcset={dark.webp} type="image/webp" />}
  <img src={dark.src} alt={alt} class={klass} loading={loading} width={width} height={height} />
</picture>
<picture class:list={['theme-light-only', pictureClass]}>
  {light.webp && <source srcset={light.webp} type="image/webp" />}
  <img src={light.src} alt={alt} class={klass} loading={loading} width={width} height={height} />
</picture>
```

- [ ] **Step 3: Export the React component**

In `src/components/ui/index.ts`, after the `export { ProjectCard } from './ProjectCard';` line, add:

```ts
export { ThemedImage } from './ThemedImage';
export type { ThemedImageProps } from './ThemedImage';
```

- [ ] **Step 4: Create a Storybook story that renders both themes**

Create `src/components/ui/ThemedImage.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemedImage } from './ThemedImage';
import odrDark from './__examples__/open-defence-radar-icon.png';

const meta = {
  title: 'UI/ThemedImage',
  component: ThemedImage,
  args: {
    // Same src both sides here just proves wiring; the swap is verified by the
    // Light decorator flipping data-theme (see below).
    dark: { src: odrDark as unknown as string },
    light: { src: odrDark as unknown as string },
    alt: 'Example icon',
    width: 128,
    height: 128,
    className: 'h-32 w-32 object-cover',
  },
} satisfies Meta<typeof ThemedImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkTheme: Story = {
  decorators: [(Story) => <div className="bg-charcoal-900 p-10" data-theme-preview="dark">{Story()}</div>],
};

export const LightTheme: Story = {
  decorators: [
    (Story) => {
      // Flip the document theme so .theme-light-only / .theme-dark-only resolve
      // to the light branch for this story.
      if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', 'light');
      return <div className="bg-charcoal-900 p-10">{Story()}</div>;
    },
  ],
};
```

- [ ] **Step 5: Verify build + Storybook**

Run: `npm run build`
Expected: passes (both components compile; the React one is bundled into the library via `index.ts`).

Run: `npm run storybook` and open `UI/ThemedImage`.
Expected: both `DarkTheme` and `LightTheme` render the example icon (identical image here — the point is that the correct `<picture>` is the visible one; inspect the DOM to confirm the `theme-dark-only`/`theme-light-only` wrappers exist and the off-theme one is `display:none`).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ThemedImage.tsx src/components/ui/ThemedImage.astro src/components/ui/ThemedImage.stories.tsx src/components/ui/index.ts
git commit -m "feat: ThemedImage (React + Astro) dual-picture theme swap"
```

---

## Task 3: Wire ProjectCard icons through ThemedImage

**Files:**
- Modify: `src/components/ui/ProjectCard.tsx`
- Modify: `src/components/ui/ProjectCard.stories.tsx`

**Interfaces:**
- Consumes: `ThemedImage` (Task 2), `resolveThemedPair` (Task 1).

- [ ] **Step 1: Import the helper and component in ProjectCard**

In `src/components/ui/ProjectCard.tsx`, update the imports at the top. After the existing `import { ExternalLinkIcon } from './icons';` line, add:

```tsx
import { ThemedImage } from './ThemedImage';
import { resolveThemedPair } from '../../lib/themed-image';
```

- [ ] **Step 2: Destructure the new icon fields**

Replace the destructuring line:

```tsx
  const { name, platform, status, icon, icon_webp, audience, summary, technologies, features, link, link_label } =
    project;
```

with:

```tsx
  const {
    name, platform, status, icon, icon_webp,
    icon_light, icon_light_webp, icon_dark, icon_dark_webp,
    audience, summary, technologies, features, link, link_label,
  } = project;
  const iconPair = resolveThemedPair(icon, icon_webp, icon_light, icon_light_webp, icon_dark, icon_dark_webp);
```

- [ ] **Step 3: Replace the icon `<picture>` with ThemedImage**

Replace this block:

```tsx
        {icon ? (
          <picture className="h-32 w-32 shrink-0">
            {icon_webp && <source srcSet={icon_webp} type="image/webp" />}
            <img
              className="h-32 w-32 object-cover"
              src={icon}
              alt={`${name} app icon`}
              loading="lazy"
              width={128}
              height={128}
            />
          </picture>
        ) : (
```

with:

```tsx
        {iconPair ? (
          <ThemedImage
            light={iconPair.light}
            dark={iconPair.dark}
            alt={`${name} app icon`}
            width={128}
            height={128}
            className="h-32 w-32 object-cover"
            pictureClassName="h-32 w-32 shrink-0"
          />
        ) : (
```

(The `: (` placeholder-branch that follows — the `✦` fallback tile — is unchanged.)

- [ ] **Step 4: Add a themed example to the ProjectCard story**

In `src/components/ui/ProjectCard.stories.tsx`, add a light-icon example. After the existing `import peakingIcon ...` line, add:

```tsx
import odrIconLight from './__examples__/open-defence-radar-icon.png';
```

At the end of the file, after the `NoIcon` story, add:

```tsx
// Verifies the light-variant slot: passing icon_light swaps the tile under the
// light theme (use the Storybook DOM inspector / a data-theme=light wrapper).
export const ThemedIcon: Story = {
  args: { project: { ...odr, icon_light: odrIconLight as unknown as string } },
  decorators: [
    (Story) => {
      if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', 'light');
      return <div className="max-w-2xl">{Story()}</div>;
    },
  ],
};
```

> Note: there is no separate light example PNG in `__examples__`; reusing `open-defence-radar-icon.png` is only to prove the wiring compiles and renders. The real light SVGs land in Task 5.

- [ ] **Step 5: Verify build + card render**

Run: `npm run build`
Expected: passes.

Run: `npm run storybook`, open `UI/ProjectCard` → `CaseStudy` (dark) and `ThemedIcon` (light).
Expected: `CaseStudy` looks identical to before (dark, no regression); `ThemedIcon` renders under `data-theme=light` with the icon present.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ProjectCard.tsx src/components/ui/ProjectCard.stories.tsx
git commit -m "feat: ProjectCard renders icons via ThemedImage"
```

---

## Task 4: Wire ProjectLayout hero through ThemedImage.astro

**Files:**
- Modify: `src/layouts/ProjectLayout.astro`

**Interfaces:**
- Consumes: `ThemedImage.astro` (Task 2), `resolveThemedPair` (Task 1).

- [ ] **Step 1: Import in the layout frontmatter**

In `src/layouts/ProjectLayout.astro`, in the `---` frontmatter, after `import UpdateTimeline from '../components/UpdateTimeline.astro';` add:

```ts
import ThemedImage from '../components/ui/ThemedImage.astro';
import { resolveThemedPair } from '../lib/themed-image';
```

Then, after the `const data = project.data;` line, add:

```ts
const heroPair = resolveThemedPair(
  data.hero_image,
  data.hero_image_webp,
  data.hero_image_light,
  data.hero_image_light_webp,
  data.hero_image_dark,
  data.hero_image_dark_webp,
);
```

- [ ] **Step 2: Replace the hero `<picture>` with ThemedImage**

Replace the `data.hero_image && (...)` figure block. Change the outer condition from `data.hero_image` to `heroPair`, and swap the inner `<picture>…</picture>` for the component:

```astro
        {
          heroPair && (
            <figure class="mt-10">
              <ThemedImage
                light={heroPair.light}
                dark={heroPair.dark}
                alt={data.hero_image_alt ?? data.title}
                width={data.hero_image_width}
                height={data.hero_image_height}
                class="w-full rounded-2xl shadow-[0_20px_45px_-30px_rgba(0,0,0,0.9)]"
                loading="eager"
              />
              {data.hero_image_caption && (
                <figcaption class="mt-3 text-xs text-aluminum-400">{data.hero_image_caption}</figcaption>
              )}
            </figure>
          )
        }
```

Also update the summary spacing condition on the next block: change `data.hero_image ? 'mt-8' : 'mt-4'` to `heroPair ? 'mt-8' : 'mt-4'`.

- [ ] **Step 3: Verify build + preview toggle**

Run: `npm run build`
Expected: passes; all case-study pages still render their hero.

Run: `npm run dev`, open `http://localhost:4321/projects/open-defence-radar/` (note trailing slash). Toggle the theme picker light↔dark.
Expected: the hero still shows (currently the same dark SVG both ways — the light hero lands in Task 6); no layout shift, no console errors. Confirm the DOM has both `theme-dark-only` and `theme-light-only` `<picture>` wrappers.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/ProjectLayout.astro
git commit -m "feat: ProjectLayout renders hero via ThemedImage"
```

---

## Task 5: Author AI light-theme icons + wire icon_light

**Files:**
- Create: `public/assets/images/projects/career-pivot-navigator-icon-light.svg`
- Create: `public/assets/images/projects/open-defence-radar-icon-light.svg`
- Create: `public/assets/images/projects/podforge-icon-light.svg`
- Create: `public/assets/images/projects/claude-usage-pacer-icon-light.svg`
- Create: `public/assets/images/projects/lifeos-icon-light.svg`
- Modify: `src/data/app_projects.yml`

**Interfaces:**
- Consumes: the `.theme-light-only` wrapper (Task 1) + ProjectCard wiring (Task 3). No code interface; assets + YAML only.

- [ ] **Step 1: Author the four SVG-derived light icons**

For each of `career-pivot-navigator`, `open-defence-radar`, `podforge`, `claude-usage-pacer`: read the existing `…-icon.svg`, and author `…-icon-light.svg` applying the **Light-SVG treatment palette** in Global Constraints. Same `viewBox`/geometry/a11y tags; light warm field; deep-neutral marks; light-theme ember accents; suffix internal `id`s with `-l`.

Acceptance per icon: opened directly in a browser, the mark is clearly legible on a near-white page, ember accents remain visibly ember (not washed out), and the silhouette matches the dark original.

- [ ] **Step 2: Author the LifeOS light icon mark**

LifeOS's current icon is a raster app-tile (`LifeOSAppIcon-256.png`), so there is no SVG to derive from. Author `lifeos-icon-light.svg` as a fresh mark echoing the LifeOS motif described in `src/content/projects/lifeos.mdx` frontmatter (`hero_image_alt`: "a central ember-orange spine surrounded by eight constellation nodes"). Use a 256×256 `viewBox`, the light treatment palette, and include `<title>LifeOS</title>`.

Acceptance: reads as a coherent constellation/spine mark on a near-white field, ember spine visible, 256-square.

- [ ] **Step 3: Wire icon_light for the five AI projects**

In `src/data/app_projects.yml`, add an `icon_light` line directly beneath the existing `icon:` (and `icon_webp:` where present) for each AI project:

- Career Pivot Navigator:
  ```yaml
  icon_light: /assets/images/projects/career-pivot-navigator-icon-light.svg
  ```
- Open Defence Radar:
  ```yaml
  icon_light: /assets/images/projects/open-defence-radar-icon-light.svg
  ```
- PodForge:
  ```yaml
  icon_light: /assets/images/projects/podforge-icon-light.svg
  ```
- Claude Usage Pacer (its `icon` is already an SVG):
  ```yaml
  icon_light: /assets/images/projects/claude-usage-pacer-icon-light.svg
  ```
- LifeOS:
  ```yaml
  icon_light: /assets/images/projects/lifeos-icon-light.svg
  ```

Do **not** add `icon_light` to Peaking / Training / Squash Tracker (Task 7 handles their dark slot).

- [ ] **Step 4: Verify build + preview both themes**

Run: `npm run build`
Expected: passes.

Run: `npm run dev`, open `http://localhost:4321/#projects`. Toggle light↔dark.
Expected: in dark mode the five AI icons are unchanged; in light mode each shows its new light variant, swapping in sync with the page. The three iOS tiles are unchanged in both themes.

- [ ] **Step 5: Commit**

```bash
git add public/assets/images/projects/career-pivot-navigator-icon-light.svg public/assets/images/projects/open-defence-radar-icon-light.svg public/assets/images/projects/podforge-icon-light.svg public/assets/images/projects/claude-usage-pacer-icon-light.svg public/assets/images/projects/lifeos-icon-light.svg src/data/app_projects.yml
git commit -m "feat: light-theme icons for the AI projects"
```

---

## Task 6: Author AI light-theme heroes + wire hero_image_light

**Files:**
- Create: `public/assets/images/projects/career-pivot-navigator-hero-light.svg`
- Create: `public/assets/images/projects/open-defence-radar-hero-light.svg`
- Create: `public/assets/images/projects/podforge-hero-light.svg`
- Create: `public/assets/images/projects/lifeos-hero-light.svg`
- Create: `public/assets/images/projects/claude-usage-pacer-hero-light.svg`
- Modify: the five AI project MDX files' frontmatter.

**Interfaces:**
- Consumes: `heroPair` wiring in `ProjectLayout.astro` (Task 4).

- [ ] **Step 1: Author the five light hero SVGs**

For each of `career-pivot-navigator-hero.svg`, `open-defence-radar-hero.svg`, `podforge-hero.svg`, `lifeos-hero.svg`, `claude-usage-pacer-hero.svg`: read the dark source and author `…-hero-light.svg` applying the **Light-SVG treatment palette**. These heroes are `1600×800` with rich baked gradients — convert the warm-dark radial field to the warm-light field, retune each gradient's darkest stops so the composition reads on light, keep ember focal elements, and drop/soften additive glow layers. Preserve `viewBox`, `preserveAspectRatio`, and the `<title>`/`<desc>` blocks; suffix internal `id`s with `-l`.

Acceptance per hero: rendered full-width on a light page it reads as the same artwork in a light key — no dark band, focal ember element still dominant, no muddy low-contrast regions.

- [ ] **Step 2: Wire hero_image_light in each MDX frontmatter**

In each file, add a `hero_image_light` line directly beneath the existing `hero_image:` line:

- `src/content/projects/career-pivot-navigator.mdx`:
  ```yaml
  hero_image_light: /assets/images/projects/career-pivot-navigator-hero-light.svg
  ```
- `src/content/projects/open-defence-radar.mdx`:
  ```yaml
  hero_image_light: /assets/images/projects/open-defence-radar-hero-light.svg
  ```
- `src/content/projects/podforge.mdx`:
  ```yaml
  hero_image_light: /assets/images/projects/podforge-hero-light.svg
  ```
- `src/content/projects/lifeos.mdx`:
  ```yaml
  hero_image_light: /assets/images/projects/lifeos-hero-light.svg
  ```
- `src/content/projects/claude-usage-pacer.mdx`:
  ```yaml
  hero_image_light: /assets/images/projects/claude-usage-pacer-hero-light.svg
  ```

- [ ] **Step 3: Verify build + preview each case study in both themes**

Run: `npm run build`
Expected: passes.

Run: `npm run dev` and visit each of the five case-study pages (trailing slash), toggling light↔dark on each:
`/projects/career-pivot-navigator/`, `/projects/open-defence-radar/`, `/projects/podforge/`, `/projects/lifeos/`, `/projects/claude-usage-pacer/`.
Expected: dark theme heroes unchanged; light theme shows each light hero, swapping with the page; no layout shift; no console errors.

- [ ] **Step 4: Commit**

```bash
git add public/assets/images/projects/career-pivot-navigator-hero-light.svg public/assets/images/projects/open-defence-radar-hero-light.svg public/assets/images/projects/podforge-hero-light.svg public/assets/images/projects/lifeos-hero-light.svg public/assets/images/projects/claude-usage-pacer-hero-light.svg src/content/projects/career-pivot-navigator.mdx src/content/projects/open-defence-radar.mdx src/content/projects/podforge.mdx src/content/projects/lifeos.mdx src/content/projects/claude-usage-pacer.mdx
git commit -m "feat: light-theme hero images for the AI projects"
```

---

## Task 7: iOS dark-icon slots + Icon Composer handoff doc

**Files:**
- Create: `docs/handoff/ios-dark-app-icons.md`

**Interfaces:**
- Consumes: the `icon_dark` slot resolved by Task 1 + rendered by Task 3. No wiring is switched on yet (assets don't exist); this task delivers the documented handoff and confirms the slot is inert-safe.

- [ ] **Step 1: Write the handoff doc**

Create `docs/handoff/ios-dark-app-icons.md`:

```markdown
# iOS dark-appearance app icons — export & wiring handoff

The website shows a light and a dark variant of every project icon, tracking the
site theme. The three iOS apps (Peaking, Training, Squash Tracker) keep their
current tile as the default/light appearance; the **dark** appearance must be
exported from Apple's **Icon Composer** on a Mac, because it is a real per-app
asset, not a recolour of the light tile.

## Per app (Peaking, Training, SquashTracker)

1. Open the app's icon in **Icon Composer** and select the **Dark** appearance.
2. Export it at **1024×1024 PNG**.
3. Downscale to **256×256** and save it here, matching the existing tile names:
   - `public/assets/images/projects/PeakingAppIcon-256-dark.png`
   - `public/assets/images/projects/TrainingAppIcon-256-dark.png`
   - `public/assets/images/projects/SquashTrackerAppIcon-256-dark.png`
4. Generate the `.webp` sibling for each (matches the existing `-256.webp` set):
   ```bash
   cd public/assets/images/projects
   for f in PeakingAppIcon-256-dark TrainingAppIcon-256-dark SquashTrackerAppIcon-256-dark; do
     cwebp -q 82 "$f.png" -o "$f.webp"
   done
   ```
   (If `cwebp` is unavailable: `brew install webp`. A `.webp` is optional — the
   `.png` alone works; the resolver just won't have a webp source.)
5. Add the `icon_dark` (and `icon_dark_webp`) lines to `src/data/app_projects.yml`
   under each app's existing `icon:`/`icon_webp:`:

   Peaking:
   ```yaml
   icon_dark: /assets/images/projects/PeakingAppIcon-256-dark.png
   icon_dark_webp: /assets/images/projects/PeakingAppIcon-256-dark.webp
   ```
   Training:
   ```yaml
   icon_dark: /assets/images/projects/TrainingAppIcon-256-dark.png
   icon_dark_webp: /assets/images/projects/TrainingAppIcon-256-dark.webp
   ```
   Squash Tracker:
   ```yaml
   icon_dark: /assets/images/projects/SquashTrackerAppIcon-256-dark.png
   icon_dark_webp: /assets/images/projects/SquashTrackerAppIcon-256-dark.webp
   ```
6. `npm run build`, then `npm run dev` and toggle the theme on `/#projects`:
   the three tiles should switch to their dark-appearance icon in dark mode.

Until these land, `icon_dark` is unset and the current tile shows on both
themes — no regression.
```

- [ ] **Step 2: Verify build (slots remain inert)**

Run: `npm run build`
Expected: passes. No `icon_dark` fields are set yet, so the iOS tiles render today's asset on both themes.

- [ ] **Step 3: Commit**

```bash
git add docs/handoff/ios-dark-app-icons.md
git commit -m "docs: iOS dark app-icon export & wiring handoff"
```

---

## Task 8: Full-site verification pass

**Files:** none (verification only; may touch `__examples__`/stories if a regression is found).

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: clean build, 10 project pages generated.

- [ ] **Step 2: Preview the showcase in both themes**

Run: `npm run dev`, open `http://localhost:4321/#projects`.
- Dark (default): all eight project icons look as they did before this feature.
- Toggle light: the five AI icons swap to their light variants; the three iOS tiles are unchanged (dark slot still empty).
- No console errors; no layout shift on toggle; the swap is in sync with the page (no flash of the wrong variant on first paint — reload with the cookie set to light and confirm the light variant paints immediately).

- [ ] **Step 3: Preview every case study in both themes**

For each of the five AI case studies (`/projects/<slug>/`), toggle light↔dark and confirm the hero swaps correctly. For the iOS/other project pages that have no hero, confirm no regression.

- [ ] **Step 4: Screenshot proof**

Capture a light-mode and a dark-mode screenshot of the projects showcase and one case-study hero, to attach to the PR.

- [ ] **Step 5: Final commit (only if fixes were needed)**

```bash
git add -A
git commit -m "chore: theme-image verification fixes"
```

---

## Self-Review (author's check against the spec)

- **Spec §1 resolution model** → Task 1 (schema + type slots + `resolveThemedPair` with `*_dark ?? default` / `*_light ?? default` and full fallback). ✓
- **Spec §2 swap mechanism** (dual `<picture>` + CSS `data-theme` toggle, no JS/FOUC) → Task 1 (CSS utilities) + Task 2 (components) + Tasks 3–4 (wiring). ✓
- **Spec §3 AI assets** (5 light heroes, 4 light SVG icons, LifeOS new light mark) → Task 5 (icons + LifeOS) + Task 6 (heroes). ✓
- **Spec §4 iOS slots + Icon Composer handoff** → Task 1 (slots) + Task 3 (rendered) + Task 7 (doc, inert until assets land). ✓
- **Spec §5 verification** → Task 8 (build + both themes across showcase and case studies + screenshots). ✓
- **Backwards compatibility** (variant-less renders unchanged) → resolver fallback (Task 1) + inert iOS slots (Task 7) + build gates on every task. ✓
- **Type consistency:** `resolveThemedPair(base, baseWebp, light, lightWebp, dark, darkWebp)` and `ThemedSource { src, webp }` used identically in Tasks 1–4. ✓
- **No new dependencies; British spelling; no test runner introduced.** ✓
```
