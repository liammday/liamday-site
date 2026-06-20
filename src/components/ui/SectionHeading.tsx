import type { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  intro?: ReactNode;
}

/** Section title + optional intro paragraph, with the GSAP reveal hook. */
export function SectionHeading({ title, intro }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4" data-animate="section-heading">
      <h2 className="text-3xl font-semibold text-aluminum-100">{title}</h2>
      {intro && <p className="text-lg text-aluminum-300">{intro}</p>}
    </div>
  );
}

export default SectionHeading;
