(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  function collectFollowingNodes(start) {
    const nodes = [];
    let node = start;
    while (node) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.matches &&
        node.matches('h2.nav-scroll-anchor')
      ) {
        break;
      }
      nodes.push(node);
      node = node.nextSibling;
    }
    return nodes;
  }

  function buildSection(container, heading) {
    const originalId = heading.id;
    if (!originalId) {
      return;
    }

    const section = document.createElement('section');
    section.id = originalId;
    section.className = 'project-section nav-scroll-anchor';
    section.setAttribute('data-project-section', '');

    const inner = document.createElement('div');
    inner.className = 'project-section-inner';

    const headingWrapper = document.createElement('div');
    headingWrapper.className = 'project-section-heading';

    const newHeadingId = `${originalId}-heading`;
    heading.id = newHeadingId;
    heading.classList.add('project-section-title');
    heading.setAttribute('tabindex', '-1');
    section.setAttribute('aria-labelledby', newHeadingId);

    const followingNodes = collectFollowingNodes(heading.nextSibling);

    container.insertBefore(section, heading);

    headingWrapper.appendChild(heading);

    const body = document.createElement('div');
    body.className = 'project-section-body';

    followingNodes.forEach((node) => {
      body.appendChild(node);
    });

    inner.appendChild(headingWrapper);
    if (body.childNodes.length) {
      inner.appendChild(body);
    }

    section.appendChild(inner);
  }

  function removeEmptyTextNodes(container) {
    const nodes = Array.from(container.childNodes);
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
        container.removeChild(node);
      }
    });
  }

  ready(function () {
    const container = document.querySelector('[data-project-sections]');
    if (!container) {
      return;
    }

    if (container.dataset.projectSectionsReady === 'true') {
      return;
    }

    const headings = Array.from(
      container.querySelectorAll(':scope > h2.nav-scroll-anchor')
    );

    if (!headings.length) {
      return;
    }

    headings.forEach((heading) => {
      buildSection(container, heading);
    });

    container.dataset.projectSectionsReady = 'true';
    container.classList.add('project-sections-ready');
    removeEmptyTextNodes(container);
  });
})();
