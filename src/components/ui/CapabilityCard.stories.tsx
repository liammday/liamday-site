import type { Meta, StoryObj } from '@storybook/react-vite';
import { CapabilityCard } from './CapabilityCard';

const meta = {
  title: 'UI/CapabilityCard',
  component: CapabilityCard,
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
  args: {
    title: 'Applied AI Building (Claude + MCP)',
    description:
      'Daily Claude and MCP development including a personal orchestration system, self-authored MCP, agent skills, and AI-paired iOS engineering through Claude Code.',
  },
} satisfies Meta<typeof CapabilityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
