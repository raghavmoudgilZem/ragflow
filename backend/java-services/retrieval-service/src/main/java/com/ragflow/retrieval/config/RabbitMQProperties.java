package com.ragflow.retrieval.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rag.queue")
public record RabbitMQProperties(
        String indexJobsName,
        String indexJobsConcurrency) {
}
