import { cv, type Role, type Qualification } from './cv';

/**
 * Geo layer for the /defence exploration: joins the cv.yml content (single
 * source of truth — never duplicate copy here) with map coordinates so the
 * scroll-driven globe can fly to each posting/institution.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  /** Short site label rendered in HUD readouts, e.g. "IMMENSTADT · DEU". */
  label: string;
}

/** Matched against Role.location / Qualification.institution by substring. */
const LOCATION_GEO: Array<{ pattern: RegExp; geo: GeoPoint }> = [
  { pattern: /Harwell/i, geo: { lat: 51.5716, lng: -1.3122, label: 'HARWELL · GBR' } },
  { pattern: /Immenstadt/i, geo: { lat: 47.5606, lng: 10.2198, label: 'IMMENSTADT · DEU' } },
  { pattern: /Bovington/i, geo: { lat: 50.6974, lng: -2.2343, label: 'BOVINGTON · GBR' } },
  { pattern: /Chester/i, geo: { lat: 53.1905, lng: -2.8917, label: 'CHESTER · GBR' } },
  { pattern: /Cyprus/i, geo: { lat: 34.675, lng: 32.846, label: 'CYPRUS · CYP' } },
  { pattern: /Open University/i, geo: { lat: 52.0247, lng: -0.7112, label: 'MILTON KEYNES · GBR' } },
  { pattern: /Sandhurst/i, geo: { lat: 51.3403, lng: -0.6617, label: 'SANDHURST · GBR' } },
  { pattern: /Southampton/i, geo: { lat: 50.9345, lng: -1.3958, label: 'SOUTHAMPTON · GBR' } },
];

/** Home station (the "Based in" hero stat). */
export const HOME_GEO: GeoPoint = { lat: 51.0632, lng: -1.308, label: 'WINCHESTER · GBR' };

function geoFor(text: string): GeoPoint | null {
  const hit = LOCATION_GEO.find(({ pattern }) => pattern.test(text));
  return hit ? hit.geo : null;
}

/** Companies worked hybrid/remote from home. The console draws an animated
    home↔posting link for these and frames both ends together. */
const HYBRID_COMPANIES = /Outdooractive|Oxford Dynamics/i;

export interface GeoRole extends Role {
  geo: GeoPoint;
  /** Hybrid/remote posting — rendered with a link back to the home station. */
  hybrid: boolean;
}

export interface GeoQualification extends Qualification {
  geo: GeoPoint | null;
}

/** Employment newest-first (cv.yml order), each joined to its map site. */
export const geoEmployment: GeoRole[] = cv.employment.map((role) => {
  const geo = geoFor(role.location);
  if (!geo) throw new Error(`defence.ts: no geo mapping for employment location "${role.location}"`);
  return { ...role, geo, hybrid: HYBRID_COMPANIES.test(role.company) };
});

/** Education joined to institution sites (certifications stay non-geo). */
export const geoEducation: GeoQualification[] = cv.education.map((q) => ({
  ...q,
  geo: geoFor(q.institution),
}));
