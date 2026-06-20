import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetaList } from './MetaList';

const meta = {
  title: 'UI/MetaList',
  component: MetaList,
  args: {
    items: [
      { label: 'Role', value: 'Architect and engineer (AI-paired)' },
      { label: 'Year', value: '2026' },
      { label: 'Client', value: 'Personal applied-AI build' },
      { label: 'Outcome', value: 'Live, multi-feed, self-hosted' },
    ],
  },
} satisfies Meta<typeof MetaList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
