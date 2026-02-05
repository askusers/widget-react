import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from '../src/components/Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    delay: { control: 'number' },
    content: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <button type="button">Hover me</button>,
  },
};

export const LongContent: Story = {
  args: {
    content: 'This tooltip contains a longer description that provides additional context about the element it is attached to.',
    children: <button type="button">Hover for details</button>,
  },
};

export const CustomDelay: Story = {
  args: {
    content: 'This tooltip appears after 500ms',
    delay: 500,
    children: <button type="button">Hover me (500ms delay)</button>,
  },
};
