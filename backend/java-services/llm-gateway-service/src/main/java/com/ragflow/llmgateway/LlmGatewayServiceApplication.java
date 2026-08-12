package com.ragflow.llmgateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * LLM Gateway Service.
 *
 * <p>This module currently covers database schema and reference-data migrations, and the
 * read-only Factory catalog API — cached in Redis and rate-limited per client.
 *
 * <p><b>Catalog seeding</b> — {@code llm_factory} / {@code llm_catalog_model} reference data is
 * owned by a repeatable Flyway migration ({@code R__seed_catalog.sql}), not application code.
 * It re-applies automatically whenever its content changes, under Flyway's migration lock —
 * safe even if multiple instances start at once.
 *
 * <p>The tenant Configuration API ({@code /v1/llm}) and the inference gateway (chat completions,
 * streaming, embeddings) are not yet implemented in this module.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class LlmGatewayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LlmGatewayServiceApplication.class, args);
    }
}
