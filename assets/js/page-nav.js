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
    const SECTION_BREATHING_ROOM = 32;

    /* Headings (H1-H6) are inline text targets — give them breathing room below the nav.
       Section/article/aside targets carry their own visual top edge (border, divider, hero)
       and should snap flush against the nav so dividers align with the nav bottom. */
    function breathingRoomFor(section) {
      return /^H[1-6]$/.test(section.tagName) ? SECTION_BREATHING_ROOM : 0;
    }

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
        linkItems.forEach(({ section }) => {
          section.style.scrollMarginTop = `${navHeight + breathingRoomFor(section)}px`;
        });
      }

      function handleScroll({ fromHash = false } = {}) {
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom && linkItems.length) {
          setActive(linkItems[linkItems.length - 1].section.id, { fromHash });
          return;
        }
        const navBottom = nav.getBoundingClientRect().bottom;
        let activeId = null;
        for (const { section } of linkItems) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= navBottom + breathingRoomFor(section) + 1) {
            activeId = section.id;
          } else {
            break;
          }
        }
        if (!activeId && linkItems.length) {
          activeId = linkItems[0].section.id;
        }
        setActive(activeId, { fromHash });
      }

      function scrollToSection(section, { behavior } = {}) {
        if (!section) {
          return;
        }
        const navHeight = nav.offsetHeight;
        const targetTop = window.pageYOffset + section.getBoundingClientRect().top - navHeight - breathingRoomFor(section);
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
