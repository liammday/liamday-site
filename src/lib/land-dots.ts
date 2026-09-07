import countriesGeoJSON from '../data/countries.geo.json';

/**
 * The globe's dot matrix as lng/lat pairs.
 *
 * Same source and same sampling rule as `buildFromFeatures` in DefenceGlobe
 * (every other vertex of every outline ring), so the flat field and the
 * sphere are two projections of one set of points rather than two datasets.
 * Kept separate from the globe module because that one bakes the points
 * straight into sphere-space Vector3s; the unroll needs them un-projected.
 */

interface GeoFeature {
  geometry: { type: string; coordinates: number[][][] | number[][][][] };
}

// Typed with its concrete ArrayBuffer so it satisfies vgpu's BufferWriteData.
let cached: Float32Array<ArrayBuffer> | null = null;

export function getLandDots(): Float32Array<ArrayBuffer> {
  if (cached) return cached;

  const out: number[] = [];
  // Dedupe onto a coarse grid: dense coastlines otherwise clump into blobs
  // that read as fill rather than as a matrix.
  const seen = new Set<string>();
  const GRID = 0.35;

  const pushRing = (ring: number[][]) => {
    for (let i = 0; i < ring.length; i += 2) {
      const [lng, lat] = ring[i];
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
      const key = `${Math.round(lng / GRID)},${Math.round(lat / GRID)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(lng, lat);
    }
  };

  for (const feature of (countriesGeoJSON as unknown as { features: GeoFeature[] }).features) {
    const { type, coordinates } = feature.geometry;
    if (type === 'Polygon') {
      (coordinates as number[][][]).forEach(pushRing);
    } else if (type === 'MultiPolygon') {
      (coordinates as number[][][][]).forEach((polygon) => polygon.forEach(pushRing));
    }
  }

  cached = new Float32Array(out);
  return cached;
}

/** Index of the land dot nearest a coordinate — the one the console would light. */
export function nearestDotIndex(dots: Float32Array, lng: number, lat: number): number {
  let best = Infinity;
  let idx = 0;
  for (let i = 0; i < dots.length / 2; i++) {
    const d = (dots[i * 2] - lng) ** 2 + (dots[i * 2 + 1] - lat) ** 2;
    if (d < best) {
      best = d;
      idx = i;
    }
  }
  return idx;
}
