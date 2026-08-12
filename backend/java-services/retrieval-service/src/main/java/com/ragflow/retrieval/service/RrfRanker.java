package com.ragflow.retrieval.service;

import com.ragflow.retrieval.config.RetrievalProperties;
import com.ragflow.retrieval.dto.RankedChunk;
import com.ragflow.retrieval.dto.ScoredChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Reciprocal Rank Fusion (RRF) ranker.
 *
 * <p>Fuses the independently-ranked keyword (BM25) and vector (kNN) result
 * lists using rank position alone — never raw scores:
 *
 * <pre>    score(chunk) = Σ  1 / (k + rank)   over every list it appears in</pre>
 *
 * <p>{@code rank} is 1-indexed (top result = rank 1), matching the original RRF
 * formulation and Elasticsearch's native {@code rrf} retriever. A chunk present
 * in both lists receives both contributions summed, which is how RRF rewards a
 * candidate that two independent signals agree on over one ranked #1 by a
 * single signal alone.
 *
 * <p>Stateless and free of shared mutable fields, so a single instance is safe
 * to share across concurrent requests.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RrfRanker {

    /**
     * Deterministic ordering: rrfScore desc, then chunkId asc for ties.
     */
    private static final Comparator<RankedChunk> RRF_ORDER = Comparator.comparingDouble(RankedChunk::rrfScore)
            .reversed()
            .thenComparing(RankedChunk::chunkId);

    /**
     * The bound {@code retrieval.*} config, registered by
     * {@code @ConfigurationPropertiesScan}. Only the {@code rrf} group is read
     * here (see {@link RetrievalProperties.Rrf}), reached through at the call
     * site; its default {@code k} is validated at startup, so nothing re-checks
     * it.
     */
    private final RetrievalProperties retrievalProperties;

    /**
     * Fuses using the configured default k ({@code retrieval.rrf.k},
     * default 60).
     */
    public List<RankedChunk> fuse(List<ScoredChunk> keywordResults, List<ScoredChunk> vectorResults) {
        return fuse(keywordResults, vectorResults, retrievalProperties.rrf().k());
    }

    /**
     * Fuses using an explicit {@code k}, overriding the configured default.
     *
     * <p>Provided so a runtime configuration source can supply {@code k}
     * per request without this class depending on it directly.
     *
     * @throws IllegalArgumentException if {@code k < 1}
     * @throws NullPointerException     if either list is {@code null}; callers
     *                                  should pass {@code List.of()} for no results
     */
    public List<RankedChunk> fuse(List<ScoredChunk> keywordResults,
                                  List<ScoredChunk> vectorResults,
                                  int k) {
        validateK(k);
        Objects.requireNonNull(keywordResults, "keywordResults must not be null");
        Objects.requireNonNull(vectorResults, "vectorResults must not be null");

        log.debug("Fusing {} keyword and {} vector result(s) with k={}",
                keywordResults.size(), vectorResults.size(), k);

        Map<String, Accumulator> accumulators = new HashMap<>();
        accumulate(keywordResults, k, accumulators, ScoreSource.KEYWORD);
        accumulate(vectorResults, k, accumulators, ScoreSource.VECTOR);

        // Empty-input safety is structural, not special-cased: with both lists
        // empty the loops above never run, the map stays empty, and this yields
        // List.of(). Division by zero is impossible on any input: rank >= 1
        // always and k >= 1 is validated, so the denominator is never below 2.
        List<RankedChunk> fused = accumulators.values().stream()
                .map(Accumulator::toRankedChunk)
                .sorted(RRF_ORDER)
                .toList();

        log.debug("RRF fusion produced {} ranked chunk(s)", fused.size());
        return fused;
    }

    private void accumulate(List<ScoredChunk> results,
                            int k,
                            Map<String, Accumulator> accumulators,
                            ScoreSource source) {
        for (int i = 0; i < results.size(); i++) {
            ScoredChunk chunk = results.get(i);
            int rank = i + 1;                       // 1-indexed rank
            double contribution = 1.0 / (k + rank);

            Accumulator acc = accumulators.computeIfAbsent(
                    chunk.chunkId(), id -> new Accumulator(chunk));
            acc.rrfScore += contribution;
            switch (source) {
                case KEYWORD -> {
                    acc.rawBm25Score = chunk.score();
                    acc.keywordRank = rank;
                }
                case VECTOR -> {
                    acc.rawVectorScore = chunk.score();
                    acc.vectorRank = rank;
                }
            }
        }
    }

    /**
     * Guards the caller-supplied {@code k} on the explicit overload only. The
     * configured default needs no check here — {@link RetrievalProperties.Rrf}
     * rejects it at startup — but a value arriving per request has never passed
     * through that gate, so it is validated where it enters.
     */
    private static void validateK(int k) {
        if (k < 1) {
            throw new IllegalArgumentException("k must be >= 1, got: " + k);
        }
    }

    private enum ScoreSource {KEYWORD, VECTOR}

    /**
     * Mutable working state for one chunk while fusion is in progress.
     *
     * <p>Deliberately not the immutable {@link RankedChunk} record: updating a
     * field here is a plain assignment, whereas "mutating" a record would
     * allocate a new instance on every accumulation step. Converted to a
     * {@code RankedChunk} exactly once, at the end.
     */
    private static final class Accumulator {
        private final String chunkId;
        private final String docId;
        private final String kbId;
        private final String content;
        private Double rawBm25Score;
        private Double rawVectorScore;
        private Integer keywordRank;
        private Integer vectorRank;
        private double rrfScore = 0.0;

        private Accumulator(ScoredChunk chunk) {
            this.chunkId = chunk.chunkId();
            this.docId = chunk.docId();
            this.kbId = chunk.kbId();
            this.content = chunk.content();
        }

        private RankedChunk toRankedChunk() {
            return new RankedChunk(chunkId, docId, kbId, content, rawBm25Score, rawVectorScore, keywordRank, vectorRank, rrfScore, null);
        }
    }
}
