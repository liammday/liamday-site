import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactSection } from './ContactSection';

const meta = {
  title: 'UI/ContactSection',
  component: ContactSection,
  parameters: { layout: 'fullscreen' },
  args: {
    email: 'liam@liamday.co.uk',
    linkedin: 'https://www.linkedin.com/in/liammday/',
    github: 'https://github.com/liammday',
  },
} satisfies Meta<typeof ContactSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
