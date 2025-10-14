(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  ready(function () {
    const navs = document.querySelectorAll('[data-sticky-nav]');
    if (!navs.length) {
      return;
    }

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function scrollLinkIntoView(container, link) {
      if (!container || !link) return;
      const paddingLeft = parseFloat(window.getComputedStyle(container).paddingLeft || '0');
      const targetLeft = Math.max(link.offsetLeft - paddingLeft, 0);
      container.scrollTo({
        left: targetLeft,
        behavior: reduceMotionQuery.matches ? 'auto' : 'smooth',
      });
    }

    navs.forEach((nav) => {
      const scrollContainer = nav.querySelector('[data-nav-scroll]');
      if (!scrollContainer) {
        return;
      }

      const links = Array.from(nav.querySelectorAll('[data-nav-link]'));
      if (!links.length) {
        return;
      }

      function updateScrollIndicators() {
        if (!scrollContainer) {
          return;
        }
        const maxScrollLeft = Math.max(scrollContainer.scrollWidth - scrollContainer.clientWidth, 0);
        const epsilon = 1;

        if (maxScrollLeft <= epsilon) {
          scrollContainer.setAttribute('data-scroll-start', '');
          scrollContainer.setAttribute('data-scroll-end', '');
          return;
        }

        if (scrollContainer.scrollLeft <= epsilon) {
          scrollContainer.setAttribute('data-scroll-start', '');
        } else {
          scrollContainer.removeAttribute('data-scroll-start');
        }

        if (scrollContainer.scrollLeft >= maxScrollLeft - epsilon) {
          scrollContainer.setAttribute('data-scroll-end', '');
        } else {
          scrollContainer.removeAttribute('data-scroll-end');
        }
      }

      const handleScrollIndicators = () => {
        window.requestAnimationFrame(updateScrollIndicators);
      };

      updateScrollIndicators();

      scrollContainer.addEventListener('scroll', handleScrollIndicators, { passive: true });

      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(() => {
          updateScrollIndicators();
        });
        resizeObserver.observe(scrollContainer);
      } else {
        window.addEventListener('resize', handleScrollIndicators);
      }

      const linkItems = links
        .map((link, index) => {
          const href = link.getAttribute('href') || '';
          if (!href.startsWith('#')) {
            return null;
          }
          const id = href.slice(1);
          const section = document.getElementById(id);
          if (!section) {
            return null;
          }
          section.dataset.navIndex = section.dataset.navIndex || String(index);
          if (!section.dataset.baseScrollMargin) {
            const computedMargin = parseFloat(
              window.getComputedStyle(section).scrollMarginTop || '0'
            );
            if (!Number.isNaN(computedMargin)) {
              section.dataset.baseScrollMargin = String(computedMargin);
            }
          }
          return { link, section };
        })
        .filter(Boolean);

      if (!linkItems.length) {
        return;
      }

      const itemsById = new Map(linkItems.map((item) => [item.section.id, item]));

      const dockTargetId = nav.dataset.dockTarget;
      const dockTarget = dockTargetId ? document.getElementById(dockTargetId) : null;
      const dockPlaceholder =
        nav.nextElementSibling &&
        nav.nextElementSibling.hasAttribute('data-sticky-nav-placeholder')
          ? nav.nextElementSibling
          : null;
      let isDocked = false;

      function applyDockState(shouldDock) {
        if (isDocked === shouldDock) {
          return;
        }
        isDocked = shouldDock;
        if (shouldDock) {
          nav.dataset.dockState = 'bottom';
        } else {
          delete nav.dataset.dockState;
        }
        if (dockPlaceholder) {
          dockPlaceholder.style.height = shouldDock
            ? 'var(--sticky-nav-height, 0px)'
            : '0px';
        }
      }

      function updateDockState() {
        if (!dockTarget) {
          return;
        }

        const heroRect = dockTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const shouldDock = heroRect.top < viewportHeight && heroRect.bottom > viewportHeight;
        applyDockState(shouldDock);
      }

      let currentId = null;

      function setActive(id, { fromHash = false } = {}) {
        if (id === currentId) {
          return;
        }
        currentId = id || null;
        let activeLink = null;
        linkItems.forEach(({ link, section }) => {
          if (id && section.id === id && !link.hidden) {
            link.setAttribute('aria-current', 'page');
            activeLink = link;
            if (!fromHash) {
              scrollLinkIntoView(scrollContainer, link);
            }
          } else {
            link.removeAttribute('aria-current');
          }
        });
        nav.dispatchEvent(
          new CustomEvent('nav:active-change', {
            detail: {
              id: id || null,
              link: activeLink || null,
            },
          })
        );
      }

      function updateSectionOffsets() {
        const navHeight = nav.offsetHeight;
        const root = document.documentElement;
        root.style.setProperty('--sticky-nav-height', `${navHeight}px`);

        linkItems.forEach(({ section }) => {
          const baseMargin = parseFloat(section.dataset.baseScrollMargin || '0') || 0;
          const scrollOffset = Math.max(navHeight, baseMargin);

          section.dataset.navScrollOffset = String(scrollOffset);
          section.style.scrollMarginTop = `${scrollOffset}px`;
          section.style.removeProperty('min-height');
        });
      }

      function getActiveItemId() {
        let lastReachedId = null;
        const activationThreshold = 1;
        const navHeight = nav.offsetHeight;
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight || 0;

        linkItems.forEach(({ section }, index) => {
          const rect = section.getBoundingClientRect();
          const scrollOffset = parseFloat(section.dataset.navScrollOffset || '0') || 0;
          const hasReachedAnchor = rect.top - scrollOffset <= activationThreshold;

          if (index === 0) {
            const intersectsViewport =
              rect.bottom > navHeight + activationThreshold &&
              rect.top < viewportHeight - activationThreshold;

            if (intersectsViewport || hasReachedAnchor) {
              lastReachedId = section.id;
            }

            return;
          }

          if (hasReachedAnchor) {
            lastReachedId = section.id;
          }
        });

        return lastReachedId;
      }

      function handleScroll({ fromHash = false } = {}) {
        const activeId = getActiveItemId();
        setActive(activeId, { fromHash });
        updateDockState();
      }

      function scrollToSection(section, { behavior } = {}) {
        if (!section) {
          return;
        }
        const scrollOffset = parseFloat(section.dataset.navScrollOffset || '0') || 0;
        const targetTop =
          window.pageYOffset + section.getBoundingClientRect().top - scrollOffset;
        window.scrollTo({
          top: targetTop,
          behavior: behavior || (reduceMotionQuery.matches ? 'auto' : 'smooth'),
        });
      }

      function refreshNav({ immediate = false } = {}) {
        updateSectionOffsets();
        const trigger = () => handleScroll({ fromHash: true });
        if (immediate) {
          trigger();
        } else {
          window.requestAnimationFrame(trigger);
        }
        updateScrollIndicators();
      }

      updateSectionOffsets();
      handleScroll({ fromHash: true });
      updateScrollIndicators();

      window.addEventListener(
        'scroll',
        () => {
          window.requestAnimationFrame(handleScroll);
        },
        { passive: true }
      );

      window.addEventListener('resize', () => {
        refreshNav();
      });

      nav.addEventListener('nav:refresh', () => {
        refreshNav();
      });

      if (document.documentElement.dataset.projectSectionsReady === 'true') {
        refreshNav({ immediate: true });
      }

      if (window.location.hash) {
        const hashId = window.location.hash.slice(1);
        const item = itemsById.get(hashId);
        if (item) {
          scrollToSection(item.section, { behavior: 'auto' });
          setActive(hashId, { fromHash: true });
          window.requestAnimationFrame(() => handleScroll({ fromHash: true }));
        }
      }

      linkItems.forEach(({ link, section }) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          scrollToSection(section, {});
          window.history.replaceState(null, '', `#${section.id}`);
          setActive(section.id);
          window.requestAnimationFrame(handleScroll);
        });
      });
    });
  });

  document.addEventListener('projectSections:ready', () => {
    document.querySelectorAll('[data-sticky-nav]').forEach((nav) => {
      nav.dispatchEvent(new CustomEvent('nav:refresh'));
    });
  });
})();
