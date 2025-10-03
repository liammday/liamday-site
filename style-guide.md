---
layout: default
title: Interface Style Guide
permalink: /style-guide/
---

<style>
  .sg-background-card {
    display: grid;
    gap: 1.25rem;
    border-radius: 1.5rem;
    border: 1px solid var(--dynamic-card-border, rgba(203, 213, 225, 0.4));
    background: var(--dynamic-card-background, rgba(248, 250, 252, 0.95));
    color: var(--dynamic-card-text, #0f172a);
    padding: 1.75rem;
    box-shadow: 0 20px 40px rgba(var(--dynamic-card-shadow-rgb, 15, 23, 42), 0.12);
    transition: background-color 0.6s ease, border-color 0.6s ease, color 0.6s ease, box-shadow 0.6s ease;
  }

  .sg-background-card__swatch {
    width: 100%;
    height: 8rem;
    border-radius: 1.25rem;
    background: var(--sg-background-color, var(--sky-background-color, #030712));
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
    transition: background-color 0.6s ease, box-shadow 0.6s ease;
  }

  .sg-background-card__meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .sg-time-control {
    display: grid;
    gap: 1rem;
  }

  .sg-time-control__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .sg-time-control__slider {
    width: 100%;
    accent-color: var(--dynamic-accent, #0ea5e9);
    transition: accent-color 0.6s ease;
  }

  .sg-time-control__readout {
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--dynamic-text-on-background, #0f172a);
    transition: color 0.6s ease;
  }

  .sg-time-control__button {
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border-radius: 9999px;
    padding: 0.35rem 0.85rem;
    border: 1px solid rgba(var(--dynamic-nav-divider-rgb, 148, 163, 184), 0.35);
    color: var(--dynamic-text-muted, rgba(71, 85, 105, 0.9));
    background: rgba(var(--dynamic-card-shadow-rgb, 15, 23, 42), 0.04);
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  .sg-time-control__button:hover,
  .sg-time-control__button:focus-visible {
    color: var(--dynamic-text-on-background, #0f172a);
    border-color: rgba(var(--dynamic-nav-divider-rgb, 148, 163, 184), 0.55);
    background: rgba(var(--dynamic-card-shadow-rgb, 15, 23, 42), 0.08);
  }

  .sg-token-list {
    display: grid;
    gap: 0.75rem;
    margin: 0;
  }

  .sg-token-list__item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    color: var(--dynamic-card-text-muted, rgba(71, 85, 105, 0.9));
  }

  .sg-token-list__item dt {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dynamic-card-text, #0f172a);
  }

  .sg-token-list__item code {
    font-size: 0.85rem;
    font-weight: 600;
    background: rgba(var(--dynamic-card-shadow-rgb, 15, 23, 42), 0.08);
    border-radius: 0.4rem;
    padding: 0.15rem 0.5rem;
    color: var(--dynamic-card-text, #0f172a);
  }

  .sg-anchor-swatches {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .sg-anchor-swatch {
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    background: var(--swatch-color, #0f172a);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(var(--dynamic-nav-divider-rgb, 148, 163, 184), 0.25);
    transition: background-color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease;
  }

  .sg-anchor-swatch__meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.8rem;
    color: var(--dynamic-card-text-muted, rgba(71, 85, 105, 0.9));
  }

  .sg-anchor-swatch__label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dynamic-card-text, #0f172a);
  }
</style>

<div class="mx-auto max-w-6xl px-6 py-20 space-y-16">
  <header class="space-y-4">
    <p class="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Design system</p>
    <h1 class="text-dynamic text-3xl font-semibold sm:text-4xl">Interface style guide</h1>
    <p class="text-dynamic-muted text-lg leading-relaxed">
      A living reference for typography, colours, interaction patterns, and reusable components that power Liam’s portfolio site.
      Use this page to audit changes quickly and to ensure new sections inherit the existing look and feel.
    </p>
  </header>

  {% assign background = site.data.background %}
  <section class="grid gap-8 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-start">
    <div class="space-y-4">
      <h2 class="text-dynamic text-2xl font-semibold">Colour system</h2>
      <p class="text-dynamic-muted text-base leading-relaxed">
        The site’s sky backdrop is orchestrated from
        <code class="rounded bg-slate-900/10 px-1.5 py-0.5 text-sm text-slate-900">_data/background.yml</code>.
        Anchor swatches are defined at precise times, then the client interpolates the background and glassmorphism palette
        every minute so cards, typography, and UI chrome stay readable as the sky evolves.
      </p>
      <div class="grid gap-3">
        <div class="flex items-center gap-3">
          <span class="h-10 w-10 rounded-full bg-brand/20"></span>
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Brand Accent</p>
            <p class="text-base font-medium text-slate-900">brand.DEFAULT · <span class="font-mono text-sm">#0ea5e9</span></p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="h-10 w-10 rounded-full bg-slate-900"></span>
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Primary Text</p>
            <p class="text-base font-medium text-slate-900">var(--dynamic-text-on-background)</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="h-10 w-10 rounded-full bg-slate-300"></span>
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Muted Text</p>
            <p class="text-base font-medium text-slate-900">var(--dynamic-text-muted)</p>
          </div>
        </div>
      </div>
    </div>
    <div class="space-y-6">
      <div
        class="sg-background-card"
        data-sg-background-card
        style="--sg-background-color: {{ background.color | default: '#030712' }};"
      >
        <div class="sg-background-card__meta">
          <h3 class="text-lg font-semibold text-on-card" data-sg-background-label>
            {{ background.label | default: 'Site background' }}
          </h3>
          <p class="text-sm text-on-card-muted">{{ background.description | default: 'Primary background colour applied across the site.' }}</p>
        </div>
        <div class="sg-background-card__swatch" aria-hidden="true"></div>
        <dl class="sg-token-list">
          <div class="sg-token-list__item">
            <dt>Source of truth</dt>
            <dd><code>_data/background.yml</code></dd>
          </div>
          <div class="sg-token-list__item">
            <dt>Fallback hex</dt>
            <dd><code data-sg-current-hex>{{ background.color | default: '#030712' }}</code></dd>
          </div>
          <div class="sg-token-list__item">
            <dt>CSS variable</dt>
            <dd><code>--sky-background-color</code></dd>
          </div>
          <div class="sg-token-list__item">
            <dt>Computed RGB</dt>
            <dd><code data-sg-current-rgb>var(--sky-background-rgb)</code></dd>
          </div>
        </dl>
      </div>
      <div class="card-surface rounded-3xl border p-6 backdrop-blur" data-sg-time-simulator>
        <div class="sg-time-control">
          <div class="sg-time-control__header">
            <div>
              <h3 class="text-base font-semibold text-on-card">Time of day simulator</h3>
              <p class="mt-1 text-sm text-on-card-muted">
                Preview how the adaptive palette reacts across the day. Drag the slider to scrub through the anchor points
                defined in <code class="font-mono text-xs text-on-card-muted">_data/background.yml</code>.
              </p>
            </div>
            <button type="button" class="sg-time-control__button" data-sg-time-reset>Reset</button>
          </div>
          <label class="flex items-center justify-between gap-4" for="sg-time-slider">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-on-card">Simulated time</span>
            <span class="sg-time-control__readout" data-sg-time-display aria-live="polite">--:--</span>
          </label>
          <input
            id="sg-time-slider"
            class="sg-time-control__slider"
            type="range"
            min="0"
            max="1439"
            step="1"
            value="0"
            data-sg-time-slider
          />
          <p class="text-xs text-on-card-muted">
            Updates here are temporary and only affect this style guide while the page is open. All dynamic backgrounds and
            typography respond with the same transitions used in production.
          </p>
        </div>
      </div>
      {% assign time_points = background.time_points %}
      {% if time_points %}
      <div class="card-surface rounded-3xl border p-6 backdrop-blur">
        <h3 class="text-base font-semibold text-on-card">Time-aware sky anchors</h3>
        <p class="mt-2 text-sm text-on-card-muted">
          Each anchor specifies the palette at a 24-hour timestamp. The runtime script blends between anchors once per minute
          and flattens the result to a single sky colour, keeping card surfaces and on-background type legible as daylight
          shifts. Swatches below show that final hex value rather than the gradient endpoints.
        </p>
        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          {% for point in time_points %}
          {% assign top_color = point.color | default: point.top | default: point.gradient.top | default: background.color %}
          {% assign bottom_color = point.bottom | default: point.gradient.bottom | default: top_color %}
          <div
            class="card-surface rounded-2xl border p-4 backdrop-blur"
            data-sg-anchor
            data-top="{{ top_color | default: background.color | default: '#050712' }}"
            data-bottom="{{ bottom_color | default: top_color | default: background.color | default: '#050712' }}"
            data-fallback="{{ background.color | default: '#050712' }}"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm font-semibold uppercase tracking-[0.25em] text-on-card-muted">{{ point.label }}</p>
              <p class="font-mono text-xs text-on-card-muted">{{ point.time }}</p>
            </div>
            <div class="sg-anchor-swatches" aria-hidden="true">
              <div class="flex items-center gap-3">
                <div
                  class="sg-anchor-swatch"
                  data-sg-anchor-swatch
                  style="--swatch-color: {{ top_color | default: '#050712' }};"
                ></div>
                <div class="sg-anchor-swatch__meta">
                  <span class="sg-anchor-swatch__label">Base colour</span>
                  <code data-sg-anchor-hex>{{ top_color | default: '#050712' }}</code>
                </div>
              </div>
            </div>
            {% if bottom_color and bottom_color != top_color %}
            <p class="mt-3 text-xs text-on-card-muted">
              Derived from anchor mix of <code>{{ top_color }}</code> → <code>{{ bottom_color }}</code>.
            </p>
            {% endif %}
          </div>
          {% endfor %}
        </div>
      </div>
      {% endif %}
      <div class="card-surface rounded-3xl border p-6 backdrop-blur">
        <h3 class="text-base font-semibold text-on-card">Dynamic CSS variables</h3>
        <dl class="mt-4 grid gap-4 text-sm text-on-card-muted sm:grid-cols-2">
          <div>
            <dt class="font-semibold text-on-card">--sky-background-color</dt>
            <dd>Current sky midpoint applied to the document root and theme colour meta tag.</dd>
          </div>
          <div>
            <dt class="font-semibold text-on-card">--sky-background-rgb</dt>
            <dd>Pre-calculated RGB channel values for WebGL and canvas effects.</dd>
          </div>
          <div>
            <dt class="font-semibold text-on-card">--dynamic-text-on-background</dt>
            <dd>Primary type colour that adapts based on the background’s luminance.</dd>
          </div>
          <div>
            <dt class="font-semibold text-on-card">--dynamic-glass-background</dt>
            <dd>Controls glassmorphism surfaces, ensuring cards stay legible whether the sky is bright or midnight dark.</dd>
          </div>
          <div>
            <dt class="font-semibold text-on-card">--dynamic-control-surface</dt>
            <dd>Base background for buttons, chips, and interactive controls layered on glass panels.</dd>
          </div>
        </dl>
      </div>
      <div class="card-surface rounded-3xl border p-6 backdrop-blur">
        <h3 class="text-base font-semibold text-on-card">Adaptive accent palette</h3>
        <p class="mt-2 text-sm text-on-card-muted">
          Accent tokens are generated by <code class="font-mono text-xs text-slate-500">applyDynamicPalette</code> so that buttons, links, and highlights shift harmoniously with the sky background.
        </p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="flex items-center gap-3">
            <span class="h-10 w-10 rounded-full border border-dynamic" style="background: var(--dynamic-accent);"></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Accent base</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-accent</code></p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-10 w-10 rounded-full border border-dynamic" style="background: var(--dynamic-accent-hover);"></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Hover state</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-accent-hover</code></p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-10 w-10 rounded-full border border-dynamic" style="background: var(--dynamic-accent-strong);"></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Emphasis fill</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-accent-strong</code></p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-10 w-10 rounded-full border border-dynamic" style="background: var(--dynamic-accent-muted);"></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Muted wash</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-accent-muted</code></p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-full border border-dynamic"
              style="background: var(--dynamic-accent); color: var(--dynamic-accent-contrast);"
            >
              Aa
            </span>
            <div>
              <p class="text-sm font-semibold text-on-card">Contrast text</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-accent-contrast</code></p>
            </div>
          </div>
        </div>
      </div>
      <div class="card-surface rounded-3xl border p-6 backdrop-blur">
        <h3 class="text-base font-semibold text-on-card">Navigation glass tokens</h3>
        <p class="mt-2 text-sm text-on-card-muted">
          Overlay, divider, and shadow colours used by the floating navigation are also palette-aware, keeping the menu legible regardless of background choice.
        </p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="flex items-center gap-3">
            <span
              class="h-10 w-10 rounded-full border"
              style="background: var(--dynamic-nav-panel-background); border-color: var(--dynamic-nav-panel-border);"
            ></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Nav panel</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-nav-panel-background</code></p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-10 w-10 rounded-full border border-dynamic" style="background: var(--dynamic-nav-overlay);"></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Backdrop overlay</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-nav-overlay</code></p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-10 w-10 rounded-full border border-dynamic" style="background: rgba(var(--dynamic-nav-divider-rgb), 1);"></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Divider tint</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-nav-divider-rgb</code></p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="h-10 w-10 rounded-full border border-dynamic shadow-lg"
              style="background: rgba(var(--dynamic-shadow-rgb), 0.18); box-shadow: 0 12px 22px rgba(var(--dynamic-shadow-rgb), 0.25);"
            ></span>
            <div>
              <p class="text-sm font-semibold text-on-card">Shadow colour</p>
              <p class="text-xs text-on-card-muted"><code>--dynamic-shadow-rgb</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="grid gap-10 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-start">
    <div class="space-y-4">
      <h2 class="text-dynamic text-2xl font-semibold">Typography</h2>
      <p class="text-dynamic-muted text-base leading-relaxed">
        Inter is used throughout with a responsive scale driven by Tailwind utilities. Headlines stay bold, while supporting copy uses the
        <code class="rounded bg-slate-900/10 px-1.5 py-0.5 text-sm text-slate-900">text-dynamic</code> and <code class="rounded bg-slate-900/10 px-1.5 py-0.5 text-sm text-slate-900">text-dynamic-muted</code>
        helpers so colour adapts with the sky.
      </p>
    </div>
    <div class="card-surface space-y-6 rounded-3xl border p-6 backdrop-blur">
      <div class="space-y-2">
        <p class="text-on-card-muted text-xs font-semibold uppercase tracking-[0.3em]">Headings</p>
        <h1 class="text-dynamic text-4xl font-semibold sm:text-5xl">H1 – Impact headline</h1>
        <h2 class="text-dynamic text-3xl font-semibold sm:text-4xl">H2 – Section title</h2>
        <h3 class="text-dynamic text-2xl font-semibold">H3 – Card or panel title</h3>
      </div>
      <div class="space-y-3">
        <p class="text-on-card-muted text-xs font-semibold uppercase tracking-[0.3em]">Body copy</p>
        <p class="text-dynamic-muted text-lg leading-relaxed">
          Use <code class="font-mono text-sm text-slate-500">text-lg</code> for introductions and lead paragraphs, stepping down to
          <code class="font-mono text-sm text-slate-500">text-base</code> for supporting content.
        </p>
        <p class="text-dynamic-muted text-base leading-relaxed">
          Lists inherit Tailwind’s <code class="font-mono text-sm text-slate-500">prose</code> styles and automatically pick up the accent coloured markers defined in
          <code class="font-mono text-sm text-slate-500">assets/css/style.scss</code>.
        </p>
      </div>
    </div>
  </section>

  <section class="grid gap-10 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-start">
    <div class="space-y-4">
      <h2 class="text-dynamic text-2xl font-semibold">Buttons &amp; controls</h2>
      <p class="text-dynamic-muted text-base leading-relaxed">
        Buttons either sit directly on the dynamic background or on glass panels. Keep padding generous and maintain rounded-full silhouettes for primary calls to action.
      </p>
    </div>
    <div class="card-surface space-y-4 rounded-3xl border p-6 backdrop-blur">
      <div class="flex flex-wrap items-center gap-4">
        <a
          class="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-soft-xl transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          href="#"
        >Primary action</a>
        <a
          class="inline-flex items-center justify-center rounded-full border border-transparent bg-[var(--dynamic-card-background)] px-6 py-3 text-base font-semibold text-[var(--dynamic-card-text)] shadow-sm transition hover:bg-[var(--dynamic-control-surface-hover)] hover:text-[var(--dynamic-card-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          href="#"
        >Secondary</a>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--dynamic-control-surface)] px-4 py-2 text-sm font-semibold text-[var(--dynamic-control-text)] shadow-sm transition hover:bg-[var(--dynamic-control-surface-hover)]"
        >
          <span class="inline-flex h-2.5 w-2.5 rounded-full bg-brand"></span>
          Glass toggle
        </button>
      </div>
      <p class="text-on-card-muted text-sm">
        Controls inherit stateful colours from the CSS custom properties updated by <code class="font-mono text-xs text-slate-500">applyDynamicPalette</code> in <code class="font-mono text-xs text-slate-500">_layouts/default.html</code>.
      </p>
    </div>
  </section>

  <section class="grid gap-10 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-start">
    <div class="space-y-4">
      <h2 class="text-dynamic text-2xl font-semibold">Cards &amp; glass surfaces</h2>
      <p class="text-dynamic-muted text-base leading-relaxed">
        Two primary surface treatments are available: pair <code class="font-mono text-sm text-slate-500">glass-dynamic</code> panels with luminous backgrounds and rely on <code class="font-mono text-sm text-slate-500">card-surface</code> for dense content blocks. Mix them to create visual hierarchy.
      </p>
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      <div class="glass-panel glass-dynamic ring-dynamic relative overflow-hidden rounded-3xl border p-6 shadow-soft-xl ring-1" data-liquid-glass-panel>
        <div class="liquid-glass-layer" aria-hidden="true"></div>
        <div class="liquid-glass-layer liquid-glass-layer--cyan" aria-hidden="true"></div>
        <div class="space-y-3">
          <p class="text-on-glass-muted text-xs font-semibold uppercase tracking-[0.3em]">Glass panel</p>
          <h3 class="text-on-glass text-xl font-semibold">Hero highlight</h3>
          <p class="text-on-glass-muted text-sm leading-relaxed">
            Use this treatment for callouts that should mirror the luminous background while staying legible.
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold text-on-glass">
              <span class="h-1.5 w-1.5 rounded-full bg-brand"></span>
              Dynamic tint
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold text-on-glass">
              Adaptive text
            </span>
          </div>
        </div>
      </div>
      <div class="card-surface rounded-3xl border p-6">
        <p class="text-on-card-muted text-xs font-semibold uppercase tracking-[0.3em]">Solid card</p>
        <h3 class="text-on-card text-xl font-semibold">Supporting detail</h3>
        <p class="mt-3 text-base text-on-card-muted">
          Solid cards are ideal for structured lists, metrics, and dense content that benefits from a calm backdrop.
        </p>
        <ul class="mt-4 space-y-2 text-sm text-on-card-muted">
          <li class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-brand"></span>
            Uses standard border + shadow stack
          </li>
          <li class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-brand"></span>
            Calibrated for clarity against the deep midnight backdrop
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="grid gap-10 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-start">
    <div class="space-y-4">
      <h2 class="text-dynamic text-2xl font-semibold">Reference snippets</h2>
      <p class="text-dynamic-muted text-base leading-relaxed">
        Quick copy/paste helpers when building new sections. Adjust copy only; structural classes keep spacing, alignment, and colour rules intact.
      </p>
    </div>
    <div class="card-surface space-y-4 rounded-3xl border p-6 backdrop-blur">
      <pre class="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100"><code>&lt;section class=&quot;py-16&quot;&gt;
  &lt;div class=&quot;mx-auto max-w-6xl px-6&quot;&gt;
    &lt;div class=&quot;grid gap-10 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]&quot;&gt;
      &lt;div&gt;
        &lt;h2 class=&quot;text-dynamic text-2xl font-semibold&quot;&gt;Title&lt;/h2&gt;
      &lt;/div&gt;
      &lt;div class=&quot;text-dynamic-muted text-lg leading-relaxed&quot;&gt;
        &lt;p&gt;Supporting copy...&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/section&gt;</code></pre>
      <pre class="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100"><code>&lt;article class=&quot;card-surface group rounded-3xl border p-6 transition hover:-translate-y-1&quot;&gt;
  &lt;h3 class=&quot;text-xl font-semibold text-on-card group-hover:text-brand&quot;&gt;Card title&lt;/h3&gt;
  &lt;p class=&quot;mt-3 text-base text-on-card-muted&quot;&gt;Body copy for a supporting card.&lt;/p&gt;
  &lt;span class=&quot;mt-4 inline-flex items-center text-sm font-semibold text-brand&quot;&gt;Call to action →&lt;/span&gt;
&lt;/article&gt;</code></pre>
    </div>
  </section>
</div>

<script>
  (() => {
    const slider = document.querySelector('[data-sg-time-slider]');
    const display = document.querySelector('[data-sg-time-display]');
    const resetButton = document.querySelector('[data-sg-time-reset]');
    const backgroundCard = document.querySelector('[data-sg-background-card]');
    const hexTarget = document.querySelector('[data-sg-current-hex]');
    const rgbTarget = document.querySelector('[data-sg-current-rgb]');
    const labelTarget = document.querySelector('[data-sg-background-label]');
    const anchorCards = Array.from(document.querySelectorAll('[data-sg-anchor]'));
    const MINUTES_IN_DAY = 24 * 60;
    const FALLBACK_HEX = '#050712';

    const clampChannel = (value) => {
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        return 0;
      }
      return Math.max(0, Math.min(255, Math.round(numeric)));
    };

    const componentToHex = (value) => clampChannel(value).toString(16).padStart(2, '0');

    const rgbToHex = (color) => {
      if (!color) {
        return null;
      }
      return `#${componentToHex(color.r)}${componentToHex(color.g)}${componentToHex(color.b)}`;
    };

    const normalizeHex = (value) => {
      if (typeof value !== 'string') {
        return null;
      }

      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      let hex = trimmed.replace(/^#/, '');
      if (hex.length === 3) {
        hex = hex
          .split('')
          .map((char) => char + char)
          .join('');
      } else if (hex.length !== 6) {
        return null;
      }

      if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return null;
      }

      return `#${hex.toLowerCase()}`;
    };

    const hexToRgb = (value) => {
      const normalized = normalizeHex(value);
      if (!normalized) {
        return null;
      }

      const int = Number.parseInt(normalized.slice(1), 16);
      if (Number.isNaN(int)) {
        return null;
      }

      return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255
      };
    };

    const clamp01 = (value) => {
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        return 0;
      }
      return Math.min(Math.max(numeric, 0), 1);
    };

    const mixRgb = (start, end, factor = 0.5) => {
      if (!start && !end) {
        return null;
      }
      if (!start) {
        return end;
      }
      if (!end) {
        return start;
      }

      const mixFactor = clamp01(factor);
      return {
        r: Math.round(start.r + (end.r - start.r) * mixFactor),
        g: Math.round(start.g + (end.g - start.g) * mixFactor),
        b: Math.round(start.b + (end.b - start.b) * mixFactor)
      };
    };

    const FALLBACK_RGB = hexToRgb(FALLBACK_HEX);

    const computeBaseHex = (top, bottom, fallback = FALLBACK_HEX) => {
      const fallbackColor = hexToRgb(fallback) || FALLBACK_RGB;
      const topColor = hexToRgb(top) || fallbackColor;
      const bottomColor = hexToRgb(bottom) || topColor;
      const baseColor = mixRgb(topColor, bottomColor, 0.5) || topColor || bottomColor || fallbackColor;
      return rgbToHex(baseColor) || normalizeHex(fallback) || FALLBACK_HEX;
    };

    const updateAnchorSwatches = () => {
      anchorCards.forEach((card) => {
        const topHex = card.getAttribute('data-top');
        const bottomHex = card.getAttribute('data-bottom');
        const fallbackHex = card.getAttribute('data-fallback') || FALLBACK_HEX;
        const baseHex = computeBaseHex(topHex, bottomHex, fallbackHex) || FALLBACK_HEX;
        const swatch = card.querySelector('[data-sg-anchor-swatch]');
        const hexLabel = card.querySelector('[data-sg-anchor-hex]');

        if (swatch && baseHex) {
          swatch.style.setProperty('--swatch-color', baseHex);
        }

        if (hexLabel && baseHex) {
          hexLabel.textContent = baseHex;
        }
      });
    };

    if (anchorCards.length) {
      updateAnchorSwatches();
    }

    if (!slider || !display) {
      return;
    }

    const formatMinutes = (minutes) => {
      const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
      const normalized = ((Math.round(safeMinutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
      const hours = Math.floor(normalized / 60);
      const mins = normalized % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const updateDisplay = (minutes) => {
      display.textContent = formatMinutes(minutes);
    };

    const updateLiveTokens = () => {
      const runtime = window.__skyRuntime;
      const detail = runtime?.lastAppliedBackground;
      const computed = getComputedStyle(document.documentElement);
      const hex = computed.getPropertyValue('--sky-background-color').trim();
      const rgb = computed.getPropertyValue('--sky-background-rgb').trim();

      if (backgroundCard && hex) {
        backgroundCard.style.setProperty('--sg-background-color', hex);
      }

      if (hexTarget && hex) {
        hexTarget.textContent = hex;
      }

      if (rgbTarget && rgb) {
        rgbTarget.textContent = rgb;
      }

      if (labelTarget && detail?.label) {
        labelTarget.textContent = detail.label;
      }
    };

    const applyOverride = (minutes) => {
      const runtime = window.__skyRuntime;
      if (!runtime) {
        return;
      }

      if (typeof runtime.setTimeOverride === 'function') {
        runtime.setTimeOverride(minutes);
        return;
      }

      runtime.timeOverrideMinutes = minutes;
      if (typeof runtime.applyBackground === 'function') {
        runtime.applyBackground();
      }
    };

    const clearOverride = () => {
      const runtime = window.__skyRuntime;
      if (!runtime) {
        return;
      }

      if (typeof runtime.clearTimeOverride === 'function') {
        runtime.clearTimeOverride();
        return;
      }

      delete runtime.timeOverrideMinutes;
      if (typeof runtime.applyBackground === 'function') {
        runtime.applyBackground();
      }
    };

    const initializeControls = () => {
      const runtime = window.__skyRuntime;
      const lastDetail = runtime?.lastAppliedBackground;
      const overrideMinutes = Number.isFinite(runtime?.timeOverrideMinutes)
        ? runtime.timeOverrideMinutes
        : null;

      const initialMinutes = Number.isFinite(overrideMinutes)
        ? overrideMinutes
        : Number.isFinite(lastDetail?.minutes)
        ? lastDetail.minutes
        : (() => {
            const now = new Date();
            return now.getHours() * 60 + now.getMinutes();
          })();

      slider.value = String(Math.round(initialMinutes));
      updateDisplay(initialMinutes);
      updateLiveTokens();

      slider.addEventListener('input', (event) => {
        const minutes = Number(event.target.value);
        updateDisplay(minutes);
        applyOverride(minutes);
      });

      slider.addEventListener('change', (event) => {
        const minutes = Number(event.target.value);
        updateDisplay(minutes);
        applyOverride(minutes);
      });

      if (resetButton) {
        resetButton.addEventListener('click', () => {
          clearOverride();
        });
      }

      window.addEventListener('sky:background-applied', (event) => {
        const minutes = Number.isFinite(event?.detail?.minutes) ? event.detail.minutes : null;
        if (Number.isFinite(minutes) && !Number.isFinite(window.__skyRuntime?.timeOverrideMinutes)) {
          slider.value = String(Math.round(minutes));
          updateDisplay(minutes);
        }
        updateLiveTokens();
      });
    };

    const waitForRuntime = () => {
      if (window.__skyRuntime && typeof window.__skyRuntime.applyBackground === 'function') {
        initializeControls();
      } else {
        window.requestAnimationFrame(waitForRuntime);
      }
    };

    waitForRuntime();
  })();
</script>

