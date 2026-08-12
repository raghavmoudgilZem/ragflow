package com.ragflow.retrieval.health;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import com.ragflow.retrieval.config.ElasticsearchProperties;
import com.ragflow.retrieval.exception.ElasticsearchAuthenticationException;
import com.ragflow.retrieval.exception.ElasticsearchConnectionException;
import io.github.resilience4j.retry.Retry;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component("elasticsearch")
public class ElasticsearchReadinessIndicator implements HealthIndicator {


    private final ElasticsearchClient client;
    private final ElasticsearchProperties props;
    private final Retry retry;

    public ElasticsearchReadinessIndicator(ElasticsearchClient client, ElasticsearchProperties props, Retry elasticsearchRetry) {
        this.client = client;
        this.props = props;
        this.retry = elasticsearchRetry;
    }

    @Override
    public Health health() {
        try {
            Retry.decorateRunnable(retry, this::executePing).run();
            return Health.up()
                    .withDetail("cluster", props.host() + ":" + props.port())
                    .withDetail("scheme", props.scheme())
                    .build();
        } catch (ElasticsearchAuthenticationException e) {
            return Health.down()
                    .withDetail("status", "AUTHENTICATION_FAILURE")
                    .withDetail("cause", e.getMessage())
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("status", "UNREACHABLE")
                    .withDetail("cause", e.getMessage())
                    .build();
        }
    }

    private void executePing() {
        try {
            if (!client.ping().value()) {
                throw new ElasticsearchConnectionException("Active cluster ping did not respond successfully.");
            }
        } catch (ElasticsearchException e) {
            if (e.status() == 401 || e.status() == 403) {
                throw new ElasticsearchAuthenticationException("Access rejected during Actuator probe sweep.", e);
            }
            throw new ElasticsearchConnectionException("Cluster downstream error caught by internal probe.", e);
        } catch (IOException e) {
            throw new ElasticsearchConnectionException("Interface I/O exception caught during Actuator probe sweep.", e);
        }
    }
}
