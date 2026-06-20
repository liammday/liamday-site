// Scroll-driven reveal animations + surface-panel spotlight glow.
// Ported from assets/js/gsap-animations.js; GSAP now comes from the npm package
// instead of a CDN global. Honours prefers-reduced-motion and the data-motion
// opt-outs. Listens for `projects:changed` (dispatched by the React showcase) so
// ScrollTrigger re-measures after a sort/filter reorders the grid.
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
      ScrollTrigger.create({
        trigger: block,
        start: 'top 80%',
        end: 'bottom 40%',
        onEnter: () => gsap.to(items, { y: 0, opacity: 1, duration: 0.6, ease: 'power1.out', stagger: 0.1 }),
        onLeaveBack: () => gsap.to(items, { y: 32, opacity: 0, duration: 0.4, ease: 'power1.in', stagger: 0.08 }),
      });
    });
  }

  function initSimpleCards(selector: string) {
    const cards = gsap.utils.toArray<HTMLElement>(selector);
    if (!cards.length) return;

    if (!allowMotion) {
      gsap.set(cards, { y: 0, opacity: 1 });
      return;
    }

    cards.forEach((card) => {
      gsap.set(card, { y: 48, opacity: 0 });
      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => gsap.to(card, { y: 0, opacity: 1, duration: 0.6, ease: 'power1.out' }),
        onLeaveBack: () => gsap.to(card, { y: 48, opacity: 0, duration: 0.45, ease: 'power1.in' }),
      });
    });
  }

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
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        end: 'bottom 30%',
        onEnter: () => gsap.to(card, { x: 0, opacity: 1, duration: 0.6, ease: 'power1.out' }),
        onLeaveBack: () => gsap.to(card, { x: fromX, opacity: 0, duration: 0.45, ease: 'power1.in' }),
      });
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
      gsap.set(card, { x: fromX, opacity: 0, transformOrigin: '50% 50%' });

      const hoverTimeline = gsap
        .timeline({ paused: true, defaults: { ease: 'power2.out' } })
        .to(card, { y: -12, scale: 1.02, boxShadow: '0 28px 55px -30px rgba(255, 176, 122, 0.6)', duration: 0.35 }, 0);

      const animateIn = () => {
        hoverTimeline.progress(0).pause();
        gsap.to(card, { x: 0, opacity: 1, duration: 0.6, ease: 'power1.out' });
      };
      const resetState = () => {
        hoverTimeline.progress(0).pause();
        gsap.to(card, { x: fromX, opacity: 0, duration: 0.45, ease: 'power1.in' });
      };

      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        end: 'bottom 30%',
        onEnter: animateIn,
        onEnterBack: animateIn,
        onLeave: resetState,
        onLeaveBack: resetState,
      });

      card.addEventListener('mouseenter', () => hoverTimeline.play());
      card.addEventListener('mouseleave', () => hoverTimeline.reverse());
      card.addEventListener('focusin', () => hoverTimeline.play());
      card.addEventListener('focusout', () => hoverTimeline.reverse());
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

    const contactTimeline = gsap.timeline({
      defaults: { ease: 'power1.out' },
      scrollTrigger: { trigger: section, start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' },
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

      const resetHoverInstant = () => ctaHoverTimeline.progress(0).pause();
      cta.addEventListener('mouseenter', () => ctaHoverTimeline.play());
      cta.addEventListener('mouseleave', () => ctaHoverTimeline.reverse());
      cta.addEventListener('focusin', () => ctaHoverTimeline.play());
      cta.addEventListener('focusout', () => ctaHoverTimeline.reverse());
      contactTimeline.eventCallback('onStart', resetHoverInstant);
      contactTimeline.eventCallback('onReverseComplete', resetHoverInstant);
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
    // Re-measure after the React showcase sorts/filters (mirrors the original
    // inline refreshReveal()).
    window.addEventListener('projects:changed', () => ScrollTrigger.refresh());
  }
});
