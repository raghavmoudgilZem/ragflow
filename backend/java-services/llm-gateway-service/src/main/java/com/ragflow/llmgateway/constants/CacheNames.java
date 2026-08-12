package com.ragflow.llmgateway.constants;

import lombok.experimental.UtilityClass;

/**
 * Names of the Spring Cache regions backed by Redis (see {@code spring.cache.redis} in
 * application.yml for the shared TTL).
 */
@UtilityClass
public class CacheNames {
    public static final String FACTORIES = "factories";
    public static final String FACTORY = "factory";
}
