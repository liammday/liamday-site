// Scroll-driven reveal animations + surface-panel spotlight glow.
// Ported from assets/js/gsap-animations.js; GSAP now comes from the npm package
// instead of a CDN global. Honours prefers-reduced-motion and the data-motion
// opt-outs.
//
// Reveal model: elements start hidden (gsap.set opacity 0) and reveal on enter.
// Reveals are ONE-WAY — no element is ever re-hidden on scroll-out or on a
// ScrollTrigger.refresh(). This is deliberate: the projects showcase is a React
// island whose hydration/sort/filter can fire ScrollTrigger.refresh() at any
// time, and a re-hide callback firing during that refresh would strand a section
// invisible with no scroll event to recover it. With reveal-only triggers a
// refresh can, at worst, re-reveal something already visible.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function ready(fn: () => void) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
}

function initCardSpotlight() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.surface-panel'));
  if (!cards.length) return;

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  cards.forEach((card) => {
    let animationFrame: number | null = null;

    const setOpacity = (value: string) => {
      card.style.setProperty('--spotlight-opacity', value);
    };

    const setPosition = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
      card.style.setProperty('--spotlight-x', `${x}%`);
      card.style.setProperty('--spotlight-y', `${y}%`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => setPosition(event));
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      setPosition(event);
      setOpacity('1');
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      setOpacity('0');
    };

    const handleFocus = () => {
      card.style.setProperty('--spotlight-x', '50%');
      card.style.setProperty('--spotlight-y', '50%');
      setOpacity('0.85');
    };

    const handleBlur = () => setOpacity('0');

    card.addEventListener('pointerenter', handlePointerEnter);
    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerleave', handlePointerLeave);
    card.addEventListener('focusin', handleFocus);
    card.addEventListener('focusout', handleBlur);
  });
}

function motionManuallyDisabled(): boolean {
  const root = document.documentElement;
  if ((root && root.dataset.motion === 'off') || (document.body && document.body.dataset.motion === 'off')) {
    return true;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const motion = (params.get('motion') || '').toLowerCase();
    if (motion === 'off' || motion === 'reduce' || motion === 'none') return true;
    if (params.has('reduce-motion') || params.has('reducemotion') || params.has('preview')) return true;
  } catch {
    /* URLSearchParams unavailable — ignore */
  }
  try {
    if (window.localStorage && window.localStorage.getItem('motion') === 'off') return true;
  } catch {
    /* storage access blocked — ignore */
  }
  return false;
}

