import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hero } from './Hero';

const meta = {
  title: 'UI/Hero',
  component: Hero,
  parameters: { layout: 'fullscreen' },
  args: {
    badge: 'Technical Product Builder · Applied AI',
    profileText:
      'Technical product builder with 12 years across British Army operational command, geospatial product at consumer scale, and daily Applied AI building with Claude and MCP. UK security cleared.',
    email: 'liam@liamday.co.uk',
    stats: [
      { label: 'Experience', value: '12 years', detail: 'Operational leadership and digital product delivery.' },
      { label: 'Current focus', value: 'Applied AI building', detail: 'Daily Claude and MCP development.' },
      { label: 'Studies', value: 'MBA candidate', detail: 'Technology Management, Open University.' },
      { label: 'Based in', value: 'Winchester, UK', detail: 'UK citizen, security cleared.' },
    ],
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
