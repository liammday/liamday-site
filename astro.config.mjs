// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.liamday.co.uk',
  // Jekyll used pretty permalinks (/projects/name/); keep trailing slashes so
  // existing canonical URLs and inbound links resolve identically.
  trailingSlash: 'always',
  // Preserve the old Jekyll date-based URL for the one migrated blog post.
  redirects: {
    '/2023/07/01/coaching-design-teams/': '/posts/coaching-design-teams/',
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [yaml(), tailwindcss()],
  },
});
