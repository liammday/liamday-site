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
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: rgba(255, 255, 255, 0.85);
    padding: 1.75rem;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  }

  .sg-background-card__swatch {
    width: 100%;
    height: 8rem;
    border-radius: 1.25rem;
    background: var(--sg-background-color, #030712);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
  }

  .sg-background-card__meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
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
    color: #475569;
  }

  .sg-token-list__item dt {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #334155;
  }

  .sg-token-list__item code {
    font-size: 0.85rem;
    font-weight: 600;
    background: rgba(15, 23, 42, 0.08);
    border-radius: 0.4rem;
    padding: 0.15rem 0.5rem;
    color: #0f172a;
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
        The site now anchors to a single atmospheric backdrop defined in
        <code class="rounded bg-slate-900/10 px-1.5 py-0.5 text-sm text-slate-900">_data/background.yml</code>.
        Updating that file keeps the production background, this style guide, and dependent scripts fully in sync.
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
        style="--sg-background-color: {{ background.color | default: '#030712' }};"
      >
        <div class="sg-background-card__meta">
          <h3 class="text-lg font-semibold text-slate-900">{{ background.label | default: 'Site background' }}</h3>
          <p class="text-sm text-slate-600">{{ background.description | default: 'Primary background colour applied across the site.' }}</p>
        </div>
        <div class="sg-background-card__swatch" aria-hidden="true"></div>
        <dl class="sg-token-list">
          <div class="sg-token-list__item">
            <dt>Source of truth</dt>
            <dd><code>_data/background.yml</code></dd>
          </div>
          <div class="sg-token-list__item">
            <dt>Hex value</dt>
            <dd><code>{{ background.color | default: '#030712' }}</code></dd>
          </div>
          <div class="sg-token-list__item">
            <dt>CSS variable</dt>
            <dd><code>--sky-background-color</code></dd>
          </div>
          <div class="sg-token-list__item">
            <dt>Computed RGB</dt>
            <dd><code>var(--sky-background-rgb)</code></dd>
          </div>
        </dl>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
        <h3 class="text-base font-semibold text-slate-900">Dynamic CSS variables</h3>
        <dl class="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt class="font-semibold text-slate-900">--sky-background-color</dt>
            <dd>Static backdrop shared between the site and documentation. Update via <code class="font-mono text-xs text-slate-500">_data/background.yml</code>.</dd>
          </div>
          <div>
            <dt class="font-semibold text-slate-900">--sky-background-rgb</dt>
            <dd>Pre-calculated RGB channel values for WebGL and canvas effects.</dd>
          </div>
          <div>
            <dt class="font-semibold text-slate-900">--dynamic-text-on-background</dt>
            <dd>Primary type colour that adapts based on the background’s luminance.</dd>
          </div>
          <div>
            <dt class="font-semibold text-slate-900">--dynamic-glass-background</dt>
            <dd>Controls glassmorphism surfaces, ensuring cards stay legible against the midnight base.</dd>
          </div>
          <div>
            <dt class="font-semibold text-slate-900">--dynamic-control-surface</dt>
            <dd>Base background for buttons, chips, and interactive controls layered on glass panels.</dd>
          </div>
        </dl>
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
    <div class="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Headings</p>
        <h1 class="text-dynamic text-4xl font-semibold sm:text-5xl">H1 – Impact headline</h1>
        <h2 class="text-dynamic text-3xl font-semibold sm:text-4xl">H2 – Section title</h2>
        <h3 class="text-dynamic text-2xl font-semibold">H3 – Card or panel title</h3>
      </div>
      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Body copy</p>
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
    <div class="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="flex flex-wrap items-center gap-4">
        <a
          class="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-soft-xl transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          href="#"
        >Primary action</a>
        <a
          class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
      <p class="text-sm text-slate-600">
        Controls inherit stateful colours from the CSS custom properties updated by <code class="font-mono text-xs text-slate-500">applyDynamicPalette</code> in <code class="font-mono text-xs text-slate-500">_layouts/default.html</code>.
      </p>
    </div>
  </section>

  <section class="grid gap-10 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-start">
    <div class="space-y-4">
      <h2 class="text-dynamic text-2xl font-semibold">Cards &amp; glass surfaces</h2>
      <p class="text-dynamic-muted text-base leading-relaxed">
        Two primary surface treatments are available: frosted glass for hero panels and solid white cards for dense content. Mix them to create visual hierarchy.
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
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Solid card</p>
        <h3 class="text-slate-900 text-xl font-semibold">Supporting detail</h3>
        <p class="mt-3 text-base text-slate-600">
          Solid cards are ideal for structured lists, metrics, and dense content that benefits from a calm backdrop.
        </p>
        <ul class="mt-4 space-y-2 text-sm text-slate-500">
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
    <div class="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
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
      <pre class="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100"><code>&lt;article class=&quot;group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl&quot;&gt;
  &lt;h3 class=&quot;text-xl font-semibold text-slate-900 group-hover:text-brand&quot;&gt;Card title&lt;/h3&gt;
  &lt;p class=&quot;mt-3 text-base text-slate-600&quot;&gt;Body copy for a supporting card.&lt;/p&gt;
  &lt;span class=&quot;mt-4 inline-flex items-center text-sm font-semibold text-brand&quot;&gt;Call to action →&lt;/span&gt;
&lt;/article&gt;</code></pre>
    </div>
  </section>
</div>

