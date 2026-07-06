# app-screenshots Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `app-screenshots` skill that ingests iPhone screenshots into the iOS app-page galleries (receive → confirm → resize+webp → wire) and reviews staleness against each app's repo version.

**Architecture:** A small site-repo schema change (`version` + `captured` per screenshot) plus a `~/.claude/skills/app-screenshots/` skill = `SKILL.md` (orchestrates the interactive/judgment parts) + one deterministic image-pipeline helper script. Verification is `npm run build` (no unit-test runner in the site repo) plus a runnable shell smoke test for the helper.

**Tech Stack:** Astro 6 content collections (Zod schema), Bash + `sips` (HEIC/JPEG→PNG, resize) + `cwebp` (webp), macOS `mdls`/`exiftool` (capture date), `git`/`gh`.

## Global Constraints

- **Skill location:** `~/.claude/skills/app-screenshots/` — `SKILL.md` (frontmatter `name: app-screenshots` + a `description` with trigger phrases) and `scripts/process-screenshot.sh`. Match the house SKILL.md style (see `~/.claude/skills/release-notes/SKILL.md`).
- **Site repo:** `/Users/liamday/GitHub/liamday-site` (worktree at `.claude/worktrees/zen-dirac-6d3c01`, branch `claude/app-screenshots-skill`). Public; lands via branch → `npm run build` gate → PR + squash → Pages deploy (free).
- **Screenshots schema item** is `{ light, light_webp?, dark?, dark_webp?, alt, caption? }` plus the two NEW optional fields this plan adds: `version` (string, e.g. `"v1.7"`) and `captured` (string, e.g. `"2026-06"`). All additive/optional; the gallery ignores the two new fields.
- **Image pipeline defaults:** max dimension **1200px**, webp quality **90**. Assets go to `public/assets/images/projects/<slug>/` named `<slug>-NN-<screen>.{png,webp}`.
- **Slug → repo → mdx mapping** (fixed): `peaking → ~/GitHub/Peaking → src/content/projects/peaking.mdx`; `training → ~/GitHub/Training → src/content/projects/training.mdx`; `rallying → ~/GitHub/Rallying → src/content/projects/rallying.mdx`.
- **British English** in any copy the skill drafts (alt text / captions). **Removals are always confirmed** — nothing auto-deletes.
- **Skill files & git:** `~/.claude/skills/` may or may not be under version control. After creating skill files, commit them only if `~/.claude` is a git repo (`git -C ~/.claude rev-parse --is-inside-work-tree`); otherwise the files are simply installed in place. Site-repo changes always commit to the `claude/app-screenshots-skill` branch.

---

## Task 1: Add `version` + `captured` to the screenshots schema (site repo)

**Files:**
- Modify: `src/content.config.ts` (the `screenshots` array object in the `projects` collection)

**Interfaces:**
- Produces: MDX `screenshots[]` items may now carry `version?: string` and `captured?: string`. Additive; existing content (empty galleries) unaffected.

- [ ] **Step 1: Add the two fields**

In `src/content.config.ts`, in the `screenshots` `z.array(z.object({ ... }))`, add two fields after `caption`:

```ts
          caption: z.string().optional(),
          version: z.string().optional(),
          captured: z.string().optional(),
```

- [ ] **Step 2: Verify the build (schema compiles, nothing regresses)**

