---
layout: default
title: Style Guide
permalink: /style-guide/
---
<section class="bg-white py-16">
  <div class="mx-auto flex max-w-5xl flex-col gap-12 px-6">
    <header class="space-y-4">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Foundations</p>
      <h1 class="text-3xl font-bold text-slate-900 md:text-4xl">Interface style guide</h1>
      <p class="text-lg text-slate-600">
        A lightweight reference for the site’s core visual language. The system leans on Tailwind CSS defaults to keep the
        presentation clean and flexible while we rebuild the experience.
      </p>
    </header>

    <section class="space-y-6">
      <h2 class="text-2xl font-semibold text-slate-900">Color palette</h2>
      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="h-16 w-full rounded-lg bg-slate-900"></div>
          <p class="mt-4 text-sm font-semibold text-slate-900">Primary text</p>
          <p class="text-sm text-slate-600">Slate 900</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="h-16 w-full rounded-lg bg-slate-100"></div>
          <p class="mt-4 text-sm font-semibold text-slate-900">Surface</p>
          <p class="text-sm text-slate-600">Slate 100</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="h-16 w-full rounded-lg bg-blue-500"></div>
          <p class="mt-4 text-sm font-semibold text-slate-900">Accent</p>
          <p class="text-sm text-slate-600">Blue 500</p>
        </div>
      </div>
      <p class="text-sm text-slate-500">
        Tailwind’s extended slate palette anchors the neutral look. Blue provides a simple accent for interactive states.
      </p>
    </section>

    <section class="space-y-6">
      <h2 class="text-2xl font-semibold text-slate-900">Typography</h2>
      <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 class="text-3xl font-bold text-slate-900">Heading example</h3>
        <p class="text-lg text-slate-600">
          Body copy is set in the system sans-serif stack for clarity. Use Tailwind’s spacing scale to maintain relaxed line
          lengths and breathing room between paragraphs.
        </p>
        <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Supporting label text</p>
      </div>
    </section>

    <section class="space-y-6">
      <h2 class="text-2xl font-semibold text-slate-900">Components</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <p class="text-sm font-semibold text-slate-900">Buttons</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <a class="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              href="#">Secondary</a>
            <a class="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              href="#">Primary</a>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <p class="text-sm font-semibold text-slate-900">Cards</p>
          <div class="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 class="text-lg font-semibold text-slate-900">Simple card</h3>
            <p class="text-sm text-slate-600">
              Use card containers to group related content. They rely on subtle borders and background shifts rather than heavy
              shadows.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</section>
