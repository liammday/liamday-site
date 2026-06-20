interface StatCardProps {
  label: string;
  value: string;
  detail: string;
}

/** Hero statistic on a surface panel (label / value / detail). */
export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="surface-panel p-6" data-animate="hero-stat">
      <p className="text-sm uppercase tracking-[0.3em] text-aluminum-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-aluminum-100">{value}</p>
      <p className="mt-2 text-sm text-aluminum-400">{detail}</p>
    </div>
  );
}

export default StatCard;
