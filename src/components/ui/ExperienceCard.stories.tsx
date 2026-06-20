import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExperienceCard } from './ExperienceCard';

const meta = {
  title: 'UI/ExperienceCard',
  component: ExperienceCard,
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
  args: {
    title: 'Technical Product Specialist',
    company: 'Outdooractive',
    location: 'Remote (UK · Immenstadt, Germany)',
    period: 'Sep 2023 – Present',
    highlights: [
      'Contributed to product roadmap prioritisation across B2C and partner-facing areas using RICE and MoSCoW.',
      'Reduced feature-request support tickets by 59% through structured discovery and user research.',
    ],
  },
} satisfies Meta<typeof ExperienceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
