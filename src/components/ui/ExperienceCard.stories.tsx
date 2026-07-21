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

export const MilitaryRole: Story = {
  args: {
    title: 'Technical Coordinator',
    appointment: 'Regimental Signals Officer',
    company: "British Army - 1st Bn Duke of Lancaster's Regiment",
    location: 'Chester, UK',
    period: 'Jul 2018 – Jul 2020',
    highlights: [
      'Coordinated secure communications infrastructure across a regiment of 500+ personnel.',
      'Increased trained communication specialists from 2 to 8 per 30-person team.',
    ],
  },
};
