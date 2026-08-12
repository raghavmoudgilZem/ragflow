const DOCUMENT_ROOT = ['documents'] as const;

export const documentKeys = {
  all: DOCUMENT_ROOT,
  details: () => [...DOCUMENT_ROOT, 'detail'] as const,
  detail: (documentId: string) =>
    [...DOCUMENT_ROOT, 'detail', documentId] as const,
};
