# app-screenshots skill — ingest + staleness review for iOS app-page galleries

**Date:** 2026-07-06
**Status:** Approved (design), pending implementation plan

## Problem

The iOS app pages (`/projects/{peaking,training,rallying}/`) have a themed screenshot
gallery (`AppScreenshotGallery.astro`) that renders from a `screenshots` array in each
app's MDX frontmatter — but the galleries currently ship empty (no screenshots captured
yet). Adding screenshots by hand is fiddly: convert/resize each capture, generate a
`.webp`, name and place the files, write correct `alt`/`caption`, and keep the order
right. And once added, screenshots go stale as the apps evolve, with nothing tracking
which app version each shot came from.

We want a repeatable **skill** that (1) ingests screenshots — receive → confirm →
process → wire into the page — and (2) reviews staleness — flag shots that predate the
app's current version and remove them on confirmation.

## Constraints & context

- **How screenshots actually arrive:** dragged out of the **macOS Photos app** (iCloud-
  synced from Liam's iPhone), either dropped into the chat or into an inbox folder. So
  the pipeline must tolerate **HEIC/JPEG as well as PNG**, and **generic filenames**
  (`IMG_1234`, UUIDs) that carry no ordering or meaning. iPhone screenshots do carry a
  **capture date** in metadata.
- **Target data model (already shipped, main @ 6c96dd5):** each app page's MDX
  `screenshots` array items are `{ light, light_webp?, dark?, dark_webp?, alt, caption? }`
  (schema in `src/content.config.ts`). The gallery renders only when the array is
  non-empty; a missing `dark` falls back to `light` via `resolveThemedPair`. Assets live
  under `public/assets/images/projects/<slug>/`.
- **Skill ecosystem:** personal skills live in `~/.claude/skills/<name>/SKILL.md` (YAML
  frontmatter: `name` + a `description` with trigger phrases). Some skills carry a
  trailer prefix (`~/.claude/skills/_shared/trailers.md`). Follow these conventions.
- **App repos** (for staleness): `~/GitHub/Peaking`, `~/GitHub/Training`,
  `~/GitHub/Rallying`. `gh`/`git` authenticated. Slug→repo→mdx mapping is fixed and small.
- **Site workflow:** `liamday-site` is public; changes land via PR + squash → Pages
  deploy (free). `npm run build` is the verification gate (no unit-test runner).
- **Image tooling available:** `sips` (HEIC/JPEG→PNG, resize) and `cwebp` (1.6.0) — the
  same pipeline used to produce the Rallying icon.

## Non-goals (agreed out of scope)

- Reading the Photos library directly (no Photos/PhotoKit API) — Liam drags images out.
- Capturing screenshots from a simulator/device (a different concern).
- Auto-deleting anything without explicit confirmation.
- Managing imagery for non-app projects, or any asset other than the app galleries.
- Themed light+dark pairs as the default — single image per screenshot; `dark` only when
  a dark-appearance capture is explicitly provided.

## Decisions locked during brainstorming

1. **Scope:** one skill, **two modes** — ingest AND staleness review — in the first build.
2. **Metadata:** I **draft from the image, you confirm** (app, screen/function label, alt,
   caption, order); `captured` auto-read from EXIF, `version` defaulted from the app repo.
3. **Image handling:** **single image** per screenshot, auto-**resize + webp**; optional
   `dark` only when a dark capture is supplied.
4. **Staleness basis:** **auto from the app's repo** (latest release tag → build tag →
   commit-date fallback); removals always **confirmed**, never automatic.
5. **Architecture:** SKILL.md orchestrates judgment; **one image-pipeline helper script**
   owns the deterministic file ops.

## Design

### 1. Two deliverables (build in this order)

- **D1 — schema change (`liamday-site`, tiny PR):** extend the `screenshots` object in
  `src/content.config.ts` with two optional fields:
  - `version: z.string().optional()` — the app version the shot was captured from (e.g. `"v1.7"`).
  - `captured: z.string().optional()` — capture month/date (e.g. `"2026-06"`), from EXIF.
  Additive and backwards-compatible; the gallery ignores both (they're metadata for the
  skill's staleness logic). Prerequisite for both modes, so it lands first.
- **D2 — the skill (`~/.claude/skills/app-screenshots/`):** `SKILL.md` + one helper script
  `scripts/process-screenshot.sh`. This is the bulk of the work.

### 2. Skill shape

`~/.claude/skills/app-screenshots/`
- `SKILL.md` — frontmatter `name: app-screenshots`; description triggers: "ingest/add
  screenshots for <app>", "update <app> screenshots", "review stale screenshots",
  "/app-screenshots". Body defines the two modes below.
- `scripts/process-screenshot.sh` — the deterministic image pipeline (see §5).

Fixed mapping the skill uses (extensible list):

| slug | repo | mdx |
|---|---|---|
| peaking | ~/GitHub/Peaking | src/content/projects/peaking.mdx |
| training | ~/GitHub/Training | src/content/projects/training.mdx |
| rallying | ~/GitHub/Rallying | src/content/projects/rallying.mdx |

The skill operates on a `liamday-site` branch off `main` and finishes by running the
build and offering a PR (matching the PR+squash → Pages flow).

### 3. Mode 1 — Ingest

1. **Gather source images.** Accept images (a) dropped into the chat, or (b) in a named
   inbox folder / explicit paths. If chat-dropped images aren't reachable on disk for the
   resize step, fall back to asking Liam to drop them into an inbox folder.
2. **Per image — draft, then confirm.** `Read` each image and propose: which app (of the
   three), a screen/function label, `alt` text, an optional `caption`, and a suggested
   display order. Auto-fill `captured` from the image's EXIF capture date (via
   `mdls`/`exiftool`/`sips`, best-effort; fall back to asking) and default `version` to the
   app repo's current tag (§4 read). Liam approves or edits the human bits per image.
