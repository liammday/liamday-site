(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  function initCardSpotlight() {
    const cards = Array.from(document.querySelectorAll('.surface-panel')).filter(
      (card) => card.dataset.spotlight !== 'static'
    );
    if (!cards.length) {
      return;
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    cards.forEach((card) => {
      let animationFrame = null;

      const setOpacity = (value) => {
        card.style.setProperty('--spotlight-opacity', value);
      };

      const setPosition = (event) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          return;
        }
        const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
        const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
        card.style.setProperty('--spotlight-x', `${x}%`);
        card.style.setProperty('--spotlight-y', `${y}%`);
      };

      const handlePointerMove = (event) => {
        if (event.pointerType === 'touch') {
          return;
        }
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
        animationFrame = window.requestAnimationFrame(() => {
          setPosition(event);
        });
      };

      const handlePointerEnter = (event) => {
        if (event.pointerType === 'touch') {
          return;
        }
        setPosition(event);
        setOpacity('1');
      };

      const handlePointerLeave = (event) => {
        if (event.pointerType === 'touch') {
          return;
        }
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

      const handleBlur = () => {
        setOpacity('0');
      };

      card.addEventListener('pointerenter', handlePointerEnter);
      card.addEventListener('pointermove', handlePointerMove);
      card.addEventListener('pointerleave', handlePointerLeave);
      card.addEventListener('focusin', handleFocus);
      card.addEventListener('focusout', handleBlur);
    });
  }

  ready(function () {
    initCardSpotlight();

    const gsapGlobal = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsapGlobal || !ScrollTrigger) {
      return;
    }

    gsapGlobal.registerPlugin(ScrollTrigger);

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const manualMotionDisabled = Boolean(
      (document.documentElement && document.documentElement.dataset.motion === 'off') ||
        (document.body && document.body.dataset.motion === 'off')
    );
    const shouldReduceMotion = reduceMotionQuery.matches || manualMotionDisabled;
    const allowMotion = !shouldReduceMotion;

    function animateCardStack(elements, config = {}) {
      const cards = gsapGlobal.utils.toArray(elements);
      if (!cards.length) {
        return;
      }

      const {
        start = 'top 80%',
        end = 'bottom 20%',
        fromY = 48,
        durationIn = 0.6,
        durationOut = 0.45,
      } = config;

      if (!allowMotion) {
        gsapGlobal.set(cards, { y: 0, opacity: 1 });
        return;
      }

      cards.forEach((card) => {
        gsapGlobal.set(card, { y: fromY, opacity: 0, transformOrigin: '50% 50%' });

        ScrollTrigger.create({
          trigger: card,
          start,
          end,
          onEnter: () =>
            gsapGlobal.to(card, {
              y: 0,
              opacity: 1,
              duration: durationIn,
              ease: 'power1.out',
            }),
          onLeaveBack: () =>
            gsapGlobal.to(card, {
              y: fromY,
              opacity: 0,
              duration: durationOut,
              ease: 'power1.in',
            }),
        });
      });
    }

    function animateCardGrid(elements, config = {}) {
      const cards = gsapGlobal.utils.toArray(elements);
      if (!cards.length) {
        return;
      }

      const {
        start = 'top 85%',
        end = 'bottom 30%',
        fromX = 32,
        durationIn = 0.6,
        durationOut = 0.45,
      } = config;

      if (!allowMotion) {
        gsapGlobal.set(cards, { x: 0, opacity: 1 });
        return;
      }

      cards.forEach((card, index) => {
        const direction = index % 2 === 0 ? -fromX : fromX;
        gsapGlobal.set(card, { x: direction, opacity: 0, transformOrigin: '50% 50%' });

        ScrollTrigger.create({
          trigger: card,
          start,
          end,
          onEnter: () =>
            gsapGlobal.to(card, {
              x: 0,
              opacity: 1,
              duration: durationIn,
              ease: 'power1.out',
            }),
          onLeaveBack: () =>
            gsapGlobal.to(card, {
              x: direction,
              opacity: 0,
              duration: durationOut,
              ease: 'power1.in',
            }),
        });
      });
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
      const statCards = gsapGlobal.utils.toArray('[data-animate="hero-stat"]', hero);

      if (!heroElements.length && !statCards.length) {
        return;
      }

      if (!allowMotion) {
        if (heroElements.length) {
          gsapGlobal.set(heroElements, { y: 0, opacity: 1 });
        }
        if (statCards.length) {
          gsapGlobal.set(statCards, { y: 0, opacity: 1 });
        }
        return;
      }

      if (heroElements.length) {
        gsapGlobal.set(heroElements, { y: 36, opacity: 0 });
      }
      if (statCards.length) {
        gsapGlobal.set(statCards, { y: 24, opacity: 0 });
      }

      const heroTimeline = gsapGlobal.timeline({ defaults: { ease: 'power1.out' } });

      if (heroElements.length) {
        heroTimeline.to(heroElements, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
        });
      }

      if (statCards.length) {
        heroTimeline.to(
          statCards,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
          },
          heroElements.length ? '-=0.2' : 0
        );
      }
    }

    function initSectionHeadings() {
      const headingBlocks = gsapGlobal.utils.toArray('[data-animate="section-heading"]');
      if (!headingBlocks.length) {
        return;
      }

      headingBlocks.forEach((block) => {
        const items = gsapGlobal.utils.toArray(':scope > *', block);
        if (!items.length) {
          return;
        }

        if (!allowMotion) {
          gsapGlobal.set(items, { y: 0, opacity: 1 });
          return;
        }

        gsapGlobal.set(items, { y: 32, opacity: 0 });
        ScrollTrigger.create({
          trigger: block,
          start: 'top 80%',
          end: 'bottom 40%',
          onEnter: () =>
            gsapGlobal.to(items, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power1.out',
              stagger: 0.1,
            }),
          onLeaveBack: () =>
            gsapGlobal.to(items, {
              y: 32,
              opacity: 0,
              duration: 0.4,
              ease: 'power1.in',
              stagger: 0.08,
            }),
        });
      });
    }

    function initExperience() {
      animateCardStack('[data-animate="experience-card"]');
    }

    function initCapabilities() {
      animateCardGrid('[data-animate="capability-card"]');
    }

    function initEducation() {
      animateCardGrid('[data-animate="education-panel"]', {
        start: 'top 80%',
        end: 'bottom 25%',
        fromX: 28,
      });
    }

    function initProjects() {
      animateCardStack('[data-animate="project-card"]', {
        start: 'top 80%',
        end: 'bottom 30%',
        durationOut: 0.4,
      });
    }

    function initContact() {
      const section = document.querySelector('#contact');
      if (!section) {
        return;
      }

      const wrapper = section.querySelector('[data-animate="contact-wrapper"]');
      const heading = section.querySelector('[data-animate="contact-heading"]');
      const copy = section.querySelector('[data-animate="contact-copy"]');
      const actions = section.querySelector('[data-animate="contact-actions"]');
      const cta = section.querySelector('[data-animate="contact-cta"]');
      const glow = section.querySelector('[data-animate="contact-glow"]');

      const actionItems = actions ? gsapGlobal.utils.toArray(':scope > *', actions) : [];

      if (!allowMotion) {
        if (wrapper) {
          gsapGlobal.set(wrapper, { y: 0, opacity: 1 });
        }
        if (glow) {
          gsapGlobal.set(glow, { opacity: 1, scale: 1 });
        }
        if (heading) {
          gsapGlobal.set(heading, { y: 0, opacity: 1 });
        }
        if (copy) {
          gsapGlobal.set(copy, { y: 0, opacity: 1 });
        }
        if (actionItems.length) {
          gsapGlobal.set(actionItems, { y: 0, opacity: 1 });
        }
        if (cta) {
          gsapGlobal.set(cta, { y: 0 });
        }
        return;
      }

      if (wrapper) {
        gsapGlobal.set(wrapper, { y: 48, opacity: 0 });
      }

      if (glow) {
        gsapGlobal.set(glow, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' });
      }
      if (heading) {
        gsapGlobal.set(heading, { y: 32, opacity: 0 });
      }
      if (copy) {
        gsapGlobal.set(copy, { y: 32, opacity: 0 });
      }
      if (actionItems.length) {
        gsapGlobal.set(actionItems, { y: 28, opacity: 0 });
      }

      const contactTimeline = gsapGlobal.timeline({
        defaults: { ease: 'power1.out' },
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });

      if (wrapper) {
        contactTimeline.to(wrapper, { y: 0, opacity: 1, duration: 0.6 }, 0);
      }

      if (glow) {
        contactTimeline.to(glow, { opacity: 1, scale: 1.05, duration: 0.8 }, 0);
      }
      if (heading) {
        contactTimeline.to(heading, { y: 0, opacity: 1, duration: 0.6 }, 0.1);
      }
      if (copy) {
        contactTimeline.to(copy, { y: 0, opacity: 1, duration: 0.6 }, '-=0.35');
      }
      if (actionItems.length) {
        contactTimeline.to(actionItems, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.25');
      }
      if (cta) {
        gsapGlobal.set(cta, { transformOrigin: '50% 50%' });
        contactTimeline
          .to(cta, { y: -6, duration: 0.25, ease: 'power1.out' }, '>-0.1')
          .to(cta, { y: 0, duration: 0.35, ease: 'power1.inOut' }, '>-0.05');

        const ctaHoverTimeline = gsapGlobal.timeline({
          paused: true,
          defaults: { ease: 'power2.out' },
        });

        ctaHoverTimeline
          .to(
            cta,
            {
              scale: 1.05,
              boxShadow: '0 24px 55px -28px rgba(255, 176, 122, 0.55)',
              duration: 0.25,
            },
            0
          )
          .to(
            cta,
            {
              scale: 1.02,
              duration: 0.3,
              ease: 'power1.inOut',
            },
            '>-0.05'
          );

        const resetHoverInstant = () => ctaHoverTimeline.progress(0).pause();
        const playCtaHover = () => ctaHoverTimeline.play();
        const reverseCtaHover = () => ctaHoverTimeline.reverse();

        cta.addEventListener('mouseenter', playCtaHover);
        cta.addEventListener('mouseleave', reverseCtaHover);
        cta.addEventListener('focusin', playCtaHover);
        cta.addEventListener('focusout', reverseCtaHover);

        contactTimeline.eventCallback('onStart', resetHoverInstant);
        contactTimeline.eventCallback('onReverseComplete', resetHoverInstant);
      }
    }

    initHero();
    initSectionHeadings();
    initExperience();
    initCapabilities();
    initEducation();
    initProjects();
    initContact();

    if (allowMotion) {
      ScrollTrigger.refresh();
    }
  });
})();
