(function () {
  const createLayers = (panel) => {
    const existingLayers = panel.querySelectorAll('.liquid-glass-layer');
    if (existingLayers.length === 3) {
      return Array.from(existingLayers);
    }

    const fragment = document.createDocumentFragment();
    const layers = [
      { className: 'liquid-glass-layer liquid-glass-layer--base' },
      { className: 'liquid-glass-layer liquid-glass-layer--cyan' },
      { className: 'liquid-glass-layer liquid-glass-layer--magenta' },
    ].map((layerConfig) => {
      const element = document.createElement('span');
      element.className = layerConfig.className;
      fragment.appendChild(element);
      return element;
    });

    panel.appendChild(fragment);

    return layers;
  };

  const animateLayers = (layers) => {
    if (!layers.length || !window.gsap) return;

    layers.forEach((layer, index) => {
      window.gsap.set(layer, {
        xPercent: window.gsap.utils.random(-10, 10, true),
        yPercent: window.gsap.utils.random(-10, 10, true),
        rotation: window.gsap.utils.random(-6, 6, true),
      });

      const floatRange = 12 + index * 6;
      const rotateRange = 8 + index * 4;
      const duration = 12 + index * 4;

      window.gsap.to(layer, {
        xPercent: window.gsap.utils.random(-floatRange, floatRange, true),
        yPercent: window.gsap.utils.random(-floatRange, floatRange, true),
        rotation: window.gsap.utils.random(-rotateRange, rotateRange, true),
        duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    });
  };

  const animateBadge = (badge) => {
    if (!badge || !window.gsap) return;

    const shimmer = badge.querySelector('.liquid-glass-badge__shimmer');

    if (shimmer) {
      window.gsap.to(shimmer, {
        rotation: 360,
        duration: 24,
        ease: 'none',
        repeat: -1,
      });
    }

    window.gsap.to(badge, {
      duration: 6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      scale: 1.04,
      rotate: 2,
      transformOrigin: '50% 50%',
    });
  };

  const animateStatus = (pip) => {
    if (!pip || !window.gsap) return;

    window.gsap.to(pip, {
      scale: 1.12,
      opacity: 0.85,
      duration: 2.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.gsap) return;

    const panel = document.querySelector('[data-liquid-glass-panel]');
    if (!panel) return;

    const layers = createLayers(panel);
    animateLayers(layers);

    const badge = panel.querySelector('[data-liquid-glass]');
    animateBadge(badge);

    const pip = panel.querySelector('.liquid-glass-pip');
    animateStatus(pip);
  });
})();
