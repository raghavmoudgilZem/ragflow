package com.ragflow.retrieval.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import com.ragflow.retrieval.base.BaseIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class ElasticsearchConnectionTest extends BaseIntegrationTest {

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    @Test
    void testElasticsearchClientIsOperationalAndConnected() throws Exception {
        boolean pingResult = elasticsearchClient.ping().value();
        assertThat(pingResult).isTrue();
    }
}
