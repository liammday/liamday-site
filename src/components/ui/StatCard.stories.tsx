import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';

const meta = {
  title: 'UI/StatCard',
  component: StatCard,
  decorators: [(Story) => <div className="max-w-xs">{Story()}</div>],
  args: {
    label: 'Experience',
    value: '12 years',
    detail: 'Operational leadership and digital product delivery.',
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
