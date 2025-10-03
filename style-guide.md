---
layout: default
title: Interface Style Guide
permalink: /style-guide/
---

<style>
  .style-guide-page {
    width: min(100%, 76rem);
    margin: 0 auto;
    padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem) clamp(4rem, 8vw, 6rem);
    display: flex;
    flex-direction: column;
    gap: clamp(2.5rem, 6vw, 4rem);
    color: var(--screen-ink);
  }

  .screen-panel {
    position: relative;
    background: var(--screen-paper);
    color: var(--screen-ink);
    border-radius: clamp(1.75rem, 4vw, 2.5rem);
    padding: clamp(1.75rem, 3vw, 2.75rem);
    border: 3px solid rgba(var(--two-tone-foreground-rgb), 0.22);
    box-shadow: 12px 12px 0 rgba(var(--two-tone-foreground-rgb), 0.15);
    overflow: hidden;
  }

  .screen-panel::after {
    content: "";
    position: absolute;
    inset: 0;
    border: 3px solid rgba(var(--two-tone-background-rgb), 0.55);
    transform: translate(10px, 10px);
    mix-blend-mode: lighten;
    opacity: 0.18;
    pointer-events: none;
  }

  .screen-panel > * {
    position: relative;
    z-index: 1;
  }

  .screen-panel--ink {
    background: var(--screen-ink);
    color: var(--screen-paper);
    border-color: rgba(var(--two-tone-background-rgb), 0.25);
    box-shadow: 12px 12px 0 rgba(var(--two-tone-background-rgb), 0.25);
  }

  .screen-panel--ink::after {
    border-color: rgba(var(--two-tone-foreground-rgb), 0.35);
  }

  .style-guide__hero {
    display: grid;
    gap: 1rem;
    background-image: linear-gradient(135deg, rgba(var(--two-tone-foreground-rgb), 0.08) 0%, transparent 55%),
      linear-gradient(-135deg, rgba(var(--two-tone-foreground-rgb), 0.06) 0%, transparent 50%);
  }

  .style-guide__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.28em;
  }

  .style-guide__tag::before {
    content: "●";
    font-size: 0.65rem;
  }

  .style-guide__title {
    font-size: clamp(2.5rem, 4vw, 4.5rem);
    line-height: 1.05;
  }

  .style-guide__lead {
    max-width: 48ch;
    font-size: clamp(1.05rem, 1.6vw, 1.25rem);
    line-height: 1.7;
    color: var(--screen-ink-muted);
  }

  .style-guide__section {
    display: grid;
    gap: clamp(1.75rem, 4vw, 2.5rem);
  }

  .style-guide__section-header {
    display: grid;
    gap: 0.75rem;
    max-width: 54ch;
  }

  .style-guide__section-title {
    font-size: clamp(1.9rem, 3vw, 2.75rem);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .style-guide__section-copy {
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--screen-ink-muted);
  }

  .style-guide-page :not(pre) > code {
    font-family: "Fira Code", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 0.9rem;
    background: rgba(var(--two-tone-foreground-rgb), 0.12);
    color: inherit;
    padding: 0.1rem 0.45rem;
    border-radius: 0.6rem;
  }

  .style-guide__swatch-grid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
  }

  @media (min-width: 900px) {
    .style-guide__swatch-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .style-guide__swatch-card {
    display: grid;
    gap: 1.25rem;
    border-radius: clamp(1.5rem, 3vw, 2rem);
    padding: clamp(1.5rem, 3vw, 2rem);
    background: rgba(var(--two-tone-background-rgb), 0.35);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.2);
    box-shadow: 10px 10px 0 rgba(var(--two-tone-foreground-rgb), 0.14);
  }

  .style-guide__swatch-card--ink {
    background: rgba(var(--two-tone-foreground-rgb), 0.15);
  }

  .style-guide__swatch-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .style-guide__swatch-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.24em;
  }

  .style-guide__swatch-name {
    font-size: 1.15rem;
    font-weight: 600;
  }

  .style-guide__swatch-sample {
    width: 100%;
    aspect-ratio: 3 / 2;
    border-radius: clamp(1.1rem, 3vw, 1.75rem);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.35);
    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.08);
    background: var(--sample-color, var(--screen-paper));
  }

  .style-guide__token-list {
    display: grid;
    gap: 0.85rem;
  }

  .style-guide__token-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--screen-ink-muted);
    gap: 1rem;
  }

  .style-guide__token-item dt {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .style-guide__token-item code {
    font-family: "Fira Code", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 0.85rem;
    padding: 0.15rem 0.5rem;
    border-radius: 0.65rem;
    background: rgba(var(--two-tone-foreground-rgb), 0.12);
    color: inherit;
    white-space: nowrap;
  }

  .style-guide__time-board {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
  }

  .style-guide__time-panel {
    display: grid;
    gap: 1.25rem;
    border-radius: clamp(1.5rem, 3vw, 2rem);
    padding: clamp(1.5rem, 3vw, 2.25rem);
    background: rgba(var(--two-tone-background-rgb), 0.45);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.25);
    box-shadow: 10px 10px 0 rgba(var(--two-tone-foreground-rgb), 0.15);
  }

  .style-guide__time-panel h3 {
    font-size: 1.35rem;
    font-family: "Playfair Display", "Times New Roman", Times, serif;
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  .style-guide__slider-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .style-guide__time-display {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  .style-guide__slider {
    width: 100%;
    accent-color: var(--two-tone-foreground);
  }

  .style-guide__time-reset {
    align-self: flex-start;
    padding: 0.45rem 0.85rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    border-radius: 999px;
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.35);
    background: transparent;
    color: currentColor;
    cursor: pointer;
    transition: background-color 0.25s ease, color 0.25s ease;
  }

  .style-guide__time-reset:hover,
  .style-guide__time-reset:focus-visible {
    background: rgba(var(--two-tone-foreground-rgb), 0.18);
    color: var(--screen-paper);
    outline: none;
  }

  .style-guide__anchor-grid {
    display: grid;
    gap: 1.25rem;
  }

  @media (min-width: 50rem) {
    .style-guide__anchor-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .style-guide__anchor-card {
    display: grid;
    gap: 0.9rem;
    padding: clamp(1.2rem, 2.2vw, 1.6rem);
    border-radius: clamp(1.25rem, 2.5vw, 1.75rem);
    background: rgba(var(--two-tone-background-rgb), 0.55);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.25);
  }

  .style-guide__anchor-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .style-guide__anchor-sample {
    height: 3.25rem;
    border-radius: clamp(0.85rem, 2vw, 1.1rem);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.35);
    background: var(--anchor-color, var(--screen-paper));
  }

  .style-guide__anchor-meta {
    font-family: "Fira Code", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 0.85rem;
    color: var(--screen-ink-muted);
  }

  .style-guide__type-samples {
    display: grid;
    gap: 1.5rem;
  }

  .style-guide__type-pairing {
    padding: clamp(1.75rem, 3vw, 2.5rem);
    border-radius: clamp(1.5rem, 3vw, 2rem);
    background: rgba(var(--two-tone-background-rgb), 0.45);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.25);
    box-shadow: 10px 10px 0 rgba(var(--two-tone-foreground-rgb), 0.15);
    display: grid;
    gap: 1.25rem;
  }

  .style-guide__type-heading {
    display: grid;
    gap: 0.4rem;
  }

  .style-guide__type-heading span {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--screen-ink-muted);
  }

  .style-guide__type-heading h3 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
  }

  .style-guide__type-body {
    display: grid;
    gap: 0.75rem;
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--screen-ink-muted);
  }

  .style-guide__interface-grid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
  }

  @media (min-width: 900px) {
    .style-guide__interface-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .style-guide__card-demo {
    display: grid;
    gap: 1rem;
    background: rgba(var(--two-tone-background-rgb), 0.55);
    border-radius: clamp(1.5rem, 3vw, 2rem);
    padding: clamp(1.5rem, 3vw, 2.25rem);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.25);
    box-shadow: 10px 10px 0 rgba(var(--two-tone-foreground-rgb), 0.15);
  }

  .style-guide__card-demo h3 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .style-guide__card-demo p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--screen-ink-muted);
  }

  .style-guide__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    background: var(--screen-ink);
    color: var(--screen-paper);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    border: 2px solid rgba(var(--two-tone-background-rgb), 0.3);
    box-shadow: 6px 6px 0 rgba(var(--two-tone-background-rgb), 0.35);
  }

  .style-guide__cta:hover,
  .style-guide__cta:focus-visible {
    background: rgba(var(--two-tone-foreground-rgb), 0.85);
    outline: none;
  }

  .style-guide__menu-preview {
    display: grid;
    gap: 1rem;
    padding: clamp(1.5rem, 3vw, 2rem);
    border-radius: clamp(1.5rem, 3vw, 2rem);
    background: linear-gradient(160deg, rgba(var(--two-tone-foreground-rgb), 0.1) 0%, transparent 65%),
      rgba(var(--two-tone-background-rgb), 0.55);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.25);
    box-shadow: 10px 10px 0 rgba(var(--two-tone-foreground-rgb), 0.15);
  }

  .style-guide__menu-preview-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.24em;
  }

  .style-guide__code {
    display: grid;
    gap: 1rem;
    padding: clamp(1.5rem, 3vw, 2.25rem);
    border-radius: clamp(1.5rem, 3vw, 2rem);
    background: rgba(var(--two-tone-background-rgb), 0.65);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.28);
    box-shadow: 10px 10px 0 rgba(var(--two-tone-foreground-rgb), 0.18);
  }

  .style-guide__code pre {
    border-radius: 1.25rem;
    padding: 1.5rem;
    background: rgba(var(--two-tone-background-rgb), 0.85);
    color: var(--screen-ink);
    border: 2px solid rgba(var(--two-tone-foreground-rgb), 0.25);
  }

  .style-guide__code code {
    font-family: "Fira Code", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 0.95rem;
    line-height: 1.7;
  }

  .style-guide__footer-note {
    font-size: 0.85rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--screen-ink-muted);
  }
