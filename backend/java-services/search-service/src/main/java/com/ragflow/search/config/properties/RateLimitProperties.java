package com.ragflow.search.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for search API rate limiting.
 * -
 * Binds to application.yaml:
 * rate:
 *   limit:
 *     requests: 100
 *     duration-seconds: 60
 *
 */
@ConfigurationProperties(prefix = "rate.limit")
public record RateLimitProperties(
        int requests,
        int durationSeconds
) {
    // Compact constructor providing default fallback values
    public RateLimitProperties {
        if (requests <= 0) requests = 100;
        if (durationSeconds <= 0) durationSeconds = 60;
    }
}