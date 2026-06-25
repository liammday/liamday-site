import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';

export interface StarsBackgroundProps {
  /** Extra classes on the root — e.g. `fixed inset-0 z-[-10]` for a page backdrop. */
  className?: string;
  /** Pointer-parallax strength. `0` disables the parallax entirely. */
  factor?: number;
  /** Seconds for the base (smallest) layer to drift one full loop. Larger = slower. */
  speed?: number;
  /** Star colour. Defaults to `currentColor` so it follows the active theme via CSS. */
  starColor?: string;
  /** Whether the root captures pointer events. The decorative layers never do. */
  pointerEvents?: boolean;
  children?: ReactNode;
}

interface LayerConfig {
  count: number;
  /** Star diameter in px. */
  size: number;
  /** Drift duration in seconds. */
  duration: number;
}

// Field the stars are scattered across. The loop height is fixed at LOOP_PX so a
// duplicated block one loop-height down can seamlessly wrap as the layer drifts.
const LOOP_PX = 2000;
const SPREAD_X = 3000;

function generateBoxShadow(count: number, color: string): string {
  const shadows: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.floor(Math.random() * SPREAD_X);
    const y = Math.floor(Math.random() * LOOP_PX);
    shadows.push(`${x}px ${y}px ${color}`);
  }
  return shadows.join(', ');
}

/**
 * One depth layer: a single 1px element whose `box-shadow` paints `count` copies
 * of itself (cheap — the browser rasterises the whole field once, then we only
 * GPU-transform it). The layer is duplicated LOOP_PX down so the linear drift in
 * the `stars-drift` keyframe wraps without a visible seam.
 */
function StarLayer({ count, size, duration, color }: LayerConfig & { color: string }) {
  // Generated after mount so a server/client render mismatch is impossible and
  // Math.random never runs during SSR.
  const [boxShadow, setBoxShadow] = useState('');
  useEffect(() => {
    setBoxShadow(generateBoxShadow(count, color));
  }, [count, color]);

  const star: CSSProperties = { width: size, height: size, boxShadow };

  return (
    <div className="stars-bg__layer" style={{ animationDuration: `${duration}s` }}>
      <div className="stars-bg__star" style={star} />
      <div className="stars-bg__star" style={{ ...star, top: LOOP_PX }} />
    </div>
  );
}

/**
 * Animated star-field background. Three parallax layers of drifting dots over a
 * transparent surface, with a spring-like pointer parallax driven by GSAP. Drop
 * it behind content as a `fixed inset-0 z-[-10]` backdrop, or wrap content with
 * it directly. Decorative — hidden from assistive tech and fully disabled under
 * `prefers-reduced-motion`.
 *
 * Inspired by animate-ui's Stars background, re-implemented on the site's own
 * stack (GSAP + CSS) so it needs no extra animation dependency.
 */
export function StarsBackground({
  className,
  factor = 0.05,
  speed = 50,
  starColor = 'currentColor',
  pointerEvents = true,
  children,
}: StarsBackgroundProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el || factor === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      xTo(-(event.clientX - cx) * factor);
      yTo(-(event.clientY - cy) * factor);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.killTweensOf(el);
    };
  }, [factor]);

  return (
    <div
      aria-hidden="true"
      className={`stars-bg${className ? ` ${className}` : ''}`}
      style={pointerEvents ? undefined : { pointerEvents: 'none' }}>
      <div ref={parallaxRef} className="stars-bg__parallax">
        <StarLayer count={600} size={1} duration={speed} color={starColor} />
        <StarLayer count={200} size={2} duration={speed * 2} color={starColor} />
        <StarLayer count={100} size={3} duration={speed * 3} color={starColor} />
      </div>
      {children}
    </div>
  );
}

export default StarsBackground;
