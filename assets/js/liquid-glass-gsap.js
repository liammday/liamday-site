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

  const registerPointerEffect = (panel, layers) => {
    if (!panel || !layers.length) {
      return null;
    }

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const supportsPointer = 'PointerEvent' in window;
    const pointerState = { x: 0.5, y: 0.5 };

    const updateLayerOffsets = () => {
      layers.forEach((layer, index) => {
        const intensity = Math.max(4, 10 - index * 3);
        const offsetX = ((pointerState.x - 0.5) * intensity).toFixed(3);
        const offsetY = ((pointerState.y - 0.5) * intensity).toFixed(3);

        if (window.gsap?.to) {
          window.gsap.to(layer, {
            '--pointer-shift-x': `${offsetX}%`,
            '--pointer-shift-y': `${offsetY}%`,
            duration: 0.6,
            ease: 'sine.out',
            overwrite: 'auto',
          });
        } else {
          layer.style.setProperty('--pointer-shift-x', `${offsetX}%`);
          layer.style.setProperty('--pointer-shift-y', `${offsetY}%`);
        }
      });
    };

    const setActive = (isActive) => {
      if (isActive) {
        panel.setAttribute('data-liquid-glass-active', 'true');
      } else {
        panel.removeAttribute('data-liquid-glass-active');
      }
    };

    const handlePointerMove = (event) => {
      const rect = panel.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      pointerState.x = Math.min(Math.max(x, 0), 1);
      pointerState.y = Math.min(Math.max(y, 0), 1);
      updateLayerOffsets();
      setActive(true);
    };

    const resetPointer = () => {
      pointerState.x = 0.5;
      pointerState.y = 0.5;
      updateLayerOffsets();
      setActive(false);
    };

    updateLayerOffsets();
    panel.setAttribute('data-liquid-glass-ready', 'true');

    if (reduceMotionQuery.matches || !supportsPointer) {
      return null;
    }

    panel.addEventListener('pointermove', handlePointerMove, { passive: true });
    panel.addEventListener('pointerdown', handlePointerMove, { passive: true });
    panel.addEventListener('pointerleave', resetPointer);
    panel.addEventListener('pointercancel', resetPointer);

    return () => {
      panel.removeEventListener('pointermove', handlePointerMove);
      panel.removeEventListener('pointerdown', handlePointerMove);
      panel.removeEventListener('pointerleave', resetPointer);
      panel.removeEventListener('pointercancel', resetPointer);
      setActive(false);
    };
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

    registerPointerEffect(panel, layers);
  });
})();
