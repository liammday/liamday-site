import { Button } from './Button';
import { StatCard } from './StatCard';

interface HeroStat {
  label: string;
  value: string;
  detail: string;
}

interface HeroProps {
  badge: string;
  heading?: string;
  profileText: string;
  stats: HeroStat[];
  email: string;
  photoSrc?: string;
}

/** Full-screen hero: photo, eyebrow badge, heading, profile copy, CTAs, stats. */
export function Hero({
  badge,
  heading = "Hello, I'm Liam Day",
  profileText,
  stats,
  email,
  photoSrc = '/assets/images/profile-photo.png',
}: HeroProps) {
  return (
    <section
      id="profile"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-aluminum-500/20 bg-transparent">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-10 px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-4 lg:items-center lg:gap-4">
          <div className="flex justify-center" data-animate="hero-photo">
            <img
              src={photoSrc}
              alt="Liam Day"
              className="h-40 w-40 rounded-full object-cover ring-4 ring-aluminum-500/20 shadow-lg"
              width={160}
              height={160}
            />
          </div>

          <div className="space-y-6 lg:col-span-3" data-animate="hero-copy">
            <span
              className="inline-flex items-center rounded-full border border-ember-400/30 bg-ember-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-ember-200 texture-noise"
              data-animate="hero-badge">
              {badge}
            </span>

            <h1 className="text-4xl font-semibold text-aluminum-100 sm:text-5xl" data-animate="hero-heading">
              {heading}
            </h1>

            <p className="max-w-3xl text-lg leading-relaxed text-aluminum-300" data-animate="hero-text">
              {profileText}
            </p>

            <div className="flex flex-wrap gap-4" data-animate="hero-actions">
              <Button variant="primary" href="#experience">
                View experience
              </Button>
              <Button variant="secondary" href={`mailto:${email}`}>
                Let's connect
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
