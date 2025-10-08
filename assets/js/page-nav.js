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

      const navRect = nav.getBoundingClientRect();
      const navInitialBottom = navRect.bottom + window.scrollY;

      const filteredLinkItems = linkItems.filter(({ section }) => {
        const sectionRect = section.getBoundingClientRect();
        const sectionTop = sectionRect.top + window.scrollY;
        return sectionTop >= navInitialBottom - 1;
      });

      if (!filteredLinkItems.length) {
        return;
      }

      const filteredLinkSet = new Set(filteredLinkItems.map(({ link }) => link));
      linkItems.forEach(({ link }) => {
        if (!filteredLinkSet.has(link)) {
          link.remove();
        }
      });

      const itemsById = new Map(filteredLinkItems.map((item) => [item.section.id, item]));

      let currentId = null;

      function setActive(id, { fromHash = false } = {}) {
        if (id === currentId) {
          return;
        }
        currentId = id || null;
        filteredLinkItems.forEach(({ link, section }) => {
          if (id && section.id === id) {
            link.setAttribute('aria-current', 'page');
            if (!fromHash) {
              scrollLinkIntoView(scrollContainer, link);
            }
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }

      function updateSectionOffsets() {
        const navHeight = nav.offsetHeight;
        filteredLinkItems.forEach(({ section }) => {
          section.style.scrollMarginTop = `${navHeight}px`;
        });
      }

      function handleScroll({ fromHash = false } = {}) {
        const navHeight = nav.offsetHeight;
        let activeId = null;
        for (let index = 0; index < filteredLinkItems.length; index += 1) {
          const { section } = filteredLinkItems[index];
          const rect = section.getBoundingClientRect();
          const topRelativeToNav = rect.top - navHeight;

          if (rect.top <= navHeight && rect.bottom > navHeight) {
            activeId = section.id;
            break;
          }

          if (topRelativeToNav > 0) {
            activeId = section.id;
            break;
          }
        }

        if (!activeId && filteredLinkItems.length) {
          activeId = filteredLinkItems[filteredLinkItems.length - 1].section.id;
        }

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

      filteredLinkItems.forEach(({ link, section }) => {
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
