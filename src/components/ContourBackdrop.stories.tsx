import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContourBackdrop } from './ContourBackdrop';

const meta = {
  title: 'Backdrops/ContourBackdrop',
  component: ContourBackdrop,
  parameters: { layout: 'fullscreen' },
  // A sized, relatively-positioned stage; the canvas fills it. WebGPU only —
  // in a browser without navigator.gpu the story shows the bare stage, which
  // is exactly the production fallback.
  decorators: [
    (Story) => (
      <div className="relative min-h-[70vh] overflow-hidden bg-charcoal-900 text-aluminum-100">
        {Story()}
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="eyebrow text-ember-200">404</p>
          <h1 className="type-title">Page not found</h1>
          <p className="t-readout text-aluminum-400">[ NO FIX · OFF THE CHART ]</p>
        </div>
      </div>
    ),
  ],
  args: { className: 'absolute inset-0 z-0' },
} satisfies Meta<typeof ContourBackdrop>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default density: 22 levels, every fifth an ember index contour. Move the cursor to carry the light. */
export const Default: Story = {};

/** Coarser terrain, fewer lines — reads as a large-scale map. */
export const Sparse: Story = { args: { scale: 0.9, levels: 12 } };

/** Finer terrain, denser lines — busier, closer to a 1:25k sheet. */
export const Dense: Story = { args: { scale: 2.6, levels: 34 } };
