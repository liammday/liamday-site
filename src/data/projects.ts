import appProjectsYaml from './app_projects.yml';

export interface AppProject {
  name: string;
  platform?: string;
  status?: string;
  order: number;
  date_started?: string;
  date_finished?: string;
  tags?: string[];
  icon?: string;
  icon_webp?: string;
  link?: string;
  link_label?: string;
  audience?: string;
  summary?: string;
  technologies?: string[];
  features?: string[];
}

export const appProjects = (appProjectsYaml as AppProject[]).filter(Boolean);
