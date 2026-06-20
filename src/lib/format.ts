// Format a "YYYY-MM" string as e.g. "May 2026" (matches the Jekyll
// `date_started | append: "-01" | date: "%b %Y"` formatting).
export function formatMonth(ym?: string): string {
  if (!ym) return '';
  const d = new Date(`${ym}-01T00:00:00`);
  if (Number.isNaN(d.getTime())) return ym;
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}
