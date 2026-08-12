import type { Meta, StoryObj } from '@storybook/react';

import { IngestionStatus } from '../../types/ingestion.types';
import type { DocumentProgress } from '../../types/ingestion.types';
import { DocumentParsingStatus } from './index';

const baseRecord: DocumentProgress = {
  id: 'doc-1',
  name: 'quarterly-report.pdf',
  run: IngestionStatus.Running,
  progress: 0.42,
  progress_msg: 'Task dispatched\nParsing page 12 of 30\n',
  chunk_num: 7,
  token_num: 1840,
  process_duration: 12.4,
};

const buildRecord = (overrides: Partial<DocumentProgress>): DocumentProgress => ({
  ...baseRecord,
  ...overrides,
});

const meta: Meta<typeof DocumentParsingStatus> = {
  title: 'Components/Molecules/DocumentParsingStatus',
  component: DocumentParsingStatus,
};

export default meta;

type Story = StoryObj<typeof DocumentParsingStatus>;

export const Pending: Story = {
  args: {
    record: buildRecord({
      run: IngestionStatus.Unstart,
      progress: 0,
      progress_msg: '',
      process_duration: 0,
    }),
  },
};

export const Parsing: Story = {
  args: {
    record: buildRecord({ run: IngestionStatus.Running, progress: 0.42 }),
  },
};

export const Success: Story = {
  args: {
    record: buildRecord({
      run: IngestionStatus.Done,
      progress: 1,
      progress_msg: 'Task dispatched\nParsing finished\n',
    }),
  },
};

export const Failed: Story = {
  args: {
    record: buildRecord({
      run: IngestionStatus.Fail,
      progress: -1,
      progress_msg:
        'Task dispatched\n[ERROR] Tokenizer ran out of memory\nGiving up after 3 attempts\n',
    }),
  },
};

export const Canceled: Story = {
  args: {
    record: buildRecord({
      run: IngestionStatus.Cancel,
      progress: 0.3,
      progress_msg: 'Cancelled by user\n',
    }),
  },
};
