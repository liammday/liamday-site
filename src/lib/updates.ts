import { getCollection } from 'astro:content';

/** The shape UpdateTimeline renders — one release/update entry. */
export interface ProjectUpdate {
  date?: Date;
  id?: string;
  title: string;
  summary?: string;
  content?: string;
  version?: string;
}

/**
 * Load a project's release/update entries from the `updates` content
 * collection (one file per release under src/content/updates/<app>/),
 * newest first. `app` is the project entry's id (e.g. "peaking").
 *
 * The HTML anchor id comes from the `anchor` frontmatter field when present,
 * otherwise it is derived from the version (v1.11 -> v1-11); entries with
 * neither render without an anchor, as before.
 */
export async function getProjectUpdates(app: string): Promise<ProjectUpdate[]> {
  const entries = await getCollection('updates', ({ data }) => data.app === app);
  return entries
    .map((entry) => ({
      date: entry.data.date,
      id: entry.data.anchor ?? entry.data.version?.replace(/\./g, '-'),
      title: entry.data.title,
      summary: entry.data.summary,
      content: entry.body,
      version: entry.data.version,
    }))
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
}
