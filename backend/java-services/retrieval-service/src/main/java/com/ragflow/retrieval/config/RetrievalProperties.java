package com.ragflow.retrieval.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/**
 * Everything under {@code retrieval.*}, bound and validated once at startup.
 *
 * <p>One root per namespace, with a nested record per pipeline stage. The stages
 * are steps of a single flow and are tuned together — {@code rrf.k} decides what
 * order the candidates arrive in, {@code rerank.top-n} decides how far down that
 * order the model is spent — so keeping them in one file is what lets someone
 * read the pipeline's cost and quality trade-offs without opening three classes.
 *
 * <p>{@code @ConfigurationPropertiesScan} on the application class registers this
 * root as a bean, and consumers inject it directly and read the group they need
 * (e.g. {@code properties.rerank().topN()}) — the same way {@code GeminiProperties}
 * and the other {@code retrieval-service} configuration records are consumed.
 *
 * <p>Every group is {@code @Valid}, so a group configured wrongly fails the
 * context with the offending property named rather than surfacing on a request
 * hours later. {@code rrf} and {@code rerank} are defaulted and may be omitted
 * entirely; {@code sanitize} is deliberately not — see below.
 *
 * <p>New stages belong here as another nested record.
 *
 * @param rrf      reciprocal-rank-fusion settings
 * @param rerank   cross-encoder re-ranking settings
 * @param sanitize query pre-processing settings. Required, unlike the other two:
 *                 the length cap is an operational decision about what reaches
 *                 Elasticsearch, and the {@code @Value} this replaced had no
 *                 default either. A deployment that omits it fails to start
 *                 instead of silently adopting a cap nobody chose.
 */
@Validated
@ConfigurationProperties(prefix = "retrieval")
public record RetrievalProperties(

        @Valid @DefaultValue Rrf rrf,

        @Valid @DefaultValue Rerank rerank,

        @Valid @NotNull Sanitize sanitize) {

    /**
     * {@code retrieval.rrf.*} — how the keyword and vector result lists are fused.
     *
     * @param k rank constant in {@code 1 / (k + rank)}. A higher {@code k}
     *          flattens the influence of the top ranks, so two lists agreeing on
     *          a chunk matters more than either ranking it first. Must be at
     *          least 1: at {@code k = 0} the top of each list stops being damped,
     *          and a negative value drives the denominator through zero, which
     *          inverts the ordering outright.
     */
    public record Rrf(

            @Min(1)
            @DefaultValue("60")
            int k) {
    }

    /**
     * {@code retrieval.rerank.*} — the cross-encoder pass over the fused head.
     *
     * @param baseUrl          provider root; the request path is appended to it
     * @param connectTimeoutMs how long to wait for the connection to be accepted.
     *                         Must be positive — zero or negative means "wait
     *                         forever" to the underlying request factory, which is
     *                         the exact failure mode the timeouts exist to prevent.
     * @param readTimeoutMs    how long to wait for scores once connected. Must stay
     *                         below the request budget of whatever calls the search
     *                         pipeline: if the caller gives up first, the fail-open
     *                         path in {@code RerankService} never runs and the user
     *                         sees an error instead of un-re-ranked results.
     * @param topN             how many of the top candidates are sent to the model.
     *                         Raising it improves ordering deeper into the list but
     *                         costs one more model pass per candidate, making it the
     *                         main latency control for this stage. Below 1 there is
     *                         nothing to re-rank, so it is rejected rather than
     *                         silently disabling the feature.
     */
    public record Rerank(

            @NotBlank
            @DefaultValue("http://localhost:9380")
            String baseUrl,

            @Positive
            @DefaultValue("2000")
            int connectTimeoutMs,

            @Positive
            @DefaultValue("4000")
            int readTimeoutMs,

            @Min(1)
            @DefaultValue("50")
            int topN) {
    }

    /**
     * {@code retrieval.sanitize.*} — the pre-processing every raw query passes
     * through before it reaches search.
     *
     * @param maxQueryLength longest query text accepted, in characters. The
     *                       sanitizer truncates beyond this rather than failing,
     *                       so the value is the last line of defence on what
     *                       reaches Elasticsearch. Must be positive: at zero every
     *                       query truncates to the empty string and matches
     *                       nothing, which looks like broken search rather than
     *                       broken config. No default — the group is required.
     */
    public record Sanitize(

            @Positive
            int maxQueryLength) {
    }
}
