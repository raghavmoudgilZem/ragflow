import type { IDataset } from './handler.js';

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  errors: string[];
  data: T;
}

export const IngestionStatus = {
  Unstart: '0',
  Running: '1',
  Cancel: '2',
  Done: '3',
  Fail: '4',
  Schedule: '5',
} as const;

export type IngestionStatus =
  (typeof IngestionStatus)[keyof typeof IngestionStatus];

export interface DocumentProgress {
  id: string;
  name: string;
  run: IngestionStatus;
  progress: number;
  progress_msg: string;
  chunk_num: number;
  token_num: number;
  process_duration: number;
}

export interface IngestionSummary {
  doc_num: number;
  chunk_num: number;
  token_num: number;
  finished: number;
  processing: number;
  failed: number;
}

export interface IngestionLog {
  id: string;
  document_name: string;
  run: IngestionStatus;
  message: string;
  create_time: number;
  duration: number;
}

interface RunningSimulation {
  duration_ms: number;
  start_progress: number;
  target_chunk_num: number;
  target_token_num: number;
  running_message: string;
}

interface SeedDocument {
  document: DocumentProgress;
  simulation?: RunningSimulation;
}

const WORKER_FAILURE_MESSAGE =
  'Task failed after 3 retries: the embedding model endpoint returned HTTP 429 (rate limit exceeded) while embedding chunk 87 of 214. The upstream provider reported "requests per minute quota exhausted for model text-embedding-3-large". Reduce the batch size in the parser configuration, or wait for the quota window to reset, then re-run this document.';

const SIMULATION_STARTED_AT = Date.now();

const seedDocuments: SeedDocument[] = [
  {
    document: {
      id: 'doc-001',
      name: 'quarterly-financial-report.pdf',
      run: IngestionStatus.Running,
      progress: 0,
      progress_msg: '',
      chunk_num: 0,
      token_num: 0,
      process_duration: 0,
    },
    simulation: {
      duration_ms: 45000,
      start_progress: 0.08,
      target_chunk_num: 214,
      target_token_num: 51360,
      running_message: 'Embedding chunks',
    },
  },
  {
    document: {
      id: 'doc-002',
      name: 'employee-handbook.docx',
      run: IngestionStatus.Running,
      progress: 0,
      progress_msg: '',
      chunk_num: 0,
      token_num: 0,
      process_duration: 0,
    },
    simulation: {
      duration_ms: 20000,
      start_progress: 0,
      target_chunk_num: 96,
      target_token_num: 18240,
      running_message: 'Chunking document',
    },
  },
  {
    document: {
      id: 'doc-003',
      name: 'onboarding-checklist.md',
      run: IngestionStatus.Schedule,
      progress: 0,
      progress_msg: 'Queued behind 2 running tasks',
      chunk_num: 0,
      token_num: 0,
      process_duration: 0,
    },
  },
  {
    document: {
      id: 'doc-004',
      name: 'security-policy-2026.pdf',
      run: IngestionStatus.Unstart,
      progress: 0,
      progress_msg: '',
      chunk_num: 0,
      token_num: 0,
      process_duration: 0,
    },
  },
  {
    document: {
      id: 'doc-005',
      name: 'product-roadmap.pptx',
      run: IngestionStatus.Done,
      progress: 1,
      progress_msg: 'Parsing completed',
      chunk_num: 58,
      token_num: 11020,
      process_duration: 27.4,
    },
  },
  {
    document: {
      id: 'doc-006',
      name: 'customer-support-transcripts.csv',
      run: IngestionStatus.Done,
      progress: 1,
      progress_msg: 'Parsing completed',
      chunk_num: 342,
      token_num: 79860,
      process_duration: 118.9,
    },
  },
  {
    document: {
      id: 'doc-007',
      name: 'scanned-invoice-batch.pdf',
      run: IngestionStatus.Fail,
      progress: -1,
      progress_msg: WORKER_FAILURE_MESSAGE,
      chunk_num: 0,
      token_num: 0,
      process_duration: 63.2,
    },
  },
  {
    document: {
      id: 'doc-008',
      name: 'legacy-archive.zip',
      run: IngestionStatus.Cancel,
      progress: 0.31,
      progress_msg: 'Cancelled by user',
      chunk_num: 0,
      token_num: 0,
      process_duration: 9.8,
    },
  },
];

const toPercent = (progress: number): number => Math.round(progress * 100);

const advanceDocument = (
  seed: SeedDocument,
  elapsedMs: number,
): DocumentProgress => {
  const { document, simulation } = seed;

  if (!simulation) {
    return { ...document };
  }

  const advanced =
    simulation.start_progress +
    (elapsedMs / simulation.duration_ms) * (1 - simulation.start_progress);

  if (advanced >= 1) {
    return {
      ...document,
      run: IngestionStatus.Done,
      progress: 1,
      progress_msg: 'Parsing completed',
      chunk_num: simulation.target_chunk_num,
      token_num: simulation.target_token_num,
      process_duration: Number((simulation.duration_ms / 1000).toFixed(1)),
    };
  }

  return {
    ...document,
    progress: Number(advanced.toFixed(2)),
    progress_msg: `${simulation.running_message} (${toPercent(advanced)}%)`,
    chunk_num: Math.floor(simulation.target_chunk_num * advanced),
    token_num: Math.floor(simulation.target_token_num * advanced),
    process_duration: Number((elapsedMs / 1000).toFixed(1)),
  };
};

