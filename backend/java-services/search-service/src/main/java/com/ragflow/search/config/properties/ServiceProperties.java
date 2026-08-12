package com.ragflow.search.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for external microservices (rag-service, chat-service).
 * -
 * Binds to application.yaml:
 * services:
 *   rag:
 *     url: http://localhost:9405
 *   chat:
 *     url: http://localhost:9406
 *   timeout-ms: 5000
 * -
 */
@ConfigurationProperties(prefix = "services")
public record ServiceProperties(
        Rag rag,
        Chat chat,
        int timeoutMs
) {
    // Compact constructor providing default values if unset
    public ServiceProperties {
        if (rag == null) rag = new Rag("http://localhost:9405");
        if (chat == null) chat = new Chat("http://localhost:9406");
        if (timeoutMs <= 0) timeoutMs = 5000;
    }

    public record Rag(String url) {
        public Rag {
            if (url == null || url.isBlank()) url = "http://localhost:9405";
        }
    }

    public record Chat(String url) {
        public Chat {
            if (url == null || url.isBlank()) url = "http://localhost:9406";
        }
    }
}