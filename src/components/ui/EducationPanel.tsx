interface Qualification {
  qualification: string;
  institution: string;
  period: string;
}

interface EducationPanelProps {
  heading: string;
  items: Qualification[];
}

/** A surface panel listing education or certification entries. */
export function EducationPanel({ heading, items }: EducationPanelProps) {
  return (
    <div className="space-y-6 surface-panel p-8" data-animate="education-panel">
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-aluminum-300">{heading}</h3>
      <ul className="space-y-4 text-sm leading-relaxed text-aluminum-300">
        {items.map((item) => (
          <li key={item.qualification} data-animate="education-item">
            <p className="text-base font-semibold leading-tight text-aluminum-100">{item.qualification}</p>
            <p className="text-sm text-aluminum-300">{item.institution}</p>
            <p className="mt-1 text-xs font-medium uppercase text-aluminum-400">{item.period}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EducationPanel;
