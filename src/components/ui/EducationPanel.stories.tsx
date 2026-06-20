import type { Meta, StoryObj } from '@storybook/react-vite';
import { EducationPanel } from './EducationPanel';

const meta = {
  title: 'UI/EducationPanel',
  component: EducationPanel,
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
  args: {
    heading: 'Education',
    items: [
      { qualification: 'MBA, Technology Management (in progress)', institution: 'Open University', period: '2022 – 2026 (expected)' },
      { qualification: "Queen's Commission", institution: 'Royal Military Academy Sandhurst', period: '2013 – 2014' },
      { qualification: 'BSc International Relations, 2:1', institution: 'University of Southampton', period: '2010 – 2013' },
    ],
  },
} satisfies Meta<typeof EducationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
