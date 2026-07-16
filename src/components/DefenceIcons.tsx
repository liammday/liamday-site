import type { FC, ReactNode } from 'react';

/**
 * Hand-drawn schematic line icons for the /defence tactical design exploration.
 *
 * Style contract: every glyph lives in a 48x48 viewBox, stroke-only at 1.5
 * with square caps and miter joins (engineered feel, no rounded caps).
 * Artwork stays inside x/y 7-41 so it clears the SchematicFrame hairline and
 * corner ticks. Small solid dots are the only fills allowed.
 *
 * Each glyph is an outline homage of the project's real app icon
 * (public/assets/images/projects/*).
 */

/** Small solid dot — the one place fill is permitted. */
const Dot: FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 1.5 }) => (
  <circle cx={cx} cy={cy} r={r} stroke="none" className="fill-aluminum-200" />
);

export interface SchematicFrameProps {
  className?: string;
  children?: ReactNode;
}

/**
 * The shared drawing plate: hairline square + four ember corner ticks that
 * brighten when an ancestor with `group` is hovered. Glyph paths render as
 * children inside the same 48x48 coordinate space.
 */
export function SchematicFrame({ className, children }: SchematicFrameProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      <rect x={1} y={1} width={46} height={46} strokeWidth={1} className="stroke-aluminum-500" />
      <path
        d="M1 4 V1 H4 M44 1 H47 V4 M47 44 V47 H44 M4 47 H1 V44"
        strokeWidth={1.5}
        className="stroke-ember-400 opacity-60 transition-opacity duration-150 group-hover:opacity-100"
      />
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Glyphs                                                              */
/* ------------------------------------------------------------------ */

/** Peaking — two-peak mountain (front taller), snow line, summit flag. */
export const PeakingIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    {/* back peak, emerging from the front peak's right slope */}
    <path d="M28.5 26.5 L33 17.5 L41 38" />
    {/* front peak */}
    <path d="M7 38 L21 13 L35 38" />
    {/* baseline */}
    <path d="M7 38 H41" />
    {/* snow line below the summit */}
    <path d="M17.6 19 L19.4 21 L21 19.3 L22.9 21 L24.4 19.2" />
    {/* summit flag */}
    <path d="M21 13 V7" />
    <path d="M21 7 L26.5 8.6 L21 10.2 Z" />
  </g>
);

/** Training — three checklist rows: status circle + pill bar. */
export const TrainingIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    <circle cx={11} cy={12} r={3.5} />
    <rect x={20} y={8.5} width={21} height={7} rx={3.5} />
    <circle cx={11} cy={24} r={3.5} />
    <rect x={20} y={20.5} width={21} height={7} rx={3.5} />
    <circle cx={11} cy={36} r={3.5} />
    <rect x={20} y={32.5} width={21} height={7} rx={3.5} />
  </g>
);

/** Rallying — racket head with string dots and a short handle stub. */
export const RallyingIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    <ellipse cx={24} cy={20} rx={11.5} ry={13} />
    {/* handle stub, open where it meets the head */}
    <path d="M22.4 32.8 V41 H25.6 V32.8" />
    {/* string dots, diamond lattice */}
    <Dot cx={24} cy={14} r={1} />
    <Dot cx={20} cy={16.5} r={1} />
    <Dot cx={28} cy={16.5} r={1} />
    <Dot cx={18.5} cy={20} r={1} />
    <Dot cx={24} cy={20} r={1} />
    <Dot cx={29.5} cy={20} r={1} />
    <Dot cx={20} cy={23.5} r={1} />
    <Dot cx={28} cy={23.5} r={1} />
    <Dot cx={24} cy={26} r={1} />
  </g>
);

/** Career Pivot Navigator — ringed origin, path sweeping to a circled flag, waypoints, dashed branch. */
export const CareerPivotNavigatorIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    {/* origin dot with one concentric ring */}
    <Dot cx={12.5} cy={34} r={2.4} />
    <circle cx={12.5} cy={34} r={5.5} />
    {/* main path sweeping up-right */}
    <path d="M12.5 34 C21 33 28 28 32.6 19.2" />
    {/* ring around the flag base */}
    <circle cx={33} cy={16.5} r={3} />
    {/* flag pole + pennant */}
    <path d="M33 16.5 V7.5" />
    <path d="M33 7.5 L38.5 9.1 L33 10.7 Z" />
    {/* waypoint dots */}
    <Dot cx={22} cy={14} />
    <Dot cx={37} cy={23} />
    {/* dashed alternative branch */}
    <path d="M14.5 37.5 C23 36 31.5 30.5 37 23" strokeDasharray="1.5 3.5" />
  </g>
);

/** Open Defence Radar — concentric rings, sweep line, three blips (one circled). */
export const OpenDefenceRadarIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    <circle cx={24} cy={24} r={16} />
    <circle cx={24} cy={24} r={9} />
    <circle cx={24} cy={24} r={4} />
    <Dot cx={24} cy={24} r={1.6} />
    {/* sweep line from centre to the outer ring */}
    <path d="M24 24 L36.3 13.7" />
    {/* blips — the one near the sweep is circled */}
    <Dot cx={15.5} cy={18} />
    <Dot cx={28.5} cy={33.5} />
    <Dot cx={35} cy={19} />
    <circle cx={35} cy={19} r={3} />
  </g>
);

