import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeading } from './SectionHeading';

const meta = {
  title: 'UI/SectionHeading',
  component: SectionHeading,
  args: {
    title: 'Core capabilities',
    intro: 'A blend of operational discipline and modern product practice to move complex teams forward with clarity.',
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { title: 'Projects', intro: undefined } };
