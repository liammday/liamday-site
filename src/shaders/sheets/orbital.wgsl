// SHEET · GLOBE — Orbital readout. An analytic sphere with dot-matrix land,
// a 15° graticule, day/night terminator, ember scan band and atmosphere rim,
// plus a tilted orbit ring carrying one satellite. The pointer nudges the spin.
// A mock of what the three.js globe gains from vgpu's TSL bridge.
import { fbmSimplex3d } from "@vgpu/wgsl-std/noise/simplex";

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

fn rotY(v: vec3f, a: f32) -> vec3f {
  let c = cos(a); let s = sin(a);
  return vec3f(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}
fn rotX(v: vec3f, a: f32) -> vec3f {
  let c = cos(a); let s = sin(a);
  return vec3f(v.x, c * v.y - s * v.z, s * v.y + c * v.z);
}
fn land(dir: vec3f) -> f32 {
  return fbmSimplex3d(dir * 2.1 + vec3f(3.1, 0.0, 1.7), 4, 2.0, 0.5);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p0 = plane(uv);
  let p = vec2f(p0.x - params.p1, -p0.y);          // y up, optional x offset
  let t = params.time;
  let R = params.p0;                                // sphere radius in plane units
  let r = length(p);
  let px = fwidth(r);

  var out = vec4f(0.0);
  let spin = t * 0.12 + (params.px - 0.5) * 1.4;
  let tilt = -0.41;                                 // 23.5°
  let sun = normalize(vec3f(-0.55, 0.35, 0.75));

  // Orbit ring: circle of radius 1.42R in the XZ plane, tilted 68° about X.
  let ringR = R * 1.42;
  let ringTilt = 1.19;
  let a = ringR; let b = ringR * cos(ringTilt);
  let e = length(vec2f(p.x / a, p.y / b));
  let ringD = abs(e - 1.0) * min(a, b);
  let ringLine = 1.0 - smoothstep(0.0, px * 1.5, ringD);
  let theta = atan2(p.y / b, p.x / a);
  let ringFront = step(0.0, -sin(theta));           // lower half passes in front
  let satAng = -t * 0.35;
  let sat = vec2f(a * cos(satAng), b * sin(satAng));
  let satFront = step(0.0, -sin(satAng));
  let satDot = 1.0 - smoothstep(0.0, R * 0.05, distance(p, sat));

  // Back half of the ring and the satellite render first, so the sphere covers them.
  out = over(out, params.colA.rgb, ringLine * 0.35 * (1.0 - ringFront));
  out = over(out, params.colA.rgb, satDot * (1.0 - satFront));

  // Sphere geometry for every pixel (derivatives must stay in uniform control
  // flow, so the graticule widths are computed before the branch).
  let z = sqrt(max(R * R - r * r, 0.0));
  let n = vec3f(p.x, p.y, z) / R;                   // view-space normal
  let dir = rotY(rotX(n, tilt), spin);              // body-space direction
  let lon = atan2(dir.x, dir.z);
  let lat = asin(clamp(dir.y, -1.0, 1.0));
  let gl = vec2f(lon, lat) / (PI / 12.0);
  let gw = min(fwidth(gl) * 1.2, vec2f(0.2));

  if (r < R) {
    let light = dot(n, sun);
    let day = smoothstep(-0.15, 0.25, light);
    let body = mix(params.colC.rgb, params.colB.rgb, 0.06 + 0.05 * day);
    out = over(out, body, 1.0);

    // Dot-matrix land: sample the land field at each cell centre.
    let cell = PI / 48.0;                            // 3.75°
    let g = vec2f(lon, lat) / cell;
    let c = (floor(g) + 0.5) * cell;
    let cdir = vec3f(cos(c.y) * sin(c.x), sin(c.y), cos(c.y) * cos(c.x));
    let isLand = smoothstep(0.02, 0.10, land(cdir));
    let f = (fract(g) - 0.5) * vec2f(cos(lat), 1.0);
    let dotR = mix(0.18, 0.34, isLand);
    // Fade the matrix out towards the poles, where cells collapse into rings.
    let polar = 1.0 - smoothstep(0.86, 0.97, abs(dir.y));
    let dotM = (1.0 - smoothstep(dotR - 0.08, dotR, length(f))) * isLand * polar;

    // Scan band sweeps longitude with a phosphor tail.
    let sweep = fract(lon / (2.0 * PI) - t * 0.06);
    let scan = exp(-sweep * 9.0);

    let inkA = mix(0.22, 0.6, day);
    let dotCol = mix(params.colB.rgb, params.colA.rgb, scan);
    out = over(out, dotCol, dotM * (inkA + 0.4 * scan) * smoothstep(0.0, 0.08, z / R));

    // Graticule every 15°.
    let gf = abs(fract(gl) - 0.5);
    let grat = max(1.0 - smoothstep(0.0, gw.x, gf.x), 1.0 - smoothstep(0.0, gw.y, gf.y));
    out = over(out, params.colB.rgb, grat * 0.12 * smoothstep(0.0, 0.25, z / R));

    // Terminator glow and limb.
    let term = exp(-abs(light) * 14.0) * 0.35;
    out = over(out, params.colA.rgb, term * smoothstep(0.0, 0.1, z / R));
    let fres = pow(1.0 - z / R, 3.0);
    out = over(out, params.colA.rgb, fres * 0.45);
  } else {
    // Atmosphere outside the limb.
    let glow = exp(-(r - R) / (R * 0.09)) * 0.35;
    out = over(out, params.colA.rgb, glow);
  }

  // Front half of the ring and the satellite.
  out = over(out, params.colA.rgb, ringLine * 0.8 * ringFront);
  out = over(out, params.colA.rgb, satDot * satFront);
  let satGlow = exp(-distance(p, sat) / (R * 0.08)) * 0.5 * satFront;
  out = over(out, params.colA.rgb, satGlow);
  return out;
}
