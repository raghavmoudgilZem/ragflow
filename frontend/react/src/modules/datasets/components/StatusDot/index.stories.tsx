import type { Meta, StoryObj } from '@storybook/react';

import { IngestionStatus } from '../../types/ingestion.types';
import { StatusDot } from './index';

const meta: Meta<typeof StatusDot> = {
  title: 'Components/Atoms/StatusDot',
  component: StatusDot,
  argTypes: {
    status: {
      control: 'select',
      options: Object.values(IngestionStatus),
    },
  },
};

export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Pending: Story = {
  args: { status: IngestionStatus.Unstart },
};

export const Schedule: Story = {
  args: { status: IngestionStatus.Schedule },
};

export const Parsing: Story = {
  args: { status: IngestionStatus.Running },
};

export const Canceled: Story = {
  args: { status: IngestionStatus.Cancel },
};

export const Success: Story = {
  args: { status: IngestionStatus.Done },
};

export const Failed: Story = {
  args: { status: IngestionStatus.Fail },
};
