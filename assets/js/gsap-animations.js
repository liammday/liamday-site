(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  function initCardSpotlight() {
    const cards = Array.from(document.querySelectorAll('.surface-panel'));
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
        gsapGlobal.set(card, {
          x: fromX,
          opacity: 0,
          transformOrigin: '50% 50%',
        });

        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          end: 'bottom 30%',
          onEnter: () => {
            gsapGlobal.to(card, {
              x: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power1.out',
            });
          },
          onLeaveBack: () => {
            gsapGlobal.to(card, {
              x: fromX,
              opacity: 0,
              duration: 0.45,
              ease: 'power1.in',
            });
          },
        });
      });
    }

    function initEducation() {
      const section = document.querySelector('#education');
      if (!section) {
        return;
      }
      const panels = gsapGlobal.utils.toArray('[data-animate="education-panel"]', section);

      if (!panels.length) {
        return;
      }

      if (!allowMotion) {
        gsapGlobal.set(panels, { x: 0, opacity: 1 });
        return;
      }

      panels.forEach((panel, index) => {
        const fromX = index % 2 === 0 ? -32 : 32;
        gsapGlobal.set(panel, {
          x: fromX,
          opacity: 0,
          transformOrigin: '50% 50%',
        });

        ScrollTrigger.create({
          trigger: panel,
          start: 'top 85%',
          end: 'bottom 30%',
          onEnter: () => {
            gsapGlobal.to(panel, {
              x: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power1.out',
            });
          },
          onLeaveBack: () => {
            gsapGlobal.to(panel, {
              x: fromX,
              opacity: 0,
              duration: 0.45,
              ease: 'power1.in',
            });
          },
        });
      });
    }

    function initProjects() {
      const cards = gsapGlobal.utils.toArray('[data-animate="project-card"]');
      if (!cards.length) {
        return;
      }

      if (!allowMotion) {
        gsapGlobal.set(cards, { x: 0, opacity: 1 });
        const arrows = cards
          .map((card) => card.querySelector('[data-animate="project-arrow"]'))
          .filter(Boolean);
        if (arrows.length) {
          gsapGlobal.set(arrows, { x: 0, opacity: 1 });
        }
        return;
      }

      cards.forEach((card, index) => {
        const arrow = card.querySelector('[data-animate="project-arrow"]');
        const isAppsSection = card.closest('#apps');
        const shouldUseLiftHover = !isAppsSection;
        
        // Alternating x pattern like capabilities
        const fromX = index % 2 === 0 ? -32 : 32;

        gsapGlobal.set(card, { 
          x: fromX, 
          opacity: 0, 
          transformOrigin: '50% 50%' 
        });

        if (arrow) {
          gsapGlobal.set(arrow, { x: 0, opacity: 0.6 });
        }

        let hoverTimeline = null;
        if (shouldUseLiftHover) {
          hoverTimeline = gsapGlobal
            .timeline({
              paused: true,
              defaults: { ease: 'power2.out' },
            })
            .to(
              card,
              {
                y: -12,
                scale: 1.02,
                boxShadow: '0 28px 55px -30px rgba(255, 176, 122, 0.6)',
                duration: 0.35,
              },
              0
            );

          if (arrow) {
            hoverTimeline
              .to(
                arrow,
                {
                  x: 16,
                  duration: 0.18,
                },
                0
              )
              .to(
                arrow,
                {
                  x: 8,
                  duration: 0.24,
                  ease: 'power1.out',
                },
                '>-0.05'
              );
          }
        }

        const animateIn = () => {
          if (hoverTimeline) {
            hoverTimeline.progress(0).pause();
          }
          gsapGlobal.to(card, {
            x: 0,
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
          if (hoverTimeline) {
            hoverTimeline.progress(0).pause();
          }
          gsapGlobal.to(card, {
            x: fromX,
            opacity: 0,
            duration: 0.45,
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
          start: 'top 85%',
          end: 'bottom 30%',
          onEnter: animateIn,
          onEnterBack: animateIn,
          onLeave: resetState,
          onLeaveBack: resetState,
        });

        if (hoverTimeline) {
          const playHover = () => hoverTimeline.play();
          const resetHover = () => hoverTimeline.reverse();

          card.addEventListener('mouseenter', playHover);
          card.addEventListener('mouseleave', resetHover);
          card.addEventListener('focusin', playHover);
          card.addEventListener('focusout', resetHover);
        }
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
