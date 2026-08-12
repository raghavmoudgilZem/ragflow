import type {
  DocumentProgressListParams,
  IngestionLogListParams,
} from '../types/ingestion.types';

const DATAFLOW_ROOT = ['datasets', 'dataflow'] as const;

export const dataflowKeys = {
  all: DATAFLOW_ROOT,
  overview: (datasetId: string) =>
    [...DATAFLOW_ROOT, 'overview', datasetId] as const,
  logs: (datasetId: string) => [...DATAFLOW_ROOT, 'logs', datasetId] as const,
  logList: (datasetId: string, params: IngestionLogListParams) =>
    [...DATAFLOW_ROOT, 'logs', datasetId, params] as const,
  progress: (datasetId: string) =>
    [...DATAFLOW_ROOT, 'progress', datasetId] as const,
  progressList: (datasetId: string, params: DocumentProgressListParams) =>
    [...DATAFLOW_ROOT, 'progress', datasetId, params] as const,
  documentProgress: (datasetId: string, documentId: string) =>
    [...DATAFLOW_ROOT, 'progress', datasetId, documentId] as const,
};
