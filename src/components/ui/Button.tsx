import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'pill';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center justify-center rounded-full bg-ember-400 px-6 py-3 text-sm font-semibold text-charcoal-950 shadow-glow transition texture-noise hover:bg-ember-300',
  secondary:
    'inline-flex items-center justify-center rounded-full border border-aluminum-500/25 px-6 py-3 text-sm font-semibold text-aluminum-100 transition hover:border-ember-400/40 hover:bg-ember-500/10',
  pill:
    'inline-flex items-center gap-2 rounded-full border border-ember-400/40 bg-ember-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-ember-200 transition texture-noise hover:bg-ember-500/20 hover:text-ember-100',
};

interface ButtonProps {
  variant?: ButtonVariant;
  /** When provided, renders an anchor; otherwise a button. */
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  /** Optional trailing icon/glyph (e.g. an arrow or external-link icon). */
  icon?: ReactNode;
  children: ReactNode;
}

/** Primary (ember), secondary (outline), and pill (uppercase) call-to-action. */
export function Button({ variant = 'primary', href, target, rel, className = '', icon, children }: ButtonProps) {
  const cls = `${VARIANTS[variant]} ${className}`.trim();
  if (href) {
    return (
      <a className={cls} href={href} target={target} rel={rel}>
        {children}
        {icon}
      </a>
    );
  }
  return (
    <button className={cls} type="button">
      {children}
      {icon}
    </button>
  );
}

export default Button;
