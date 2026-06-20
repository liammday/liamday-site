import type { ReactNode } from 'react';

/**
 * Preview-only frame: renders children on the site's dark charcoal surface.
 * Used as the design-sync preview wrapper (cfg.provider) so light-on-dark
 * components are visible against the right background — the same role the
 * Storybook decorator plays. Not a shipped design-system component.
 */
export function ThemeFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-charcoal-900 text-aluminum-100" style={{ padding: '2.5rem' }}>
      {children}
    </div>
  );
}

export default ThemeFrame;
