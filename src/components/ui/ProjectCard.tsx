import type { AppProject } from '../../data/projects';
import { formatMonth } from '../../lib/format';
import { Button } from './Button';
import { Tag } from './Tag';
import { ExternalLinkIcon } from './icons';

interface ProjectCardProps {
  project: AppProject;
}

/** The rich project/app card used in the projects showcase. */
export function ProjectCard({ project }: ProjectCardProps) {
  const { name, platform, status, icon, icon_webp, audience, summary, technologies, features, link, link_label } =
    project;
  const isExternal = !!link && link.includes('://');

  return (
    <article className="surface-panel h-full p-6 lg:p-8 transition-opacity duration-300 ease-in-out" data-animate="project-card">
      <div className="project-card__header flex items-start gap-4">
        {icon ? (
          <picture className="h-32 w-32 shrink-0">
            {icon_webp && <source srcSet={icon_webp} type="image/webp" />}
            <img
              className="h-32 w-32 object-cover"
              src={icon}
              alt={`${name} app icon`}
              loading="lazy"
              width={128}
              height={128}
            />
          </picture>
        ) : (
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border border-ember-400/30 bg-ember-500/10 texture-noise">
            <span aria-hidden="true" className="text-3xl text-ember-200">
              ✦
            </span>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">
            {platform}
            {status ? ` · ${status}` : ''}
          </p>
          {project.date_started && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-aluminum-400">
              {project.date_finished ? (
                <span>
                  {formatMonth(project.date_started)} → {formatMonth(project.date_finished)}
                </span>
              ) : (
                <>
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-ember-400"></span>
                  <span>{formatMonth(project.date_started)} → Present</span>
                </>
              )}
            </p>
          )}
          <h3 className="text-xl font-semibold leading-tight text-aluminum-100">{name}</h3>
          {audience && <p className="text-sm leading-relaxed text-aluminum-300">{audience}</p>}
        </div>
      </div>

      {summary && <p className="mt-6 text-sm leading-relaxed text-aluminum-300">{summary}</p>}

      {technologies && technologies.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">Core technologies</p>
          <ul className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <Tag as="li" key={tech}>
                {tech}
              </Tag>
            ))}
          </ul>
        </div>
      )}

      {features && features.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">Key features</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-aluminum-300 marker:text-ember-300">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {link && (
        <div className="mt-6">
          <Button
            variant="pill"
            href={link}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            icon={isExternal ? <ExternalLinkIcon /> : <span aria-hidden="true">→</span>}>
            {link_label ?? 'View case study'}
          </Button>
        </div>
      )}
    </article>
  );
}

export default ProjectCard;
