import type { Meta, StoryObj } from '@storybook/react';

import { IngestionStatus } from '../../types/ingestion.types';
import type { DocumentProgress } from '../../types/ingestion.types';
import { DocumentProgressDetail } from './index';

const baseRecord: DocumentProgress = {
  id: 'doc-1',
  name: 'quarterly-report.pdf',
  run: IngestionStatus.Done,
  progress: 1,
  progress_msg: 'Task dispatched\nParsing finished\n',
  chunk_num: 7,
  token_num: 1840,
  process_duration: 12.4,
};

const buildRecord = (overrides: Partial<DocumentProgress>): DocumentProgress => ({
  ...baseRecord,
  ...overrides,
});

const meta: Meta<typeof DocumentProgressDetail> = {
  title: 'Components/Molecules/DocumentProgressDetail',
  component: DocumentProgressDetail,
};

export default meta;

type Story = StoryObj<typeof DocumentProgressDetail>;

export const Success: Story = {
  args: { record: baseRecord },
};

export const Parsing: Story = {
  args: {
    record: buildRecord({
      run: IngestionStatus.Running,
      progress: 0.42,
      progress_msg: 'Task dispatched\nParsing page 12 of 30\n',
      process_duration: 4.2,
    }),
  },
};

export const WithErrorLine: Story = {
  args: {
    record: buildRecord({
      run: IngestionStatus.Fail,
      progress: -1,
      progress_msg:
        'Task dispatched\n[ERROR] Tokenizer ran out of memory\nGiving up after 3 attempts\n',
    }),
  },
};

export const NoMessage: Story = {
  args: {
    record: buildRecord({
      run: IngestionStatus.Unstart,
      progress: 0,
      progress_msg: '',
      process_duration: 0,
    }),
  },
};
