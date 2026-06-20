import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';

const meta = {
  title: 'UI/Tag',
  component: Tag,
  args: { children: 'SwiftUI' },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const List: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-2">
      {['SwiftUI', 'SwiftData', 'CloudKit', 'MapKit', 'HealthKit'].map((t) => (
        <Tag as="li" key={t}>
          {t}
        </Tag>
      ))}
    </ul>
  ),
};
