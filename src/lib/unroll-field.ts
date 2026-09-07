import { clock, draw, frameLoop, init, surface } from 'vgpu';
import type { FrameLoopHandle } from 'vgpu';
import unrollShader from '../shaders/unroll.wgsl';
import { getLandDots, nearestDotIndex } from './land-dots';

/**
 * Sec /06 — the instrument unrolls (vgpu).
 *
 * Plain start/teardown driver, no React. One `draw()` with an instance-stepped
 * vertex buffer of lng/lat pairs — not a storage buffer, which needs opt-in
 * vertex-stage limits that not every adapter grants. The caller supplies the
 * unroll progress each frame, so the page decides whether that comes from
 * scroll, a control, or a fixed value.
 */

export interface UnrollFieldOptions {
  /** Home coordinate to keep lit, [lng, lat]. Omit to light nothing. */
  home?: [number, number];
  /** Sky accent as "r g b" channels (the console's tactical accent). */
  accent: string;
  /** Resting land colour as "r g b". */
  ink: string;
  /** 0 = sphere, 1 = flat map. Read every frame. */
  getUnroll: () => number;
  onReady?: () => void;
  onUnavailable?: (reason: string) => void;
}

export interface UnrollFieldHandle {
  stop: () => void;
  setColours: (accent: string, ink: string) => void;
}

export function hasWebGPU(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu != null;
}

function channels(value: string, fallback: [number, number, number]): [number, number, number] {
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some((n) => Number.isNaN(n))) return fallback;
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

export function startUnrollField(
  canvas: HTMLCanvasElement,
  opts: UnrollFieldOptions,
): UnrollFieldHandle {
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Awaited<ReturnType<typeof init>> | undefined;
  let accent = opts.accent;
  let ink = opts.ink;
  const cleanups: Array<() => void> = [];

  void (async () => {
    try {
      gpu = await init();
    } catch (err) {
      opts.onUnavailable?.(err instanceof Error ? err.message : String(err));
      return;
    }
    if (disposed) return gpu.dispose();

    const dots = getLandDots();
    const count = dots.length / 2;
    const homeIdx = opts.home ? nearestDotIndex(dots, opts.home[0], opts.home[1]) : -1;

    // One instance per dot, fed by an instance-stepped vertex buffer. A storage
    // buffer would be tidier but vertex-stage storage needs opt-in device
    // limits that not every adapter grants; a vertex buffer works everywhere.
    const buffer = gpu.device.createBuffer({
      size: dots.byteLength,
      usage: ['vertex', 'copy_dst'],
      label: 'land-dots',
    });
    buffer.write(dots);
    cleanups.push(() => buffer.destroy());

    const canvasSurface = surface(gpu, canvas, { dpr: [1, 1.5], alphaMode: 'premultiplied' });
    const [w0, h0] = canvasSurface.size;

    const field = draw(gpu, {
      shader: unrollShader,
      label: 'unroll-field',
      blend: 'premultiplied',
      geometry: {
        // Three vertices circumscribing the unit disc, rounded in the fragment
        // stage — cheaper than a quad and needs no topology override.
        vertexCount: 3,
        instanceCount: count,
        vertexBuffers: [buffer.gpu],
        vertexBufferLayouts: [
          {
            arrayStride: 8,
            stepMode: 'instance',
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
          },
        ],
      },
      set: {
        params: {
          aspect: w0 / Math.max(h0, 1),
          unroll: 0,
          spin: 0,
          shiftX: 0,
          accent: [...channels(accent, [1, 0.55, 0.29]), 1],
          ink: [...channels(ink, [0.44, 0.45, 0.49]), 0.85],
          homeIdx,
          dotR: 0,
          pulse: -9,
          reveal: 1,
        },
      },
    });

    // Dot radius is a pixel size, so it belongs to the surface, not the frame.
    const sizeUniforms = ({ width, height }: { width: number; height: number }) => {
      field.set({
        params: {
          aspect: width / Math.max(height, 1),
          dotR: (1.5 * 2) / Math.max(height, 1),
        },
      });
    };
    sizeUniforms({ width: w0, height: h0 });
    cleanups.push(canvasSurface.onResize(sizeUniforms));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const time = clock(gpu);
    let presented = false;

    loop = frameLoop(
      gpu,
      (frame) => {
        const still = reduceMotion.matches;
        const unroll = Math.min(1, Math.max(0, opts.getUnroll()));
        const t = still ? 8 : time.time;
        field.set({
          params: {
            unroll,
            spin: still ? 0.6 : t * 0.08,
            shiftX: (canvasSurface.size[0] / Math.max(canvasSurface.size[1], 1)) * 0.5,
            // The leading edge tracks the unroll itself: it is progress, not a timer.
            pulse: -1 + 2 * unroll,
            accent: [...channels(accent, [1, 0.55, 0.29]), 1],
            ink: [...channels(ink, [0.44, 0.45, 0.49]), 0.85],
          },
        });
        frame.pass(canvasSurface, field);
        if (!presented) {
          presented = true;
          opts.onReady?.();
        }
      },
      { fps: 30 },
    );
  })();

  return {
    stop: () => {
      disposed = true;
      for (const fn of cleanups.splice(0)) fn();
      loop?.stop();
      gpu?.dispose();
    },
    setColours: (a, i) => {
      accent = a;
      ink = i;
    },
  };
}
