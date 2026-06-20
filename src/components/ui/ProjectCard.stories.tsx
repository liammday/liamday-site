import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AppProject } from '../../data/projects';
import { ProjectCard } from './ProjectCard';
import odrIcon from './__examples__/open-defence-radar-icon.png';
import peakingIcon from './__examples__/PeakingAppIcon-256.png';

const odr: AppProject = {
  name: 'Open Defence Radar',
  platform: 'Applied AI · Grounded RAG',
  status: 'v1.0.0, open source',
  order: 2,
  date_started: '2026-04',
  tags: ['python', 'applied-ai', 'mcp'],
  icon: odrIcon as unknown as string,
  link: '/projects/open-defence-radar/',
  link_label: 'Read the case study',
  audience: 'A grounded retrieval engine over open UK defence-and-security data, where every answer cites its sources.',
  summary:
    'A clearance-safe RAG system over open government data, exposed as an MCP tool, a CLI, and a web console with a trust dashboard. Every claim traces to a fetched, licensed source.',
  technologies: ['Python', 'Model Context Protocol (MCP)', 'FastAPI', 'SQLite · sqlite-vec'],
  features: [
    'Grounded synthesis where every claim carries a citation to a fetched, licensed source.',
    'CI-gated evaluation harness with floors that fail the build on regression.',
  ],
};

const peaking: AppProject = {
  name: 'Peaking',
  platform: 'iOS',
  status: 'Active development',
  order: 5,
  date_started: '2024-06',
  tags: ['swift', 'ios'],
  icon: peakingIcon as unknown as string,
  link: 'https://testflight.apple.com/join/2T6FwyZF',
  link_label: 'Beta test this app',
  audience: 'For hikers and mountaineers who track summits, routes, and collection progress.',
  summary: 'A mountain companion app for discovering peaks and verifying summits from route data.',
  technologies: ['SwiftUI', 'SwiftData', 'CloudKit', 'MapKit'],
};

const meta = {
  title: 'UI/ProjectCard',
  component: ProjectCard,
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
  args: { project: odr },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CaseStudy: Story = {};
export const ExternalLink: Story = { args: { project: peaking } };
export const NoIcon: Story = { args: { project: { ...odr, icon: undefined, icon_webp: undefined } } };
