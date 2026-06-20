# design-sync notes — liamday-site

## Setup specifics
- This is an Astro **app**, not a published library. The component library is bundled for design-sync from `dist-ui/` (built by `npm run build:lib` → tsup → `dist-ui/index.{js,d.ts}`). The converter runs with `--entry dist-ui/index.js`; component discovery reads `dist-ui/index.d.ts` via package.json `types`.
- `cfg.provider = ThemeFrame` supplies the dark charcoal surface for previews. The Storybook decorator can't be bundled by esbuild (it imports `global.css`, which has `@import "tailwindcss"`), so a tiny `ThemeFrame` wrapper component plays that role. `ThemeFrame` and `ExternalLinkIcon` are excluded from the synced set (`componentSrcMap: null`).
- Example images (Hero photo, ProjectCard / ProjectsShowcase icons) are imported from `src/components/ui/__examples__/` and inlined as data URIs (`cfg.storyImports.loaders {".png":"dataurl"}`) so they resolve in previews and the uploaded cards.

## Re-sync risks (watch on next sync)
- **Rebuild order (encoded in `buildCmd`):** before the converter, run `npm run build:lib` (tsup → dist-ui) **and** `npx storybook build -c .storybook -o .design-sync/sb-reference`. Both feed the converter; a stale either one makes grades compare against the wrong artifact.
- **`[FONT_MISSING]` is expected and accepted:** "Styrene B" / "Inter" / "JetBrains Mono" are referenced only by the `.lifeos-architecture` diagram CSS (not the synced components) and were never shipped as `@font-face` on the real site (it uses the system stack). Substitution matches production — not a regression.
- **Hero card framing:** the preview frame is narrower than the `lg` breakpoint, so the Hero stacks (photo above copy) vs the site's 4-col layout. Expected responsive behaviour; graded `match`.
- **TS 6 / tsup:** `tsconfig.json` sets `ignoreDeprecations: "6.0"` so tsup's `--dts` build tolerates the `baseUrl` inherited from `astro/tsconfigs/strict`.
- **Example image drift:** `__examples__/` duplicates five images from `public/assets/images/`. If a real icon/photo changes, refresh the example copy.
