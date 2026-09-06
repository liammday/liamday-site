// Contour backdrop — a slow-drifting terrain rendered as topographic contour
// lines. Every fifth line is an "index" contour in the ember accent, the rest
// sit in aluminium at low alpha so copy stays readable on top. The pointer
// carries a soft light that lifts the lines near it. Output is premultiplied
// so the canvas composites over whatever the page paints underneath (the
// theme background stays in CSS; colours arrive as uniforms from the tokens).
import { fbmSimplex2d } from "@vgpu/wgsl-std/noise/simplex";

struct Params {
  time: f32,
  aspect: f32,
  pointer: vec2f,
  line: vec4f,
  accent: vec4f,
  scale: f32,
  levels: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

fn terrain(p: vec2f) -> f32 {
  // Advect the sample point slowly so the field slides rather than boils.
  let drift = vec2f(params.time * 0.012, params.time * -0.008);
  return fbmSimplex2d((p + drift) * params.scale, 4, 2.0, 0.5) * 0.5 + 0.5;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  // Aspect-correct plane centred on the canvas.
  let p = vec2f((uv.x - 0.5) * params.aspect, uv.y - 0.5);

  let iso = terrain(p) * params.levels;
  let f = fract(iso);
  let dist = min(f, 1.0 - f);
  let width = max(fwidth(iso), 1e-4);
  let contour = 1.0 - smoothstep(0.0, width * 1.6, dist);

  let idx = i32(floor(iso + 0.5));
  let isIndex = select(0.0, 1.0, (idx % 5) == 0);

  // Pointer light: a wide gaussian in the same aspect-corrected space.
  let pointer = vec2f((params.pointer.x - 0.5) * params.aspect, params.pointer.y - 0.5);
  let d = distance(p, pointer);
  let light = exp(-(d * d) / 0.12);

  // Calm the centre so copy sits on quieter ground; full ink towards the edges.
  let clearing = mix(0.35, 1.0, smoothstep(0.1, 0.42, length(p)));

  let rgb = mix(params.line.rgb, params.accent.rgb, isIndex);
  let baseAlpha = mix(params.line.a, params.accent.a, isIndex);
  let alpha = contour * baseAlpha * clearing * (0.5 + 0.5 * light);
  return vec4f(rgb * alpha, alpha);
}
