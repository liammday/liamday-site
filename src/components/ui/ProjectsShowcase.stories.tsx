import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AppProject } from '../../data/projects';
import { ProjectsShowcase } from './ProjectsShowcase';
import cpnIcon from './__examples__/career-pivot-navigator-icon.png';
import podforgeIcon from './__examples__/podforge-icon.png';
import peakingIcon from './__examples__/PeakingAppIcon-256.png';

const projects: AppProject[] = [
  {
    name: 'Career Pivot Navigator',
    platform: 'Applied AI · Grounded MCP',
    status: 'v0, open source',
    order: 1,
    date_started: '2026-05',
    tags: ['python', 'applied-ai', 'mcp', 'defence', 'open-source'],
    icon: cpnIcon as unknown as string,
    link: '/projects/career-pivot-navigator/',
    link_label: 'Read the case study',
    audience: 'A governed career-transition tool for UK service leavers, grounded in cited open data.',
    summary: 'Runs inside an ordinary person’s own Claude, with no LLM API and no per-token cost.',
    technologies: ['Python', 'MCP', 'Claude Skill'],
  },
  {
    name: 'PodForge',
    platform: 'Personal Applied AI · Self-hosted',
    status: 'Live, multi-feed',
    order: 3,
    date_started: '2026-03',
    tags: ['applied-ai', 'mcp', 'python', 'self-hosted', 'personal'],
    icon: podforgeIcon as unknown as string,
    link: '/projects/podforge/',
    link_label: 'Read the case study',
    audience: 'A self-hosted, multi-feed podcast generator — a Claude-first alternative to NotebookLM.',
    summary: 'Claude writes the script, a Mac renders it with a local voice, and a Raspberry Pi publishes the RSS.',
    technologies: ['Claude (Skill-orchestrated)', 'MCP', 'Kokoro local TTS'],
  },
  {
    name: 'Peaking',
    platform: 'iOS',
    status: 'Active development',
    order: 5,
    date_started: '2024-06',
    tags: ['swift', 'ios', 'mapkit', 'cloudkit', 'personal'],
    icon: peakingIcon as unknown as string,
    link: 'https://testflight.apple.com/join/2T6FwyZF',
    link_label: 'Beta test this app',
    audience: 'For hikers and mountaineers who track summits, routes, and collection progress.',
    summary: 'A mountain companion app for discovering peaks and verifying summits from route data.',
    technologies: ['SwiftUI', 'SwiftData', 'CloudKit', 'MapKit'],
  },
];

const meta = {
  title: 'UI/ProjectsShowcase',
  component: ProjectsShowcase,
  parameters: { layout: 'fullscreen' },
  args: { projects },
} satisfies Meta<typeof ProjectsShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
