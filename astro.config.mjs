// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.liamday.co.uk',
  // Honour a harness/CI-assigned port (Astro ignores PORT by default). Local
  // `npm run dev` behaviour is unchanged — defaults to 4321 when PORT is unset.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : {},
  // Jekyll used pretty permalinks (/projects/name/); keep trailing slashes so
  // existing canonical URLs and inbound links resolve identically.
  trailingSlash: 'always',
  // Dev-only overlay (island inspector / audits); never ships to production.
  // Disabled to keep the preview — and screenshots — clean.
  devToolbar: { enabled: false },
  // Preserve the old Jekyll date-based URL for the one migrated blog post.
  redirects: {
    '/2023/07/01/coaching-design-teams/': '/posts/coaching-design-teams/',
  },
  // Self-hosted typography via the stable Astro Fonts API. Downloaded and
  // cached at build so fonts serve from our own domain (privacy + CWV), with
  // preload links and metric-matched fallbacks generated automatically.
  // Consumed in CSS through the --ff-* variables (see global.css @theme).
  //   --ff-display → Fraunces      (headings; editorial variable serif)
  //   --ff-body    → Hanken Grotesk (body/UI; humanist grotesque)
  //   --ff-mono    → JetBrains Mono (labels, code)
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Fraunces',
      cssVariable: '--ff-display',
      weights: [400, 600, 700, 900],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Hanken Grotesk',
      cssVariable: '--ff-body',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--ff-mono',
      weights: [500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['SF Mono', 'Menlo', 'Consolas', 'monospace'],
    },
  ],
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [yaml(), tailwindcss()],
  },
});
