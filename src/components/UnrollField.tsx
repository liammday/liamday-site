import { useEffect, useRef, useState } from 'react';
import { hasWebGPU, startUnrollField } from '../lib/unroll-field';
import { useTacticalAccent } from '../lib/useTacticalAccent';

export interface UnrollFieldProps {
  className?: string;
  /** Home coordinate to keep lit, [lng, lat]. */
  home?: [number, number];
  /** Hold a fixed unroll value instead of taking it from scroll. */
  hold?: number | null;
}

/**
 * Sec /06 backdrop: the globe's dot matrix unrolling into a flat map.
 *
 * Progressive enhancement, like the 404 contour backdrop — without
 * `navigator.gpu`, or if the adapter refuses, it renders nothing and the
 * section stands as it is. Unroll follows the host element through the
 * viewport unless `hold` pins it.
 */
export function UnrollField({ className = '', home, hold = null }: UnrollFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'pending' | 'ready' | 'unavailable'>('pending');
  const accent = useTacticalAccent();

  // Read through a ref so the render loop never restarts on a colour or hold change.
  const holdRef = useRef(hold);
  holdRef.current = hold;
  const handleRef = useRef<ReturnType<typeof startUnrollField> | null>(null);

  useEffect(() => {
    handleRef.current?.setColours(accent, '113 114 125');
  }, [accent]);

  useEffect(() => {
    if (!hasWebGPU()) {
      setState('unavailable');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = startUnrollField(canvas, {
      home,
      accent,
      ink: '113 114 125', // --aluminum-400 under [data-tactical]
      getUnroll: () => {
        // Preview hook: /lab/unroll pins a value on the canvas to hold a frame.
        const held = canvas.dataset.hold;
        if (held !== undefined) return Number(held);
        if (holdRef.current !== null) return holdRef.current;
        const r = canvas.getBoundingClientRect();
        // Flat by the time the section has settled past the centre line.
        return 1 - (r.top + r.height * 0.35) / (window.innerHeight * 0.75);
      },
      onReady: () => setState('ready'),
      onUnavailable: () => setState('unavailable'),
    });
    handleRef.current = handle;
    return () => {
      handleRef.current = null;
      handle.stop();
    };
    // Colours are pushed through setColours; restarting on them would rebuild the device.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home?.[0], home?.[1]]);

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
