import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
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

/** Polyline → line-segment pairs, ready for a merged LineSegments buffer. */
export function polylineToSegments(points: THREE.Vector3[], out: number[]): void {
  for (let i = 0; i < points.length - 1; i++) {
    out.push(points[i].x, points[i].y, points[i].z, points[i + 1].x, points[i + 1].y, points[i + 1].z);
  }
}

interface GlobeMapProps {
  radius?: number;
  /** THREE-parseable literal (hex/rgb) — never a CSS var. */
  color?: string;
  opacity?: number;
}

export const GlobeMap: React.FC<GlobeMapProps> = ({
  radius = 5,
  color = '#565b63',
  opacity = 0.4,
}) => {
  // Every country outline merged into ONE LineSegments geometry — a single
  // draw call, versus ~800 for the per-ring <line> approach.
  const geometry = useMemo(() => {
    const positions: number[] = [];

    const pushRing = (ring: number[][]) => {
      const points = ring.map(([lng, lat]) => latLongToVector3(lat, lng, radius));
      polylineToSegments(points, positions);
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
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </lineSegments>
      {/* Opaque near-black sphere just under the wireframe: writes depth so the
          far hemisphere's outlines self-occlude and the globe reads as solid. */}
      <mesh>
        <sphereGeometry args={[radius * 0.99, 48, 48]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
    </group>
  );
};
