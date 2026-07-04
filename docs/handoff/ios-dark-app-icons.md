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