Run: `npm run build`
Expected: succeeds (19 pages). No content uses the new fields yet, so this only proves the schema compiles.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(schema): add version + captured to screenshot items (for screenshot skill)"
```

---

## Task 2: Image-pipeline helper + smoke test

**Files:**
- Create: `~/.claude/skills/app-screenshots/scripts/process-screenshot.sh`
- Create: `~/.claude/skills/app-screenshots/scripts/smoke-test.sh`

**Interfaces:**
- Produces: `process-screenshot.sh SRC SLUG ORDER SCREEN [MAXDIM] [SITE_ROOT]` — converts SRC (png/jpg/heic) to `<SITE_ROOT>/public/assets/images/projects/<SLUG>/<SLUG>-<ORDER>-<SCREEN>.{png,webp}` (max dimension MAXDIM, default 1200; webp q90). Prints three lines: `PNG=<web path>`, `WEBP=<web path>`, `CAPTURED=<YYYY-MM|unknown>`. Exits non-zero on a missing/invalid source. Consumed by the SKILL.md ingest flow (Task 3).

- [ ] **Step 1: Write the smoke test (the failing test)**

Create `~/.claude/skills/app-screenshots/scripts/smoke-test.sh`:

```bash
#!/usr/bin/env bash
# Smoke test for process-screenshot.sh. Uses a real repo PNG as a stand-in source,
# derives a HEIC from it to exercise format conversion, and asserts outputs.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
SCRIPT="$HERE/process-screenshot.sh"
SEED=/Users/liamday/GitHub/liamday-site/public/assets/images/projects/PeakingAppIcon-256.png
TMP=$(mktemp -d)
SITE="$TMP/site"; mkdir -p "$SITE"
cp "$SEED" "$TMP/src.png"
sips -s format heic "$TMP/src.png" --out "$TMP/src.heic" >/dev/null 2>&1 || true

# PNG input → png + webp produced, dimension capped
"$SCRIPT" "$TMP/src.png" peaking 01 test-screen 1200 "$SITE"
D="$SITE/public/assets/images/projects/peaking"
[ -f "$D/peaking-01-test-screen.png" ]  || { echo "FAIL: png not created"; exit 1; }
[ -f "$D/peaking-01-test-screen.webp" ] || { echo "FAIL: webp not created"; exit 1; }
W=$(sips -g pixelWidth "$D/peaking-01-test-screen.png" | awk '/pixelWidth/{print $2}')
[ "$W" -le 1200 ] || { echo "FAIL: width $W > 1200"; exit 1; }

# HEIC input → converts to png (only if HEIC seed was created)
if [ -f "$TMP/src.heic" ]; then
  "$SCRIPT" "$TMP/src.heic" peaking 02 heic-screen 1200 "$SITE"
  [ -f "$D/peaking-02-heic-screen.png" ] || { echo "FAIL: heic->png not created"; exit 1; }
fi

# missing source → non-zero exit
if "$SCRIPT" /no/such/file.png peaking 03 missing 1200 "$SITE" 2>/dev/null; then
  echo "FAIL: expected non-zero exit on missing source"; exit 1
fi

echo "SMOKE PASS"
rm -rf "$TMP"
```

- [ ] **Step 2: Run the smoke test — verify it fails**

Run: `mkdir -p ~/.claude/skills/app-screenshots/scripts && chmod +x ~/.claude/skills/app-screenshots/scripts/smoke-test.sh && ~/.claude/skills/app-screenshots/scripts/smoke-test.sh`
Expected: FAIL — `process-screenshot.sh` doesn't exist yet (script not found / exits non-zero before "SMOKE PASS").

- [ ] **Step 3: Write the helper script**

Create `~/.claude/skills/app-screenshots/scripts/process-screenshot.sh`:

```bash
#!/usr/bin/env bash
# Convert one app screenshot into web assets (PNG + WebP) for a liamday-site app gallery.
#
# Usage: process-screenshot.sh SRC SLUG ORDER SCREEN [MAXDIM] [SITE_ROOT]
#   SRC        source image (png / jpg / heic)
#   SLUG       app slug (peaking | training | rallying)
#   ORDER      zero-padded order, e.g. 01
#   SCREEN     screen slug, e.g. discovery-map
#   MAXDIM     max dimension in px (default 1200)
#   SITE_ROOT  site repo root (default: current directory)
#
# Prints (stdout): PNG=<web path>, WEBP=<web path>, CAPTURED=<YYYY-MM|unknown>
set -euo pipefail

