package com.ragflow.retrieval.config;

import com.ragflow.retrieval.exception.ElasticsearchAuthenticationException;
import com.ragflow.retrieval.exception.ElasticsearchConnectionException;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@Slf4j
public class Resilience4jRetryConfig {

    @Bean
    public Retry elasticsearchRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofSeconds(2))
                .retryExceptions(ElasticsearchConnectionException.class)
                .ignoreExceptions(ElasticsearchAuthenticationException.class)
                .build();

         Retry retry=registry.retry("elasticsearch-connect", config);
         retry.getEventPublisher()
                .onRetry(event -> log.info(
                        "Retrying Elasticsearch connection. Attempt: {}",
                        event.getNumberOfRetryAttempts()))
                .onSuccess(event -> log.info(
                        "Elasticsearch connection successful after {} retries",
                        event.getNumberOfRetryAttempts()))
                .onError(event -> log.error(
                        "All retries exhausted. Total attempts: {}",
                        event.getNumberOfRetryAttempts()));
        return retry;
    }
}
