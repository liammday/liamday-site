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

      const sections = links
        .map((link) => {
          const href = link.getAttribute('href') || '';
          if (!href.startsWith('#')) {
            return null;
          }
          const id = href.slice(1);
          const section = document.getElementById(id);
          if (section) {
            section.dataset.navIndex = section.dataset.navIndex || String(links.indexOf(link));
          }
          return section;
        })
        .filter(Boolean);

      if (!sections.length) {
        return;
      }

      let currentId = null;

      function setActive(id, { fromHash = false } = {}) {
        if (!id || id === currentId) {
          return;
        }
        currentId = id;
        links.forEach((link) => {
          const targetId = (link.getAttribute('href') || '').replace('#', '');
          if (targetId === id) {
            link.setAttribute('aria-current', 'page');
            if (!fromHash) {
              scrollLinkIntoView(scrollContainer, link);
            }
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }

      function findCurrentSection() {
        const navHeight = nav.offsetHeight + 24;
        let activeSection = sections[0];
        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          if (rect.top - navHeight <= 0) {
            activeSection = section;
          } else {
            break;
          }
        }
        return activeSection;
      }

      function handleScroll() {
        const section = findCurrentSection();
        if (section) {
          setActive(section.id);
        }
      }

      handleScroll();
      window.addEventListener(
        'scroll',
        () => {
          window.requestAnimationFrame(handleScroll);
        },
        { passive: true }
      );
      window.addEventListener(
        'resize',
        () => {
          window.requestAnimationFrame(handleScroll);
        }
      );

      if (window.location.hash) {
        const hashId = window.location.hash.slice(1);
        if (sections.some((section) => section.id === hashId)) {
          setActive(hashId, { fromHash: true });
          const targetSection = document.getElementById(hashId);
          if (targetSection) {
            targetSection.scrollIntoView();
          }
        }
      }

      links.forEach((link) => {
        link.addEventListener('click', () => {
          const href = link.getAttribute('href');
          if (!href || !href.startsWith('#')) {
            return;
          }
          const id = href.slice(1);
          setActive(id);
        });
      });
    });
  });
})();
