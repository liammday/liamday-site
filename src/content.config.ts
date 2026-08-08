import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    summary: z.string().optional(),
    role: z.string().optional(),
    year: z.union([z.number(), z.string()]).optional(),
    client: z.string().optional(),
    outcome: z.string().optional(),
    order: z.number().optional(),
    type: z.string().optional(),
    image: z.string().optional(),
    hero: z.boolean().optional(),
    hero_image: z.string().optional(),
    hero_image_webp: z.string().optional(),
    hero_image_light: z.string().optional(),
    hero_image_light_webp: z.string().optional(),
    hero_image_dark: z.string().optional(),
    hero_image_dark_webp: z.string().optional(),
    hero_image_width: z.number().optional(),
    hero_image_height: z.number().optional(),
    hero_image_alt: z.string().optional(),
    hero_image_caption: z.string().optional(),
    date_published: z.coerce.date().optional(),
    date_updated: z.coerce.date().optional(),
    period: z.string().optional(),
    location: z.string().optional(),
    nav: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
    links: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
    kind: z.enum(['app']).optional(),
    slug: z.string().optional(),
    subtitle: z.string().optional(),
    compatibility: z.string().optional(),
    app_store_url: z.string().optional(),
    testflight_url: z.string().optional(),
    github_url: z.string().optional(),
    screenshots: z
      .array(
        z.object({
          light: z.string(),
          light_webp: z.string().optional(),
          dark: z.string().optional(),
          dark_webp: z.string().optional(),
          alt: z.string(),
          caption: z.string().optional(),
          version: z.string().optional(),
          captured: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

// One file per release/update, machine-appendable: a new entry is a new file at
// src/content/updates/<app>/<slug>.md — no hand-written frontmatter to rewrite.
// `app` matches the project entry's id (e.g. "peaking"). The body is the entry
// prose (rendered through the same marked pipeline as before via entry.body).
// `anchor` is the HTML anchor id; when omitted it is derived from the version
// (v1.11 -> v1-11), so versioned entries rarely need it.
const updates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/updates' }),
  schema: z.object({
    app: z.string(),
    version: z.string().optional(),
    date: z.coerce.date(),
    title: z.string(),
    summary: z.string().optional(),
    anchor: z.string().optional(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
  }),
});

export const collections = { projects, posts, updates };
