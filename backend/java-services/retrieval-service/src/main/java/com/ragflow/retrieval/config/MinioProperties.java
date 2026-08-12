package com.ragflow.retrieval.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rag.minio")
public record MinioProperties(
        String endpoint,
        String accessKey,
        String secretKey) {
}
