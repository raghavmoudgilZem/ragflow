package com.ragflow.retrieval.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.ragflow.retrieval.exception.ElasticsearchAuthenticationException;
import com.ragflow.retrieval.exception.ElasticsearchConnectionException;
import io.github.resilience4j.retry.Retry;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.IOException;

@Configuration
@EnableConfigurationProperties(ElasticsearchProperties.class)
@Slf4j
public class ElasticsearchClientConfig {


    @Bean
    public RestClient restClient(ElasticsearchProperties props) {
        log.info("Assembling low-level RestClient targeting -> {}://{}:{}", props.scheme(), props.host(), props.port());

        HttpHost httpHost = new HttpHost(props.host(), Integer.parseInt(props.port()), props.scheme());

        final CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(props.username(), props.password())
        );

        RestClientBuilder builder = RestClient.builder(httpHost)
                .setRequestConfigCallback(requestBuilder -> requestBuilder
                        .setConnectTimeout((int) props.connectTimeout().toMillis())
                        .setSocketTimeout((int) props.socketTimeout().toMillis())
                )
                .setHttpClientConfigCallback(httpClientBuilder -> {
                    httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
                    return httpClientBuilder;
                });

        return builder.build();
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient, ElasticsearchProperties props, Retry elasticsearchRetry) {
        log.info("Assembling high-level ElasticsearchClient wrapper for {}://{}:{}", props.scheme(), props.host(), props.port());

        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        ElasticsearchClient client = new ElasticsearchClient(transport);

        try {
            Retry.decorateRunnable(elasticsearchRetry, () -> pingCluster(client)).run();
            log.info("Context Startup Check: Elasticsearch connection successfully established.");
        } catch (Exception exception) {
            log.error("Unable to establish Elasticsearch connection after retries.",exception);
            throw exception;
        }
        return client;
    }

    private void pingCluster(ElasticsearchClient client) {
        try {
            if (!client.ping().value()) {
                throw new ElasticsearchConnectionException("Elasticsearch instance responded to ping with a false state.");
            }
        } catch (ElasticsearchException elasticsearchException) {
            if (elasticsearchException.status() == 401 || elasticsearchException.status() == 403) {
                throw new ElasticsearchAuthenticationException("Access forbidden. Invalid credentials provided.", elasticsearchException);
            }
            throw new ElasticsearchConnectionException("Cluster responded with diagnostic code: " + elasticsearchException.status(), elasticsearchException);
        } catch (IOException ioException) {
            throw new ElasticsearchConnectionException("Network I/O interface exception occurred during ping command execution.", ioException);
        } catch (Exception exception) {
            throw new ElasticsearchConnectionException("Non-standard failure discovered during active ping execution.", exception);
        }
    }
}
