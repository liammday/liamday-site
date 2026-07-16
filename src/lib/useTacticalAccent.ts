import { useEffect, useState } from 'react';

/**
 * Time-of-day tactical accent spectrum, as space-separated RGB channels
 * ("r g b") so it can drive both `rgb(var(--accent))` CSS and THREE colours.
 *
 * Morning gold → afternoon ember → evening violet → night cyan. Every step
 * clears WCAG AA (≥4.5:1) as small text on the tactical black (#050505).
 *
 * SSR-safe: renders the night-cyan default, then corrects after hydration.
 */
export function useTacticalAccent(): string {
  const [accent, setAccent] = useState('0 240 255'); // night cyan default

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      if (hour >= 6 && hour < 12) setAccent('255 180 0'); // morning gold
      else if (hour >= 12 && hour < 18) setAccent('255 57 20'); // afternoon ember
      else if (hour >= 18 && hour < 22) setAccent('190 80 255'); // evening violet
      else setAccent('0 240 255'); // night cyan
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
