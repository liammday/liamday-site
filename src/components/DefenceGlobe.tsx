import React, { useEffect, useMemo, useRef, useState } from 'react';
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

/* ── Shared geometry builders (module-cached; radius is constant in practice) ── */

type Tuple3 = [number, number, number];

interface GlobeGeometry {
  /** Country outlines as consecutive segment-pair tuples (fat-line input). */
  outlineSegments: Tuple3[];
  /** Dot-matrix vertex buffer (every other outline vertex). */
  dots: Float32Array;
}

/** Country outlines (+ dot samples) from a GeoJSON feature list. */
function buildFromFeatures(features: GeoFeature[], radius: number): GlobeGeometry {
  const segs: Tuple3[] = [];
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

  features.forEach((feature) => {
    const { type, coordinates } = feature.geometry;
    if (type === 'Polygon') {
      (coordinates as number[][][]).forEach(pushRing);
    } else if (type === 'MultiPolygon') {
      (coordinates as number[][][][]).forEach((polygon) => polygon.forEach(pushRing));
    }
  });

  return { outlineSegments: segs, dots: new Float32Array(dots) };
}

const globeGeometryCache = new Map<number, GlobeGeometry>();

export function getGlobeGeometry(radius: number): GlobeGeometry {
  const cached = globeGeometryCache.get(radius);
  if (cached) return cached;
  const built = buildFromFeatures(countriesGeoJSON.features as GeoFeature[], radius);
  globeGeometryCache.set(radius, built);
  return built;
}

/* Hi-res (Natural Earth 50m) outlines, lazy-loaded on first zoom-in. The
   TopoJSON (~740KB, gzips to ~300KB) + topojson-client only ever load when a
   zoomed section is reached, and only once per session. */
let hiResPromise: Promise<Tuple3[]> | null = null;

function loadHiResSegments(radius: number): Promise<Tuple3[]> {
  if (!hiResPromise) {
    hiResPromise = Promise.all([import('../data/countries-50m.json'), import('topojson-client')]).then(
      ([topo, tc]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const topology = (topo.default ?? topo) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fc = tc.feature(topology, topology.objects.countries) as any;
        return buildFromFeatures(fc.features as GeoFeature[], radius).outlineSegments;
      },
    );
  }
  return hiResPromise;
}

/** Graticule (15° lat rings + meridians) as segment-pair tuples. */
export function buildGraticule(radius: number, stepDeg = 15, segments = 72): Tuple3[] {
  const out: Tuple3[] = [];

  const push = (a: THREE.Vector3, b: THREE.Vector3) => {
    out.push([a.x, a.y, a.z], [b.x, b.y, b.z]);
  };

  // Latitude rings (skip the poles).
  for (let lat = -90 + stepDeg; lat <= 90 - stepDeg; lat += stepDeg) {
    for (let i = 0; i < segments; i++) {
      const lngA = (i / segments) * 360 - 180;
      const lngB = ((i + 1) / segments) * 360 - 180;
      push(latLongToVector3(lat, lngA, radius), latLongToVector3(lat, lngB, radius));
    }
  }
  // Meridians, pole to pole.
  for (let lng = -180; lng < 180; lng += stepDeg) {
    for (let i = 0; i < segments / 2; i++) {
      const latA = -90 + (i / (segments / 2)) * 180;
      const latB = -90 + ((i + 1) / (segments / 2)) * 180;
      push(latLongToVector3(latA, lng, radius), latLongToVector3(latB, lng, radius));
    }
  }
  return out;
}

/** Globe render modes: country outlines / dot-matrix abstraction / bare
    graticule sphere (the orbital "shipped work" state). */
export type GlobeMode = 'map' | 'matrix' | 'orbital';

interface GlobeMapProps {
  radius?: number;
  mode?: GlobeMode;
  /** True when the camera is zoomed in — crossfades to the 50m outlines. */
  detail?: boolean;
  /** THREE-parseable literals (hex/rgb) — never CSS vars. */
  lineColor?: string;
  dotColor?: string;
  graticuleColor?: string;
  lineOpacity?: number;
  dotOpacity?: number;
  graticuleOpacity?: number;
  /** Stroke width in PIXELS (drei fat lines), not world units. */
  lineWidth?: number;
}

