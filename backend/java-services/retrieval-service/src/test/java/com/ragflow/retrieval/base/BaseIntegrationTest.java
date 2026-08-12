package com.ragflow.retrieval.base;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.elasticsearch.ElasticsearchContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class BaseIntegrationTest {

    @Container
    protected static final ElasticsearchContainer elasticsearchContainer =
            new ElasticsearchContainer("docker.elastic.co/elasticsearch/elasticsearch:8.11.1")
                    .withEnv("discovery.type", "single-node")
                    .withEnv("xpack.security.http.ssl.enabled", "false")
                    .withPassword("testcontainerpassword");

    @DynamicPropertySource
    static void overrideApplicationProperties(DynamicPropertyRegistry registry) {
        // Dynamically override properties to target the random container ports safely
        String dynamicHost = elasticsearchContainer.getHost();
        Integer dynamicPort = elasticsearchContainer.getMappedPort(9200);

        registry.add("elasticsearch.host", () -> dynamicHost);
        registry.add("elasticsearch.port", () -> dynamicPort);
        registry.add("elasticsearch.username", () -> "elastic");
        registry.add("elasticsearch.password", () -> "testcontainerpassword");
    }
}
