package com.ragflow.retrieval.dto;

/**
 * Fully-annotated retrieval result for a single chunk, produced by
 * {@link com.ragflow.retrieval.service.RrfRanker} and consumed by the
 * downstream reranking stage.
 *
 * <p>Field semantics:
 * <ul>
 *   <li>{@code rawBm25Score} / {@code keywordRank} — populated only when the
 *       chunk appeared in the keyword result list; {@code null} otherwise.</li>
 *   <li>{@code rawVectorScore} / {@code vectorRank} — populated only when the
 *       chunk appeared in the vector result list; {@code null} otherwise.</li>
 *   <li>{@code rrfScore} — always populated.</li>
 *   <li>{@code rerankScore} — {@code null} until the reranking stage has run;
 *       chunks outside the rerank top-N intentionally remain {@code null}.</li>
 * </ul>
 *
 * <p>Every intermediate signal is preserved so that diagnostic responses can be
 * assembled from existing fields without re-running the pipeline.
 */
public record RankedChunk(
        String chunkId,
        String docId,
        String kbId,
        String content,
        Double rawBm25Score,
        Double rawVectorScore,
        Integer keywordRank,
        Integer vectorRank,
        Double rrfScore,
        Double rerankScore
) {
    /** Returns a copy of this chunk with the given reranking score applied. */
    public RankedChunk withRerankScore(double newRerankScore) {
        return new RankedChunk(chunkId, docId, kbId, content,
                rawBm25Score, rawVectorScore, keywordRank, vectorRank,
                rrfScore, newRerankScore);
    }
}
