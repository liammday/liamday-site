// SHEET · PROJECT CARD — Holo sheen. A card surface that reads the pointer
// as a light source: a specular lobe, a slow iridescent band held inside the
// palette, and true per-pixel grain in place of the tiled SVG noise.
import { hash2 } from "@vgpu/wgsl-std/hash";

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

fn roundBox(p: vec2f, b: vec2f, r: f32) -> f32 {
  let q = abs(p) - b + vec2f(r);
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - r;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = plane(uv);
  let t = params.time;
  let half = vec2f(params.p0, params.p1);
  let d = roundBox(p, half, 0.035);
  let px = fwidth(d);
  let inside = 1.0 - smoothstep(0.0, px, d);
  var out = vec4f(0.0);
  if (inside <= 0.0) { return out; }

  let light = pointerPlane();
  let toL = light - p;
  let dist = length(toL);

  // Surface: graphite lifted slightly towards the light.
  let tiltShade = 0.5 + 0.5 * dot(normalize(light + vec2f(1e-4)), p / max(half.x, half.y));
  let surface = mix(params.colC.rgb, params.colB.rgb, 0.10 + 0.06 * tiltShade);
  out = over(out, surface, inside);

  // Iridescent band: thin-film phase from the light angle and a slow drift.
  let phase = dot(p, vec2f(1.4, 0.8)) * 14.0 + light.x * 5.0 - t * 0.25;
  let band = 0.5 + 0.5 * sin(phase);
  let irid = mix(params.colB.rgb, params.colA.rgb, smoothstep(0.35, 0.85, band));
  let lobe = exp(-dist * dist / 0.09);
  out = over(out, irid, lobe * 0.42 * inside);

  // Specular core.
  out = over(out, params.colA.rgb, exp(-dist * dist / 0.006) * 0.35 * inside);

  // Grain, one hash per device pixel, refreshed every frame.
  let grain = hash2(uv * vec2f(1920.0, 1080.0) + vec2f(floor(t * 24.0))).x - 0.5;
  out = over(out, params.colB.rgb, abs(grain) * 0.08 * inside);

  // Hairline edge that catches the light.
  let edge = 1.0 - smoothstep(0.0, px * 1.5, abs(d + px));
  out = over(out, mix(params.colB.rgb, params.colA.rgb, lobe), edge * (0.35 + 0.5 * lobe));
  return out;
}
