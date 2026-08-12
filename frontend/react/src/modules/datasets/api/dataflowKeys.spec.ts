import { describe, it, expect } from 'vitest';
import { dataflowKeys } from './dataflowKeys';
import type {
  DocumentProgressListParams,
  IngestionLogListParams,
} from '../types/ingestion.types';

const datasetId = 'kb-1';
const documentId = 'doc-1';
const params: IngestionLogListParams = {
  page: 1,
  pageSize: 10,
  keywords: 'invoice',
  status: '1',
};
const progressParams: DocumentProgressListParams = {
  page: 1,
  pageSize: 10,
  keywords: 'invoice',
};

describe('dataflowKeys', () => {
  it('exposes the shared root', () => {
    expect(dataflowKeys.all).toEqual(['datasets', 'dataflow']);
  });

  it('builds every key from the shared root', () => {
    const builtKeys = [
      dataflowKeys.overview(datasetId),
      dataflowKeys.logs(datasetId),
      dataflowKeys.logList(datasetId, params),
      dataflowKeys.progress(datasetId),
      dataflowKeys.progressList(datasetId, progressParams),
      dataflowKeys.documentProgress(datasetId, documentId),
    ];
    builtKeys.forEach((key) => {
      expect(key.slice(0, 2)).toEqual(['datasets', 'dataflow']);
    });
  });

  it('builds the overview key', () => {
    expect(dataflowKeys.overview(datasetId)).toEqual([
      'datasets',
      'dataflow',
      'overview',
      datasetId,
    ]);
  });

  it('builds the logs key', () => {
    expect(dataflowKeys.logs(datasetId)).toEqual([
      'datasets',
      'dataflow',
      'logs',
      datasetId,
    ]);
  });

  it('builds the log list key carrying the params object', () => {
    const key = dataflowKeys.logList(datasetId, params);
    expect(key).toEqual(['datasets', 'dataflow', 'logs', datasetId, params]);
    expect(key[key.length - 1]).toBe(params);
  });

  it('builds the progress key', () => {
    expect(dataflowKeys.progress(datasetId)).toEqual([
      'datasets',
      'dataflow',
      'progress',
      datasetId,
    ]);
  });

  it('builds the document progress key', () => {
    expect(dataflowKeys.documentProgress(datasetId, documentId)).toEqual([
      'datasets',
      'dataflow',
      'progress',
      datasetId,
      documentId,
    ]);
  });

  it('nests the log list key under the logs key', () => {
    const logsKey = dataflowKeys.logs(datasetId);
    const logListKey = dataflowKeys.logList(datasetId, params);
    expect(logListKey.slice(0, logsKey.length)).toEqual([...logsKey]);
  });

  it('builds the progress list key carrying the params object', () => {
    const key = dataflowKeys.progressList(datasetId, progressParams);
    expect(key).toEqual([
      'datasets',
      'dataflow',
      'progress',
      datasetId,
      progressParams,
    ]);
    expect(key[key.length - 1]).toBe(progressParams);
  });

  it('nests the progress list key under the progress key', () => {
    const progressKey = dataflowKeys.progress(datasetId);
    const progressListKey = dataflowKeys.progressList(datasetId, progressParams);
    expect(progressListKey.slice(0, progressKey.length)).toEqual([
      ...progressKey,
    ]);
  });

  it('nests the document progress key under the progress key', () => {
    const progressKey = dataflowKeys.progress(datasetId);
    const documentProgressKey = dataflowKeys.documentProgress(
      datasetId,
      documentId,
    );
    expect(documentProgressKey.slice(0, progressKey.length)).toEqual([
      ...progressKey,
    ]);
  });
});
