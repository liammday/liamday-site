# iOS dark-appearance app icons — source & refresh

The website shows a light and a dark variant of every project icon, tracking the
site theme. The three iOS apps (Peaking, Training, Squash Tracker) keep their
current tile as the default/light appearance and now also ship a **dark**
appearance in dark mode — **already wired**, no Icon Composer export needed.

## Where the dark icons came from

The dark tiles were not hand-drawn or re-exported: each app already ships its
authentic dark-appearance icon in its own repo. They were copied in, downscaled
to 256×256 (to match the existing `-256` tiles), and given a webp sibling:

| Site asset | Source in the app repo |
|---|---|
| `PeakingAppIcon-256-dark.png` | `~/GitHub/Peaking/Peaking/Assets.xcassets/AppIcon.appiconset/AppIcon-iOS-Dark.png` |
| `TrainingAppIcon-256-dark.png` | `~/GitHub/Training/Training/Assets.xcassets/AppIcon.appiconset/AppIcon-iOS-Dark.png` |
| `SquashTrackerAppIcon-256-dark.png` | `~/GitHub/SquashTrackerWatch/SquashTrackerMultiplatform/Assets.xcassets/AppIcon.appiconset/Icon-App-iTunes 1.png` (the `luminosity: dark` marketing icon) |

Peaking and Training ship a rounded dark tile already. Squash Tracker's dark
asset is a full-bleed square, so it was masked to an iOS squircle to match the
other two on the card.

Each is wired in `src/data/app_projects.yml` as `icon_dark` / `icon_dark_webp`
beneath the existing `icon:` / `icon_webp:`.

## Refreshing a dark icon when an app's artwork changes

From the site repo root:

```bash
SITE=public/assets/images/projects

# 1. Copy + downscale the app's dark asset to 256 (repeat per app, adjust paths)
sips -z 256 256 "$HOME/GitHub/Peaking/Peaking/Assets.xcassets/AppIcon.appiconset/AppIcon-iOS-Dark.png" \
  --out "$SITE/PeakingAppIcon-256-dark.png"

# 2. (Squash Tracker only) round the square marketing icon to a squircle:
python3 - <<'PY'
from PIL import Image; import numpy as np
p="public/assets/images/projects/SquashTrackerAppIcon-256-dark.png"
img=Image.open(p).convert("RGBA"); S=img.size[0]; SS=S*4
yy,xx=np.mgrid[0:SS,0:SS]; u=(xx+0.5)/(SS/2)-1; v=(yy+0.5)/(SS/2)-1
m=Image.fromarray(((np.abs(u)**5+np.abs(v)**5)<=1).astype('uint8')*255,'L').resize((S,S),Image.LANCZOS)
a=np.minimum(np.array(img.split()[3]),np.array(m)).astype('uint8')
img.putalpha(Image.fromarray(a,'L')); img.save(p)
PY

# 3. Regenerate the webp sibling
cwebp -quiet -q 82 "$SITE/PeakingAppIcon-256-dark.png" -o "$SITE/PeakingAppIcon-256-dark.webp"

# 4. Rebuild and verify in dark mode
npm run build
```

If an app ever drops its shipped dark asset, export the Dark appearance from
**Icon Composer** at 1024, save it as the source PNG above, and run the same
steps. Until a dark asset exists for an app, leave its `icon_dark` unset — the
resolver falls back to the light tile on both themes with no regression.