/** PodForge — orb, four waveform bars, broadcast arc. */
export const PodforgeIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    {/* orb */}
    <circle cx={12.5} cy={24} r={5} />
    <Dot cx={12.5} cy={24} r={2.1} />
    {/* waveform bars */}
    <path d="M22 15.5 V32.5" />
    <path d="M26 19.5 V28.5" />
    <path d="M30 17 V31" />
    <path d="M34 21 V27" />
    {/* broadcast arc */}
    <path d="M34.9 14.2 A12 12 0 0 1 34.9 33.8" />
  </g>
);

/** LifeOS — hub-and-spoke: centre circle, eight satellites on thin spokes. */
export const LifeOSIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    <circle cx={24} cy={24} r={5} />
    {/* cardinal spokes */}
    <path d="M29 24 H35" />
    <path d="M24 29 V35" />
    <path d="M19 24 H13" />
    <path d="M24 19 V13" />
    {/* diagonal spokes */}
    <path d="M27.5 20.5 L31.8 16.2" />
    <path d="M27.5 27.5 L31.8 31.8" />
    <path d="M20.5 27.5 L16.2 31.8" />
    <path d="M20.5 20.5 L16.2 16.2" />
    {/* satellites */}
    <Dot cx={37} cy={24} r={1.8} />
    <Dot cx={33.2} cy={33.2} r={1.8} />
    <Dot cx={24} cy={37} r={1.8} />
    <Dot cx={14.8} cy={33.2} r={1.8} />
    <Dot cx={11} cy={24} r={1.8} />
    <Dot cx={14.8} cy={14.8} r={1.8} />
    <Dot cx={24} cy={11} r={1.8} />
    <Dot cx={33.2} cy={14.8} r={1.8} />
  </g>
);

/** HomeOS — house with door, radiating to five smart-home satellite dots. */
export const HomeOSIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    {/* house */}
    <path d="M17 24 L24 17 L31 24 V33.5 H17 Z" />
    {/* door, open at the floor */}
    <path d="M21.8 33.5 V27.5 H26.2 V33.5" />
    {/* spokes */}
    <path d="M24 15 V10.5" />
    <path d="M32 22 L36.5 20" />
    <path d="M32.5 28.5 L36.5 30.2" />
    <path d="M16 22 L11.5 20" />
    <path d="M15.5 28.5 L11.5 30.2" />
    {/* satellite dots */}
    <Dot cx={24} cy={8.5} />
    <Dot cx={38.3} cy={19.2} />
    <Dot cx={38.3} cy={30.9} />
    <Dot cx={9.7} cy={19.2} />
    <Dot cx={9.7} cy={30.9} />
  </g>
);

/** Claude Usage Pacer — dual pacing rings (weekly + five-hour arcs), target tick, ember core. */
export const ClaudeUsagePacerIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    {/* outer weekly arc: from the top, clockwise 270 degrees */}
    <path d="M24 10 A14 14 0 1 1 10 24" />
    {/* inner five-hour arc: from the top, clockwise 150 degrees */}
    <path d="M24 15.5 A8.5 8.5 0 0 1 28.25 31.36" />
    {/* target tick just beyond the weekly arc's end */}
    <path d="M10.1 19.5 L7.3 18.6" />
    {/* core */}
    <circle cx={24} cy={24} r={4.75} />
    <Dot cx={24} cy={24} r={2} />
  </g>
);

/** Sainsbury's Groceries MCP — items queue toward a confirmation gate; checkout arc beyond. */
export const SainsburysMcpIcon: FC = () => (
  <g strokeWidth={1.5} className="stroke-aluminum-200">
    {/* items flowing toward the gate */}
    <Dot cx={9.5} cy={24} r={1.3} />
    <Dot cx={15} cy={24} r={1.6} />
    {/* one item ringed for review */}
    <Dot cx={21.5} cy={24} r={1.5} />
    <circle cx={21.5} cy={24} r={3.2} />
    {/* the confirmation gate */}
    <circle cx={31.5} cy={24} r={6.5} />
    {/* checkout arc beyond the gate */}
    <path d="M37.3 17 A9.5 9.5 0 0 1 37.3 31" />
  </g>
);

/** Fallback for unknown slugs — a small centred solid square. */
const FallbackGlyph: FC = () => (
  <rect x={22.5} y={22.5} width={3} height={3} stroke="none" className="fill-aluminum-200" />
);

/* ------------------------------------------------------------------ */
/* Registry + consumer API                                             */
/* ------------------------------------------------------------------ */

export const DEFENCE_ICONS: Record<string, FC> = {
  peaking: PeakingIcon,
  training: TrainingIcon,
  rallying: RallyingIcon,
  'career-pivot-navigator': CareerPivotNavigatorIcon,
  'open-defence-radar': OpenDefenceRadarIcon,
  podforge: PodforgeIcon,
  lifeos: LifeOSIcon,
  homeos: HomeOSIcon,
  'claude-usage-pacer': ClaudeUsagePacerIcon,
  'sainsburys-mcp': SainsburysMcpIcon,
};

export interface DefenceProjectIconProps {
  slug: string;
  className?: string;
}

/**
 * Frame + glyph for a project slug. Unknown slugs render the frame with a
 * small centred square dot. Put `group` on the consuming row to light the
 * corner ticks on hover.
 */
export function DefenceProjectIcon({ slug, className }: DefenceProjectIconProps) {
  const Glyph = DEFENCE_ICONS[slug] ?? FallbackGlyph;
  return (
    <SchematicFrame className={className}>
      <Glyph />
    </SchematicFrame>
  );
}
