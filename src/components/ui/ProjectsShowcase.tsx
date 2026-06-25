import { useEffect, useMemo, useRef, useState } from 'react';
import type { AppProject } from '../../data/projects';
import { ProjectCard } from './ProjectCard';

type SortKey = 'featured' | 'newest' | 'oldest';

// Display label → underlying tag slugs it matches. A category pill only renders
// if at least one project carries one of its tags. (Ported from projects-showcase.html.)
const FILTER_CATEGORIES: { label: string; tags: string[] }[] = [
  { label: 'Swift/iOS', tags: ['swift', 'ios', 'watchos'] },
  { label: 'Applied AI', tags: ['applied-ai'] },
  { label: 'MCP', tags: ['mcp'] },
  { label: 'Python', tags: ['python'] },
  { label: 'Defence', tags: ['defence'] },
  { label: 'Open Source', tags: ['open-source'] },
  { label: 'Personal', tags: ['personal'] },
  { label: 'Self-hosted', tags: ['self-hosted'] },
];

const SORTS: SortKey[] = ['featured', 'newest', 'oldest'];

function monthValue(started?: string): number {
  if (!started) return 0;
  const [y, m] = started.split('-');
  return parseInt(y, 10) * 100 + parseInt(m || '0', 10);
}

function pillClass(active: boolean): string {
  return active
    ? 'rounded-full border border-ember-400/50 bg-ember-500/10 px-3 py-2 text-xs font-medium text-ember-200 transition'
    : 'rounded-full border border-aluminum-500/30 px-3 py-2 text-xs font-medium text-aluminum-300 transition hover:border-aluminum-400/50 hover:text-aluminum-100';
}

interface ProjectsShowcaseProps {
  projects: AppProject[];
}

/** Interactive projects grid: featured/newest/oldest sort + multi-tag OR-filter. */
export function ProjectsShowcase({ projects }: ProjectsShowcaseProps) {
  const [sort, setSort] = useState<SortKey>('featured');
  // each active filter is a comma-joined category key (e.g. "swift,ios,watchos")
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const allTags = useMemo(() => new Set(projects.flatMap((p) => p.tags ?? [])), [projects]);
  const categories = FILTER_CATEGORIES.filter((c) => c.tags.some((t) => allTags.has(t)));

  const visible = useMemo(() => {
    let list = projects.slice();

    if (activeFilters.length > 0) {
      const sets = activeFilters.map((k) => k.split(','));
      list = list.filter((p) => {
        const tags = p.tags ?? [];
        return sets.some((set) => set.some((t) => tags.includes(t)));
      });
    }

    list.sort((a, b) => {
      if (sort === 'featured') return a.order - b.order;
      const aStart = monthValue(a.date_started);
      const bStart = monthValue(b.date_started);
      if (sort === 'newest') {
        const aOngoing = a.date_finished ? 0 : 1;
        const bOngoing = b.date_finished ? 0 : 1;
        if (aOngoing !== bOngoing) return bOngoing - aOngoing;
        return bStart - aStart;
      }
      return aStart - bStart; // oldest
    });

    return list;
  }, [projects, sort, activeFilters]);

  // Let the global GSAP ScrollTrigger re-measure after a sort/filter reorders or
  // hides cards (mirrors the refreshReveal() in the original inline script).
  // IMPORTANT: skip the initial mount. This island is client:visible, so it
  // hydrates when scrolled into view; dispatching on mount would fire
  // ScrollTrigger.refresh() mid-scroll and could strand nearby sections at
  // opacity 0. Only re-measure on a genuine user sort/filter change.
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    window.dispatchEvent(new CustomEvent('projects:changed'));
  }, [visible]);

  function toggleFilter(key: string) {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <section
      id="projects"
      className="scroll-mt-32 flex min-h-screen flex-col justify-center border-b border-aluminum-500/20 bg-transparent">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="max-w-3xl space-y-4" data-animate="section-heading">
          <h2 className="text-3xl font-semibold text-aluminum-100">Projects</h2>
        </div>

        <div className="mt-10 space-y-6" data-animate="section-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">Sort</span>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={sort === s}
                  onClick={() => setSort(s)}
                  className={pillClass(sort === s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">Filter</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={activeFilters.length === 0}
                onClick={() => setActiveFilters([])}
                className={pillClass(activeFilters.length === 0)}>
                All
              </button>
              {categories.map((c) => {
                const key = c.tags.join(',');
                const active = activeFilters.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleFilter(key)}
                    className={pillClass(active)}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6">
          {visible.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsShowcase;
