/**
 * Where the sun is, right now.
 *
 * The subsolar point — the one place on Earth with the sun directly overhead —
 * from the NOAA general solar position equations. Accurate to a fraction of a
 * degree, which at globe scale is far finer than a pixel.
 *
 * The console already tells the time through its accent (see useTacticalAccent,
 * which tracks the sky through the viewer's day). This puts the same fact on
 * the globe geometrically, so the two agree rather than merely coexist.
 */

export interface SubsolarPoint {
  /** Solar declination, degrees. Swings ±23.44° across the year. */
  lat: number;
  /** Degrees east of Greenwich; moves west at 15°/hour. */
  lng: number;
}

/** Day of the year, 1–366, in UTC. */
function dayOfYearUTC(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - start) / 86_400_000) + 1;
}

export function subsolarPoint(date: Date = new Date()): SubsolarPoint {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Fractional year, radians.
  const g = ((2 * Math.PI) / 365) * (dayOfYearUTC(date) - 1 + (hours - 12) / 24);

  // Equation of time, minutes — the gap between clock noon and solar noon.
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));

  // Solar declination, radians.
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);

  // At a given UTC hour the subsolar meridian sits west of Greenwich by the
  // hours elapsed since solar noon there, at 15° an hour.
  let lng = -15 * (hours + eqTime / 60 - 12);
  lng = ((((lng + 180) % 360) + 360) % 360) - 180;

  return { lat: (decl * 180) / Math.PI, lng };
}

/**
 * The subsolar point as a unit vector in the globe's object space, matching
 * `latLongToVector3` in DefenceGlobe so the terminator lands on the same
 * geography as the country outlines.
 */
export function subsolarDirection(date: Date = new Date()): [number, number, number] {
  const { lat, lng } = subsolarPoint(date);
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [-(Math.sin(phi) * Math.cos(theta)), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
}
