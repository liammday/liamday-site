// SHEET · CASE STUDY HEADER — Radar. Range rings, 30° bearings, a phosphor
// sweep with decay, and hashed contacts that light as the sweep passes.
// For the Open Defence Radar case-study header.
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
  let centre = vec2f(params.p1, params.p2);        // scope centre in plane units
  let p = plane(uv) - centre;
  let t = params.time;
  let r = length(p);
  let ang = atan2(p.y, p.x);
  let px = fwidth(r);
  let scopeR = params.p0;
  let inScope = 1.0 - smoothstep(scopeR - px, scopeR + px, r);

  var out = vec4f(0.0);

  // Faint graticule outside the scope.
  let grid = abs(fract(plane(uv) / 0.06) - 0.5) * 0.06;
  let gl = 1.0 - smoothstep(0.0, px * 1.2, min(grid.x, grid.y));
  out = over(out, params.colB.rgb, gl * 0.07 * (1.0 - inScope));

  // Range rings and bearings.
  let ringStep = scopeR / 4.0;
  let ringD = abs(r - round(r / ringStep) * ringStep);
  let rings = 1.0 - smoothstep(0.0, px * 1.4, ringD);
  let bearingStep = PI / 6.0;
  let bd = abs(ang - round(ang / bearingStep) * bearingStep) * r;
  let bearings = (1.0 - smoothstep(0.0, px * 1.2, bd)) * smoothstep(0.0, 0.03, r);
  out = over(out, params.colB.rgb, max(rings * 0.35, bearings * 0.18) * inScope);
  let rim = 1.0 - smoothstep(0.0, px * 2.0, abs(r - scopeR));
  out = over(out, params.colB.rgb, rim * 0.6);

  // Sweep: leading edge at phase 0, exponential tail behind it.
  let rate = 0.14;
  let phase = fract(ang / (2.0 * PI) - t * rate);
  let tail = exp(-phase * 7.0);
  out = over(out, params.colA.rgb, tail * 0.28 * inScope);
  let edge = 1.0 - smoothstep(0.0, fwidth(ang) * 1.5, phase * 2.0 * PI * r) ;
  out = over(out, params.colA.rgb, edge * 0.9 * inScope);

  // Contacts: hashed polar positions; each blooms as the sweep crosses it.
  for (var i = 0; i < 14; i++) {
    let h = hash2(vec2f(f32(i) * 7.31, 2.17));
    let cr = 0.12 + h.x * (scopeR - 0.16);
    let ca = h.y * 2.0 * PI;
    let cpos = vec2f(cos(ca), sin(ca)) * cr;
    let since = fract(ca / (2.0 * PI) - t * rate);   // time since the sweep passed
    let bloom = exp(-since * 4.5);
    let dd = distance(p, cpos);
    let core = 1.0 - smoothstep(0.0, 0.006 + 0.006 * bloom, dd);
    let halo = exp(-dd / 0.02) * bloom * 0.5;
    out = over(out, params.colA.rgb, (core * (0.3 + 0.7 * bloom) + halo) * inScope);
  }

  // Pointer designates a target: bracketed box that follows it.
  let pp = pointerPlane() - centre;
  let bx = abs(p - pp) - vec2f(0.035);
  let boxD = max(bx.x, bx.y);
  let box = (1.0 - smoothstep(0.0, px * 1.5, abs(boxD))) * step(0.02, max(abs(p.x - pp.x), abs(p.y - pp.y)));
  out = over(out, params.colA.rgb, box * 0.8 * inScope);
  return out;
}
