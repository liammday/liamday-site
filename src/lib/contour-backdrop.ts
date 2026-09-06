import { clock, effect, frameLoop, init, surface } from 'vgpu';
import type { FrameLoopHandle } from 'vgpu';
import contoursShader from '../shaders/contours.wgsl';

/**
 * WebGPU contour backdrop (vgpu). Plain function, no React: `start` mounts the
 * render loop on a layout-sized canvas and returns a teardown. The component
 * that owns the canvas decides what to show when WebGPU is unavailable — this
 * module only reports it, it never falls back to WebGL.
 */

export interface ContourBackdropOptions {
  /** Noise frequency over the aspect-corrected unit plane. */
  scale?: number;
  /** Contour lines across the full height range; every fifth is an index line. */
  levels?: number;
  /** First frame has been presented — safe to fade the canvas in. */
  onReady?: () => void;
  /** No adapter / device (WebGPU present but unusable). Nothing was drawn. */
  onUnavailable?: (reason: string) => void;
}

type Rgba = [number, number, number, number];

/** Feature gate. `navigator.gpu` missing means WebGPU is not implemented. */
export function hasWebGPU(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu != null;
}

/** Read a space-separated channel token (`--ember-400: 240 139 74`) as 0..1 RGB. */
function readToken(style: CSSStyleDeclaration, token: string): [number, number, number] | null {
  const parts = style
    .getPropertyValue(token)
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some((n) => Number.isNaN(n))) return null;
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

/** Line + accent colours from the live theme tokens (dark defaults, light overrides). */
function themeColours(): { line: Rgba; accent: Rgba } {
  const html = document.documentElement;
  const style = getComputedStyle(html);
  const light = html.getAttribute('data-theme') === 'light';
  const line = readToken(style, '--aluminum-400') ?? [0.51, 0.53, 0.56];
  const accent = readToken(style, '--ember-400') ?? [0.94, 0.55, 0.29];
  // Light theme needs a touch more ink to read against the pale ground.
  return {
    line: [...line, light ? 0.45 : 0.4],
    accent: [...accent, 0.75],
  };
}

export function startContourBackdrop(
  canvas: HTMLCanvasElement,
  { scale = 1.6, levels = 22, onReady, onUnavailable }: ContourBackdropOptions = {},
): () => void {
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Awaited<ReturnType<typeof init>> | undefined;
  const cleanups: Array<() => void> = [];

  void (async () => {
    try {
      gpu = await init();
    } catch (err) {
      onUnavailable?.(err instanceof Error ? err.message : String(err));
      return;
    }
    if (disposed) return gpu.dispose();

    // Premultiplied alpha so the page background shows through the line work.
    // DPR capped at 1.5: it is a backdrop, not the subject.
    const canvasSurface = surface(gpu, canvas, { dpr: [1, 1.5], alphaMode: 'premultiplied' });
    const colours = themeColours();
    const [w, h] = canvasSurface.size;

    const contours = effect(gpu, contoursShader, {
      label: 'contour-backdrop',
      set: {
        params: {
          time: 0,
          aspect: w / Math.max(h, 1),
          pointer: [0.5, 0.5],
          line: colours.line,
          accent: colours.accent,
          scale,
          levels,
        },
      },
    });

    cleanups.push(
      canvasSurface.onResize(({ width, height }) => {
        contours.set({ params: { aspect: width / Math.max(height, 1) } });
      }),
    );

    // Follow the theme toggle (it flips data-theme on <html>).
    const themeObserver = new MutationObserver(() => {
      const next = themeColours();
      contours.set({ params: { line: next.line, accent: next.accent } });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    cleanups.push(() => themeObserver.disconnect());

    // Pointer light. Target is written on move; the loop eases towards it.
    const target: [number, number] = [0.5, 0.5];
    const current: [number, number] = [0.5, 0.5];
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = (e.clientY - r.top) / r.height;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    cleanups.push(() => window.removeEventListener('pointermove', onMove));

    // Reduced motion: hold the terrain and the light still (one static render
    // per frame is still needed for resize/theme, so the loop keeps ticking).
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let still = reduceMotion.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      still = e.matches;
    };
    reduceMotion.addEventListener('change', onMotionChange);
    cleanups.push(() => reduceMotion.removeEventListener('change', onMotionChange));

    const time = clock(gpu);
    let presented = false;
    // 30 fps is plenty for a slow drift and halves the fragment cost.
    loop = frameLoop(
      gpu,
      (frame) => {
        if (!still) {
          current[0] += (target[0] - current[0]) * 0.08;
          current[1] += (target[1] - current[1]) * 0.08;
          contours.set({ params: { time: time.time, pointer: current } });
        }
        frame.pass(canvasSurface, contours);
        if (!presented) {
          presented = true;
          onReady?.();
        }
      },
      { fps: 30 },
    );
  })();

  return () => {
    disposed = true;
    for (const fn of cleanups.splice(0)) fn();
    loop?.stop();
    gpu?.dispose();
  };
}
