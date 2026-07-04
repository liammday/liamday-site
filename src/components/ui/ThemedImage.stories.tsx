import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemedImage } from './ThemedImage';
import odrDark from './__examples__/open-defence-radar-icon.png';

const meta = {
  title: 'UI/ThemedImage',
  component: ThemedImage,
  args: {
    // Same src both sides here just proves wiring; the swap is verified by the
    // Light decorator flipping data-theme (see below).
    dark: { src: odrDark as unknown as string },
    light: { src: odrDark as unknown as string },
    alt: 'Example icon',
    width: 128,
    height: 128,
    className: 'h-32 w-32 object-cover',
  },
} satisfies Meta<typeof ThemedImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkTheme: Story = {
  decorators: [(Story) => <div className="bg-charcoal-900 p-10" data-theme-preview="dark">{Story()}</div>],
};

export const LightTheme: Story = {
  decorators: [
    (Story) => {
      // Flip the document theme so .theme-light-only / .theme-dark-only resolve
      // to the light branch for this story.
      if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', 'light');
      return <div className="bg-charcoal-900 p-10">{Story()}</div>;
    },
  ],
};
