// Sticky in-page navigation: scroll-spy active state + smooth scroll on click.
// Ported from assets/js/page-nav.js. Operates on any [data-sticky-nav] with
// [data-nav-link] anchors, so the home page and case-study pages share it.
function ready(fn: () => void) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
}

ready(function () {
  const navs = document.querySelectorAll<HTMLElement>('[data-sticky-nav]');
  if (!navs.length) return;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SECTION_BREATHING_ROOM = 32;

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
      /* ignore */
    }
    try {
      if (window.localStorage && window.localStorage.getItem('motion') === 'off') return true;
    } catch {
      /* ignore */
    }
    return false;
  }

  function prefersReducedMotion(): boolean {
    return reduceMotionQuery.matches || motionManuallyDisabled();
  }

  function breathingRoomFor(section: HTMLElement): number {
    return /^H[1-6]$/.test(section.tagName) ? SECTION_BREATHING_ROOM : 0;
  }

  function scrollLinkIntoView(container: HTMLElement | null, link: HTMLElement | null) {
    if (!container || !link) return;
    const paddingLeft = parseFloat(window.getComputedStyle(container).paddingLeft || '0');
    const targetLeft = Math.max(link.offsetLeft - paddingLeft, 0);
    container.scrollTo({ left: targetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  navs.forEach((nav) => {
    const scrollContainer = nav.querySelector<HTMLElement>('[data-nav-scroll]');
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
    if (!links.length) return;

    const linkItems = links
      .map((link, index) => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) return null;
        const id = href.slice(1);
        const section = document.getElementById(id);
        if (!section) return null;
        section.dataset.navIndex = section.dataset.navIndex || String(index);
        return { link, section };
      })
      .filter(Boolean) as { link: HTMLAnchorElement; section: HTMLElement }[];

    if (!linkItems.length) return;

    const itemsById = new Map(linkItems.map((item) => [item.section.id, item]));
    let currentId: string | null = null;

    function setActive(id: string | null, { fromHash = false }: { fromHash?: boolean } = {}) {
      if (id === currentId) return;
      currentId = id || null;
      let activeLink: HTMLAnchorElement | null = null;
      linkItems.forEach(({ link, section }) => {
        if (id && section.id === id && !link.hidden) {
          link.setAttribute('aria-current', 'page');
          activeLink = link;
          if (!fromHash) scrollLinkIntoView(scrollContainer, link);
        } else {
          link.removeAttribute('aria-current');
        }
      });
      nav.dispatchEvent(new CustomEvent('nav:active-change', { detail: { id: id || null, link: activeLink || null } }));
    }

    function updateSectionOffsets() {
      const navHeight = nav.offsetHeight;
      linkItems.forEach(({ section }) => {
        section.style.scrollMarginTop = `${navHeight + breathingRoomFor(section)}px`;
      });
    }

    function handleScroll({ fromHash = false }: { fromHash?: boolean } = {}) {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && linkItems.length) {
        setActive(linkItems[linkItems.length - 1].section.id, { fromHash });
        return;
      }
      const navBottom = nav.getBoundingClientRect().bottom;
      let activeId: string | null = null;
      for (const { section } of linkItems) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= navBottom + breathingRoomFor(section) + 1) {
          activeId = section.id;
        } else {
          break;
        }
      }
      if (!activeId && linkItems.length) activeId = linkItems[0].section.id;
      setActive(activeId, { fromHash });
    }

    function scrollToSection(section: HTMLElement, { behavior }: { behavior?: ScrollBehavior } = {}) {
      if (!section) return;
      const navHeight = nav.offsetHeight;
      const targetTop = window.pageYOffset + section.getBoundingClientRect().top - navHeight - breathingRoomFor(section);
      window.scrollTo({ top: targetTop, behavior: behavior || (prefersReducedMotion() ? 'auto' : 'smooth') });
    }

    updateSectionOffsets();
    handleScroll({ fromHash: true });

    window.addEventListener('scroll', () => window.requestAnimationFrame(() => handleScroll()), { passive: true });
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
        window.requestAnimationFrame(() => handleScroll());
      });
    });
  });
});
