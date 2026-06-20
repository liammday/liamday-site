import type { ReactNode } from 'react';

interface BadgeProps {
  className?: string;
  children: ReactNode;
}

/** Bordered ember pill with wide tracking and the anodised texture — used for
 *  the hero eyebrow and similar labels. */
export function Badge({ className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-ember-400/30 bg-ember-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-ember-200 texture-noise ${className}`.trim()}>
      {children}
    </span>
  );
}

export default Badge;
