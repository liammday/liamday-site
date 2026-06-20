interface CapabilityCardProps {
  title: string;
  description: string;
}

/** A single capability on the "Core capabilities" grid. */
export function CapabilityCard({ title, description }: CapabilityCardProps) {
  return (
    <article className="h-full surface-panel p-6 transition-colors duration-200" data-animate="capability-card">
      <h3 className="text-lg font-semibold leading-tight text-aluminum-100">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-aluminum-300">{description}</p>
    </article>
  );
}

export default CapabilityCard;
