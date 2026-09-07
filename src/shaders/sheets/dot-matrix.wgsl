// SHEET · SECTION BREAK — Dot matrix. The console's matrix-mode dots as a
// full-width field: a slow field breathes the radii, an ember pulse walks
// across, and the pointer drops a ripple. For section breaks and the contact band.
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
  let p = plane(uv);
  let t = params.time;
  let cell = params.p0;
  let g = p / cell;
  let c = (floor(g) + 0.5) * cell;                  // cell centre in plane units
  let f = fract(g) - 0.5;

  let field = fbmSimplex2d(c * 1.3 + vec2f(t * 0.05, 0.0), 3, 2.0, 0.5) * 0.5 + 0.5;

  // Ember pulse walking left to right.
  let pulseX = (fract(t * 0.06) * 1.3 - 0.15) * params.aspect - params.aspect * 0.5;
  let pulse = exp(-abs(c.x - pulseX) / 0.08);

  // Pointer ripple: expanding ring from the pointer, restarting every ~2.5 s.
  let pd = distance(c, pointerPlane());
  let ringR = fract(t * 0.4) * 0.9;
  let ripple = exp(-abs(pd - ringR) / 0.04) * (1.0 - fract(t * 0.4));

  let radius = 0.06 + 0.22 * field + 0.2 * pulse + 0.22 * ripple;
  let dotM = 1.0 - smoothstep(radius - fwidth(f.x) * 1.5, radius, length(f));
  let hot = clamp(pulse + ripple, 0.0, 1.0);
  let rgb = mix(params.colB.rgb, params.colA.rgb, smoothstep(0.2, 0.7, hot));
  let a = dotM * (params.p1 + 0.5 * hot);
  return vec4f(rgb * a, a);
}
