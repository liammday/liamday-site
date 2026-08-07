import { useEffect, useState } from 'react';
import { experienceYearsText } from './experience';

/**
 * The years-of-experience figure is derived from today's date, but the page is
 * a static build and the Pages deploy only runs on a push to main. A site built
 * in August renders "12" and would still say "12" the following September,
 * until some unrelated commit happened to trigger a rebuild. Recomputing in the
 * browser means the number is right on the day it changes — no rebuild, no
 * scheduled job, no server.
 *
 * SSR-safe, on the same pattern as useTacticalAccent: the first client render
 * reuses the build-time figure so the hydrated markup matches the server's,
 * then an effect corrects it. The two only differ on a page whose build
 * predates an anniversary, and then only by one digit.
 */
export function useExperienceYears(buildValue: string): string {
  const [years, setYears] = useState(buildValue);
  useEffect(() => setYears(experienceYearsText()), []);
  return years;
}
