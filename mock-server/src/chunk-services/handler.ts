import { Router, Request, Response } from 'express';
import {
  ApiResponse,
  Chunk,
  chunks,
  documents,
  parsedResults,
  TOTAL_CHUNKS,
} from './data.js';

function ok<T>(res: Response, data: T, status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    status_code: status,
    errors: [],
    data,
  };
  res.status(status).json(body);
}

function fail(res: Response, status: number, message: string) {
  const body: ApiResponse<null> = {
    success: false,
    status_code: status,
    errors: [message],
    data: null,
  };
  res.status(status).json(body);
}

export function registerChunkRoutes(router: Router): void {
  router.get('/chunks', (req: Request, res: Response) => {
    const documentId = String(req.query.document_id ?? '');
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.page_size ?? 50);
    const search = String(req.query.search ?? '').trim().toLowerCase();
    const enabledParam = req.query.enabled;

    if (!documentId) {
      fail(res, 400, 'document_id is required');
      return;
    }
    if (page < 1 || pageSize < 1) {
      fail(res, 400, 'Invalid pagination parameters');
      return;
    }

    let filtered = chunks.filter((c) => c.document_id === documentId);

    if (search) {
      filtered = filtered.filter((c) => c.content.toLowerCase().includes(search));
    }
    if (enabledParam === 'true' || enabledParam === 'false') {
      const enabled = enabledParam === 'true';
      filtered = filtered.filter((c) => c.enabled === enabled);
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    ok(res, {
      items,
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page,
      page_size: pageSize,
    });
  });

  router.get('/documents/:documentId', (req: Request, res: Response) => {
    const doc = documents.find((d) => d.id === req.params.documentId);
    if (!doc) {
      fail(res, 404, 'Document not found');
      return;
    }
    ok(res, { ...doc, chunk_count: TOTAL_CHUNKS });
  });

  router.get(
    '/documents/:documentId/parsed-result',
    (req: Request, res: Response) => {
      const parsed = parsedResults[req.params.documentId];
      if (!parsed) {
        fail(res, 404, 'Parsed result not found');
        return;
      }
      ok(res, parsed);
    },
  );

  router.post('/chunks', (req: Request, res: Response) => {
    const { document_id, content, metadata } = req.body as {
      document_id?: string;
      content?: string;
      metadata?: Chunk['metadata'];
    };

    if (!document_id || !content?.trim()) {
      fail(res, 400, 'document_id and content are required');
      return;
    }

    const now = new Date().toISOString();
    const chunk: Chunk = {
      id: `chunk-${document_id}-${Date.now()}`,
      document_id,
      content: content.trim(),
      metadata: metadata ?? { page: 1, content_type: 'Text' },
      enabled: true,
      created_at: now,
      updated_at: now,
      thumbnail_url: null,
    };
    chunks.unshift(chunk);
    ok(res, chunk, 201);
  });

  router.put('/chunks/:chunkId', (req: Request, res: Response) => {
    const index = chunks.findIndex((c) => c.id === req.params.chunkId);
    if (index < 0) {
      fail(res, 404, 'Chunk not found');
      return;
    }

    const current = chunks[index];
    const { content, metadata, enabled } = req.body as {
      content?: string;
      metadata?: Chunk['metadata'];
      enabled?: boolean;
    };

    const updated: Chunk = {
      ...current,
      content: content ?? current.content,
      metadata: metadata ?? current.metadata,
      enabled: typeof enabled === 'boolean' ? enabled : current.enabled,
      updated_at: new Date().toISOString(),
    };
    chunks[index] = updated;
    ok(res, updated);
  });

  router.delete('/chunks/:chunkId', (req: Request, res: Response) => {
    const index = chunks.findIndex((c) => c.id === req.params.chunkId);
    if (index < 0) {
      fail(res, 404, 'Chunk not found');
      return;
    }
    chunks.splice(index, 1);
    ok(res, null);
  });

  router.patch('/chunks/:chunkId', (req: Request, res: Response) => {
    const index = chunks.findIndex((c) => c.id === req.params.chunkId);
    if (index < 0) {
      fail(res, 404, 'Chunk not found');
      return;
    }
    const enabled = Boolean(req.body?.enabled);
    chunks[index] = {
      ...chunks[index],
      enabled,
      updated_at: new Date().toISOString(),
    };
    ok(res, chunks[index]);
  });

  // Keep legacy alias for compatibility with callers that still use the old path
  router.patch('/chunks/:chunkId/enabled', (req: Request, res: Response) => {
    const index = chunks.findIndex((c) => c.id === req.params.chunkId);
    if (index < 0) {
      fail(res, 404, 'Chunk not found');
      return;
    }
    const enabled = Boolean(req.body?.enabled);
    chunks[index] = {
      ...chunks[index],
      enabled,
      updated_at: new Date().toISOString(),
    };
    ok(res, chunks[index]);
  });

  function applyBulkEnabled(chunkIds: string[], enabled: boolean) {
    let updated = 0;
    const idSet = new Set(chunkIds);
    for (let i = 0; i < chunks.length; i += 1) {
      if (idSet.has(chunks[i].id)) {
        chunks[i] = {
          ...chunks[i],
          enabled,
          updated_at: new Date().toISOString(),
        };
        updated += 1;
      }
    }
    return updated;
  }

  router.post('/chunks/bulk-enable', (req: Request, res: Response) => {
    const { chunk_ids = [] } = req.body as { chunk_ids?: string[] };
    if (!Array.isArray(chunk_ids)) {
      fail(res, 400, 'chunk_ids is required');
      return;
    }
    const updated = applyBulkEnabled(chunk_ids, true);
    ok(res, { updated });
  });

  router.post('/chunks/bulk-disable', (req: Request, res: Response) => {
    const { chunk_ids = [] } = req.body as { chunk_ids?: string[] };
    if (!Array.isArray(chunk_ids)) {
      fail(res, 400, 'chunk_ids is required');
      return;
    }
    const updated = applyBulkEnabled(chunk_ids, false);
    ok(res, { updated });
  });

  // Legacy aliases kept for backwards compatibility
  router.post('/chunks/bulk-enabled', (req: Request, res: Response) => {
    const { chunk_ids = [], enabled } = req.body as {
      chunk_ids?: string[];
      enabled?: boolean;
    };
    if (!Array.isArray(chunk_ids) || typeof enabled !== 'boolean') {
      fail(res, 400, 'chunk_ids and enabled are required');
      return;
    }
    const updated = applyBulkEnabled(chunk_ids, enabled);
    ok(res, { updated });
  });

  router.post('/chunks/bulk-delete', (req: Request, res: Response) => {
    const { chunk_ids = [] } = req.body as {
      chunk_ids?: string[];
    };
    if (!Array.isArray(chunk_ids)) {
      fail(res, 400, 'chunk_ids is required');
      return;
    }
    const idSet = new Set(chunk_ids);
    const originalLength = chunks.length;
    // Filter out chunks to delete
    for (let i = chunks.length - 1; i >= 0; i -= 1) {
      if (idSet.has(chunks[i].id)) {
        chunks.splice(i, 1);
      }
    }
    const deleted = originalLength - chunks.length;
    ok(res, { deleted });
  });
}
