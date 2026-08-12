package com.ragflow.llmgateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds {@code llm.rate-limit.*} — per-client request throttling applied by
 * {@link com.ragflow.llmgateway.filter.RateLimitFilter}.
 *
 * @param enabled           whether rate limiting is enforced
 * @param requestsPerMinute the number of requests a single client may make per rolling minute
 */
@ConfigurationProperties(prefix = "llm.rate-limit")
public record RateLimitProperties(boolean enabled, int requestsPerMinute) {
}
