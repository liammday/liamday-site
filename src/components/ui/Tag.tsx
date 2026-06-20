import type { ElementType, ReactNode } from 'react';

interface TagProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/** Small graphite pill used for technology lists and similar metadata. */
export function Tag({ as: Tag = 'span', className = '', children }: TagProps) {
  return (
    <Tag
      className={`rounded-full border border-aluminum-500/30 bg-graphite-700/70 px-3 py-1 text-xs font-medium text-aluminum-200 ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export default Tag;
