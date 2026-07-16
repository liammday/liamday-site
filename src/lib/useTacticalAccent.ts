import { useEffect, useState } from 'react';

/**
 * Sky-tone accent spectrum: the page accent tracks the colour of the sky
 * through the 24h day — night blue → pre-dawn indigo → dawn rose → sunrise
 * gold → day blue → golden hour amber → sunset ember → dusk violet → night.
 *
 * Values are luminous, high-chroma versions of each sky tone so every stop
 * clears WCAG AA (≥4.5:1, most ≥7:1) as small mono text on the tactical
 * black (#050505). Interpolation is linear RGB with cosine easing; the
 * cross-hue transitions (day-blue → amber) are kept short in the keyframe
 * table so the desaturated midpoint is only ever transient.
 *
 * Returned as space-separated RGB channels ("r g b") so it can drive both
 * `rgb(var(--accent))` CSS and THREE material colours.
 *
 * SSR-safe: renders the night default, then corrects after hydration.
 * Future refinement: derive keyframe times from actual sunrise/sunset for
 * the viewer's latitude (SunCalc) instead of fixed clock times.
 */

type Keyframe = { hour: number; rgb: [number, number, number] };

const SKY_KEYFRAMES: Keyframe[] = [
  { hour: 0.0, rgb: [96, 150, 255] }, // deep night blue
  { hour: 4.0, rgb: [96, 150, 255] }, // hold through the small hours
  { hour: 5.0, rgb: [150, 140, 255] }, // astronomical dawn indigo
  { hour: 6.0, rgb: [255, 135, 150] }, // dawn rose
  { hour: 7.0, rgb: [255, 155, 60] }, // sunrise gold
  { hour: 9.0, rgb: [140, 195, 255] }, // morning blue
  { hour: 16.0, rgb: [110, 185, 255] }, // long midday/afternoon sky blue
  { hour: 17.5, rgb: [255, 185, 80] }, // golden hour amber
  { hour: 19.5, rgb: [255, 105, 65] }, // sunset ember
  { hour: 21.0, rgb: [185, 125, 255] }, // dusk violet
  { hour: 22.5, rgb: [96, 150, 255] }, // back to night
  { hour: 24.0, rgb: [96, 150, 255] }, // wrap
];

/** Sample the sky spectrum at a fractional hour (0–24). Exported for tests/previews. */
export function skyAccentAt(hour: number): string {
  const h = ((hour % 24) + 24) % 24;

  let i = 0;
  while (i < SKY_KEYFRAMES.length - 2 && SKY_KEYFRAMES[i + 1].hour <= h) i++;
  const a = SKY_KEYFRAMES[i];
  const b = SKY_KEYFRAMES[i + 1];

  const span = b.hour - a.hour || 1e-6;
  const t = Math.min(1, Math.max(0, (h - a.hour) / span));
  // Cosine ease: dwell on the keyframe colours, move through midpoints quickly.
  const e = 0.5 - 0.5 * Math.cos(Math.PI * t);

  const rgb = a.rgb.map((av, ch) => Math.round(av + (b.rgb[ch] - av) * e));
  return rgb.join(' ');
}

export function useTacticalAccent(): string {
  const [accent, setAccent] = useState(() => skyAccentAt(0)); // night default (SSR)

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setAccent(skyAccentAt(now.getHours() + now.getMinutes() / 60));
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  return accent;
}

/** "255 57 20" → "rgb(255, 57, 20)" — a form THREE.Color and CSS both parse. */
export function accentToCss(accent: string): string {
  return `rgb(${accent.split(' ').join(', ')})`;
}
