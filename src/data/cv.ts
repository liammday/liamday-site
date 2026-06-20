import cvYaml from './cv.yml';

export interface HeroStat {
  label: string;
  value: string;
  detail: string;
}
export interface Competency {
  title: string;
  description: string;
}
export interface Role {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights?: string[];
}
export interface Qualification {
  qualification: string;
  institution: string;
  period: string;
}
export interface CV {
  hero_badge: string;
  profile: string;
  hero_stats: HeroStat[];
  competencies: Competency[];
  employment: Role[];
  education: Qualification[];
  certifications: Qualification[];
}

export const cv = cvYaml as CV;