if [ $# -lt 4 ]; then
  echo "usage: process-screenshot.sh SRC SLUG ORDER SCREEN [MAXDIM] [SITE_ROOT]" >&2
  exit 2
fi

SRC=$1; SLUG=$2; ORDER=$3; SCREEN=$4; MAXDIM=${5:-1200}; SITE_ROOT=${6:-$(pwd)}
[ -f "$SRC" ] || { echo "no such source image: $SRC" >&2; exit 2; }

DEST_DIR="$SITE_ROOT/public/assets/images/projects/$SLUG"
mkdir -p "$DEST_DIR"
BASE="$SLUG-$ORDER-$SCREEN"
PNG="$DEST_DIR/$BASE.png"
WEBP="$DEST_DIR/$BASE.webp"

# Capture date, best effort, BEFORE processing strips metadata:
# EXIF DateTimeOriginal via exiftool if present, else Spotlight creation date via mdls.
CAP=""
if command -v exiftool >/dev/null 2>&1; then
  CAP=$(exiftool -s3 -d '%Y-%m' -DateTimeOriginal "$SRC" 2>/dev/null | head -1)
fi
if [ -z "$CAP" ]; then
  CAP=$(mdls -raw -name kMDItemContentCreationDate "$SRC" 2>/dev/null | cut -c1-7)
fi
case "$CAP" in ""|"(nul"*|"(nu"*) CAP="unknown";; esac

# Convert (any input format) to PNG and fit within MAXDIM in one sips pass.
sips -s format png -Z "$MAXDIM" "$SRC" --out "$PNG" >/dev/null
# WebP alongside.
cwebp -quiet -q 90 "$PNG" -o "$WEBP" >/dev/null

echo "PNG=/assets/images/projects/$SLUG/$BASE.png"
echo "WEBP=/assets/images/projects/$SLUG/$BASE.webp"
echo "CAPTURED=${CAP:-unknown}"
```

- [ ] **Step 4: Make executable and run the smoke test — verify it passes**

Run: `chmod +x ~/.claude/skills/app-screenshots/scripts/process-screenshot.sh && ~/.claude/skills/app-screenshots/scripts/smoke-test.sh`
Expected: prints `PNG=…`, `WEBP=…`, `CAPTURED=…` lines for the two runs, then `SMOKE PASS`.

- [ ] **Step 5: Commit (only if ~/.claude is a git repo)**

```bash
if git -C ~/.claude rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git -C ~/.claude add .claude/skills/app-screenshots/scripts/ 2>/dev/null || git -C ~/.claude add skills/app-screenshots/scripts/
  git -C ~/.claude commit -m "feat(app-screenshots): image-pipeline helper + smoke test"
else
  echo "~/.claude is not a git repo — skill script installed in place (no commit)."
