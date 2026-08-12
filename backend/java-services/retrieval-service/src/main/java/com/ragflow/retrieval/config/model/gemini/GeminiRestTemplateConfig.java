package com.ragflow.retrieval.config.model.gemini;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Provides the {@link RestTemplate} used by {@code GeminiEmbeddingService}, wired up
 * with the connect/read timeouts declared in {@code gemini.connect-timeout} and
 * {@code gemini.read-timeout} (previously configured but never actually applied).
 */
@Configuration
@Slf4j
public class GeminiRestTemplateConfig {

    @Bean
    public RestTemplate geminiRestTemplate(RestTemplateBuilder builder, GeminiProperties geminiProperties) {
        log.info("Configuring Gemini RestTemplate with connectTimeout={} readTimeout={}",
                geminiProperties.connectTimeout(), geminiProperties.readTimeout());

        return builder
                .connectTimeout(geminiProperties.connectTimeout())
                .readTimeout(geminiProperties.readTimeout())
                .build();
    }
}
