import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { ExternalLinkIcon } from './icons';

const meta = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'pill'] },
  },
  args: { children: 'View experience', href: '#' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: "Let's connect" } };
export const Pill: Story = {
  args: { variant: 'pill', children: 'Read the case study', icon: <ExternalLinkIcon /> },
};

export const Row: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary" href="#">
        Primary
      </Button>
      <Button variant="secondary" href="#">
        Secondary
      </Button>
      <Button variant="pill" href="#" icon={<ExternalLinkIcon />}>
        Pill
      </Button>
    </div>
  ),
};
