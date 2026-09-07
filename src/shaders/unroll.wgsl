// Sec /06 — the instrument unrolls.
//
// One instance per land dot. Each dot is projected twice — onto the sphere
// with the globe's own latLongToVector3 maths, and onto plate carrée — and
// mixed by `unroll`, which the page drives from scroll progress. The home
// coordinate stays lit in the accent throughout.
//
// Working space: y in [-1, 1], x in [-aspect, aspect]; the vertex stage
// divides x by aspect on the way out to clip space.

struct Params {
  aspect: f32,
  unroll: f32,
  spin: f32,
  shiftX: f32,
  accent: vec4f,   // sky accent (rgb) + alpha budget
  ink: vec4f,      // resting land colour (rgb) + alpha budget
  homeIdx: f32,    // instance index of the dot nearest home; -1 to disable
  dotR: f32,       // dot radius, clip-space y units
  pulse: f32,      // pulse centre in x, normalised; < -1 parks it off-field
  reveal: f32,     // 0..1 boot density; 1 = the whole field
}

@group(0) @binding(0) var<uniform> params: Params;

const PI: f32 = 3.14159265;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) rgb: vec3f,
  @location(2) alpha: f32,
}

fn hash1(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453);
}

@vertex fn vs_main(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
  @location(0) lngLat: vec2f,
) -> VSOut {
  let lng = lngLat.x;
  let lat = lngLat.y;

  // Sphere — the globe's projection, unchanged.
  let phi = (90.0 - lat) * PI / 180.0;
  let theta = (lng + 180.0) * PI / 180.0;
  let sp = vec3f(-(sin(phi) * cos(theta)), cos(phi), sin(phi) * sin(theta));
  let cs = cos(params.spin);
  let sn = sin(params.spin);
  // Radius clamped so the limb clears the frame edge once shifted right.
  let radius = min(0.62, params.aspect * 0.40);
  let sphere = vec3f(cs * sp.x + sn * sp.z, sp.y, -sn * sp.x + cs * sp.z) * radius;

  // Plate carrée, sized to fill the frame.
  let plate = vec3f(lng / 180.0 * params.aspect * 0.93, lat / 90.0 * params.aspect * 0.465, 0.0);

  let e = smoothstep(0.0, 1.0, params.unroll);
  // Split framing: the sphere sits in the right half (as /06 frames it), and
  // slides back to centre as the map goes flat.
  let p = mix(sphere, plate, e) + vec3f(params.shiftX * (1.0 - e), 0.0, 0.0);

  // Depth only reads on the sphere; it vanishes as the map flattens.
  let depth = mix(p.z, 1.0, e);
  var a = mix(0.30 + 0.70 * smoothstep(-0.9, 0.5, depth), 1.0, e) * params.ink.a;

  // Boot density: a stable per-dot threshold, so the field resolves in place.
  if (params.reveal < 1.0) {
    a = a * step(hash1(f32(ii) * 0.017 + 1.3), params.reveal);
  }

  // The flattening's leading edge. Its position is the unroll progress the
  // page feeds in, so it reports where the clause has got to rather than
  // running off a timer of its own.
  let band = exp(-abs(p.x / max(params.aspect, 0.001) - params.pulse) * 14.0) * e;

  var rgb = mix(params.ink.rgb, params.accent.rgb, band * 0.6);
  var r = params.dotR * mix(1.0, 1.35, band);
  if (ii == u32(max(params.homeIdx, 0.0)) && params.homeIdx >= 0.0) {
    rgb = params.accent.rgb;
    r = params.dotR * 2.4;
    a = params.accent.a;
  }

  // Three vertices circumscribing the unit disc; the fragment stage rounds it.
  var corners = array<vec2f, 3>(vec2f(-1.8, -1.0), vec2f(1.8, -1.0), vec2f(0.0, 2.2));
  let c = corners[vi];

  var out: VSOut;
  out.pos = vec4f(p.x / params.aspect + c.x * r / params.aspect, p.y + c.y * r, 0.0, 1.0);
  out.uv = c;
  out.rgb = rgb;
  out.alpha = a;
  return out;
}

@fragment fn fs_main(in: VSOut) -> @location(0) vec4f {
  let d = length(in.uv);
  if (d > 1.0) { discard; }
  let a = in.alpha * (1.0 - smoothstep(0.45, 1.0, d));
  return vec4f(in.rgb * a, a);   // premultiplied
}
