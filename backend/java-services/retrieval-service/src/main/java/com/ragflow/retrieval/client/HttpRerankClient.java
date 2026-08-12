package com.ragflow.retrieval.client;

import com.ragflow.retrieval.dto.request.RerankProviderRequest;
import com.ragflow.retrieval.dto.response.RerankProviderResponse;
import com.ragflow.retrieval.exception.RerankClientException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

/**
 * Calls the re-rank model provider over HTTP.
 *
 * <p>Sends {@code POST {base-url}/rerank} and reads the scores back. Connection
 * and read timeouts come from the injected client, configured in
 * {@code RerankClientConfig}.
 *
 * <p>Every way this call can go wrong is reported as a single
 * {@link RerankClientException}, so callers have one thing to handle rather than
 * a spread of HTTP and parsing exceptions.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HttpRerankClient implements RerankClient {

    private static final String RERANK_PATH = "/rerank";

    /**
     * The timeout-bounded client built by {@code RerankClientConfig}. The field
     * name matches that bean's name on purpose: the Elasticsearch configuration
     * publishes a bean also called {@code RestClient} (a different type — the
     * Elasticsearch one), and should the two ever converge, name matching resolves
     * the injection without needing a qualifier here.
     */
    private final RestClient rerankRestClient;

    @Override
    public double[] score(String queryText, List<String> texts) {
        RerankProviderRequest request = new RerankProviderRequest(queryText, texts);
        long startedAt = System.currentTimeMillis();

        RerankProviderResponse response;
        try {
            response = rerankRestClient.post()
                    .uri(RERANK_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(RerankProviderResponse.class);
        } catch (RestClientException e) {
            // Covers connection refused, connect/read timeouts, 4xx, 5xx and
            // response parsing failures. The elapsed time is logged because it
            // distinguishes a timeout from an immediate rejection, which is the
            // first thing worth knowing when this starts firing.
            long elapsedMs = System.currentTimeMillis() - startedAt;
            throw new RerankClientException(
                    "Rerank provider call failed after " + elapsedMs + "ms: " + e.getMessage(), e);
        }

        long elapsedMs = System.currentTimeMillis() - startedAt;

        if (response == null || response.scores() == null) {
            throw new RerankClientException(
                    "Rerank provider returned no scores for " + texts.size() + " text(s)");
        }

        double[] scores = toPrimitiveScores(response.scores());
        log.debug("Rerank provider scored {} text(s) in {}ms", scores.length, elapsedMs);
        return scores;
    }

    /**
     * Unboxes the scores, rejecting any missing entry.
     *
     * <p>A {@code null} score is treated as a broken response rather than
     * defaulted to 0.0: zero is a legitimate "not relevant" score, so defaulting
     * would bury the provider's fault as a plausible-looking result.
     */
    private double[] toPrimitiveScores(List<Double> rawScores) {
        double[] scores = new double[rawScores.size()];
        for (int i = 0; i < scores.length; i++) {
            Double score = rawScores.get(i);
            if (score == null) {
                throw new RerankClientException(
                        "Rerank provider returned a null score at position " + i);
            }
            scores[i] = score;
        }
        return scores;
    }
}