fi
```

---

## Task 3: Write SKILL.md (ingest + staleness modes)

**Files:**
- Create: `~/.claude/skills/app-screenshots/SKILL.md`

**Interfaces:**
- Consumes: `process-screenshot.sh` (Task 2); the `version`/`captured` schema fields (Task 1).
- Produces: the invokable `app-screenshots` skill. Validated end-to-end in Task 4.

- [ ] **Step 1: Write SKILL.md**

Create `~/.claude/skills/app-screenshots/SKILL.md` with exactly this content:

````markdown
---
name: app-screenshots
description: Ingest iPhone screenshots into the liamday-site iOS app-page galleries (Peaking, Training, Rallying) and review staleness. Ingest mode receives dragged-in screenshots (HEIC/JPEG/PNG), drafts each shot's app/screen/alt/caption/order for confirmation, resizes + generates webp, and wires them into the app's MDX gallery. Review mode compares each screenshot's captured version to the app's current repo version and removes stale ones on confirmation. Use when the user says 'add/ingest screenshots for <app>', 'update <app> screenshots', 'review stale screenshots', or /app-screenshots.
---

# app-screenshots

Manage the screenshot galleries on the liamday-site iOS app pages. Two modes: **ingest** and **review**.

## Fixed mapping

| slug | app repo | mdx file |
|---|---|---|
| peaking | ~/GitHub/Peaking | src/content/projects/peaking.mdx |
| training | ~/GitHub/Training | src/content/projects/training.mdx |
| rallying | ~/GitHub/Rallying | src/content/projects/rallying.mdx |

Site repo: `~/GitHub/liamday-site` (work on a branch off `main`). Verify with `npm run build`. Removals are ALWAYS confirmed. British English in alt text / captions.

## Determining the mode

- "add/ingest/update screenshots" → **Ingest**.
- "review stale / out-of-date screenshots" → **Review**.
If ambiguous, ask which.

## Ingest mode

1. **Branch.** In `~/GitHub/liamday-site`, ensure a clean branch off `main` (e.g. `git checkout -b screenshots-<slug>-<YYYY-MM-DD> origin/main`), or reuse the current feature branch if the user is mid-flow.
2. **Gather source images.** Accept images the user dropped into the chat, an explicit list of paths, or a folder. If chat-dropped images are not present on disk at a readable path (needed for `sips`), ask the user to drop them into an inbox folder (default `~/Downloads/app-screenshots/`) and read from there. List what you found and confirm before processing.
3. **Per image — draft, then confirm.** `Read` each image and propose:
   - **app** (peaking / training / rallying),
   - a short **screen/function label** (→ a kebab screen-slug, e.g. "Peak discovery map" → `discovery-map`),
   - **alt** text (British English, describes the screen for a screen-reader),
   - an optional **caption** (short),
   - a suggested **order** among the batch.
   Default **version** to the app repo's current tag: `git -C <repo> describe --tags --match 'v*' --abbrev=0 2>/dev/null` (fall back to the latest tag of any kind, then to "unreleased"). The helper reports **captured** from EXIF. Present all of this and let the user approve/edit each field before writing anything.
4. **Process each confirmed image** with the helper (run from the site repo root so paths resolve):
   ```bash
   ~/.claude/skills/app-screenshots/scripts/process-screenshot.sh <SRC> <slug> <NN> <screen-slug> 1200 ~/GitHub/liamday-site
   ```
   Capture its `PNG=`, `WEBP=`, `CAPTURED=` output for wiring.
5. **Wire the MDX.** Edit the app's mdx frontmatter. If it has no `screenshots:` key, add one; append each entry IN CONFIRMED ORDER:
   ```yaml
   screenshots:
     - light: <PNG web path>
       light_webp: <WEBP web path>
       alt: "<alt>"
       caption: "<caption>"        # omit if none
       version: <version>
       captured: "<CAPTURED>"      # omit if "unknown"
   ```
   Add `dark`/`dark_webp` only if the user supplied a dark-appearance capture of the same screen (process it the same way with a `-dark` screen-slug suffix and set the two dark fields).
6. **Verify.** `npm run build` (from the site repo). Confirm `/projects/<slug>/` still builds and the gallery now has entries. Optionally preview `http://localhost:4321/projects/<slug>/?preview`.
7. **Hand off.** Commit on the branch (`feat(<slug>): add app screenshots`). Ask whether to open a PR (`gh pr create`, base `main`) or leave the branch for the user.

## Review mode (staleness)

1. **Pick app(s).** Default to all three; or the one the user named.
2. **Current version per app.** `git -C <repo> describe --tags --match 'v*' --abbrev=0` (latest release tag) → else latest tag of any kind → else the latest commit date (`git -C <repo> log -1 --format=%as`).
3. **Compare.** For each `screenshots[]` entry in the app's mdx, compare its `version` to the current version (semantic compare of `vMAJOR.MINOR.PATCH`); when a `version` is missing/incomparable, compare its `captured` (YYYY-MM) to the current tag's date. Mark entries strictly behind the current version as **stale**.
4. **Report.** Present a per-app table: screen (from the filename/caption), captured `version`/`captured`, current version, and Stale? (yes/no). Summarise how many are stale.
5. **Confirm + remove atomically.** For each removal the user confirms: delete the image files (`<slug>-NN-<screen>.png` + `.webp`, and any `-dark` variants) AND the matching frontmatter entry. Never delete without explicit confirmation.
6. **Verify + hand off.** `npm run build`; commit (`chore(<slug>): remove stale screenshots`); offer a PR.

## Notes

- The helper (`scripts/process-screenshot.sh`) is the ONLY thing that writes image files — don't hand-run sips/cwebp.
- Keep filenames stable and ordered (`<slug>-NN-<screen>`); re-ingesting the same screen name overwrites in place.
- If an app repo isn't present under `~/GitHub`, skip its version read and fall back to date-only comparison, and say so.
````

- [ ] **Step 2: Validate the frontmatter + triggers**

