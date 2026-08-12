package com.ragflow.retrieval.service;

import com.ragflow.retrieval.client.RerankClient;
import com.ragflow.retrieval.config.RetrievalProperties;
import com.ragflow.retrieval.dto.RankedChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Re-orders fused search results by asking a cross-encoder model how relevant
 * each chunk actually is to the query.
 *
 * <p>{@link RrfRanker} ranks candidates by how strongly the keyword and vector
 * searches agree on them — it compares rank positions and never reads the chunk
 * text. A cross-encoder reads the query and the chunk together and scores that
 * pair directly, which is more accurate but costs one model pass per chunk.
 *
 * <p>That cost is why only the first {@code retrieval.rerank.top-n} candidates
 * are re-scored. Those are the "head"; everything below is the "tail", which
 * keeps its incoming order and keeps a {@code null} rerankScore. Since only the
 * first few results ever reach an LLM's context window, spending the model
 * budget at the top of the list is where it changes answers.
 *
 * <p><strong>Re-ranking never fails a search.</strong> If the provider is down,
 * slow, or returns something unusable, the failure is logged and the incoming
 * order is returned as-is. Re-ranking improves the order of results; it is not
 * needed to produce them. Returning slightly worse results always beats
 * returning an error, so every failure here degrades quietly instead.
 *
 * <p>Stateless and free of shared mutable fields, so a single instance is safe
 * to share across concurrent requests.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RerankService {

    /**
     * Sorts a scored head best-first: model score descending, and where the model
     * cannot separate two chunks, the fusion score decides. Sorting is stable, so
     * chunks equal on both keep their incoming order.
     *
     * <p>Both scores are nullable, and a missing one sorts last rather than
     * throwing. This ordering runs after the provider call has already succeeded,
     * so an exception raised here would escape the failure handling below and
     * fail the request outright — exactly what this class promises never to do.
     */
    private static final Comparator<RankedChunk> RERANK_ORDER =
            Comparator.comparingDouble((RankedChunk chunk) -> orElseLast(chunk.rerankScore()))
                    .reversed()
                    .thenComparing(Comparator.comparingDouble(
                            (RankedChunk chunk) -> orElseLast(chunk.rrfScore())).reversed());

    private final RerankClient rerankClient;

    /**
     * The bound {@code retrieval.*} config, registered by
     * {@code @ConfigurationPropertiesScan}. Only the {@code rerank} group is read
     * here (see {@link RetrievalProperties.Rerank}), reached through at the call
     * site; {@code top-n} is validated at startup, so nothing re-checks it.
     */
    private final RetrievalProperties retrievalProperties;

    /**
     * Re-orders the best candidates by model relevance.
     *
     * @param candidates    the fused, ranked candidates, best-first. Never modified.
     * @param queryText     the user's question in natural language. Passing text
     *                      escaped for keyword search makes the model score badly,
     *                      and it degrades silently rather than raising an error.
     * @param rerankEnabled whether the caller asked for re-ranking on this request
     * @return the re-ordered list, or {@code candidates} unchanged when re-ranking
     *         is disabled, there is nothing to rank, or the provider fails
     */
    public List<RankedChunk> rerank(List<RankedChunk> candidates,
                                    String queryText,
                                    boolean rerankEnabled) {
        if (!rerankEnabled) {
            log.debug("Re-ranking disabled for this request, keeping fusion order of {} candidate(s)",
                    candidates.size());
            return candidates;
        }
        if (candidates.isEmpty()) {
            // Checked before the provider call so an empty result set costs no
            // network round-trip.
            log.debug("No candidates to re-rank");
            return List.of();
        }

        int headSize = Math.min(retrievalProperties.rerank().topN(), candidates.size());
        List<RankedChunk> head = candidates.subList(0, headSize);
        List<RankedChunk> tail = candidates.subList(headSize, candidates.size());

        double[] scores;
        try {
            scores = rerankClient.score(queryText, contentsOf(head));
        } catch (RuntimeException e) {
            // Caught broadly on purpose. The promise is that no provider fault can
            // fail a search, and narrowing this to one exception type would break
            // that the first time an implementation throws something unexpected.
            // Logged at ERROR because results silently get worse when this fires:
            // users cannot report a fault they cannot see, so the log is the only
            // signal that the provider needs attention.
            log.error("Re-ranking failed for {} candidate(s), keeping fusion order. Cause: {}",
                    headSize, e.getMessage(), e);
            return candidates;
        }

        if (scores.length != headSize) {
            // Scores are matched to chunks by position, so a wrong-length reply
            // cannot be used at all: there is no id to tell us which chunk the
            // provider skipped. Attaching them anyway would shift every score onto
            // the wrong chunk, which is worse than not re-ranking.
            log.error("Re-ranking returned {} score(s) for {} candidate(s), keeping fusion order",
                    scores.length, headSize);
            return candidates;
        }

        List<RankedChunk> reordered = new ArrayList<>(candidates.size());
        for (int i = 0; i < headSize; i++) {
            reordered.add(head.get(i).withRerankScore(scores[i]));
        }
        reordered.sort(RERANK_ORDER);

        // The tail was never scored, so there is no evidence it belongs any higher
        // than fusion already placed it. It keeps its order, below the whole head.
        reordered.addAll(tail);

        log.debug("Re-ranked top {} of {} candidate(s); remaining {} kept in fusion order",
                headSize, candidates.size(), tail.size());
        return List.copyOf(reordered);
    }

    /**
     * Extracts chunk texts for scoring, substituting an empty string for missing
     * content so that one incomplete chunk cannot fail the whole request. The
     * model scores an empty text near zero, so such a chunk simply sinks.
     */
    private List<String> contentsOf(List<RankedChunk> chunks) {
        return chunks.stream()
                .map(chunk -> Objects.requireNonNullElse(chunk.content(), ""))
                .toList();
    }

    /**
     * Treats a missing score as the lowest possible value, so unscored chunks sort
     * last instead of raising a {@link NullPointerException} during comparison.
     */
    private static double orElseLast(Double score) {
        return score == null ? Double.NEGATIVE_INFINITY : score;
    }
}
