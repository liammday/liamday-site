interface ExperienceCardProps {
  title: string;
  /** Military appointment name, rendered as a second heading tier under the functional title. */
  appointment?: string;
  company: string;
  location: string;
  period: string;
  highlights?: string[];
}

/** A single role in the experience timeline. */
export function ExperienceCard({ title, appointment, company, location, period, highlights }: ExperienceCardProps) {
  return (
    <article
      className="surface-panel p-6 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.9)] lg:p-8"
      data-animate="experience-card">
      <div className="space-y-1">
        <h3 className="type-subheading">{title}</h3>
        {appointment && <p className="text-base font-medium text-aluminum-200">{appointment}</p>}
        <p className="text-sm text-aluminum-300">
          {company} · {location}
        </p>
        <p className="eyebrow">{period}</p>
      </div>
      {highlights && highlights.length > 0 && (
        <ul className="mt-6 list-disc space-y-3 pl-6 text-sm leading-relaxed text-aluminum-300 marker:text-ember-300">
          {highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default ExperienceCard;
