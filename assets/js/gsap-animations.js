(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  ready(function () {
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
      const cards = gsapGlobal.utils.toArray('[data-animate="experience-card"]');
      if (!cards.length) {
        return;
      }

      if (!allowMotion) {
        gsapGlobal.set(cards, { y: 0, opacity: 1 });
        return;
      }

      cards.forEach((card) => {
        gsapGlobal.set(card, { y: 48, opacity: 0 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 80%',
          end: 'bottom 20%',
          onEnter: () =>
            gsapGlobal.to(card, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power1.out',
            }),
          onLeaveBack: () =>
            gsapGlobal.to(card, {
              y: 48,
              opacity: 0,
              duration: 0.45,
              ease: 'power1.in',
            }),
        });
      });
    }

    function initCapabilities() {
      const cards = gsapGlobal.utils.toArray('[data-animate="capability-card"]');
      if (!cards.length) {
        return;
      }

      if (!allowMotion) {
        gsapGlobal.set(cards, { x: 0, opacity: 1 });
        return;
      }

      cards.forEach((card, index) => {
        const fromX = index % 2 === 0 ? -32 : 32;
        gsapGlobal.set(card, { x: fromX, opacity: 0 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          end: 'bottom 30%',
          onEnter: () =>
            gsapGlobal.to(card, {
              x: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power1.out',
            }),
          onLeaveBack: () =>
            gsapGlobal.to(card, {
              x: fromX,
              opacity: 0,
              duration: 0.45,
              ease: 'power1.in',
            }),
        });
      });
    }

    function initEducation() {
      const section = document.querySelector('#education');
      if (!section) {
        return;
      }
      const panels = gsapGlobal.utils.toArray('[data-animate="education-panel"]', section);
      const items = gsapGlobal.utils.toArray('[data-animate="education-item"]', section);

      if (!panels.length && !items.length) {
        return;
      }

      if (!allowMotion) {
        if (panels.length) {
          gsapGlobal.set(panels, { scale: 1, opacity: 1 });
        }
        if (items.length) {
          gsapGlobal.set(items, { y: 0, opacity: 1 });
        }
        return;
      }

      if (panels.length) {
        gsapGlobal.set(panels, { scale: 0.97, opacity: 0, transformOrigin: '50% 50%' });
      }
      if (items.length) {
        gsapGlobal.set(items, { y: 24, opacity: 0 });
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'bottom 25%',
        onEnter: () => {
          if (panels.length) {
            gsapGlobal.to(panels, {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: 'power1.out',
              stagger: 0.12,
            });
          }
          if (items.length) {
            gsapGlobal.to(items, {
              y: 0,
              opacity: 1,
              duration: 0.45,
              ease: 'power1.out',
              stagger: 0.05,
            });
          }
        },
        onLeaveBack: () => {
          if (panels.length) {
            gsapGlobal.to(panels, {
              scale: 0.97,
              opacity: 0,
              duration: 0.45,
              ease: 'power1.in',
              stagger: 0.08,
            });
          }
          if (items.length) {
            gsapGlobal.to(items, {
              y: 24,
              opacity: 0,
              duration: 0.35,
              ease: 'power1.in',
              stagger: 0.04,
            });
          }
        },
      });
    }

    function initProjects() {
      const cards = gsapGlobal.utils.toArray('[data-animate="project-card"]');
      if (!cards.length) {
        return;
      }

      if (!allowMotion) {
        gsapGlobal.set(cards, { y: 0, opacity: 1 });
        const arrows = cards
          .map((card) => card.querySelector('[data-animate="project-arrow"]'))
          .filter(Boolean);
        if (arrows.length) {
          gsapGlobal.set(arrows, { x: 0, opacity: 1 });
        }
        return;
      }

      cards.forEach((card) => {
        const arrow = card.querySelector('[data-animate="project-arrow"]');
        gsapGlobal.set(card, { y: 48, opacity: 0 });
        if (arrow) {
          gsapGlobal.set(arrow, { x: 0, opacity: 0.6 });
        }

        const animateIn = () => {
          gsapGlobal.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power1.out',
          });
          if (arrow) {
            gsapGlobal.to(arrow, {
              x: 8,
              opacity: 1,
              duration: 0.5,
              ease: 'power1.out',
            });
          }
        };

        const resetState = () => {
          gsapGlobal.to(card, {
            y: 48,
            opacity: 0,
            duration: 0.4,
            ease: 'power1.in',
          });
          if (arrow) {
            gsapGlobal.to(arrow, {
              x: 0,
              opacity: 0.6,
              duration: 0.3,
              ease: 'power1.in',
            });
          }
        };

        ScrollTrigger.create({
          trigger: card,
          start: 'top 80%',
          end: 'bottom 90%',
          onEnter: animateIn,
          onEnterBack: animateIn,
          onLeave: resetState,
          onLeaveBack: resetState,
        });
      });
    }

    function initContact() {
      const section = document.querySelector('#contact');
      if (!section) {
        return;
      }

      const heading = section.querySelector('[data-animate="contact-heading"]');
      const copy = section.querySelector('[data-animate="contact-copy"]');
      const actions = section.querySelector('[data-animate="contact-actions"]');
      const cta = section.querySelector('[data-animate="contact-cta"]');
      const glow = section.querySelector('[data-animate="contact-glow"]');

      const actionItems = actions ? gsapGlobal.utils.toArray(':scope > *', actions) : [];

      if (!allowMotion) {
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
        contactTimeline
          .to(cta, { y: -6, duration: 0.25, ease: 'power1.out' }, '>-0.1')
          .to(cta, { y: 0, duration: 0.35, ease: 'power1.inOut' }, '>-0.05');
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