3. **Process (helper script, §5).** Convert HEIC/JPEG→PNG if needed, downscale to a
   web-friendly max dimension, emit `<slug>-NN-<screen>.png` + `.webp` into
   `public/assets/images/projects/<slug>/`.
4. **Wire.** Insert the confirmed entries into the app's MDX `screenshots:` frontmatter,
   in order:
   ```yaml
   screenshots:
     - light: /assets/images/projects/peaking/peaking-01-discovery-map.png
       light_webp: /assets/images/projects/peaking/peaking-01-discovery-map.webp
       alt: "Peaking's peak-discovery map with clustered summits"
       caption: "Discovery map"        # optional
       version: v1.7
       captured: "2026-06"
   ```
   (`dark`/`dark_webp` added only when a dark capture was supplied for that screen.)
5. **Verify + hand off.** Run `npm run build`; the "Screenshots" sub-nav item + gallery
   now render. Commit on the branch; offer a PR.

### 4. Mode 2 — Staleness review

1. **Current version per app.** Read from the repo: `git -C <repo> describe --tags
   --match 'v*' --abbrev=0` (latest release tag) → else latest tag of any kind → else
   latest commit date. Cache per run.
2. **Compare.** For each screenshot entry, compare its `version` (semantic compare) — or,
   when versions are absent/incomparable, its `captured` date vs the app's current tag
   date — and mark entries that predate the current version as **stale**.
3. **Report + confirm.** Present a per-app table (screen, captured version/date, current
   version, stale?). Liam confirms which to remove.
4. **Remove atomically.** For each confirmed removal, delete BOTH the image files (png +
   webp, and dark variants if present) AND the frontmatter entry. Run `npm run build`;
   commit on the branch; offer a PR.

### 5. Helper script — `scripts/process-screenshot.sh`

Single responsibility: one source image → web assets, deterministically.

- **Input:** source path, dest slug, zero-padded order (`NN`), screen-slug, and a
  max-dimension (default height 1200px — retina-friendly for the gallery's ~440px render).
- **Steps:** if HEIC/JPEG, `sips -s format png` to a temp PNG; `sips -Z <max>` to downscale
  preserving aspect; write `<slug>-NN-<screen>.png`; `cwebp -q 90` → `.webp`; both into
  `public/assets/images/projects/<slug>/` (mkdir -p).
- **Output:** prints the two created web paths (for the skill to wire) and, best-effort,
  the source's EXIF capture date.
- Idempotent on re-run for the same name (overwrites); never touches git.

### 6. Git & verification handoff

The skill makes edits on a `liamday-site` branch (e.g. `claude/screenshots-<slug>-<date>`),
runs `npm run build` as the gate, and offers to open a PR with `gh` (or defer to the
`integrate` skill). Nothing is pushed/merged without confirmation.

## Testing & verification

- **Helper script smoke test:** feed a sample PNG (and, if available, a HEIC) → assert the
  correct `<slug>-NN-<screen>.{png,webp}` are produced at the expected max dimension, in
  the right folder. Assert non-image input errors cleanly.
- **Schema (D1):** `npm run build` validates the two new optional fields; existing pages
  (empty galleries) unaffected.
- **End-to-end ingest:** run against one real app with 1–2 sample screenshots; `npm run
  build` + preview confirm the gallery + "Screenshots" nav render and images load in both
  themes.
- **End-to-end staleness:** seed one entry with an old `version`, run review, confirm it's
  flagged, confirm removal deletes files + frontmatter together and the build stays green.

## Build sequence

1. **D1** — schema fields (`content.config.ts`), small PR.
2. **D2** — `process-screenshot.sh` + smoke test.
3. **D2** — `SKILL.md` ingest mode, validated end-to-end on one app.
4. **D2** — `SKILL.md` staleness mode, validated end-to-end.

## Open questions (non-blocking; author's call during implementation)

- Exact max image dimension / webp quality (default 1200px / q90).
- Inbox folder location for the drag-drop fallback (e.g. `~/Downloads/app-screenshots/`).
- Whether the skill auto-commits+PRs or stops at a built branch by default.