ready(function () {
  initCardSpotlight();

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shouldReduceMotion = reduceMotionQuery.matches || motionManuallyDisabled();
  const allowMotion = !shouldReduceMotion;

  if (shouldReduceMotion && document.documentElement) {
    document.documentElement.setAttribute('data-motion', 'off');
  }

  function initHero() {
    const hero = document.querySelector('#profile');
    if (!hero) return;

    const heroElements = [
      hero.querySelector('[data-animate="hero-badge"]'),
      hero.querySelector('[data-animate="hero-heading"]'),
      hero.querySelector('[data-animate="hero-text"]'),
      hero.querySelector('[data-animate="hero-actions"]'),
    ].filter(Boolean);
    const statCards = gsap.utils.toArray('[data-animate="hero-stat"]', hero);

    if (!heroElements.length && !statCards.length) return;

    if (!allowMotion) {
      if (heroElements.length) gsap.set(heroElements, { y: 0, opacity: 1 });
      if (statCards.length) gsap.set(statCards, { y: 0, opacity: 1 });
      return;
    }

    if (heroElements.length) gsap.set(heroElements, { y: 36, opacity: 0 });
    if (statCards.length) gsap.set(statCards, { y: 24, opacity: 0 });

    const heroTimeline = gsap.timeline({ defaults: { ease: 'power1.out' } });

    if (heroElements.length) {
      heroTimeline.to(heroElements, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 });
    }
    if (statCards.length) {
      heroTimeline.to(statCards, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, heroElements.length ? '-=0.2' : 0);
    }
  }

  function initSectionHeadings() {
    const headingBlocks = gsap.utils.toArray<HTMLElement>('[data-animate="section-heading"]');
    if (!headingBlocks.length) return;

    headingBlocks.forEach((block) => {
      const items = gsap.utils.toArray(':scope > *', block);
      if (!items.length) return;

      if (!allowMotion) {
        gsap.set(items, { y: 0, opacity: 1 });
        return;
      }

      gsap.set(items, { y: 32, opacity: 0 });
      const reveal = () => gsap.to(items, { y: 0, opacity: 1, duration: 0.6, ease: 'power1.out', stagger: 0.1 });
      ScrollTrigger.create({ trigger: block, start: 'top 80%', onEnter: reveal, onEnterBack: reveal });
    });
  }

  // Simple vertical reveal (experience cards).
  function initSimpleCards(selector: string) {
    const cards = gsap.utils.toArray<HTMLElement>(selector);
    if (!cards.length) return;

    if (!allowMotion) {
      gsap.set(cards, { y: 0, opacity: 1 });
      return;
    }

    cards.forEach((card) => {
      gsap.set(card, { y: 48, opacity: 0 });
      const reveal = () => gsap.to(card, { y: 0, opacity: 1, duration: 0.6, ease: 'power1.out' });
      ScrollTrigger.create({ trigger: card, start: 'top 85%', onEnter: reveal, onEnterBack: reveal });
    });
  }

  // Alternating horizontal slide reveal (capability cards, education panels).
  function initSlideCards(selector: string, scope?: Element) {
    const cards = scope
      ? gsap.utils.toArray<HTMLElement>(selector, scope)
      : gsap.utils.toArray<HTMLElement>(selector);
    if (!cards.length) return;

    if (!allowMotion) {
      gsap.set(cards, { x: 0, opacity: 1 });
      return;
    }

    cards.forEach((card, index) => {
      const fromX = index % 2 === 0 ? -32 : 32;
      gsap.set(card, { x: fromX, opacity: 0, transformOrigin: '50% 50%' });
      const reveal = () => gsap.to(card, { x: 0, opacity: 1, duration: 0.6, ease: 'power1.out' });
      ScrollTrigger.create({ trigger: card, start: 'top 85%', onEnter: reveal, onEnterBack: reveal });
    });
  }

  function initProjects() {
    const cards = gsap.utils.toArray<HTMLElement>('[data-animate="project-card"]');
    if (!cards.length) return;

    if (!allowMotion) {
      gsap.set(cards, { x: 0, opacity: 1 });
      return;
    }

    cards.forEach((card, index) => {
      const fromX = index % 2 === 0 ? -32 : 32;
      gsap.set(card, { x: fromX, opacity: 0 });

      const reveal = () => {
        gsap.to(card, { x: 0, opacity: 1, duration: 0.6, ease: 'power1.out' });
      };

      ScrollTrigger.create({ trigger: card, start: 'top 85%', onEnter: reveal, onEnterBack: reveal });
    });
  }

  function initContact() {
    const section = document.querySelector('#contact');
    if (!section) return;

    const heading = section.querySelector('[data-animate="contact-heading"]');
    const copy = section.querySelector('[data-animate="contact-copy"]');
    const actions = section.querySelector('[data-animate="contact-actions"]');
    const cta = section.querySelector('[data-animate="contact-cta"]');
    const glow = section.querySelector('[data-animate="contact-glow"]');
    const actionItems = actions ? gsap.utils.toArray(':scope > *', actions) : [];

    if (!allowMotion) {
      if (glow) gsap.set(glow, { opacity: 1, scale: 1 });
      if (heading) gsap.set(heading, { y: 0, opacity: 1 });
      if (copy) gsap.set(copy, { y: 0, opacity: 1 });
      if (actionItems.length) gsap.set(actionItems, { y: 0, opacity: 1 });
      return;
    }

    if (glow) gsap.set(glow, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' });
    if (heading) gsap.set(heading, { y: 32, opacity: 0 });
    if (copy) gsap.set(copy, { y: 32, opacity: 0 });
    if (actionItems.length) gsap.set(actionItems, { y: 28, opacity: 0 });

    // play-once: never reverse (a reverse on a refresh-driven backward toggle
    // would strand the contact section invisible).
    const contactTimeline = gsap.timeline({
      defaults: { ease: 'power1.out' },
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none none' },
    });

    if (glow) contactTimeline.to(glow, { opacity: 1, scale: 1.05, duration: 0.8 }, 0);
    if (heading) contactTimeline.to(heading, { y: 0, opacity: 1, duration: 0.6 }, 0.1);
    if (copy) contactTimeline.to(copy, { y: 0, opacity: 1, duration: 0.6 }, '-=0.35');
    if (actionItems.length) contactTimeline.to(actionItems, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.25');
    if (cta) {
      gsap.set(cta, { transformOrigin: '50% 50%' });
      contactTimeline
        .to(cta, { y: -6, duration: 0.25, ease: 'power1.out' }, '>-0.1')
        .to(cta, { y: 0, duration: 0.35, ease: 'power1.inOut' }, '>-0.05');

      const ctaHoverTimeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
      ctaHoverTimeline
        .to(cta, { scale: 1.05, boxShadow: '0 24px 55px -28px rgba(255, 176, 122, 0.55)', duration: 0.25 }, 0)
        .to(cta, { scale: 1.02, duration: 0.3, ease: 'power1.inOut' }, '>-0.05');

      cta.addEventListener('mouseenter', () => ctaHoverTimeline.play());
      cta.addEventListener('mouseleave', () => ctaHoverTimeline.reverse());
      cta.addEventListener('focusin', () => ctaHoverTimeline.play());
      cta.addEventListener('focusout', () => ctaHoverTimeline.reverse());
    }
  }

  initHero();
  initSectionHeadings();
  initSimpleCards('[data-animate="experience-card"]');
  initSlideCards('[data-animate="capability-card"]');
  initSlideCards('[data-animate="education-panel"]', document.querySelector('#education') ?? undefined);
  initProjects();
  initContact();

  if (allowMotion) {
    ScrollTrigger.refresh();
    // Re-measure once layout-affecting content settles (fonts, late images) so
    // the initial trigger positions aren't taken mid-reflow.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    // The showcase island dispatches this on a user sort/filter (not on mount);
    // re-measure card positions. Reveal-only triggers make this safe.
    window.addEventListener('projects:changed', () => ScrollTrigger.refresh());
  }
});
