// SHEET · PEAKING — Ridgelines. Nine noise-terrain horizons receding into
// haze with an ember sun on the skyline; the pointer parallaxes the near
// ridges more than the far. For the Peaking and RidgeRunner pages.
import { fbmSimplex2d } from "@vgpu/wgsl-std/noise/simplex";

struct Params {
  time: f32,
  aspect: f32,
  px: f32,
  py: f32,
  colA: vec4f,   // accent (ember) rgb + alpha budget
  colB: vec4f,   // ink (aluminium) rgb + alpha budget
  colC: vec4f,   // page ground rgb; .a = 1 when light theme
  p0: f32,
  p1: f32,
  p2: f32,
  p3: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const PI: f32 = 3.14159265;

fn plane(uv: vec2f) -> vec2f {
  return vec2f((uv.x - 0.5) * params.aspect, uv.y - 0.5);
}

fn pointerPlane() -> vec2f {
  return vec2f((params.px - 0.5) * params.aspect, params.py - 0.5);
}

fn over(dst: vec4f, rgb: vec3f, a: f32) -> vec4f {
  return vec4f(rgb * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a));
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let t = params.time;
  let aspect = params.aspect;
  let parallax = (params.px - 0.5);
  var out = vec4f(0.0);

  // Sun on the skyline, drawn first so the ridges occlude it.
  let sunC = vec2f(0.68 * aspect, 0.36);
  let sp = vec2f(uv.x * aspect, uv.y);
  let sd = distance(sp, sunC);
  let sun = 1.0 - smoothstep(0.075, 0.082, sd);
  let halo = exp(-max(sd - 0.075, 0.0) / 0.12) * 0.35;
  out = over(out, params.colA.rgb, max(sun * 0.95, halo));

  let layers = 9;
  for (var i = 0; i < layers; i++) {
    let depth = 1.0 - f32(i) / f32(layers - 1);        // 1 = farthest
    let base = 0.40 + f32(i) * 0.062;
    let amp = mix(0.05, 0.16, 1.0 - depth);
    let freq = mix(1.1, 2.6, 1.0 - depth);
    let x = uv.x * aspect * freq + f32(i) * 13.7 + t * 0.012 * (1.0 - depth * 0.7) + parallax * 0.35 * (1.0 - depth);
    let hgt = fbmSimplex2d(vec2f(x, f32(i) * 3.3), 4, 2.0, 0.5) * 0.5 + 0.5;
    let ridgeY = base - hgt * amp;
    let d = uv.y - ridgeY;                              // > 0 below the crest
    let fill = mix(params.colC.rgb, params.colB.rgb, mix(0.04, 0.16, 1.0 - depth));
    let cover = smoothstep(0.0, fwidth(uv.y) * 1.2, d);
    out = over(out, fill, cover * mix(0.55, 1.0, 1.0 - depth));
    let crest = 1.0 - smoothstep(0.0, fwidth(uv.y) * 1.8, abs(d));
    let crestCol = mix(params.colB.rgb, params.colA.rgb, smoothstep(0.3, 0.02, abs(uv.x * aspect - sunC.x)) * depth * 0.8);
    out = over(out, crestCol, crest * mix(0.25, 0.9, 1.0 - depth));
  }
  return out;
}
