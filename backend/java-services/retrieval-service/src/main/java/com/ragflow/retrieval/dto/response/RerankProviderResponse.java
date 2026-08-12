package com.ragflow.retrieval.dto.response;

import java.util.List;

/**
 * Successful response body from the re-rank model provider.
 *
 * <pre>
 * { "scores": [0.91, 0.34] }
 * </pre>
 *
 * <p>Scores are matched to the request's {@code texts} by position:
 * {@code scores[i]} is the relevance of {@code texts[i]}. No chunk ids are
 * exchanged, so the list must have exactly as many entries as were sent —
 * a shorter or longer list cannot be matched up and is rejected.
 *
 * @param scores one relevance score per submitted text, in the order submitted.
 *               Boxed {@code Double} rather than {@code double} so that a JSON
 *               {@code null} arrives as {@code null} and can be rejected. A
 *               primitive would silently turn it into 0.0, which is
 *               indistinguishable from a genuine "not relevant" score.
 */
public record RerankProviderResponse(List<Double> scores) {
}
