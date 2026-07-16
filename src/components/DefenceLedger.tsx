import React, { useMemo, useState } from 'react';
import { DefenceProjectIcon } from './DefenceIcons';

/**
 * /05 SHIPPED WORK — the projects ops log for the /defence exploration.
 * The row grid is split on the viewport centre line: clause / icon / chip /
 * name live in the LEFT half, the summary in the RIGHT. When a dossier
 * opens, the right-half panel simply covers the summaries — the list itself
 * never re-lays out, so it doubles as the dossier's asset index with zero
 * transition machinery. Bracket chip rail: featured/newest/oldest sort +
 * multi-select OR category filters (logic ported from ui/ProjectsShowcase).
 */

export interface LedgerProject {
  name: string;
  link?: string;
  summary?: string;
  platform?: string;
  technologies?: string[];
  tags?: string[];
  order: number;
  date_started?: string;
  date_finished?: string;
}

type SortKey = 'featured' | 'newest' | 'oldest';
const SORTS: SortKey[] = ['featured', 'newest', 'oldest'];

// Display label → underlying tag slugs it matches (mirrors ProjectsShowcase).
const FILTER_CATEGORIES: { label: string; tags: string[] }[] = [
  { label: 'SWIFT/IOS', tags: ['swift', 'ios', 'watchos'] },
  { label: 'APPLIED AI', tags: ['applied-ai'] },
  { label: 'MCP', tags: ['mcp'] },
  { label: 'PYTHON', tags: ['python'] },
  { label: 'DEFENCE', tags: ['defence'] },
  { label: 'OPEN SOURCE', tags: ['open-source'] },
  { label: 'PERSONAL', tags: ['personal'] },
  { label: 'SELF-HOSTED', tags: ['self-hosted'] },
];

function monthValue(started?: string): number {
  if (!started) return 0;
  const [y, m] = started.split('-');
  return parseInt(y, 10) * 100 + parseInt(m || '0', 10);
}

/** "/projects/open-defence-radar/" → "open-defence-radar" */
export function slugFromLink(link?: string): string {
  if (!link) return '';
  const m = link.match(/\/projects\/([^/]+)\/?$/);
  return m ? m[1] : '';
}

export function designationChip(p: LedgerProject): string {
  const platform = (p.platform ?? '').toLowerCase();
  if (platform.includes('ios') || platform.includes('watch')) return 'IOS';
  const tech = [...(p.technologies ?? []), ...(p.tags ?? [])].join(' ').toLowerCase();
  if (tech.includes('mcp')) return 'MCP';
  if (tech.includes('swift')) return 'IOS';
  if (tech.includes('macos') || tech.includes('cli')) return 'CLI';
  return 'SW';
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const Chip = ({ active, onClick, children }: ChipProps) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`t-readout cursor-pointer bg-transparent p-0 transition-colors duration-150 ${
      active ? 'text-ember-300' : 'text-aluminum-400 hover:text-aluminum-200'
    }`}
  >
    [{children}]
  </button>
);

interface DefenceLedgerProps {
  projects: LedgerProject[];
  /** Reports the hovered/focused project's index in the ORIGINAL array
      (= its orbital satellite id), or null. */
  onActiveProject: (index: number | null) => void;
  /** Plain left-click on a row opens the in-page dossier instead of
      navigating (modified clicks still reach the standalone page). */
  onOpenProject: (index: number) => void;
  /** The open dossier's project index — its row reads as the active clause. */
  openIndex: number | null;
}

