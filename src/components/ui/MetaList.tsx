interface MetaItem {
  label: string;
  value: string;
}

interface MetaListProps {
  items: MetaItem[];
}

/** Project metadata grid (role, published, client, outcome, …). */
export function MetaList({ items }: MetaListProps) {
  if (items.length === 0) return null;
  return (
    <dl className="mt-12 grid gap-6 rounded-2xl border border-aluminum-500/25 bg-graphite-700/60 p-6 text-sm text-aluminum-300 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-aluminum-400">{item.label}</dt>
          <dd className="mt-1 text-aluminum-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default MetaList;
