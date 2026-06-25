import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarsBackground } from './StarsBackground';

const meta = {
  title: 'UI/StarsBackground',
  component: StarsBackground,
  parameters: { layout: 'fullscreen' },
  // Give the backdrop a sized, relatively-positioned stage to fill.
  decorators: [
    (Story) => (
      <div className="relative min-h-[70vh] bg-charcoal-900 text-aluminum-100">{Story()}</div>
    ),
  ],
  args: {
    className: 'absolute inset-0',
    factor: 0.05,
    speed: 50,
  },
} satisfies Meta<typeof StarsBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Backdrop usage with foreground content layered on top. Move the cursor to see the parallax. */
export const Default: Story = {
  args: {
    children: (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="inline-flex items-center rounded-full border border-ember-400/30 bg-ember-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-ember-200">
          Stars background
        </span>
        <h2 className="text-4xl font-semibold text-aluminum-100">Move your cursor</h2>
        <p className="max-w-md text-aluminum-300">
          Three drifting layers with a spring-like pointer parallax. Pauses for reduced-motion users.
        </p>
      </div>
    ),
  },
};

/** Slower drift with a stronger parallax pull. */
export const SlowAndDeep: Story = {
  args: { speed: 90, factor: 0.12 },
};

/** Parallax disabled — pure drift only. */
export const NoParallax: Story = {
  args: { factor: 0 },
};
