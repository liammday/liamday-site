import { useEffect, useRef, useState } from 'react';
import { hasWebGPU, startContourBackdrop } from '../lib/contour-backdrop';

export interface ContourBackdropProps {
  /** Positioning classes — e.g. `absolute inset-0 z-0` inside a relative parent. */
  className?: string;
  scale?: number;
  levels?: number;
}

/**
 * WebGPU-only decorative backdrop (vgpu contour terrain). Progressive
 * enhancement: without `navigator.gpu`, or if the adapter refuses, it renders
 * nothing and the page's CSS background stands as-is. Fades in on the first
 * presented frame so there is never a black flash. Mount with client:only —
 * there is nothing to server-render.
 */
export function ContourBackdrop({ className = '', scale, levels }: ContourBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'pending' | 'ready' | 'unavailable'>('pending');

  useEffect(() => {
    if (!hasWebGPU()) {
      setState('unavailable');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startContourBackdrop(canvas, {
      scale,
      levels,
      onReady: () => setState('ready'),
      onUnavailable: () => setState('unavailable'),
    });
  }, [scale, levels]);

  if (state === 'unavailable') return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-state={state}
      className={`pointer-events-none block h-full w-full transition-opacity duration-1000 ease-out ${
        state === 'ready' ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    />
  );
}
