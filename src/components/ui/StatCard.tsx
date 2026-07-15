interface StatCardProps {
  label: string;
  value: string;
  detail: string;
}

/** Hero statistic on a surface panel (label / value / detail). */
export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="surface-panel p-6" data-animate="hero-stat">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-aluminum-100">{value}</p>
      <p className="mt-2 text-sm text-aluminum-400">{detail}</p>
    </div>
  );
}

export default StatCard;
