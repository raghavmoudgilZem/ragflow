import type { Meta, StoryObj } from '@storybook/react';

import { IngestionStatus } from '@modules/datasets/types/ingestion.types';
import { JobProgress } from './index';

const meta: Meta<typeof JobProgress> = {
  title: 'Components/Molecules/JobProgress',
  component: JobProgress,
  args: {
    progress: 0.4,
  },
  argTypes: {
    status: {
      control: 'select',
      options: Object.values(IngestionStatus),
    },
    progress: {
      control: { type: 'range', min: -1, max: 1, step: 0.01 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof JobProgress>;

export const Unstart: Story = {
  args: {
    status: IngestionStatus.Unstart,
    progress: 0,
  },
};

export const Schedule: Story = {
  args: {
    status: IngestionStatus.Schedule,
    progress: 0,
  },
};

export const Running: Story = {
  args: {
    status: IngestionStatus.Running,
    progress: 0.42,
  },
};

export const Cancel: Story = {
  args: {
    status: IngestionStatus.Cancel,
    progress: 0.3,
  },
};

export const Done: Story = {
  args: {
    status: IngestionStatus.Done,
    progress: 1,
  },
};

export const Fail: Story = {
  args: {
    status: IngestionStatus.Fail,
    progress: -1,
  },
};

export const FailWithMessage: Story = {
  args: {
    status: IngestionStatus.Fail,
    progress: -1,
    errorMessage:
      'Worker crashed while tokenizing page 12: out of memory after 4 retries.',
  },
};

export const WithOverriddenLabel: Story = {
  args: {
    status: IngestionStatus.Running,
    progress: 0.6,
    label: '解析中',
  },
};
