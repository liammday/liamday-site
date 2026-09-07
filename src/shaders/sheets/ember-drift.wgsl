// SHEET · HERO — Ember drift. Domain-warped fBm haze that pools low in the
// frame and warms towards the pointer, with sparse sparks lifting through it.
// Meant to sit behind the hero copy in place of the static grain.
import { fbmSimplex2d } from "@vgpu/wgsl-std/noise/simplex";
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

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = plane(uv);
  let t = params.time;

  // Two-pass domain warp: the field slides rather than boils.
  let q = vec2f(
    fbmSimplex2d(p * 1.1 + vec2f(0.0, t * 0.03), 3, 2.0, 0.5),
    fbmSimplex2d(p * 1.1 + vec2f(5.2, 1.3) - vec2f(0.0, t * 0.02), 3, 2.0, 0.5),
  );
  let n = fbmSimplex2d(p * 1.5 + 0.9 * q + vec2f(t * 0.01, -t * 0.035), 4, 2.0, 0.5) * 0.5 + 0.5;

  // Pool low and right, where the hero copy is not.
  let low = smoothstep(-0.2, 0.6, uv.y);
  let right = smoothstep(0.1, 0.9, uv.x);
  let d = p - pointerPlane();
  let warm = exp(-dot(d, d) / 0.25);

  // Plumes only: a hard shoulder on the field keeps most of the frame dark.
  let plume = smoothstep(0.52, 0.92, n);
  let mask = max(low * low, right * low * 0.8);
  let heat = plume * plume * (0.08 + 0.92 * mask) * (0.45 + 0.55 * warm);
  let rgb = mix(params.colB.rgb, params.colA.rgb, smoothstep(0.3, 0.8, n));
  var out = vec4f(rgb * heat * params.p0, heat * params.p0);

  // Sparks: sparse cells drifting upward, each flickering on its own phase.
  let g = (p + vec2f(0.0, t * 0.045)) * 16.0;
  let cell = floor(g);
  let f = fract(g) - 0.5;
  let h = hash2(cell + vec2f(17.0, 3.0));
  let lit = step(0.93, h.x) * (0.4 + 0.6 * (0.5 + 0.5 * sin(t * 2.5 + h.y * 6.2831)));
  let dot = 1.0 - smoothstep(0.0, 0.09, length(f - (h - 0.5) * 0.5));
  let spark = lit * dot * (0.35 + 0.65 * low);
  out = over(out, params.colA.rgb, spark);
  return out;
}