export const GlobeMap: React.FC<GlobeMapProps> = ({
  radius = 5,
  mode = 'map',
  detail = false,
  lineColor = '#9ea3ab',
  dotColor = '#8b8d98',
  graticuleColor = '#6f7480',
  lineOpacity = 0.5,
  dotOpacity = 0.55,
  graticuleOpacity = 0.35,
  lineWidth = 1.1,
}) => {
  const lineRef = useRef<Line2>(null);
  const hiResRef = useRef<Line2>(null);
  const gratRef = useRef<Line2>(null);
  const dotsMatRef = useRef<THREE.PointsMaterial>(null);
  const [hiResSegments, setHiResSegments] = useState<Tuple3[] | null>(null);

  // Country outlines merged into ONE segment list, rendered via drei's
  // <Line segments> (LineSegments2 fat lines): gl.LINES hairlines are locked
  // to 1 physical px in WebGL, which made the map invisible on 2x displays —
  // fat lines rasterise as screen-space quads with a real pixel width.
  const { outlineSegments, dots } = useMemo(() => getGlobeGeometry(radius), [radius]);
  const graticuleSegments = useMemo(() => buildGraticule(radius), [radius]);

  const dotsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
    return geo;
  }, [dots]);

  useEffect(() => () => dotsGeometry.dispose(), [dotsGeometry]);

  // First zoom-in pulls the 50m outline set in the background.
  useEffect(() => {
    if (!detail || hiResSegments) return;
    let cancelled = false;
    loadHiResSegments(radius).then((segs) => {
      if (!cancelled) setHiResSegments(segs);
    });
    return () => {
      cancelled = true;
    };
  }, [detail, hiResSegments, radius]);

  // Crossfade the layers on mode/detail change. 600ms per the brief. The
  // 110m base holds until the 50m set has actually loaded.
  useEffect(() => {
    const lineMat = lineRef.current?.material as { opacity: number } | undefined;
    const hiResMat = hiResRef.current?.material as { opacity: number } | undefined;
    const gratMat = gratRef.current?.material as { opacity: number } | undefined;
    const dotsMat = dotsMatRef.current;
    if (!lineMat || !gratMat || !dotsMat) return;
    const useHiRes = detail && hiResSegments !== null;
    const fade = (target: { opacity: number }, to: number) =>
      gsap.to(target, { opacity: to, duration: 0.6, ease: 'power2.inOut' });
    fade(lineMat, mode === 'map' && !useHiRes ? lineOpacity : 0);
    if (hiResMat) fade(hiResMat, mode === 'map' && useHiRes ? lineOpacity : 0);
    fade(dotsMat, mode === 'matrix' ? dotOpacity : 0);
    fade(gratMat, mode === 'orbital' ? graticuleOpacity : 0);
  }, [mode, detail, hiResSegments, lineOpacity, dotOpacity, graticuleOpacity]);

  return (
    <group>
      <Line
        ref={lineRef}
        points={outlineSegments}
        segments
        color={lineColor}
        lineWidth={lineWidth}
        transparent
        opacity={lineOpacity}
        depthWrite={false}
      />
      {hiResSegments && (
        <Line
          ref={hiResRef}
          points={hiResSegments}
          segments
          color={lineColor}
          lineWidth={lineWidth}
          transparent
          opacity={0}
          depthWrite={false}
        />
      )}
      <Line
        ref={gratRef}
        points={graticuleSegments}
        segments
        color={graticuleColor}
        lineWidth={1}
        transparent
        opacity={0}
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
          far hemisphere's lines self-occlude and the globe reads as solid. */}
      <mesh>
        <sphereGeometry args={[radius * 0.99, 48, 48]} />
        <meshBasicMaterial color="#101116" />
      </mesh>
    </group>
  );
};
