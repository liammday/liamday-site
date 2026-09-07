// Render every sheet shader in src/shaders/sheets headlessly through vgpu/node
// for both themes: `node scripts/render-sheets.mjs <out-dir>`. Writes composited
// PNGs over the page ground plus sheets-wgsl.json (the flattened WGSL). Needs
// a Vulkan adapter; on a machine without one run `npx vgpu install-software-renderer`.
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import { resolveShader } from '@vgpu/wgsl/runtime';
import { effect, init, target } from 'vgpu/node';

const out = process.argv[2];
const W = 960, H = 480;
const themes = {
  dark:  { ground: [16, 18, 21],    A: [240/255, 139/255, 74/255, 1], B: [131/255, 135/255, 143/255, 1], C: [16/255, 18/255, 21/255, 0] },
  light: { ground: [248, 249, 251], A: [179/255, 77/255, 9/255, 1],   B: [104/255, 109/255, 125/255, 1], C: [248/255, 249/255, 251/255, 1] },
};
// Per-sheet tunables (p0..p3), per theme where they differ.
const sheets = {
  'ember-drift': { dark: [0.6, 0, 0, 0],  light: [0.45, 0, 0, 0] },
  'orbital':     { dark: [0.36, 0.3, 0, 0], light: [0.36, 0.3, 0, 0] },
  'radar':       { dark: [0.42, 0.28, 0, 0], light: [0.42, 0.28, 0, 0] },
  'ridgelines':  { dark: [0, 0, 0, 0], light: [0, 0, 0, 0] },
  'holo-card':   { dark: [0.42, 0.27, 0, 0], light: [0.42, 0.27, 0, 0] },
  'dot-matrix':  { dark: [0.022, 0.35, 0, 0], light: [0.022, 0.5, 0, 0] },
};
const gpu = await init();
const t = target(gpu, { size: [W, H], format: 'rgba8unorm' });
const bundle = {};
for (const [name, tun] of Object.entries(sheets)) {
  const resolved = await resolveShader({ entry: resolve(`src/shaders/sheets/${name}.wgsl`) });
  bundle[name] = resolved.wgsl;
  for (const [theme, th] of Object.entries(themes)) {
    const [p0, p1, p2, p3] = tun[theme];
    const fx = effect(gpu, resolved.wgsl, { set: { params: { time: 37.0, aspect: W / H, px: 0.62, py: 0.42, colA: th.A, colB: th.B, colC: th.C, p0, p1, p2, p3 } } });
    fx.draw(t);
    const px = await t.read();
    let covered = 0, bad = 0;
    const comp = new PNG({ width: W, height: H });
    for (let i = 0; i < px.length; i += 4) {
      const a = px[i + 3];
      if (a > 20) covered++;
      if (px[i] > a + 1 || px[i + 1] > a + 1 || px[i + 2] > a + 1) bad++;
      for (let c = 0; c < 3; c++) comp.data[i + c] = Math.round(px[i + c] + th.ground[c] * (1 - a / 255));
      comp.data[i + 3] = 255;
    }
    writeFileSync(`${out}/${name}-${theme}.png`, PNG.sync.write(comp));
    console.log(`${name.padEnd(12)} ${theme.padEnd(5)} coverage ${(100 * covered / (W * H)).toFixed(1).padStart(5)}%  premul-violations ${bad}  wgsl ${resolved.wgsl.length}B`);
  }
}
writeFileSync(`${out}/sheets-wgsl.json`, JSON.stringify(bundle));
gpu.dispose();
