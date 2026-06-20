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
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [yaml(), tailwindcss()],
  },
});
