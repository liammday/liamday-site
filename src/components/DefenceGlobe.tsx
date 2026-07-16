import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { Line2 } from 'three-stdlib';
import gsap from 'gsap';
import countriesGeoJSON from '../data/countries.geo.json';

/* NOTE: THREE materials never see CSS custom properties — THREE.Color cannot
   resolve `var(...)`, it silently falls back to white. Every colour crossing
   into the <Canvas> must be a literal (hex / rgb() string). */

interface GeoFeature {
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

/** Convert lat/lng (degrees) to a point on a sphere of the given radius. */
export function latLongToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Great-circle arc between two lat/lng points, lifted off the surface on a
 * shallow ballistic profile (peak altitude scales with arc length, so short
 * hops stay low). Returned as a polyline of `segments + 1` points.
 */
export function greatCircleArcPoints(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  radius: number,
  lift = 0.18,
  segments = 48,
): THREE.Vector3[] {
  const a = latLongToVector3(from.lat, from.lng, 1);
  const b = latLongToVector3(to.lat, to.lng, 1);
  const angle = a.angleTo(b);
  const sinAngle = Math.sin(angle) || 1e-6;

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Spherical linear interpolation along the great circle…
    const p = a
      .clone()
      .multiplyScalar(Math.sin((1 - t) * angle) / sinAngle)
      .add(b.clone().multiplyScalar(Math.sin(t * angle) / sinAngle));
    // …with a mid-arc altitude bump.
    const altitude = radius * (1 + lift * Math.sin(Math.PI * t) * (angle / Math.PI + 0.2));
    points.push(p.normalize().multiplyScalar(altitude));
  }
  return points;
}

/** Globe render modes. `map` = country outlines; `matrix` = the dot-matrix
    abstraction used behind non-geographic sections (capabilities, projects). */
export type GlobeMode = 'map' | 'matrix';

interface GlobeMapProps {
  radius?: number;
  mode?: GlobeMode;
  /** THREE-parseable literals (hex/rgb) — never CSS vars. */
  lineColor?: string;
  dotColor?: string;
  lineOpacity?: number;
  dotOpacity?: number;
  /** Stroke width in PIXELS (drei fat lines), not world units. */
  lineWidth?: number;
}

export const GlobeMap: React.FC<GlobeMapProps> = ({
  radius = 5,
  mode = 'map',
  lineColor = '#9ea3ab',
  dotColor = '#8b8d98',
  lineOpacity = 0.5,
  dotOpacity = 0.55,
  lineWidth = 1.1,
}) => {
  const lineRef = useRef<Line2>(null);
  const dotsMatRef = useRef<THREE.PointsMaterial>(null);

  // Country outlines as ONE merged segment list, rendered via drei's
  // <Line segments> (LineSegments2 fat lines): gl.LINES hairlines are locked
  // to 1 physical px in WebGL, which made the map invisible on 2x displays —
  // fat lines rasterise as screen-space quads with a real pixel width.
  // The same vertices double as the dot-matrix Points geometry.
  const { segments, dotsGeometry } = useMemo(() => {
    const segs: [number, number, number][] = [];
    const dots: number[] = [];

    const pushRing = (ring: number[][]) => {
      const pts = ring.map(([lng, lat]) => latLongToVector3(lat, lng, radius));
      for (let i = 0; i < pts.length - 1; i++) {
        segs.push([pts[i].x, pts[i].y, pts[i].z], [pts[i + 1].x, pts[i + 1].y, pts[i + 1].z]);
      }
      // Dot matrix samples every other outline vertex — dense enough to read
      // as landmass, sparse enough to read as abstraction.
      for (let i = 0; i < pts.length; i += 2) {
        dots.push(pts[i].x, pts[i].y, pts[i].z);
      }
    };

    (countriesGeoJSON.features as GeoFeature[]).forEach((feature) => {
      const { type, coordinates } = feature.geometry;
      if (type === 'Polygon') {
        (coordinates as number[][][]).forEach(pushRing);
      } else if (type === 'MultiPolygon') {
        (coordinates as number[][][][]).forEach((polygon) => polygon.forEach(pushRing));
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
    return { segments: segs, dotsGeometry: geo };
  }, [radius]);

  useEffect(() => () => dotsGeometry.dispose(), [dotsGeometry]);

  // Crossfade outlines ↔ dot matrix on mode change. 600ms per the brief.
  useEffect(() => {
    const lineMat = lineRef.current?.material as { opacity: number } | undefined;
    const dotsMat = dotsMatRef.current;
    if (!lineMat || !dotsMat) return;
    const toMatrix = mode === 'matrix';
    gsap.to(lineMat, { opacity: toMatrix ? 0 : lineOpacity, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(dotsMat, { opacity: toMatrix ? dotOpacity : 0, duration: 0.6, ease: 'power2.inOut' });
  }, [mode, lineOpacity, dotOpacity]);

  return (
    <group>
      <Line
        ref={lineRef}
        points={segments}
        segments
        color={lineColor}
        lineWidth={lineWidth}
        transparent
        opacity={lineOpacity}
        depthWrite={false}
      />
      <points geometry={dotsGeometry}>
        <pointsMaterial
          ref={dotsMatRef}
          color={dotColor}
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
      {/* Opaque near-black sphere just under the wireframe: writes depth so the
          far hemisphere's outlines self-occlude and the globe reads as solid. */}
      <mesh>
        <sphereGeometry args={[radius * 0.99, 48, 48]} />
        <meshBasicMaterial color="#101116" />
      </mesh>
    </group>
  );
};
