import type { Meta, StoryObj } from '@storybook/react-vite';
import { SurfacePanel } from './SurfacePanel';

const meta = {
  title: 'UI/SurfacePanel',
  component: SurfacePanel,
} satisfies Meta<typeof SurfacePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'p-6 max-w-sm',
    children: (
      <>
        <p className="text-sm uppercase tracking-[0.3em] text-aluminum-400">Surface panel</p>
        <p className="mt-3 text-2xl font-semibold text-aluminum-100">Hover me</p>
        <p className="mt-2 text-sm text-aluminum-400">Ember ring and spotlight glow on hover.</p>
      </>
    ),
  },
};
