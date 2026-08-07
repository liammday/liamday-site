// Experience-years calculation, ported from the Liquid date math in
// _layouts/home.html. Career start: September 2013.
const START_YEAR = 2013;
const START_MONTH = 9;

export function experienceYearsText(now: Date = new Date()): string {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  let years = currentYear - START_YEAR;
  const months = currentMonth - START_MONTH;
  if (months < 0) years -= 1;
  let text = String(years);
  if (months > 6) text += '+';
  return text;
}

/** Replace the [[experience_years]] placeholder used in cv.yml copy. Takes the
    figure rather than a date so the caller decides which clock it came from —
    the build's, or the viewer's (see useExperienceYears). */
export function withExperienceYears(text: string, years: string = experienceYearsText()): string {
  return text.replace(/\[\[experience_years\]\]/g, years);
}
