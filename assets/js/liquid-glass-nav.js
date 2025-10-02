(function () {
  const MIN_WIDTH_QUERY = '(min-width: 768px)';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

  const supportsWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (error) {
      return false;
    }
  };

  const parseColorVariable = (value, fallback) => {
    if (typeof value !== 'string') {
      return fallback;
    }

    const sanitized = value.trim();
    const matches = sanitized.match(/[\d.]+/g);

    if (!matches || matches.length < 3) {
      return fallback;
    }

    const hasPercent = sanitized.includes('%');
    const divisor = hasPercent ? 100 : 255;

    const rgb = matches
      .slice(0, 3)
      .map((component) => {
        const numeric = Number(component);
        if (Number.isNaN(numeric)) {
          return 0;
        }
        return Math.min(Math.max(numeric / divisor, 0), 1);
      });

    return rgb.length === 3 ? rgb : fallback;
  };

  const vertexShader = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision mediump float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_pointer;
    uniform float u_noiseScale;
    uniform float u_opacity;
    uniform vec3 u_topColor;
    uniform vec3 u_bottomColor;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;

      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.15;
        amplitude *= 0.5;
      }

      return value;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 pointer = vec2(u_pointer.x, u_pointer.y);

      float aspect = u_resolution.x / max(u_resolution.y, 1.0);
      vec2 noiseCoord = vec2(uv.x * aspect, uv.y);

      float time = u_time * 0.45;
      float base = fbm((noiseCoord + vec2(time * 0.6, -time * 0.35)) * u_noiseScale);
      float detail = fbm((noiseCoord - vec2(time * 0.25, time * 0.42)) * (u_noiseScale * 1.8));
      float combined = mix(base, detail, 0.6);

      vec2 pointerOffset = uv - pointer;
      float pointerDistance = length(pointerOffset);
      float pointerInfluence = smoothstep(0.55, 0.0, pointerDistance);
      vec2 pointerDirection = pointerOffset / max(pointerDistance, 0.001);

      vec2 refractionOffset = (combined - 0.5) * 0.18 - pointerDirection * pointerInfluence * 0.12;
      vec2 refractedUv = clamp(uv + refractionOffset, 0.0, 1.0);

      float gradientMix = 1.0 - refractedUv.y;
      vec3 gradient = mix(u_topColor, u_bottomColor, gradientMix);

      float caustic = smoothstep(0.45, 0.95, combined + pointerInfluence * 0.4);
      float fresnel = pow(1.0 - clamp(dot(pointerDirection, vec2(0.0, 1.0)), 0.0, 1.0), 2.0);

      vec3 highlight = vec3(0.32, 0.38, 0.48) * caustic + vec3(0.18, 0.22, 0.32) * fresnel;
      vec3 color = clamp(gradient + highlight, 0.0, 1.0);

      float edgeGlow = smoothstep(0.92, 1.0, uv.y) * 0.25 + smoothstep(0.0, 0.08, uv.y) * 0.2;
      float alpha = clamp(u_opacity + caustic * 0.18 + pointerInfluence * 0.15 + edgeGlow * 0.2, 0.0, 1.0);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  const createNavGlass = () => {
    const navList = document.querySelector('[data-nav-list]');

    if (!navList) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'nav-liquid-glass';
    navList.insertBefore(canvas, navList.firstChild);

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });

    if (!gl || !window.twgl) {
      canvas.remove();
      return null;
    }

    const programInfo = window.twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);
    const bufferInfo = window.twgl.createBufferInfoFromArrays(gl, {
      position: {
        numComponents: 2,
        data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      },
    });

    const defaults = {
      base: [0.012, 0.027, 0.071],
    };

    const uniforms = {
      u_time: 0,
      u_resolution: [1, 1],
      u_pointer: [0.5, 0.5],
      u_noiseScale: 3.25,
      u_opacity: 0.52,
      u_topColor: defaults.base.slice(),
      u_bottomColor: defaults.base.slice(),
    };

    const pointerState = { x: 0.5, y: 0.5 };
    const devicePixelRatio = window.devicePixelRatio || 1;
    let animationFrame = null;
    let resizeObserver = null;
    let windowResizeListener = null;
    let destroyed = false;
    let lastColorSample = 0;

    const resize = () => {
      const rect = navList.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);

      gl.viewport(0, 0, canvas.width, canvas.height);
      uniforms.u_resolution[0] = canvas.width;
      uniforms.u_resolution[1] = canvas.height;
    };

    const updatePointer = (event) => {
      const rect = navList.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      pointerState.x = Math.min(Math.max(x, 0), 1);
      pointerState.y = Math.min(Math.max(1 - y, 0), 1);

      uniforms.u_pointer[0] = pointerState.x;
      uniforms.u_pointer[1] = pointerState.y;
    };

    const resetPointer = () => {
      pointerState.x = 0.5;
      pointerState.y = 0.5;
      uniforms.u_pointer[0] = pointerState.x;
      uniforms.u_pointer[1] = pointerState.y;
    };

    const updateColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const backgroundValue = rootStyle.getPropertyValue('--sky-background-rgb');

      const parsedBackground = parseColorVariable(backgroundValue, defaults.base);

      uniforms.u_topColor[0] = parsedBackground[0];
      uniforms.u_topColor[1] = parsedBackground[1];
      uniforms.u_topColor[2] = parsedBackground[2];

      uniforms.u_bottomColor[0] = parsedBackground[0];
      uniforms.u_bottomColor[1] = parsedBackground[1];
      uniforms.u_bottomColor[2] = parsedBackground[2];
    };

    const render = (time) => {
      if (destroyed) {
        return;
      }

      uniforms.u_time = time * 0.001;

      if (time - lastColorSample > 500) {
        updateColors();
        lastColorSample = time;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);
      window.twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      window.twgl.setUniforms(programInfo, uniforms);
      window.twgl.drawBufferInfo(gl, bufferInfo);

      animationFrame = window.requestAnimationFrame(render);
    };

    const observeResize = () => {
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          resize();
        });
        resizeObserver.observe(navList);
      } else {
        windowResizeListener = () => {
          resize();
        };
        window.addEventListener('resize', windowResizeListener);
      }
    };

    const destroy = () => {
      if (destroyed) {
        return;
      }

      destroyed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      if (windowResizeListener) {
        window.removeEventListener('resize', windowResizeListener);
      }
      navList.removeEventListener('pointerenter', updatePointer);
      navList.removeEventListener('pointermove', updatePointer);
      navList.removeEventListener('pointerleave', resetPointer);
      navList.removeAttribute('data-glass-ready');
      canvas.remove();
    };

    resize();
    updateColors();
    observeResize();

    navList.addEventListener('pointerenter', updatePointer, { passive: true });
    navList.addEventListener('pointermove', updatePointer, { passive: true });
    navList.addEventListener('pointerleave', resetPointer);
    navList.setAttribute('data-glass-ready', 'true');

    animationFrame = window.requestAnimationFrame(render);

    return { destroy };
  };

  const init = () => {
    if (!supportsWebGL()) {
      return;
    }

    if (!window.twgl) {
      return;
    }

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      return;
    }

    const mediaQuery = window.matchMedia(MIN_WIDTH_QUERY);
    let effect = null;

    const setup = () => {
      if (effect || !mediaQuery.matches) {
        return;
      }
      effect = createNavGlass();
      if (!effect) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };

    const teardown = () => {
      if (!effect) {
        return;
      }
      effect.destroy();
      effect = null;
    };

    const handleChange = (event) => {
      if (event.matches) {
        setup();
      } else {
        teardown();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    setup();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
