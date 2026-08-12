package com.ragflow.retrieval.controller;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import com.ragflow.retrieval.dto.request.SearchRequest;
import com.ragflow.retrieval.exception.ElasticsearchConnectionException;
import com.ragflow.retrieval.service.SearchCacheFacadeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@Slf4j
@RequestMapping("/health")
public class HealthController {

    private final ElasticsearchClient elasticsearchClient;
    private final RedisTemplate<String, Object> redisTemplate;


    public HealthController(ElasticsearchClient elasticsearchClient, RedisTemplate<String, Object> redisTemplate) {
        this.elasticsearchClient = elasticsearchClient;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/ping")
    public String ping() {
        return "Retrieval Service is UP and RUNNING!";
    }

    @GetMapping("/elastic-ping")
    public String elasticPing() throws IOException {
        if (!elasticsearchClient.ping().value()) {
            log.info("elastic search connected failed");
            throw new ElasticsearchConnectionException("Elasticsearch instance responded to ping with a false state.");
        }
        log.info("elastic search connected successfully");
        return "elastic search connected successfully";
    }

    @GetMapping("/redis-ping")
    public boolean redisPing() throws IOException {
        try {
            String response = this.redisTemplate.execute(RedisConnectionCommands::ping);
            log.info("Redis ping response received: {}", response);
            return "PONG".equalsIgnoreCase(response);
        } catch (Exception e) {
            log.error("Redis ping failed! The cache instance appears to be DOWN. Error: {}", e.getMessage());
            return false;
        }
    }

}