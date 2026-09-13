// Bake the night-lights texture for the console globe.
//
//   node scripts/build-night-lights.mjs path/to/cities15000.txt
//
// Reads the GeoNames cities15000 dump (34k settlements with population) and
// renders an equirectangular greyscale map where each city contributes a
// radial falloff scaled by log population. The site ships only the derived
// PNG, never the dump.
//
// Source data: GeoNames (https://www.geonames.org), CC BY 4.0. Attribution is
// required wherever the derived texture is displayed.
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const src = process.argv[2];
const out = process.argv[3] ?? 'public/assets/images/globe/night-lights.png';
const W = 1024;
const H = 512;

const acc = new Float32Array(W * H);
let used = 0;

for (const line of readFileSync(src, 'utf8').split('\n')) {
  if (!line) continue;
  const f = line.split('\t');
  const lat = Number(f[4]);
  const lng = Number(f[5]);
  const pop = Number(f[14]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !(pop > 0)) continue;
  used++;

  // Brightness and bloom both scale with log population, so megacities read as
  // conurbations and market towns as single pixels.
  const mag = Math.log10(pop) - 4;            // ~0 at 10k, ~3 at 10M
  const bright = Math.max(0.03, mag * 0.22);
  const spread = Math.max(0.55, mag * 0.85);   // px

  const cx = ((lng + 180) / 360) * W;
  const cy = ((90 - lat) / 180) * H;
  const r = Math.ceil(spread * 2.5);

  for (let dy = -r; dy <= r; dy++) {
    const y = Math.round(cy) + dy;
    if (y < 0 || y >= H) continue;
    // Longitude compresses towards the poles in plate carrée; widen to match.
    const latRad = ((90 - (y / H) * 180) * Math.PI) / 180;
    const xScale = 1 / Math.max(Math.cos(latRad), 0.15);
    const rx = Math.ceil(r * xScale);
    for (let dx = -rx; dx <= rx; dx++) {
      let x = Math.round(cx) + dx;
      x = ((x % W) + W) % W;                   // wrap at the antimeridian
      const d = Math.hypot(dx / xScale, dy) / spread;
      acc[y * W + x] += bright * Math.exp(-d * d);
    }
  }
}

// Soft-knee the accumulation so dense regions saturate gracefully. pngjs keeps
// its bitmap as RGBA whatever the colour type, so write all four channels.
const png = new PNG({ width: W, height: H });
let peak = 0;
for (let i = 0; i < acc.length; i++) peak = Math.max(peak, acc[i]);
for (let i = 0; i < acc.length; i++) {
  const v = Math.round(Math.min(1, 1 - Math.exp(-acc[i] * 0.85)) * 255);
  png.data[i * 4] = v;
  png.data[i * 4 + 1] = v;
  png.data[i * 4 + 2] = v;
  png.data[i * 4 + 3] = 255;
}
writeFileSync(out, PNG.sync.write(png));
console.log(`cities ${used} · peak ${peak.toFixed(1)} · wrote ${out}`);