</style>

<div class="style-guide-page">
  <header class="style-guide__hero screen-panel">
    <p class="style-guide__tag">Design system</p>
    <h1 class="style-guide__title">Screen printed interface playbook</h1>
    <p class="style-guide__lead">
      The site inherits a living palette from <code>_data/background.yml</code>, blending sky anchors into a rich ink and paper
      pairing. This guide captures how those dynamic background and foreground variables map to typography, interaction, and
      reusable blocks.
    </p>
  </header>

  {% assign background = site.data.background %}
  <section class="style-guide__section" aria-labelledby="ink-and-paper">
    <div class="style-guide__section-header">
      <h2 id="ink-and-paper" class="style-guide__section-title">Ink &amp; paper system</h2>
      <p class="style-guide__section-copy">
        Every page is printed on <strong>var(--two-tone-background)</strong>, with type rendered in
        <strong>var(--two-tone-foreground)</strong>. These variables adjust automatically as the runtime samples the sky, keeping
        contrast well above AA. The swatches below resolve to the current palette.
      </p>
    </div>
    <div class="style-guide__swatch-grid">
      <article class="style-guide__swatch-card" data-sg-paper-card style="--sample-color: {{ background.color | default: '#050712' }};">
        <div class="style-guide__swatch-meta">
          <span class="style-guide__swatch-label">Paper</span>
          <span class="style-guide__swatch-name">Dynamic background</span>
        </div>
        <div class="style-guide__swatch-sample" data-sg-paper-swatch aria-hidden="true"></div>
        <dl class="style-guide__token-list">
          <div class="style-guide__token-item">
            <dt>CSS variable</dt>
            <dd><code>--two-tone-background</code></dd>
          </div>
          <div class="style-guide__token-item">
            <dt>RGB channels</dt>
            <dd><code data-sg-paper-rgb>var(--two-tone-background-rgb)</code></dd>
          </div>
          <div class="style-guide__token-item">
            <dt>Resolved hex</dt>
            <dd><code data-sg-paper-hex>{{ background.color | default: '#050712' }}</code></dd>
          </div>
        </dl>
      </article>
      <article class="style-guide__swatch-card style-guide__swatch-card--ink" data-sg-ink-card>
        <div class="style-guide__swatch-meta">
          <span class="style-guide__swatch-label">Ink</span>
          <span class="style-guide__swatch-name">Foreground accent</span>
        </div>
        <div class="style-guide__swatch-sample" data-sg-ink-swatch aria-hidden="true"></div>
        <dl class="style-guide__token-list">
          <div class="style-guide__token-item">
            <dt>CSS variable</dt>
            <dd><code>--two-tone-foreground</code></dd>
          </div>
          <div class="style-guide__token-item">
            <dt>Muted tone</dt>
            <dd><code>--two-tone-foreground-muted</code></dd>
          </div>
          <div class="style-guide__token-item">
            <dt>Resolved hex</dt>
            <dd><code data-sg-ink-hex>--</code></dd>
          </div>
        </dl>
      </article>
    </div>
  </section>

  <section class="style-guide__section" aria-labelledby="time-tracking">
    <div class="style-guide__section-header">
      <h2 id="time-tracking" class="style-guide__section-title">Time based palette</h2>
      <p class="style-guide__section-copy">
        The runtime interpolates anchor colours, calculating <strong>--two-tone-background</strong> and
        <strong>--two-tone-foreground</strong> every minute. Use the scrubber to preview the paper and ink pairings at any point in
        the day.
      </p>
    </div>
    <div class="style-guide__time-board">
      <div class="style-guide__time-panel">
        <div>
          <h3>Time of day simulator</h3>
          <p class="style-guide__section-copy">
            Drag the slider to override the runtime’s clock. The tokens above will update instantly. Reset to return to the live
            background feed.
          </p>
        </div>
        <div class="style-guide__slider-row" role="group" aria-labelledby="time-label">
          <span id="time-label">Simulated time</span>
          <span class="style-guide__time-display" data-sg-time-display>--:--</span>
        </div>
        <input
          id="sg-time-slider"
          class="style-guide__slider"
          type="range"
          min="0"
          max="1439"
          step="1"
          value="0"
          data-sg-time-slider
          aria-describedby="time-label"
        />
        <button type="button" class="style-guide__time-reset" data-sg-time-reset>Reset to live sky</button>
      </div>
      {% assign time_points = background.time_points %}
      {% if time_points %}
      <div class="style-guide__anchor-grid">
        {% for point in time_points %}
        {% assign anchor_color = point.color | default: background.color | default: '#050712' %}
        <article class="style-guide__anchor-card" data-sg-anchor-card data-color="{{ anchor_color }}">
          <header class="style-guide__anchor-heading">
            <span>{{ point.label }}</span>
            <span class="style-guide__anchor-meta">{{ point.time }}</span>
          </header>
          <div class="style-guide__anchor-sample" data-sg-anchor-swatch aria-hidden="true"></div>
          <p class="style-guide__anchor-meta" data-sg-anchor-hex>{{ anchor_color }}</p>
        </article>
        {% endfor %}
      </div>
      {% endif %}
    </div>
  </section>

  <section class="style-guide__section" aria-labelledby="typefaces">
    <div class="style-guide__section-header">
      <h2 id="typefaces" class="style-guide__section-title">Typography pairings</h2>
      <p class="style-guide__section-copy">
        Headings embrace a bold serif cut using Playfair Display, while body copy keeps Inter for clarity. Pair them with generous
        tracking and uppercase for the screen printed headline feel.
      </p>
    </div>
    <div class="style-guide__type-samples">
      <div class="style-guide__type-pairing">
        <div class="style-guide__type-heading">
          <span>Display</span>
          <h3>Serif headlines project authority.</h3>
        </div>
        <div class="style-guide__type-body">
          <p>
            Use <code>font-serif</code> with <strong>font-semibold</strong> for hero titles and section headers. Set tracking to a
            subtle negative value for dense titles, or uppercase with wide tracking for labels.
          </p>
          <p>
            Supporting copy remains <code>font-sans</code>, leaning on <strong>text-dynamic-muted</strong> so the ink colour lightens
            automatically at brighter backgrounds.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="style-guide__section" aria-labelledby="interface-blocks">
    <div class="style-guide__section-header">
      <h2 id="interface-blocks" class="style-guide__section-title">Interface blocks</h2>
      <p class="style-guide__section-copy">
        Cards, menu overlays, and calls to action reuse the ink and paper pairing. Outlined edges and offset shadows preserve the
        tactile screen print finish.
      </p>
    </div>
    <div class="style-guide__interface-grid">
      <article class="style-guide__card-demo">
        <h3>Project card</h3>
        <p>
          Combine <code>rounded-3xl</code>, <code>border-2</code>, and <code>shadow-[12px_12px_0_rgba(...)]</code> utilities with
          <strong>text-dynamic</strong> for headings and <strong>text-dynamic-muted</strong> for descriptive copy.
        </p>
        <a class="style-guide__cta" href="#">View case study</a>
      </article>
      <article class="style-guide__menu-preview">
        <h3 class="style-guide__section-title" style="font-size: 1.25rem;">Menu overlay</h3>
        <p class="style-guide__section-copy">
          Mobile navigation expands to a full-screen sheet tinted with <strong>var(--two-tone-background)</strong> and a radial ink
          mist. Items render in Playfair Display with uppercase tracking, animating in with the overlay.
        </p>
        <div class="style-guide__menu-preview-list" role="presentation">
          <span>About</span>
          <span>Projects</span>
          <span>Journal</span>
          <span>Contact</span>
        </div>
      </article>
    </div>
  </section>

  <section class="style-guide__section" aria-labelledby="code-snippets">
    <div class="style-guide__section-header">
      <h2 id="code-snippets" class="style-guide__section-title">Code toolkit</h2>
      <p class="style-guide__section-copy">
        Quickly reapply the screen printed system by composing the classes below. Code blocks stay scrollable on mobile, so long
        snippets never break the layout.
      </p>
    </div>
    <div class="style-guide__code">
      <pre><code>&lt;section class="py-20"&gt;
  &lt;div class="mx-auto max-w-6xl px-6"&gt;
    &lt;div class="grid gap-12 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]"&gt;
      &lt;header&gt;
        &lt;p class="text-xs uppercase tracking-[0.3em] text-dynamic-muted"&gt;Tagline&lt;/p&gt;
        &lt;h2 class="text-dynamic text-4xl font-semibold font-serif"&gt;Screen printed heading&lt;/h2&gt;
      &lt;/header&gt;
      &lt;div class="space-y-4 text-dynamic-muted"&gt;
        &lt;p&gt;Use --two-tone-background for surfaces and --two-tone-foreground for type.&lt;/p&gt;
        &lt;a class="inline-flex items-center gap-2 uppercase tracking-[0.2em] text-dynamic" href="#"&gt;Call to action →&lt;/a&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/section&gt;</code></pre>
      <p class="style-guide__footer-note">All typography, colours, and spacing react to the dynamic sky runtime.</p>
    </div>
  </section>