export const getDocumentsSnapshot = (): DocumentProgress[] => {
  const elapsedMs = Date.now() - SIMULATION_STARTED_AT;
  return seedDocuments.map((seed) => advanceDocument(seed, elapsedMs));
};

const PROCESSING_STATUSES: IngestionStatus[] = [
  IngestionStatus.Unstart,
  IngestionStatus.Running,
  IngestionStatus.Schedule,
];

export const buildSummary = (
  documents: DocumentProgress[],
): IngestionSummary => ({
  doc_num: documents.length,
  chunk_num: documents.reduce((total, doc) => total + doc.chunk_num, 0),
  token_num: documents.reduce((total, doc) => total + doc.token_num, 0),
  finished: documents.filter((doc) => doc.run === IngestionStatus.Done).length,
  processing: documents.filter((doc) => PROCESSING_STATUSES.includes(doc.run))
    .length,
  failed: documents.filter((doc) => doc.run === IngestionStatus.Fail).length,
});

export const ingestionLogs: IngestionLog[] = [
  {
    id: 'log-001',
    document_name: 'scanned-invoice-batch.pdf',
    run: IngestionStatus.Fail,
    message: WORKER_FAILURE_MESSAGE,
    create_time: 1751020800000,
    duration: 63.2,
  },
  {
    id: 'log-002',
    document_name: 'customer-support-transcripts.csv',
    run: IngestionStatus.Done,
    message: 'Parsing completed: 342 chunks, 79860 tokens',
    create_time: 1751017200000,
    duration: 118.9,
  },
  {
    id: 'log-003',
    document_name: 'legacy-archive.zip',
    run: IngestionStatus.Cancel,
    message: 'Cancelled by user before chunking finished',
    create_time: 1751013600000,
    duration: 9.8,
  },
  {
    id: 'log-004',
    document_name: 'product-roadmap.pptx',
    run: IngestionStatus.Done,
    message: 'Parsing completed: 58 chunks, 11020 tokens',
    create_time: 1751010000000,
    duration: 27.4,
  },
  {
    id: 'log-005',
    document_name: 'quarterly-financial-report.pdf',
    run: IngestionStatus.Running,
    message: 'Embedding chunks',
    create_time: 1751006400000,
    duration: 0,
  },
];


const datasets: IDataset[] = [
    {
        id:               'b991cbce73b211f19dbe183d2de36fb3',
        name:             'Shruthi D11',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'qa',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T12:04:47.991Z',
        updated_at:       '2026-06-29T12:04:47.991Z',
    },
    {
        id:               'b18a16e673b211f1b2f5183d2de36fb3',
        name:             'Shruthi D10',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'naive',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T12:04:34.518Z',
        updated_at:       '2026-06-29T12:04:34.518Z',
    },
    {
        id:               'a9449dad73b211f1891d183d2de36fb3',
        name:             'Shruthi D9',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'qa',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T12:04:20.641Z',
        updated_at:       '2026-06-29T12:04:20.641Z',
    },
    {
        id:               'a26ffc7273b211f191c9183d2de36fb3',
        name:             'Shruthi D8',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'resume',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T12:04:09.182Z',
        updated_at:       '2026-06-29T12:04:09.182Z',
    },
    {
        id:               '8f5f243173b211f19e2d183d2de36fb3',
        name:             'Shruthi D7',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'manual',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T12:03:37.194Z',
        updated_at:       '2026-06-29T12:03:37.194Z',
    },
    {
        id:               '531ecf8c73aa11f1832d183d2de36fb3',
        name:             'Shruthi D6',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'naive',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T11:04:40.136Z',
        updated_at:       '2026-06-29T11:04:40.136Z',
    },
    {
        id:               '4abcb29973aa11f191c8183d2de36fb3',
        name:             'Shruthi D5',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'naive',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T11:04:26.071Z',
        updated_at:       '2026-06-29T11:04:26.071Z',
    },
    {
        id:               '40973e3273aa11f18aeb183d2de36fb3',
        name:             'Shruthi D4',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'paper',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T11:04:09.048Z',
        updated_at:       '2026-06-29T11:04:09.048Z',
    },
    {
        id:               '39e7be3e73aa11f1aaab183d2de36fb3',
        name:             'Shruthi D3',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'naive',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T11:03:57.832Z',
        updated_at:       '2026-06-29T11:03:57.832Z',
    },
    {
        id:               '1a4fc27473aa11f1ba62183d2de36fb3',
        name:             'Shruthi Dataset2',
        description:      '',
        embedding_model:  'nomic-embed-text',
        parser_type:      'naive',
        permission:       'me',
        file_count:       0,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-06-29T11:03:04.826Z',
        updated_at:       '2026-06-29T11:03:04.826Z',
    },
    {
        id:               '0c198b88665d11f180d2183d2de36fb3',
        name:             'Shruthi D A',
        description:      'Sample dataset with files',
        embedding_model:  'nomic-embed-text',
        parser_type:      'naive',
        permission:       'me',
        file_count:       1,
        tenant_id:        '5f8ba29364c511f1a547cec0c0035664',
        owner_name:       'shruthi.da@zemosolabs.com',
        owner_avatar_url: null,
        created_at:       '2026-04-09T12:47:23.974Z',
        updated_at:       '2026-04-09T12:47:23.974Z',
    },
];

export default datasets;