Run: `head -5 ~/.claude/skills/app-screenshots/SKILL.md`
Expected: a valid YAML frontmatter block with `name: app-screenshots` and a `description:` containing the trigger phrases ("add/ingest screenshots", "review stale screenshots", "/app-screenshots").

- [ ] **Step 3: Commit (only if ~/.claude is a git repo)**

```bash
if git -C ~/.claude rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git -C ~/.claude add .claude/skills/app-screenshots/SKILL.md 2>/dev/null || git -C ~/.claude add skills/app-screenshots/SKILL.md
  git -C ~/.claude commit -m "feat(app-screenshots): SKILL.md (ingest + review modes)"
else
  echo "~/.claude is not a git repo — SKILL.md installed in place (no commit)."
fi
```

---

## Task 4: End-to-end validation on Peaking (REQUIRES the user's real screenshots)

This task exercises the whole skill with real images. **It cannot run until the user provides Peaking screenshots — pause and request them at Step 1.**

**Files:**
- Create: `public/assets/images/projects/peaking/peaking-*.png` + `.webp` (from the user's images)
- Modify: `src/content/projects/peaking.mdx` (add the `screenshots:` block)

**Interfaces:**
- Consumes: the full skill (Tasks 1–3).

- [ ] **Step 1: Request the images**

Ask the user to drop 2–4 Peaking screenshots (into the chat or `~/Downloads/app-screenshots/`). Do not proceed until they arrive.

- [ ] **Step 2: Run ingest end-to-end**

Follow the SKILL.md Ingest mode against `peaking`: draft app/screen/alt/caption/order per image, confirm with the user, process each with the helper, and wire the entries into `src/content/projects/peaking.mdx`.

- [ ] **Step 3: Verify the gallery renders**

Run: `npm run build` (expect success; `/projects/peaking/` emitted).
Then preview `http://localhost:4321/projects/peaking/?preview` — confirm the "Screenshots" sub-nav item now appears and the gallery images load in both themes (icons/gallery via `resolveThemedPair`).

- [ ] **Step 4: Verify staleness review**

Temporarily note one entry's `version` as an older tag than Peaking's current (or use its real value), run the SKILL.md Review mode against `peaking`, and confirm it correctly reports current-vs-captured and flags anything behind. Confirm a test removal deletes BOTH the files and the frontmatter entry and that `npm run build` stays green. (Restore/keep whatever the user actually wants shipped.)

- [ ] **Step 5: Commit + offer PR**

```bash
git add public/assets/images/projects/peaking src/content/projects/peaking.mdx
git commit -m "feat(peaking): add app screenshots via app-screenshots skill"
```
Then ask whether to open a PR to `main`.

---

## Self-Review

**Spec coverage** (against `docs/superpowers/specs/2026-07-06-app-screenshots-skill-design.md`):
- D1 schema (`version`+`captured`) → Task 1.
- D2 helper script + smoke test → Task 2.
- D2 SKILL.md ingest mode (Photos-first source, format-tolerance, draft+confirm, EXIF `captured`, repo-tag `version`, resize+webp, wiring) → Task 3 (uses Task 2's helper).
- D2 SKILL.md staleness mode (repo version read, compare, confirmed atomic removal) → Task 3.
- Git/verification handoff (branch → build → PR) → Tasks 3 (SKILL.md instructions) + 4 (real run).
- Testing (helper smoke test; end-to-end ingest + staleness) → Tasks 2 + 4.

**Placeholder scan:** No "TBD"/"add error handling". Task 4 legitimately depends on user-supplied images — this is called out explicitly (pause at Step 1), not a hidden gap; the skill's whole purpose is receiving the user's images.

**Type/interface consistency:** `process-screenshot.sh` argument order (`SRC SLUG ORDER SCREEN [MAXDIM] [SITE_ROOT]`) and its `PNG=/WEBP=/CAPTURED=` output are defined in Task 2 and consumed verbatim by the SKILL.md ingest flow in Task 3. The `screenshots[]` fields written in Task 3 (`light`, `light_webp`, `alt`, `caption`, `version`, `captured`, optional `dark`/`dark_webp`) exactly match the schema — the base fields from main plus the two added in Task 1. Slug→repo→mdx mapping is identical across the Global Constraints, Task 3, and Task 4.
