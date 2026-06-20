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
    updates: z
      .array(
        z.object({
          date: z.coerce.date().optional(),
          id: z.string().optional(),
          title: z.string(),
          summary: z.string().optional(),
          content: z.string().optional(),
        }),
      )
      .optional(),
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

export const collections = { projects, posts };
