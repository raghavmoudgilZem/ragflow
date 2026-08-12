package com.ragflow.llmgateway.constants;

import lombok.experimental.UtilityClass;

/**
 * HTTP header names used across this service.
 */
@UtilityClass
public class HeaderConstants {
    public static final String CORRELATION_ID = "X-Correlation-Id";
    public static final String FORWARDED_FOR = "X-Forwarded-For";
    public static final String RATE_LIMIT_REMAINING = "X-RateLimit-Remaining";
    public static final String RETRY_AFTER = "Retry-After";
}
