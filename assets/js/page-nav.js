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
      const links = Array.from(nav.querySelectorAll('[data-nav-link]'));
      if (!links.length) {
        return;
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
          return { link, section };
        })
        .filter(Boolean);

      if (!linkItems.length) {
        return;
      }

      const itemsById = new Map(linkItems.map((item) => [item.section.id, item]));

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
        const minHeight = Math.max(window.innerHeight - navHeight, 0);
        linkItems.forEach(({ section }) => {
          section.style.scrollMarginTop = `${navHeight}px`;
          section.style.minHeight = `${minHeight}px`;
        });
      }

      function getActiveItemId() {
        const navRect = nav.getBoundingClientRect();
        const threshold = navRect.bottom + 1;

        let lastReachedId = null;

        linkItems.forEach(({ section }) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= threshold) {
            lastReachedId = section.id;
          }
        });

        if (lastReachedId) {
          return lastReachedId;
        }

        return linkItems.length ? linkItems[0].section.id : null;
      }

      function handleScroll({ fromHash = false } = {}) {
        const activeId = getActiveItemId();
        setActive(activeId, { fromHash });
      }

      function scrollToSection(section, { behavior } = {}) {
        if (!section) {
          return;
        }
        const navHeight = nav.offsetHeight;
        const targetTop = window.pageYOffset + section.getBoundingClientRect().top - navHeight;
        window.scrollTo({
          top: targetTop,
          behavior: behavior || (reduceMotionQuery.matches ? 'auto' : 'smooth'),
        });
      }

      updateSectionOffsets();
      handleScroll({ fromHash: true });

      window.addEventListener(
        'scroll',
        () => {
          window.requestAnimationFrame(handleScroll);
        },
        { passive: true }
      );

      window.addEventListener('resize', () => {
        updateSectionOffsets();
        window.requestAnimationFrame(() => handleScroll({ fromHash: true }));
      });

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
})();
