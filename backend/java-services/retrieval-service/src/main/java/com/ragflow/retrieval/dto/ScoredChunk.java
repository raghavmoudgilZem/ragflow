package com.ragflow.retrieval.dto;

/**
 * A single scored candidate chunk produced by keyword (BM25) or vector
 * (cosine-similarity) search — one of the two inputs fused by
 * {@link com.ragflow.retrieval.service.RrfRanker}.
 *
 * <p>The {@code score} is retained only so it can be surfaced on the resulting
 * {@link RankedChunk} for diagnostics. Reciprocal Rank Fusion itself relies
 * solely on each candidate's position within its list, never on this raw score.
 *
 * @param chunkId unique identifier of the chunk; must not be {@code null} or blank
 * @param docId   identifier of the source document
 * @param kbId    identifier of the owning knowledge base
 * @param content chunk text
 * @param score   raw relevance score from the originating search
 */
public record ScoredChunk(
        String chunkId,
        String docId,
        String kbId,
        String content,
        double score
) {
    public ScoredChunk {
        if (chunkId == null || chunkId.isBlank()) {
            throw new IllegalArgumentException("chunkId must not be null or blank");
        }
    }
}
