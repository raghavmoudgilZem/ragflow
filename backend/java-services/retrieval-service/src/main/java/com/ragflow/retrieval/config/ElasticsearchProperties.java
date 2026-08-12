package com.ragflow.retrieval.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "elasticsearch")
public record ElasticsearchProperties(
        String host,
        String port,
        String scheme,
        String username,
        String password,
        Duration connectTimeout,
        Duration socketTimeout
) {
    @Override
    public String toString() {
        return "ElasticsearchProperties{" +
                "host='" + host + '\'' +
                ", port='" + port + '\'' +
                ", scheme='" + scheme + '\'' +
                ", username='" + username + '\'' +
                ", connectTimeout=" + connectTimeout +
                ", socketTimeout=" + socketTimeout +
                '}';
    }
}
