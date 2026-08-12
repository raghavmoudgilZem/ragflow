package com.ragflow.llmgateway.service.impl;

import com.ragflow.llmgateway.dto.response.FactoryResponse;
import com.ragflow.llmgateway.repository.LlmFactoryRepository;
import com.ragflow.llmgateway.service.FactoryService;
import com.redis.testcontainers.RedisContainer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.List;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * End-to-end regression test for Redis-backed caching on {@link FactoryServiceImpl}, against real
 * MySQL and Redis (Testcontainers) — not mocks — because the original bug here
 * ({@code GenericJackson2JsonRedisSerializer} deserializing cached DTOs back as raw
 * {@code LinkedHashMap}, throwing {@code ClassCastException} on the second call) only reproduces
 * with real JSON serialization round-tripping through a real Redis instance.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class FactoryCachingIT {

    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.39");

    @Container
    @ServiceConnection
    static RedisContainer redis = new RedisContainer(DockerImageName.parse("redis:7-alpine"));

    @Autowired
    private FactoryService factoryService;

    @Autowired
    private CacheManager cacheManager;

    @MockitoSpyBean
    private LlmFactoryRepository llmFactoryRepository;

    @BeforeEach
    void clearCaches() {
        // The Redis container (and its cache entries) is shared across every test method in this
        // class — without this, a cache populated by one test would make the next test's "first"
        // call a silent cache hit, so it would never reach the (freshly interaction-reset) spy.
        cacheManager.getCacheNames().forEach(name -> Objects.requireNonNull(cacheManager.getCache(name)).clear());
    }

    @Test
    void secondCallForTheSameFactory_isServedFromCacheAndReturnsTheSameValue() {
        // Act
        FactoryResponse first = factoryService.getFactoryByName("OpenAI");
        FactoryResponse second = factoryService.getFactoryByName("OpenAI");

        // Assert — cached round-trip must deserialize back into a proper FactoryResponse (not a
        // LinkedHashMap-cast failure), with the exact same field values as the DB-backed first call
        assertThat(second).isEqualTo(first);
        verify(llmFactoryRepository, times(1)).findById("OpenAI");
    }

    @Test
    void differentFactoryNames_eachIndependentlyHitTheDatabaseOnceThenCache() {
        // Act
        factoryService.getFactoryByName("OpenAI");
        factoryService.getFactoryByName("Anthropic");
        factoryService.getFactoryByName("OpenAI");
        factoryService.getFactoryByName("Anthropic");

        // Assert
        verify(llmFactoryRepository, times(1)).findById("OpenAI");
        verify(llmFactoryRepository, times(1)).findById("Anthropic");
    }

    @Test
    void getFactoriesListCall_isCachedPerActiveAndTagCombination() {
        // Act
        List<FactoryResponse> firstCall = factoryService.getFactories(true, null);
        List<FactoryResponse> secondCall = factoryService.getFactories(true, null);
        // A different parameter combination must NOT reuse the (true, null) cache entry
        List<FactoryResponse> differentParams = factoryService.getFactories(false, null);

        // Assert
        assertThat(secondCall).isEqualTo(firstCall);
        verify(llmFactoryRepository, times(1)).findByActiveTrueOrderByRankDesc();
        verify(llmFactoryRepository, times(1)).findAllByOrderByRankDesc();
        assertThat(differentParams).hasSizeGreaterThanOrEqualTo(firstCall.size());
    }
}
