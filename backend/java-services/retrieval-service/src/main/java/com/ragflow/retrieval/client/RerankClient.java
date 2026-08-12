package com.ragflow.retrieval.client;

import com.ragflow.retrieval.exception.RerankClientException;

import java.util.List;

/**
 * Sends chunk texts to the re-rank model provider and returns their relevance scores.
 *
 * <p>This interface covers transport only — how to reach the provider and how to
 * read its reply. It holds no opinion on which chunks are worth scoring, or on
 * what should happen when scoring fails; {@link com.ragflow.retrieval.service.RerankService}
 * owns those decisions.
 *
 * <p>Keeping the two apart means swapping providers (a self-hosted model server
 * for a vendor API, say) only requires a new implementation of this interface,
 * and lets the service be tested against a stub with no HTTP server involved.
 */
public interface RerankClient {

    /**
     * Scores each text against the query.
     *
     * <p>Scores are matched to texts by position: {@code scores[i]} belongs to
     * {@code texts.get(i)}. No chunk ids are exchanged, so callers must treat a
     * returned array of the wrong length as unusable — there is no way to tell
     * which text a missing score belonged to.
     *
     * @param queryText the user's question in natural language
     * @param texts     the chunk contents to score
     * @return one score per text, in the same order as {@code texts}; higher
     *         means more relevant. The scale depends on the provider and is only
     *         meaningful for comparing texts within this one call.
     * @throws RerankClientException if the provider cannot be reached, or returns
     *                               a response that cannot be read
     */
    double[] score(String queryText, List<String> texts);
}
