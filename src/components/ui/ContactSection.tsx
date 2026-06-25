interface ContactSectionProps {
  email: string;
  linkedin?: string;
  github?: string;
}

/** Closing contact section with glow accent and CTAs. */
export function ContactSection({ email, linkedin, github }: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="scroll-mt-32 flex min-h-screen flex-col justify-center border-t border-aluminum-500/20 bg-transparent">
      <div className="relative mx-auto w-full max-w-3xl px-6 py-20 text-center" data-animate="contact-wrapper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1/2 top-12 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-ember-400/20 blur-[120px] opacity-0"
          data-animate="contact-glow"></div>
        <h2 className="text-3xl font-semibold text-aluminum-100" data-animate="contact-heading">
          Let's build momentum together
        </h2>
        <p className="mt-6 text-lg text-aluminum-300" data-animate="contact-copy">
          Whether you need to stabilise release operations, evolve complex training programmes, or unite teams behind a
          shared roadmap — let's talk.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4" data-animate="contact-actions">
          <a
            className="inline-flex items-center justify-center rounded-full bg-ember-400 px-6 py-3 text-sm font-semibold text-charcoal-950 transition texture-noise hover:bg-ember-300"
            data-animate="contact-cta"
            href={`mailto:${email}`}>
            Message me
          </a>
          {linkedin && (
            <a
              className="inline-flex items-center justify-center rounded-full border border-aluminum-500/25 px-6 py-3 text-sm font-semibold text-aluminum-100 transition hover:border-ember-400/40 hover:bg-ember-500/10"
              href={linkedin}>
              Connect on LinkedIn
            </a>
          )}
          {github && (
            <a
              className="inline-flex items-center justify-center rounded-full border border-aluminum-500/25 px-6 py-3 text-sm font-semibold text-aluminum-100 transition hover:border-ember-400/40 hover:bg-ember-500/10"
              href={github}>
              View on GitHub
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
