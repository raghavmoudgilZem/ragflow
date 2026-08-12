package com.ragflow.retrieval.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Builds the HTTP client used to reach the re-rank model provider.
 *
 * <p>Unlike Elasticsearch, the provider is not checked at startup: it is an
 * optional enhancement, and a service that refuses to boot without it would
 * trade a working search for a broken one.
 */
@Slf4j
@Configuration
public class RerankClientConfig {

    /**
     * Creates the provider client with explicit timeouts.
     *
     * <p>The timeouts are the important part. An HTTP client with no timeout waits
     * indefinitely, so a provider that hangs would hold request threads until the
     * pool is exhausted — turning a slow re-ranker into a service-wide outage. A
     * timeout converts that into a failure the caller can catch and recover from.
     *
     * <p>The values arrive already validated by {@link RetrievalProperties.Rerank},
     * so nothing is re-checked here.
     *
     * @param properties the bound {@code retrieval.*} settings; only the
     *                   {@code rerank} group is read here
     */
    @Bean
    public RestClient rerankRestClient(RetrievalProperties properties) {
        RetrievalProperties.Rerank rerank = properties.rerank();

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(rerank.connectTimeoutMs());
        requestFactory.setReadTimeout(rerank.readTimeoutMs());

        log.info("Rerank provider client configured: baseUrl={}, connectTimeout={}ms, readTimeout={}ms, topN={}",
                rerank.baseUrl(), rerank.connectTimeoutMs(),
                rerank.readTimeoutMs(), rerank.topN());

        return RestClient.builder()
                .baseUrl(rerank.baseUrl())
                .requestFactory(requestFactory)
                .build();
    }
}