</div>

<script>
  (() => {
    const slider = document.querySelector('[data-sg-time-slider]');
    const display = document.querySelector('[data-sg-time-display]');
    const resetButton = document.querySelector('[data-sg-time-reset]');
    const paperCard = document.querySelector('[data-sg-paper-card]');
    const paperSwatch = document.querySelector('[data-sg-paper-swatch]');
    const paperHex = document.querySelector('[data-sg-paper-hex]');
    const paperRgb = document.querySelector('[data-sg-paper-rgb]');
    const inkCard = document.querySelector('[data-sg-ink-card]');
    const inkSwatch = document.querySelector('[data-sg-ink-swatch]');
    const inkHex = document.querySelector('[data-sg-ink-hex]');
    const anchorCards = Array.from(document.querySelectorAll('[data-sg-anchor-card]'));
    const MINUTES_IN_DAY = 24 * 60;
    const FALLBACK_HEX = '#050712';

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

    const setSwatch = (element, hexValue) => {
      if (!element || !hexValue) return;
      element.style.setProperty('--sample-color', hexValue);
    };

    const setInkSwatch = (element, hexValue) => {
      if (!element || !hexValue) return;
      element.style.setProperty('--sample-color', hexValue);
      element.style.background = hexValue;
    };

    const updateAnchorSwatches = () => {
      anchorCards.forEach((card) => {
        const colorHex = normalizeHex(card.getAttribute('data-color')) || FALLBACK_HEX;
        const swatch = card.querySelector('[data-sg-anchor-swatch]');
        const label = card.querySelector('[data-sg-anchor-hex]');
        if (swatch) {
          swatch.style.setProperty('--anchor-color', colorHex);
        }
        if (label) {
          label.textContent = colorHex;
        }
      });
    };

    const rgbToHex = (rgbString) => {
      if (typeof rgbString !== 'string') {
        return null;
      }
      const match = rgbString
        .trim()
        .match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
      if (!match) {
        return null;
      }
      const [, r, g, b] = match.map(Number);
      const clampChannel = (value) => Math.min(255, Math.max(0, Number(value) || 0));
      const channels = [clampChannel(r), clampChannel(g), clampChannel(b)];
      return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
    };

    const updateLiveTokens = () => {
      const computed = getComputedStyle(document.documentElement);
      const paperHexValue = normalizeHex(computed.getPropertyValue('--two-tone-background')) || FALLBACK_HEX;
      const paperRgbValue = computed.getPropertyValue('--two-tone-background-rgb').trim();
      const inkHexValue =
        normalizeHex(computed.getPropertyValue('--two-tone-foreground')) ||
        rgbToHex(computed.getPropertyValue('--two-tone-foreground')) ||
        '#fef4ec';

      if (paperCard) {
        setSwatch(paperCard, paperHexValue);
      }
      if (paperSwatch) {
        paperSwatch.style.setProperty('--sample-color', paperHexValue);
      }
      if (paperHex) {
        paperHex.textContent = paperHexValue;
      }
      if (paperRgb && paperRgbValue) {
        paperRgb.textContent = paperRgbValue;
      }
      if (inkSwatch) {
        setInkSwatch(inkSwatch, inkHexValue);
      }
      if (inkHex) {
        inkHex.textContent = inkHexValue;
      }
    };

    const formatMinutes = (minutes) => {
      const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
      const normalized = ((Math.round(safeMinutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
      const hours = Math.floor(normalized / 60);
      const mins = normalized % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const updateDisplay = (minutes) => {
      if (display) {
        display.textContent = formatMinutes(minutes);
      }
    };

    const applyOverride = (minutes) => {
      const runtime = window.__skyRuntime;
      if (!runtime) {
        return;
      }
      if (typeof runtime.setTimeOverride === 'function') {
        runtime.setTimeOverride(minutes);
      } else {
        runtime.timeOverrideMinutes = minutes;
        if (typeof runtime.applyBackground === 'function') {
          runtime.applyBackground();
        }
      }
    };

    const clearOverride = () => {
      const runtime = window.__skyRuntime;
      if (!runtime) {
        return;
      }
      if (typeof runtime.clearTimeOverride === 'function') {
        runtime.clearTimeOverride();
      } else {
        delete runtime.timeOverrideMinutes;
        if (typeof runtime.applyBackground === 'function') {
          runtime.applyBackground();
        }
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

      if (slider) {
        slider.value = String(Math.round(initialMinutes));
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
      }

      if (resetButton) {
        resetButton.addEventListener('click', () => {
          clearOverride();
        });
      }

      updateDisplay(initialMinutes);
      updateLiveTokens();

      window.addEventListener('sky:background-applied', (event) => {
        const minutes = Number.isFinite(event?.detail?.minutes) ? event.detail.minutes : null;
        if (Number.isFinite(minutes) && slider && !Number.isFinite(window.__skyRuntime?.timeOverrideMinutes)) {
          slider.value = String(Math.round(minutes));
          updateDisplay(minutes);
        }
        updateLiveTokens();
      });
    };

    const waitForRuntime = () => {
      if (window.__skyRuntime && typeof window.__skyRuntime.applyBackground === 'function') {
        initializeControls();
        updateAnchorSwatches();
      } else {
        window.requestAnimationFrame(waitForRuntime);
      }
    };

    updateAnchorSwatches();
    waitForRuntime();
  })();
</script>