export function DefenceLedger({ projects, onActiveProject, onOpenProject, openIndex }: DefenceLedgerProps) {
  const [sort, setSort] = useState<SortKey>('featured');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const allTags = useMemo(() => new Set(projects.flatMap((p) => p.tags ?? [])), [projects]);
  const categories = FILTER_CATEGORIES.filter((c) => c.tags.some((t) => allTags.has(t)));

  const visible = useMemo(() => {
    let list = projects.map((p, originalIndex) => ({ p, originalIndex }));

    if (activeFilters.length > 0) {
      const sets = activeFilters.map((k) => k.split(','));
      list = list.filter(({ p }) => {
        const tags = p.tags ?? [];
        return sets.some((set) => set.some((t) => tags.includes(t)));
      });
    }

    list.sort((a, b) => {
      if (sort === 'featured') return a.p.order - b.p.order;
      const aStart = monthValue(a.p.date_started);
      const bStart = monthValue(b.p.date_started);
      if (sort === 'newest') {
        const aOngoing = a.p.date_finished ? 0 : 1;
        const bOngoing = b.p.date_finished ? 0 : 1;
        if (aOngoing !== bOngoing) return bOngoing - aOngoing;
        return bStart - aStart;
      }
      return aStart - bStart; // oldest
    });

    return list;
  }, [projects, sort, activeFilters]);

  const toggleFilter = (key: string) =>
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div data-ledger>
      {/* ── Bracket chip rail — kept inside the left half so it stays fully
             visible (and usable) while a dossier panel covers the right ── */}
      <div className="mt-10 space-y-3 md:w-1/2 md:pr-12">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="t-kicker w-12">SORT</span>
          {SORTS.map((s) => (
            <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
              {s.toUpperCase()}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="t-kicker w-12">FILTER</span>
          {categories.map((c) => {
            const key = c.tags.join(',');
            return (
              <Chip key={key} active={activeFilters.includes(key)} onClick={() => toggleFilter(key)}>
                {c.label}
              </Chip>
            );
          })}
        </div>
        <p className="t-readout border-t border-aluminum-500 pt-3 text-aluminum-300">
          SHOWING {String(visible.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} ASSETS
        </p>
      </div>

      {/* ── Ledger rows. The two-half grid puts the title column's end on the
             viewport centre line — exactly the dossier panel's edge. ── */}
      <div className="mt-8">
        {visible.map(({ p, originalIndex }) => {
          const slug = slugFromLink(p.link);
          const isOpen = openIndex === originalIndex;
          const inner = (
            <div className="md:grid md:grid-cols-2">
              {/* Left half: clause / icon / chip / name — the standing index */}
              <div className="grid grid-cols-[2.5rem_1fr] items-start gap-4 py-5 md:grid-cols-[6rem_2.5rem_4.5rem_1fr] md:items-center md:gap-6 md:pr-12">
                {/* Identity clause: each asset KEEPS its number under sort/filter
                    (clauses cite, they don't renumber) — and it always matches
                    the same-numbered satellite on the orbital ring. */}
                <p className={`t-readout hidden md:block ${isOpen ? 'text-ember-400' : 'text-aluminum-400'}`}>
                  05.{originalIndex + 1}
                </p>
                <DefenceProjectIcon slug={slug} className="h-10 w-10 shrink-0" />
                <div className="md:contents">
                  <p className="t-readout text-ember-400">[{designationChip(p)}]</p>
                  <h3
                    className={`mt-1 text-lg font-medium transition-colors duration-150 md:mt-0 ${
                      isOpen ? 'text-ember-300' : 'text-aluminum-100 group-hover:text-ember-300'
                    }`}
                  >
                    {p.name}
                  </h3>
                </div>
              </div>
              {/* Right half: the summary — covered by an open dossier panel */}
              <div className="pb-5 pl-[3.5rem] md:flex md:items-center md:py-5 md:pl-12 md:pb-5">
                <p className="text-sm leading-relaxed text-aluminum-300">
                  {(p.summary ?? '').split('. ')[0].replace(/\.$/, '')}.
                </p>
              </div>
            </div>
          );
          const rowProps = {
            onMouseEnter: () => onActiveProject(originalIndex),
            onMouseLeave: () => onActiveProject(null),
            onFocus: () => onActiveProject(originalIndex),
            onBlur: () => onActiveProject(null),
          };
          const rowClass = `group block border-t no-underline transition-colors duration-150 ${
            isOpen ? 'border-ember-400/60' : 'border-aluminum-500 hover:border-ember-400/60'
          }`;
          return p.link ? (
            <a
              key={p.name}
              href={p.link}
              aria-current={isOpen ? 'true' : undefined}
              {...rowProps}
              onClick={(e) => {
                // Plain left-click opens/switches the in-page dossier;
                // cmd/ctrl/shift/middle-click keep native new-tab behaviour.
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onOpenProject(originalIndex);
              }}
              className={rowClass}
            >
              {inner}
            </a>
          ) : (
            <div key={p.name} {...rowProps} className={rowClass}>
              {inner}
            </div>
          );
        })}
        <div className="border-t border-aluminum-500"></div>
      </div>
    </div>
  );
}
