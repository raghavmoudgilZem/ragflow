export const CHUNK_ROUTES = {
  ROOT: '/chunk',
  /** Matches reference UI: /chunk/parsed/chunks?id=&doc_id= */
  PARSED_CHUNKS: '/chunk/parsed/chunks',
  PARSED_RESULT: '/chunk/parsed-result/:documentId',
} as const;

export function buildChunkListPath(datasetId: string, documentId: string) {
  const params = new URLSearchParams({
    id: datasetId,
    doc_id: documentId,
  });
  return `${CHUNK_ROUTES.PARSED_CHUNKS}?${params.toString()}`;
}
