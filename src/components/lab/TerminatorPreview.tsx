import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GlobeMap } from '../DefenceGlobe';
import { subsolarDirection, subsolarPoint } from '../../lib/solar';
import { useTacticalAccent, accentToCss } from '../../lib/useTacticalAccent';

/**
 * Preview rig for the day/night layer — the console's own globe, framed as /06
 * frames it, with the terminator brought up on a scroll transition. The time
 * offset control exists only here: on the site the clock is the clock.
 */

const RADIUS = 5;
const FOV = 40;
const HOME = { lat: 51.0632, lng: -1.308 };

/** Rotations that bring a lat/lng round to face the camera, north still up. */
function framing(lat: number, lng: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  // Azimuth of the point in the xz-plane, per latLongToVector3.
  const psi = Math.atan2(Math.sin(theta), -Math.cos(theta));
  return { spinY: psi - Math.PI / 2, tiltX: (lat * Math.PI) / 180 };
}

function Globe({
  sun,
  mix,
  accent,
  drift,
}: {
  sun: [number, number, number];
  mix: number;
  accent: string;
  drift: boolean;
}) {
  const inner = useRef<THREE.Group>(null);
  const { spinY, tiltX } = framing(HOME.lat, HOME.lng);
  useFrame((_, delta) => {
    if (drift && inner.current) inner.current.rotation.y += delta * 0.045;
  });
  // Outer group tilts, inner spins: the rotation order stays unambiguous.
  return (
    <group rotation={[tiltX, 0, 0]}>
      <group ref={inner} rotation={[0, spinY, 0]}>
        <GlobeMap radius={RADIUS} mode="map" sunDirection={sun} nightMix={mix} nightAccent={accent} />
      </group>
    </group>
  );
}

export function TerminatorPreview() {
  const accent = useTacticalAccent();
  const [offsetHours, setOffsetHours] = useState(0);
  const [drift, setDrift] = useState(true);
  const [mix, setMix] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const hostRef = useRef<HTMLDivElement>(null);

  // Keep the terminator live: a minute's drift is a quarter of a degree.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // The transition: the layer comes up as the section settles into frame.
  useEffect(() => {
    const onScroll = () => {
      const el = hostRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // 0 as the section starts to enter, 1 once it fills the viewport — the
      // layer arrives with the clause rather than trailing behind it.
      const t = 1 - r.top / window.innerHeight;
      setMix(Math.min(1, Math.max(0, t)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const shown = new Date(now.getTime() + offsetHours * 3_600_000);
  const sun = subsolarDirection(shown);
  const sp = subsolarPoint(shown);

  // Is it light where he is?
  const phi = ((90 - HOME.lat) * Math.PI) / 180;
  const theta = ((HOME.lng + 180) * Math.PI) / 180;
  const home: [number, number, number] = [
    -(Math.sin(phi) * Math.cos(theta)),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ];
  const elev = (Math.asin(Math.max(-1, Math.min(1, home[0] * sun[0] + home[1] * sun[1] + home[2] * sun[2]))) * 180) / Math.PI;
  const state = elev > 0 ? 'Daylight' : elev > -6 ? 'Civil twilight' : elev > -18 ? 'Astronomical twilight' : 'Night';

  return (
    <div ref={hostRef} className="absolute inset-0">
      {/* Pulled back to 16 so the whole terminator is in frame. The console
          frames /06 far closer (camZ 6); this is a judging view. */}
      <Canvas camera={{ position: [0, 0, 16], fov: FOV }}>
        <Globe sun={sun} mix={mix} accent={accentToCss(accent)} drift={drift} />
      </Canvas>

      {/* Live readout — true values, as the console requires. */}
      <div className="pointer-events-none absolute right-6 top-6 z-20 text-right">
        <p className="t-readout text-aluminum-400">
          Subsolar · <span style={{ color: accentToCss(accent) }}>
            {Math.abs(sp.lat).toFixed(1)}°{sp.lat >= 0 ? 'N' : 'S'} {Math.abs(sp.lng).toFixed(1)}°{sp.lng >= 0 ? 'E' : 'W'}
          </span>
        </p>
        <p className="t-readout mt-1 text-aluminum-400">
          Winchester · {state} · {elev >= 0 ? '+' : ''}{elev.toFixed(1)}°
        </p>
        <p className="t-readout mt-1 text-aluminum-400">
          {shown.toISOString().slice(0, 16).replace('T', ' ')} UTC
        </p>
      </div>

      {/* Preview-only controls. */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center gap-5 border-t border-aluminum-500 bg-charcoal-950/85 px-6 py-3">
        <label className="t-readout flex items-center gap-3 text-aluminum-400">
          Time
          <input
            type="range"
            min={-12}
            max={12}
            step={0.25}
            value={offsetHours}
            onChange={(e) => setOffsetHours(Number(e.target.value))}
            className="w-48 accent-ember-400"
            aria-label="Hours from now"
          />
          <span className="w-20 text-aluminum-300">
            {offsetHours === 0 ? 'Live' : `${offsetHours > 0 ? '+' : ''}${offsetHours}h`}
          </span>
        </label>
        <button
          type="button"
          onClick={() => setOffsetHours(0)}
          className="t-readout border border-aluminum-500 px-3 py-1 text-aluminum-300">
          Now
        </button>
        <button
          type="button"
          onClick={() => setDrift((d) => !d)}
          className="t-readout border border-aluminum-500 px-3 py-1 text-aluminum-300">
          {drift ? 'Stop spin' : 'Spin'}
        </button>
        <span className="t-readout text-aluminum-400">Transition {(mix * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
