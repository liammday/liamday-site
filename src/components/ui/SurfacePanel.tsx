import type { ElementType, ReactNode } from 'react';

interface SurfacePanelProps {
  /** Element/tag to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  /** Forwarded so GSAP reveal hooks (data-animate) and ids pass through. */
  [key: `data-${string}`]: string | undefined;
  id?: string;
}

/**
 * The site's elevated card primitive: graphite surface, soft aluminium border,
 * an ember hover ring, and the mouse-tracked spotlight glow (driven globally by
 * scripts/spotlight.ts). All visual treatment lives in the `.surface-panel`
 * class in global.css.
 */
export function SurfacePanel({ as: Tag = 'div', className = '', children, ...rest }: SurfacePanelProps) {
  return (
    <Tag className={`surface-panel ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

export default SurfacePanel;
