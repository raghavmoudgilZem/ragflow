package com.ragflow.retrieval.config.model.gemini;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Type-safe configuration properties for the Google Gemini embedding API,
 * bound from the {@code gemini.*} keys in application.properties/yaml.
 * <p>
 * Using {@code @ConfigurationProperties} (instead of scattering {@code @Value}
 * fields across services) gives us compile-time-checked, immutable, and
 * centrally validated configuration.
 *
 * @param apiKey             Gemini API key used to authenticate embedding requests
 * @param embeddingModel     Name of the embedding model (e.g. "gemini-embedding-001")
 * @param embeddingUrl       Base URL of the Gemini generative language API
 * @param embeddingDimension Expected dimensionality of the returned embedding vector
 * @param connectTimeout     Connect timeout for calls to the Gemini API
 * @param readTimeout        Read timeout for calls to the Gemini API
 */
@ConfigurationProperties(prefix = "gemini")
public record GeminiProperties(
        String apiKey,
        String embeddingModel,
        String embeddingUrl,
        Integer embeddingDimension,
        Duration connectTimeout,
        Duration readTimeout
) {
}
