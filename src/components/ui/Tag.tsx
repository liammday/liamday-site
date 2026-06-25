import type { ElementType, ReactNode } from 'react';

interface TagProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * Small outlined pill used for technology lists and similar metadata. The
 * `tech-chip` hook wires it into the shared reading-emphasis rules in global.css
 * (resting aluminum-200 → full contrast on hover / in high-contrast mode).
 */
export function Tag({ as: Tag = 'span', className = '', children }: TagProps) {
  return (
    <Tag
      className={`tech-chip rounded-full border border-aluminum-500/30 px-3 py-1 text-xs font-medium text-aluminum-200 ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export default Tag;
