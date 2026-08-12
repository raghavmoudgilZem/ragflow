import { Router, Request, Response } from 'express';
import {
  ApiResponse,
  DocumentProgress,
  IngestionLog,
  IngestionStatus,
  IngestionSummary,
  buildSummary,
  getDocumentsSnapshot,
  ingestionLogs,
} from './data.js';
import { datasetRepository } from './repository.js';

const VALID_STATUSES: string[] = Object.values(IngestionStatus);

const success = <T>(data: T, status_code = 200): ApiResponse<T> => ({
  success: true,
  status_code,
  errors: [],
  data,
});

const failure = (status_code: number, message: string): ApiResponse<null> => ({
  success: false,
  status_code,
  errors: [message],
  data: null,
});

// ── Types ──────────────────────────────────────────────────────────────────

export interface IDataset {
  id: string;
  name: string;
  description: string;
  embedding_model: string;
  parser_type: string;
  permission: 'me' | 'team';
  file_count: number;
  tenant_id: string;
  owner_name: string;
  owner_avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ── In-memory store — seeded from data.ts ─────────────────────────────────


// ── Envelope helpers ───────────────────────────────────────────────────────

const ok = <T>(data: T, status_code: number = 200): ApiResponse<T> => ({
  success: true,
  status_code,
  errors: [],
  data,
});

const fail = (message: string, status_code: number = 400): ApiResponse<null> => ({
  success: false,
  status_code,
  errors: [message],
  data: null,
});
interface Pagination {
  page: number;
  pageSize: number;
}

const readPagination = (
  page: unknown,
  pageSize: unknown,
): Pagination | null => {
  const parsedPage = Number(page ?? 1);
  const parsedPageSize = Number(pageSize ?? 10);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) return null;
  if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1) return null;

  return { page: parsedPage, pageSize: parsedPageSize };
};

const paginate = <T>(items: T[], { page, pageSize }: Pagination): T[] =>
  items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

const matchesKeywords = (value: string, keywords: string): boolean =>
  value.toLowerCase().includes(keywords.toLowerCase());

export function registerDatasetRoutes(router: Router) {
  router.get('/datasets/:datasetId/documents', (req, res) => {
    const pagination = readPagination(req.query.page, req.query.page_size);

    if (!pagination) {
      res.status(400).json(failure(400, 'Invalid pagination parameters'));
      return;
    }

    const keywords = String(req.query.keywords ?? '');
    const snapshot = getDocumentsSnapshot();
    const filtered = keywords
      ? snapshot.filter((doc) => matchesKeywords(doc.name, keywords))
      : snapshot;

    const data: { total: number; docs: DocumentProgress[] } = {
      total: filtered.length,
      docs: paginate(filtered, pagination),
    };

    res.status(200).json(success(data));
  });

  router.get('/datasets/:datasetId/ingestions/summary', (_req, res) => {
    const summary: IngestionSummary = buildSummary(getDocumentsSnapshot());
    res.status(200).json(success(summary));
  });

  router.get('/datasets/:datasetId/ingestions/logs', (req, res) => {
    const pagination = readPagination(req.query.page, req.query.page_size);

    if (!pagination) {
      res.status(400).json(failure(400, 'Invalid pagination parameters'));
      return;
    }

    const status = req.query.status ? String(req.query.status) : '';

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json(failure(400, `Invalid status filter: ${status}`));
      return;
    }

    const keywords = String(req.query.keywords ?? '');

    let filtered: IngestionLog[] = ingestionLogs;
    if (keywords) {
      filtered = filtered.filter((log) =>
        matchesKeywords(log.document_name, keywords),
      );
    }
    if (status) {
      filtered = filtered.filter((log) => log.run === status);
    }

    const sorted = [...filtered].sort((a, b) => b.create_time - a.create_time);

    const data: { total: number; logs: IngestionLog[] } = {
      total: sorted.length,
      logs: paginate(sorted, pagination),
    };

    res.status(200).json(success(data));
  });

  router.post('/dataset/list', listDatasets);
}

// POST /kb/list?keywords=&page_size=10&page=1
const listDatasets = (
  req: Request,
  res: Response,
): void => {
  const keywords =
    ((req.query.keywords as string | undefined) ?? '')
      .trim();

  const page = Number(req.query.page ?? 1);

  const pageSize = Number(req.query.page_size ?? 10);

  const rawOwnerIds = req.query.owner_ids;

  const ownerIds: string[] = rawOwnerIds
    ? Array.isArray(rawOwnerIds)
      ? (rawOwnerIds as string[])
      : [rawOwnerIds as string]
    : [];

  const data = datasetRepository.list({
    keywords,
    ownerIds,
    page,
    pageSize,
  });

  res.status(200).json(ok(data));
};
